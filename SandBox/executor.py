import queue
import asyncio
import io
import sys
import traceback
import time
import os
import multiprocessing
import psutil
from contextlib import redirect_stdout, redirect_stderr
from typing import Tuple, Dict, Optional

# Define resource limits
MAX_CPU_TIME = 30  # seconds
MAX_MEMORY = 512 * 1024 * 1024  # 512 MB

def set_process_limits():
    """Set resource limits for the subprocess."""
    try:
        import resource
        resource.setrlimit(resource.RLIMIT_CPU, (MAX_CPU_TIME, MAX_CPU_TIME))
        resource.setrlimit(resource.RLIMIT_AS, (MAX_MEMORY, MAX_MEMORY))
    except ImportError:
        # On Windows, psutil will be used for monitoring instead
        pass

def sanitize_code(code: str) -> str:
    """Sanitize the code to prevent harmful operations."""
    blocked_imports = [
        "subprocess",
        "os.system",
        "shutil.rmtree",
        "sys.exit",
    ]
    
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
        self.daemon = True

    def run(self):
        """Run the code in isolation with captured output."""
        try:
            set_process_limits()
            
            original_env = None
            if self.env_vars:
                original_env = os.environ.copy()
                os.environ.update(self.env_vars)
            
            stdout_capture = io.StringIO()
            stderr_capture = io.StringIO()
            
            with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
                local_namespace = {}
                exec(self.code, {}, local_namespace)
            
            stdout = stdout_capture.getvalue()
            stderr = stderr_capture.getvalue()
            
            if original_env:
                os.environ.clear()
                os.environ.update(original_env)
            
            self.result_queue.put((True, stdout, None))
            
        except Exception as e:
            stderr = traceback.format_exc()
            self.result_queue.put((False, "", stderr))

def _terminate_process_and_children(pid):
    """Helper function to terminate a process and all its children."""
    try:
        parent = psutil.Process(pid)
        for child in parent.children(recursive=True):
            try:
                child.terminate()
                child.wait(3)
            except:
                try:
                    child.kill()
                except:
                    pass
        
        parent.terminate()
        parent.wait(3)
        
        if parent.is_running():
            parent.kill()
    except:
        pass

async def execute_python_code(code: str, timeout: int = 30, env_vars: dict = None) -> Tuple[bool, str, str]:
    """Execute Python code in a sandboxed environment with timeout."""
    try:
        sanitized_code = sanitize_code(code)
    except ValueError as e:
        return False, "", f"Code validation error: {str(e)}"
    
    result_queue = multiprocessing.Queue()
    process = CodeExecutionProcess(sanitized_code, result_queue, env_vars)
    process.start()
    pid = process.pid
    
    try:
        start_time = time.time()
        while process.is_alive() and time.time() - start_time < timeout:
            try:
                success, output, error = result_queue.get(timeout=0.1)
                _terminate_process_and_children(pid)
                return success, output, error
            except queue.Empty:
                await asyncio.sleep(0.1)
        
        if process.is_alive():
            _terminate_process_and_children(pid)
            return False, "", f"Execution timed out after {timeout} seconds"
            
    except Exception as e:
        _terminate_process_and_children(pid)
        return False, "", f"Error running code: {str(e)}"
    
    try:
        if not result_queue.empty():
            return result_queue.get(timeout=0.1)
    except:
        pass
    
    return False, "", "Execution failed with unknown error"