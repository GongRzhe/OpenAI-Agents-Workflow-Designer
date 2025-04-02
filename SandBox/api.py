from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import asyncio
import uuid
import time
from typing import Dict, Optional

# Import the executor module
from executor import execute_python_code

execution_lock = asyncio.Lock()
app = FastAPI(title="Python Code Executor API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store ongoing executions
executions = {}

class CodeExecution(BaseModel):
    code: str
    timeout: int = 30
    async_execution: bool = False
    env_vars: Optional[Dict[str, str]] = None

class ExecutionResult(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    execution_time: float
    execution_id: Optional[str] = None



@app.get("/status")
async def get_api_status():
    """Get the status of the API itself, used for checking if the service is up."""
    return {"status": "ok", "version": "1.0"}


    
@app.post("/execute", response_model=ExecutionResult)
async def execute_code(execution: CodeExecution, background_tasks: BackgroundTasks):
    """Execute Python code and return the results. Can be synchronous or asynchronous."""
    if not execution.async_execution:
        # Synchronous execution
        start_time = time.time()
        success, output, error = await execute_python_code(
            execution.code,
            timeout=execution.timeout,
            env_vars=execution.env_vars
        )
        execution_time = time.time() - start_time
        
        return ExecutionResult(
            success=success,
            output=output,
            error=error,
            execution_time=execution_time
        )
    else:
        # Asynchronous execution - just return the ID immediately
        execution_id = str(uuid.uuid4())
        
        async with execution_lock:
            executions[execution_id] = {
                "status": "running",
                "output": "",
                "error": None,
                "start_time": time.time(),
                "execution_time": 0,
                "completed_at": None
            }
        
        # Start background task but don't wait for it
        background_tasks.add_task(
            background_execute,
            execution_id=execution_id,
            code=execution.code,
            timeout=execution.timeout,
            env_vars=execution.env_vars
        )
        
        # Return only the execution ID for async execution
        return ExecutionResult(
            success=True,
            output="",
            error=None,
            execution_time=0,
            execution_id=execution_id
        )

async def background_execute(execution_id: str, code: str, timeout: int, env_vars: Dict[str, str] = None):
    """Execute code in the background and store the result."""
    try:
        async with execution_lock:
            if execution_id not in executions:
                return
            start_time = executions[execution_id]["start_time"]
        
        # Execute the code
        success, output, error = await execute_python_code(code, timeout=timeout, env_vars=env_vars)
        execution_time = time.time() - start_time
        
        # Update the execution record with results
        async with execution_lock:
            if execution_id in executions:
                executions[execution_id] = {
                    "status": "completed" if success else "error",
                    "output": output,
                    "error": error,
                    "execution_time": execution_time,
                    "start_time": start_time,
                    "completed_at": time.time()
                }
    except Exception as e:
        async with execution_lock:
            if execution_id in executions:
                start_time = executions[execution_id].get("start_time", time.time())
                executions[execution_id] = {
                    "status": "error",
                    "output": "",
                    "error": str(e),
                    "execution_time": time.time() - start_time,
                    "start_time": start_time,
                    "completed_at": time.time()
                }
        
@app.get("/status/{execution_id}")
async def get_execution_status(execution_id: str):
    """Get the status of an asynchronous execution."""
    async with execution_lock:
        if execution_id not in executions:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        execution = executions[execution_id].copy()
    
    current_status = execution.get("status", "unknown")
    
    if current_status != "running":
        execution_time = execution.get("execution_time", 0)
    else:
        start_time = execution.get("start_time", time.time())
        execution_time = time.time() - start_time
    
    is_completed = current_status in ["completed", "error"]
    
    return {
        "status": current_status,
        "execution_time": execution_time,
        "completed": is_completed
    }

@app.get("/result/{execution_id}", response_model=ExecutionResult)
async def get_execution_result(execution_id: str):
    """Get the result of an asynchronous execution."""
    async with execution_lock:
        if execution_id not in executions:
            raise HTTPException(status_code=404, detail="Execution not found")
        
        if executions[execution_id]["status"] == "running":
            raise HTTPException(status_code=202, detail="Execution still in progress")
        
        execution = executions[execution_id].copy()
    
    return ExecutionResult(
        success=execution["status"] == "completed",
        output=execution.get("output", ""),
        error=execution.get("error"),
        execution_time=execution.get("execution_time", 0),
        execution_id=execution_id
    )

# Clean up old executions periodically
@app.on_event("startup")
async def start_periodic_cleanup():
    """Start periodic cleanup of old executions."""
    asyncio.create_task(periodic_cleanup())

async def periodic_cleanup():
    """Periodically clean up old executions."""
    while True:
        await asyncio.sleep(300)  # Run every 5 minutes
        
        current_time = time.time()
        async with execution_lock:
            to_delete = [
                execution_id 
                for execution_id, execution in executions.items() 
                if execution.get("completed_at", 0) < current_time - 3600  # 1 hour
            ]
            
            for execution_id in to_delete:
                del executions[execution_id]

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8888)