import asyncio
from agents import Agent, Runner, function_tool
from pydantic import BaseModel # Assuming pydantic might be needed for output_type
from dotenv import load_dotenv

load_dotenv()
# --- Generated Pydantic Models (if any) ---
# TODO: Add logic to generate Pydantic models based on Agent output_type


# --- Agent Definitions ---

assistant = Agent(
    name="Assistant",
    instructions="""You are a helpful assistant""",
)

# --- Runner Execution ---

async def run_workflow_0():
    print("--- Running Workflow 0 (Async) ---")
    result = await Runner.run(assistant, input="Write a haiku about recursion in programming.")
    print("Final Output:", result.final_output)
    return result

async def main():
    await run_workflow_0()

if __name__ == "__main__":
    asyncio.run(main())
