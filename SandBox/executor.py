import queue
import asyncio
import io
import sys
import traceback
import time
import os
import signal
import multiprocessing
import tempfile
import subprocess
import psutil
from contextlib import redirect_stdout, redirect_stderr
from typing import Tuple, List, Dict, Any, Optional

# Define resource limits
MAX_CPU_TIME = 30  # seconds
MAX_MEMORY = 512 * 1024 * 1024  # 512 MB

def set_process_limits():
    """Set resource limits for the subprocess."""
    # Import resource only when needed (not available on Windows)
    try:
        import resource
        # Set CPU time limit
        resource.setrlimit(resource.RLIMIT_CPU, (MAX_CPU_TIME, MAX_CPU_TIME))
        
        # Set memory limit
        resource.setrlimit(resource.RLIMIT_AS, (MAX_MEMORY, MAX_MEMORY))
    except ImportError:
        # On Windows, psutil will be used for monitoring instead
        pass

def sanitize_code(code: str) -> str:
    """
    Sanitize the code to prevent harmful operations.
    This is a simple sanitization and should be expanded for production use.
    """
    # List of blocked modules/functions that could be dangerous
    blocked_imports = [
        "subprocess",
        "os.system",
        "shutil.rmtree",
        "sys.exit",
    ]
    
    # Check for blocked imports
    for blocked in blocked_imports:
        if f"import {blocked}" in code or f"from {blocked}" in code:
            raise ValueError(f"Blocked import detected: {blocked}")
        
    return code

class CodeExecutionProcess(multiprocessing.Process):
    """Process for executing code with output capturing and timeout."""
    
    def __init__(self, code: str, result_queue, env_vars=None):
        super().__init__()
        self.code = code
        self.result_queue = result_queue
        self.env_vars = env_vars or {}
        self.daemon = True  # Process will be terminated when the parent exits

    def run(self):
        """Run the code in isolation with captured output."""
        try:
            # Set resource limits (Unix-like only)
            set_process_limits()
            
            # Apply environment variables
            original_env = None
            if self.env_vars:
                original_env = os.environ.copy()
                os.environ.update(self.env_vars)
            
            # Capture stdout and stderr
            stdout_capture = io.StringIO()
            stderr_capture = io.StringIO()
            
            # Execute the code with captured output
            with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
                # Prepare a safe namespace for execution
                local_namespace = {}
                
                # Execute the code
                exec(self.code, {}, local_namespace)
            
            # Get the captured output
            stdout = stdout_capture.getvalue()
            stderr = stderr_capture.getvalue()
            
            # Restore environment if needed
            if original_env:
                os.environ.clear()
                os.environ.update(original_env)
            
            # Send success result
            self.result_queue.put((True, stdout, None))
            
        except Exception as e:
            # Get the traceback
            stderr = traceback.format_exc()
            
            # Send error result
            self.result_queue.put((False, "", stderr))
        
async def execute_python_code(code: str, timeout: int = 30, env_vars: dict = None) -> Tuple[bool, str, str]:
    """
    Execute Python code in a sandboxed environment with timeout.
    
    Args:
        code: The Python code to execute
        timeout: Maximum execution time in seconds
        
    Returns:
        Tuple of (success, output, error)
    """
    # Sanitize the code
    try:
        sanitized_code = sanitize_code(code)
    except ValueError as e:
        return False, "", f"Code validation error: {str(e)}"
    
    # Create a multiprocessing queue for the result
    result_queue = multiprocessing.Queue()
    
    # Create and start the execution process
    process = CodeExecutionProcess(sanitized_code, result_queue, env_vars)
    process.start()
    
    pid = process.pid
    
    try:
        # Wait for the result with timeout
        start_time = time.time()
        
        # Use asyncio.sleep instead of blocking
        while process.is_alive() and time.time() - start_time < timeout:
            try:
                # Check with a timeout to avoid blocking
                success, output, error = result_queue.get(timeout=0.1)
                
                # Clean up
                process.terminate()
                process.join(1)
                
                # Return results
                return success, output, error
            except queue.Empty:
                # Queue is empty, continue waiting
                await asyncio.sleep(0.1)
        
        # If we're here, it means timeout
        if process.is_alive():
            # Try to terminate the process gracefully
            process.terminate()
            await asyncio.sleep(0.1)
            
            # If still alive, force kill
            if process.is_alive():
                if sys.platform != 'win32':  # Unix-like
                    os.kill(pid, signal.SIGKILL)
                else:  # Windows
                    os.kill(pid, signal.SIGTERM)
            
            return False, "", f"Execution timed out after {timeout} seconds"
    except Exception as e:
        # Handle any unexpected errors
        if process.is_alive():
            process.terminate()
            if sys.platform != 'win32':  # Unix-like
                try:
                    os.kill(pid, signal.SIGKILL)
                except:
                    pass
            else:  # Windows
                try:
                    os.kill(pid, signal.SIGTERM)
                except:
                    pass
        
        return False, "", f"Error running code: {str(e)}"
    
    # If we get here, make sure process is terminated
    if process.is_alive():
        process.terminate()
        process.join(1)
    
    # Look for results in queue before returning generic error
    try:
        if not result_queue.empty():
            return result_queue.get()
    except:
        pass
    
    return False, "", "Execution failed with unknown error"

async def get_installed_packages() -> List[str]:
    """Get a list of installed Python packages."""
    result = subprocess.run(
        [sys.executable, "-m", "pip", "freeze"],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        raise Exception("Failed to list installed packages")
    
    # Parse the output
    packages = [
        line.strip() 
        for line in result.stdout.split('\n') 
        if line.strip()
    ]
    
    return packages

async def execute_agent_code(code: str, timeout: int = 30) -> Tuple[bool, str, str]:
    """
    Execute OpenAI Agents code with specific handling for agent-related imports.
    """
    # Check if openai-agents is installed
    try:
        import importlib
        agents_spec = importlib.util.find_spec("agents")
        if agents_spec is None:
            return False, "", "OpenAI Agents package is not installed"
    except ImportError:
        return False, "", "OpenAI Agents package is not installed"
    
    # Add required imports
    if "import asyncio" not in code:
        code = "import asyncio\n" + code
        
    if "from agents import" not in code and "import agents" not in code:
        code = "from agents import Agent, Runner\n" + code
    
    # Ensure proper main function
    if "asyncio.run" not in code and "if __name__" not in code:
        if "async def main" not in code:
            # Separate imports from code
            lines = code.split("\n")
            imports = []
            main_lines = []
            
            for line in lines:
                if line.startswith("import ") or line.startswith("from "):
                    imports.append(line)
                elif line.strip():
                    main_lines.append("    " + line)
            
            # Recreate the code with proper structure
            code = "\n".join(imports)
            code += "\n\nasync def main():\n" + "\n".join(main_lines)
            code += "\n\nif __name__ == \"__main__\":\n    asyncio.run(main())"
    
    # Use execute_as_script instead of execute_python_code
    success, output, error = await execute_as_script(code, timeout)
    
    # When successful, make sure error is None to match the test expectation
    if success and not error:
        error = None
        
    return success, output, error

# A modified version of code execution that creates a temp file and runs as a script
# This is useful for more complex code that may have import issues when using exec
async def execute_as_script(code: str, timeout: int = 30) -> Tuple[bool, str, str]:
    """Execute Python code by creating a temporary script file and running it."""
    # Create a temporary file
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w') as temp_file:
        temp_file_path = temp_file.name
        temp_file.write(code)
    
    try:
        # Run the script in a subprocess
        process = subprocess.Popen(
            [sys.executable, temp_file_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Monitor the process with timeout
        try:
            stdout, stderr = process.communicate(timeout=timeout)
            success = process.returncode == 0
            return success, stdout, stderr
        except subprocess.TimeoutExpired:
            # Kill the process if it times out
            process.kill()
            _, stderr = process.communicate()
            return False, "", f"Execution timed out after {timeout} seconds\n{stderr}"
    finally:
        # Clean up the temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass