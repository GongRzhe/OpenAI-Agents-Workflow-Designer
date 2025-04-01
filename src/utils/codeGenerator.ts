// Updated codeGenerator.ts to support Python code nodes
import { Node, Edge } from 'reactflow';

// Helper function to sanitize names for Python variables/functions
const sanitizeName = (name: string | undefined): string => {
  if (!name) return 'unnamed_entity';
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
};

// Helper to parse parameters string into a Python function signature string
const parseParameters = (paramsStr: string | undefined): string => {
    if (!paramsStr) return '';
    // Example input: "city: str, count: int"
    // Example output: "city: str, count: int" (already valid)
    // Add more robust parsing if needed
    return paramsStr;
};

// Helper to format the return type hint
const formatReturnType = (returnType: string | undefined): string => {
    if (!returnType || returnType.toLowerCase() === 'none') return 'None';
    // Basic types are usually fine, could add mapping for complex types if needed
    return returnType;
};

export const generatePythonCode = (nodes: Node[], edges: Edge[]): string => {
  let code = `import asyncio
from agents import Agent, Runner, function_tool
from pydantic import BaseModel # Assuming pydantic might be needed for output_type

# --- Generated Pydantic Models (if any) ---
# TODO: Add logic to generate Pydantic models based on Agent output_type

`;

  const functionToolNodes = nodes.filter((node) => node.type === 'functionTool');
  const agentNodes = nodes.filter((node) => node.type === 'agent');
  const runnerNodes = nodes.filter((node) => node.type === 'runner');
  const pythonCodeNodes = nodes.filter((node) => node.type === 'pythonCode');

  // --- Python Code Nodes ---
  if (pythonCodeNodes.length > 0) {
    code += "\n# --- Custom Python Code ---\n";
    pythonCodeNodes.forEach((node) => {
      const nodeName = sanitizeName(node.data.name || `python_node_${node.id}`);
      const nodeCode = node.data.code || '# Empty code block';

      code += `\n# ${node.data.name || 'Unnamed Python Node'}\n`;
      
      // Indent the code properly
      const indentedCode = nodeCode.split('\n').map((line: string) => `    ${line}`).join('\n');
      code += indentedCode + '\n';
    });
  }

  // --- Function Tool Definitions ---
  if (functionToolNodes.length > 0) {
    code += "\n# --- Function Tool Definitions ---\n";
    functionToolNodes.forEach((node) => {
      const funcData = node.data;
      const funcName = sanitizeName(funcData.name);
      const params = parseParameters(funcData.parameters);
      const returnType = formatReturnType(funcData.returnType);
      const implementation = funcData.implementation || `    # TODO: Implement ${funcName}\n    pass`;

      code += `
@function_tool
def ${funcName}(${params}) -> ${returnType}:
${implementation.split('\n').map((line: string) => `    ${line}`).join('\n')}
`;
    });
  }

  // --- Agent Definitions ---
   if (agentNodes.length > 0) {
    code += "\n# --- Agent Definitions ---\n";
    agentNodes.forEach((node) => {
        const agentData = node.data;
        const agentVarName = sanitizeName(agentData.name) || `agent_${node.id}`;
        const agentName = agentData.name || 'Unnamed Agent';
        const instructions = agentData.instructions || 'No instructions provided.';
        const handoffDesc = agentData.handoff_description;

        // Find connected tools
        const toolEdges = edges.filter(edge => edge.target === node.id && edge.targetHandle === 'd'); // Agent is target, handle 'd'
        const toolSourceNodeIds = toolEdges.map(edge => edge.source);
        const connectedToolNodes = functionToolNodes.filter(toolNode => toolSourceNodeIds.includes(toolNode.id));
        const toolNames = connectedToolNodes.map(toolNode => sanitizeName(toolNode.data.name));

        // Find connected handoff agents (Agent -> Agent)
        const handoffEdges = edges.filter(edge => edge.source === node.id && edge.sourceHandle === 'b'); // This agent is source, handle 'b'
        const handoffTargetNodeIds = handoffEdges.map(edge => edge.target);
        const connectedHandoffAgents = agentNodes.filter(agentNode => handoffTargetNodeIds.includes(agentNode.id));
        const handoffNames = connectedHandoffAgents.map(agentNode => sanitizeName(agentNode.data.name) || `agent_${agentNode.id}`);

        code += `\n${agentVarName} = Agent(\n`;
        code += `    name="${agentName}",\n`;
        code += `    instructions="""${instructions}""",\n`;
        if (handoffDesc) {
            code += `    handoff_description="${handoffDesc}",\n`;
        }
        if (toolNames.length > 0) {
            code += `    tools=[${toolNames.join(', ')}],\n`;
        }
        if (handoffNames.length > 0) {
            code += `    handoffs=[${handoffNames.join(', ')}],\n`;
        }
        // TODO: Add output_type, guardrails etc.
        code += `)\n`;
    });
  }

  // --- Runner Execution ---
  if (runnerNodes.length > 0) {
    code += "\n# --- Runner Execution ---\n";
    let needsAsync = false;

    runnerNodes.forEach((node, index) => {
        const runnerData = node.data;
        const runnerInput = runnerData.input || 'Default input';
        const isAsync = runnerData.isAsync ?? true; // Default to async

        // Find the agent connected to this runner
        const connectedAgentEdge = edges.find(edge => edge.target === node.id && edge.targetHandle === 'a'); // Runner is target, handle 'a'
        const sourceAgentNodeId = connectedAgentEdge?.source;
        const connectedAgent = agentNodes.find(agentNode => agentNode.id === sourceAgentNodeId);
        const agentVarName = connectedAgent ? (sanitizeName(connectedAgent.data.name) || `agent_${connectedAgent.id}`) : 'None # Error: No agent connected to runner';

        if (isAsync) {
            needsAsync = true;
            code += `\nasync def run_workflow_${index}():\n`;
            code += `    print("--- Running Workflow ${index} (Async) ---")\n`;
            code += `    result = await Runner.run(${agentVarName}, input="${runnerInput}")\n`; // TODO: Add context if implemented
            code += `    print("Final Output:", result.final_output)\n`;
            code += `    return result\n`;
        } else {
            code += `\ndef run_workflow_${index}_sync():\n`;
            code += `    print("--- Running Workflow ${index} (Sync) ---")\n`;
            code += `    result = Runner.run_sync(${agentVarName}, input="${runnerInput}")\n`; // TODO: Add context if implemented
            code += `    print("Final Output:", result.final_output)\n`;
            code += `    return result\n`;
        }
    });

    // Add main execution block if any async runners exist
    if (needsAsync) {
        code += `\nasync def main():\n`;
        runnerNodes.forEach((node, index) => {
            if (node.data.isAsync ?? true) {
                code += `    await run_workflow_${index}()\n`;
            } else {
                 code += `    run_workflow_${index}_sync()\n`; // Still call sync functions from main async
            }
        });

        code += `\nif __name__ == "__main__":\n`;
        code += `    asyncio.run(main())\n`;
    } else {
        // If only sync runners, call them directly
        code += `\nif __name__ == "__main__":\n`;
         runnerNodes.forEach((node, index) => {
             if (!(node.data.isAsync ?? true)) {
                code += `    run_workflow_${index}_sync()\n`;
            }
         });
         if (runnerNodes.every(node => !(node.data.isAsync ?? true))) {
             code += `    pass # Add non-async execution calls here if needed\n`;
         }
    }
  } else {
      code += "\n# No Runner node found. Add a Runner node and connect it to an Agent to execute the workflow.\n";
  }


  return code;
};

// Add helper function to extract required dependencies from nodes
export const extractDependenciesFromNodes = (nodes: Node[]): string[] => {
  const dependencies = new Set<string>(['openai-agents']);
  
  // Extract from Python code nodes
  const pythonCodeNodes = nodes.filter((node) => node.type === 'pythonCode');
  
  pythonCodeNodes.forEach(node => {
    const code = node.data.code || '';
    
    // Simple regex to find imports
    const importRegex = /^(?:from|import)\s+([a-zA-Z0-9_]+)/gm;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      const packageName = match[1];
      // Skip standard library modules and openai-agents which is already included
      if (!['os', 'sys', 'math', 'json', 'time', 'datetime', 'random', 'asyncio', 'agents'].includes(packageName)) {
        dependencies.add(packageName);
      }
    }
  });
  
  return Array.from(dependencies);
};