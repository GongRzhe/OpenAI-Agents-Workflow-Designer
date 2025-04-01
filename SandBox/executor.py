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
    
    def __init__(self, code: str, result_queue):
        super().__init__()
        self.code = code
        self.result_queue = result_queue
        self.daemon = True  # Process will be terminated when the parent exits

    def run(self):
        """Run the code in isolation with captured output."""
        try:
            # Set resource limits (Unix-like only)
            set_process_limits()
            
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
            
            # Send success result
            self.result_queue.put((True, stdout, None))
            
        except Exception as e:
            # Get the traceback
            stderr = traceback.format_exc()
            
            # Send error result
            self.result_queue.put((False, "", stderr))

async def execute_python_code(code: str, timeout: int = 30) -> Tuple[bool, str, str]:
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
    process = CodeExecutionProcess(sanitized_code, result_queue)
    process.start()
    
    pid = process.pid
    
    try:
        # Wait for the result with timeout
        start_time = time.time()
        
        # Use asyncio.sleep instead of blocking
        while process.is_alive() and time.time() - start_time < timeout:
            if not result_queue.empty():
                # Get the result
                success, output, error = result_queue.get()
                
                # Clean up
                process.terminate()
                process.join(1)  # Wait up to 1 second
                
                # Force kill if not terminated
                if process.is_alive():
                    os.kill(pid, signal.SIGKILL)
                
                return success, output, error
            
            # Sleep to avoid busy-waiting
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
    
    # If we somehow get here, something went wrong
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

# Function to execute openai-agents code specifically
async def execute_agent_code(code: str, timeout: int = 30) -> Tuple[bool, str, str]:
    """
    Execute OpenAI Agents code with specific handling for agent-related imports.
    
    Args:
        code: The Python code with OpenAI Agents
        timeout: Maximum execution time in seconds
        
    Returns:
        Tuple of (success, output, error)
    """
    # First check if openai-agents is installed
    try:
        import agents
    except ImportError:
        return False, "", "OpenAI Agents package is not installed. Run 'pip install openai-agents' first."
    
    # Add required imports at the top if not present
    if "import asyncio" not in code:
        code = "import asyncio\n" + code
        
    if "from agents import" not in code and "import agents" not in code:
        code = "from agents import Agent, Runner\n" + code
    
    # Ensure there's a main function and proper asyncio.run call
    if "asyncio.run" not in code and "if __name__" not in code:
        # Wrap the code in a main function if it doesn't have one
        if "async def main" not in code:
            # Extract indented code and wrap it
            lines = code.split("\n")
            main_code = "\n".join("    " + line for line in lines if not (
                line.startswith("import ") or 
                line.startswith("from ") or
                not line.strip()
            ))
            
            # Add the main function and async run
            code += "\n\nasync def main():\n" + main_code + "\n\nif __name__ == \"__main__\":\n    asyncio.run(main())"
    
    # Execute the modified code
    return await execute_python_code(code, timeout)

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