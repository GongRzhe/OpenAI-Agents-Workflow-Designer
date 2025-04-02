
import pytest
import asyncio
import time
from fastapi.testclient import TestClient
from api import app, executions, cleanup_old_executions
from executor import execute_python_code, get_installed_packages, execute_agent_code, execute_as_script, sanitize_code

# Initialize the test client for FastAPI
client = TestClient(app)

# Clear executions before each test
@pytest.fixture(autouse=True)
def clear_executions():
    app.state.executions = {}

# Tests for /status endpoint
def test_status():
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert "version" in data
    assert "python_version" in data
    assert "active_executions" in data
    assert isinstance(data["active_executions"], int)

# Tests for /execute endpoint
def test_execute_success():
    code = "print('Hello, World!')"
    response = client.post("/execute", json={"code": code})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["output"] == "Hello, World!\n"
    assert data["error"] is None
    assert data["execution_time"] > 0

def test_execute_with_env_vars():
    code = "import os; print(os.environ['TEST_VAR'])"
    env_vars = {"TEST_VAR": "test_value"}
    response = client.post("/execute", json={"code": code, "env_vars": env_vars})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["output"] == "test_value\n"
    assert data["error"] is None

def test_execute_error():
    code = "raise ValueError('Test error')"
    response = client.post("/execute", json={"code": code})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["output"] == ""
    assert "ValueError: Test error" in data["error"]

def test_execute_timeout():
    code = "import time; time.sleep(2)"
    response = client.post("/execute", json={"code": code, "timeout": 1})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["output"] == ""
    assert "Execution timed out" in data["error"]

def test_execute_invalid_code():
    code = "print('Hello, World!'"  # Missing closing parenthesis
    response = client.post("/execute", json={"code": code})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["output"] == ""
    assert "SyntaxError" in data["error"]

def test_execute_blocked_import():
    code = "import subprocess"
    response = client.post("/execute", json={"code": code})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["output"] == ""
    assert "Blocked import detected" in data["error"]

def test_execution_isolation():
    code1 = "global_var = 'value1'; print(global_var)"
    code2 = "try: print(global_var)\nexcept NameError: print('Not defined')"
    response1 = client.post("/execute", json={"code": code1})
    assert response1.status_code == 200
    assert response1.json()["success"] is True
    assert response1.json()["output"] == "value1\n"

    response2 = client.post("/execute", json={"code": code2})
    assert response2.status_code == 200
    assert response2.json()["success"] is True
    assert response2.json()["output"] == "Not defined\n"

# Tests for asynchronous execution endpoints
def test_execute_async_complete():
    code = "print('Async Done')"
    response = client.post("/execute/async", json={"code": code, "timeout": 5})
    assert response.status_code == 200
    data = response.json()
    execution_id = data["execution_id"]
    
    # Wait briefly for execution to complete
    time.sleep(1)
    
    # Check status
    status_response = client.get(f"/status/{execution_id}")
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["status"] in ["running", "completed"]
    assert status_data["completed"] is True
    
    # Get result
    result_response = client.get(f"/result/{execution_id}")
    assert result_response.status_code == 200
    result_data = result_response.json()
    assert result_data["success"] is True
    assert result_data["output"] == "Async Done\n"
    assert result_data["error"] is None

def test_execute_async_running():
    code = "import time; time.sleep(2); print('Slow')"
    response = client.post("/execute/async", json={"code": code, "timeout": 5})
    assert response.status_code == 200
    execution_id = response.json()["execution_id"]
    
    # Add a short delay to allow background task to start but not complete
    time.sleep(0.1)
    
    # Check status immediately after delay
    status_response = client.get(f"/status/{execution_id}")
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["status"] in ["running"]
    assert status_data["completed"] is False

def test_stop_execution():
    code = "import time; time.sleep(10)"
    response = client.post("/execute/async", json={"code": code, "timeout": 20})
    assert response.status_code == 200
    execution_id = response.json()["execution_id"]
    
    # Stop the execution
    stop_response = client.post(f"/stop/{execution_id}")
    assert stop_response.status_code == 200
    stop_data = stop_response.json()
    assert stop_data["success"] is True
    assert stop_data["message"] == "Execution stopped"
    
    # Check status
    status_response = client.get(f"/status/{execution_id}")
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "stopped"

def test_execution_not_found():
    response = client.get("/status/invalid_id")
    assert response.status_code == 404
    assert "Execution not found" in response.json()["detail"]

# Tests for /dependencies and /dependencies/install endpoints
def test_list_dependencies():
    response = client.get("/dependencies")
    assert response.status_code == 200
    data = response.json()
    assert "dependencies" in data
    assert isinstance(data["dependencies"], list)
    assert len(data["dependencies"]) > 0

def test_install_dependency_invalid_name():
    response = client.post("/dependencies/install", json={"package": "invalid#name"})
    assert response.status_code == 400
    assert "Invalid package name" in response.json()["detail"]

# Tests for /openai-agents/examples endpoint
def test_get_agent_examples():
    response = client.get("/openai-agents/examples")
    assert response.status_code == 200
    data = response.json()
    assert "examples" in data
    assert len(data["examples"]) == 3  # Based on the provided examples
    for example in data["examples"]:
        assert "name" in example
        assert "description" in example
        assert "code" in example

# Test for cleanup of old executions
@pytest.mark.asyncio
async def test_cleanup_old_executions():
    current_time = time.time()
    executions["old_id"] = {"completed_at": current_time - 3601, "status": "completed"}
    executions["new_id"] = {"completed_at": current_time - 100, "status": "completed"}
    
    await cleanup_old_executions()
    
    assert "old_id" not in executions
    assert "new_id" in executions

# Tests for executor.py functions
@pytest.mark.asyncio
async def test_execute_python_code_success():
    code = "print('Hello, World!')"
    success, output, error = await execute_python_code(code)
    assert success is True
    assert output == "Hello, World!\n"
    assert error is None

@pytest.mark.asyncio
async def test_execute_python_code_error():
    code = "raise ValueError('Test error')"
    success, output, error = await execute_python_code(code)
    assert success is False
    assert output == ""
    assert "ValueError: Test error" in error

@pytest.mark.asyncio
async def test_execute_python_code_timeout():
    code = "import time; time.sleep(2)"
    success, output, error = await execute_python_code(code, timeout=1)
    assert success is False
    assert output == ""
    assert "Execution timed out" in error

@pytest.mark.asyncio
async def test_execute_python_code_blocked_import():
    code = "import subprocess"
    success, output, error = await execute_python_code(code)
    assert success is False
    assert output == ""
    assert "Blocked import detected" in error

def test_sanitize_code_blocked_import():
    code = "import subprocess"
    with pytest.raises(ValueError, match="Blocked import detected: subprocess"):
        sanitize_code(code)

def test_sanitize_code_allowed_import():
    code = "import math"
    sanitized = sanitize_code(code)
    assert sanitized == code

@pytest.mark.asyncio
async def test_get_installed_packages():
    packages = await get_installed_packages()
    assert isinstance(packages, list)
    assert len(packages) > 0
    assert any("pytest" in pkg for pkg in packages)  # Assuming pytest is installed

# Tests for execute_agent_code
# These assume 'openai-agents' is installed; mock if unavailable
@pytest.mark.asyncio
async def test_execute_agent_code_success():
    code = """
import asyncio
from agents import Agent, Runner
async def main():
    print('Agent Test')
if __name__ == "__main__":
    asyncio.run(main())
"""
    success, output, error = await execute_agent_code(code)
    assert success is True
    assert output == "Agent Test\n"
    assert error is None

@pytest.mark.asyncio
async def test_execute_agent_code_no_main():
    code = "print('No main')"
    success, output, error = await execute_agent_code(code)
    assert success is True
    assert output == "No main\n"
    assert error is None  # Should wrap in main automatically

# Tests for execute_as_script
@pytest.mark.asyncio
async def test_execute_as_script_success():
    code = "print('Script Test')"
    success, output, error = await execute_as_script(code)
    assert success is True
    assert output == "Script Test\n"
    assert error == ""

@pytest.mark.asyncio
async def test_execute_as_script_timeout():
    code = "import time; time.sleep(2)"
    success, output, error = await execute_as_script(code, timeout=1)
    assert success is False
    assert output == ""
    assert "Execution timed out" in error

@pytest.mark.asyncio
async def test_execute_as_script_error():
    code = "raise ValueError('Script error')"
    success, output, error = await execute_as_script(code)
    assert success is False
    assert output == ""
    assert "ValueError: Script error" in error