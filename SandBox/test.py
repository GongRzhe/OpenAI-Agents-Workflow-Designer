import asyncio
import httpx
import time

# Base URL for the API
BASE_URL = "http://127.0.0.1:8888"

async def main():
    """Test the Python Code Executor API."""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        print("1. Testing synchronous execution")
        code = """
print("Hello, World!")
result = 10 + 20
print(f"Result: {result}")
"""
        response = await client.post("/execute", json={
            "code": code,
            "timeout": 5,
            "async_execution": False
        })
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        print("\n" + "-"*50 + "\n")
        
        print("2. Testing synchronous execution with error")
        code = """
print("This will raise an error")
1/0  # Division by zero error
"""
        response = await client.post("/execute", json={
            "code": code,
            "timeout": 5,
            "async_execution": False
        })
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        print("\n" + "-"*50 + "\n")
        
        print("3. Testing asynchronous execution")
        code ="""
import json
import time

def fetch_mock_data():

    return [
        {"id": 1, "name": "Alice", "age": 25, "score": 90},
        {"id": 2, "name": "Bob", "age": 30, "score": 85},
        {"id": 3, "name": "Charlie", "age": 28, "score": 78}
    ]

def process_data(data):

    if not data:
        return []
    
    records = []
    for item in data:
        records.append({
            "id": item.get("id"),
            "name": item.get("name"),
            "age": item.get("age", 0),
            "score": item.get("score", 0)
        })
    
    return records

def main():
    print("Fetching mock data...")
    data = fetch_mock_data()
    processed_data = process_data(data)
    
    if processed_data:
        print("Sample Data:", processed_data[:3])
    
    print("Script execution completed.")
    
if __name__ == "__main__":
    main()
"""
#         code = """
# import asyncio
# from agents import Agent, Runner, function_tool
# from pydantic import BaseModel # Assuming pydantic might be needed for output_type
# from dotenv import load_dotenv
# import os
# load_dotenv()
# # print(os.getenv("OPENAI_API_KEY"))
# # --- Generated Pydantic Models (if any) ---
# # TODO: Add logic to generate Pydantic models based on Agent output_type


# # --- Agent Definitions ---

# assistant = Agent(
#     name="Assistant",
#     instructions="You are a helpful assistant",
# )

# # --- Runner Execution ---

# async def run_workflow_0():
#     print("--- Running Workflow 0 (Async) ---")
#     result = await Runner.run(assistant, input="Write a haiku about recursion in programming.")
#     print("Final Output:", result.final_output)
#     return result

# async def main():
#     await run_workflow_0()

# if __name__ == "__main__":
#     asyncio.run(main())

# """
        response = await client.post("/execute", json={
            "code": code,
            "timeout": 10,
            "async_execution": True
        })
        
        print(f"Status code: {response.status_code}")
        data = response.json()
        print(f"Initial response: {data}")
        
        execution_id = data.get("execution_id")
        if not execution_id:
            print("No execution ID received")
            return
        
        print("\nChecking status...")
        completed = False
        for i in range(10):
            status_response = await client.get(f"/status/{execution_id}")
            status_data = status_response.json()
            print(f"Status check {i+1}: {status_data}")
            
            if status_data.get("completed"):
                completed = True
                break
                
            await asyncio.sleep(1)
        
        if not completed:
            print("Execution did not complete in the expected time")
            return
            
        print("\nGetting result...")
        result_response = await client.get(f"/result/{execution_id}")
        print(f"Status code: {result_response.status_code}")
        print(f"Result: {result_response.json()}")
        print("\n" + "-"*50 + "\n")
        
        print("4. Testing environment variables")
        code = """
import os
print(f"TEST_VAR = {os.environ.get('TEST_VAR', 'Not set')}")
"""
        response = await client.post("/execute", json={
            "code": code,
            "timeout": 5,
            "async_execution": False,
            "env_vars": {"TEST_VAR": "Hello from env var"}
        })
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        print("\n" + "-"*50 + "\n")
        
        print("5. Testing execution timeout")
        code = """
import time
print("Starting potentially infinite loop")
for i in range(100):
    print(f"Iteration {i}")
    time.sleep(0.5)
print("This should not be reached due to timeout")
"""
        response = await client.post("/execute", json={
            "code": code,
            "timeout": 2,  # Short timeout to trigger timeout
            "async_execution": False
        })
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        print("\n" + "-"*50 + "\n")
        
        print("All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())