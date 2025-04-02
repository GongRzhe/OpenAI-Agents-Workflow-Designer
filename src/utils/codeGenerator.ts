// Updated codeGenerator.ts to support Python code nodes and MCP servers
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
  let code = `from agents import Agent, Runner
import asyncio

from dotenv import load_dotenv
load_dotenv()
`;

  const functionToolNodes = nodes.filter((node) => node.type === 'functionTool');
  const agentNodes = nodes.filter((node) => node.type === 'agent');
  const runnerNodes = nodes.filter((node) => node.type === 'runner');
  const pythonCodeNodes = nodes.filter((node) => node.type === 'pythonCode');
  const mcpNodes = nodes.filter((node) => node.type === 'mcp');

  // If we have MCP nodes, add the imports
  if (mcpNodes.length > 0) {
    code += `from agents.mcp import MCPServer, MCPServerStdio, MCPServerSse\n`;
  }

  // Add imports for function_tool if needed
  if (functionToolNodes.length > 0) {
    code += `from agents import function_tool\n`;
  }

  // Add additional imports based on node types
  if (runnerNodes.some(node => node.data.trace) || mcpNodes.length > 0) {
    code += `from agents import gen_trace_id, trace\n`;
  }

  // Add Pydantic import if any agent has structured output_type
  if (agentNodes.some(node => node.data.output_type)) {
    code += `from pydantic import BaseModel\n`;
  }

  code += `\n`;

  // First define Python code nodes if any
  if (pythonCodeNodes.length > 0) {
    code += "# --- Custom Python Code ---\n";
    pythonCodeNodes.forEach((node) => {
      const nodeCode = node.data.code || '# Empty code block';
      code += `\n# ${node.data.name || 'Unnamed Python Node'}\n${nodeCode}\n`;
    });
    code += `\n`;
  }

  // Second define function tools
  if (functionToolNodes.length > 0) {
    code += "# --- Function Tool Definitions ---\n";
    functionToolNodes.forEach((node) => {
      const funcData = node.data;
      const funcName = sanitizeName(funcData.name);
      const params = parseParameters(funcData.parameters);
      const returnType = formatReturnType(funcData.returnType);
      const implementation = funcData.implementation || `    # TODO: Implement ${funcName}\n    pass`;

      code += `
@function_tool
def ${funcName}(${params}) -> ${returnType}:
${implementation}
`;
    });
    code += `\n`;
  }

  // Generate MCP Server definitions if any
  if (mcpNodes.length > 0) {
    code += "# --- MCP Server Definitions ---\n";

    mcpNodes.forEach((node, index) => {
      const mcpData = node.data;
      const mcpVarName = sanitizeName(mcpData.name) || `mcp_server_${index}`;
      const serverType = mcpData.serverType || 'custom';

      if (serverType === 'git') {
        code += `${mcpVarName} = MCPServerStdio(\n`;
        code += `    name="${mcpData.name || `Git MCP Server ${index}`}",\n`;
        if (mcpData.cacheToolsList) {
          code += `    cache_tools_list=True,\n`;
        }
        code += `    params={\n`;
        code += `        "command": "uvx",\n`;
        code += `        "args": ["mcp-server-git"],\n`;
        code += `    },\n`;
        code += `)\n\n`;
      } else if (serverType === 'filesystem') {
        code += `${mcpVarName} = MCPServerStdio(\n`;
        code += `    name="${mcpData.name || `Filesystem MCP Server ${index}`}",\n`;
        if (mcpData.cacheToolsList) {
          code += `    cache_tools_list=True,\n`;
        }
        code += `    params={\n`;
        code += `        "command": "npx",\n`;
        code += `        "args": ["-y", "@modelcontextprotocol/server-filesystem", "${mcpData.directory || '.'}"],\n`;
        code += `    },\n`;
        code += `)\n\n`;
      } else { // custom
        code += `${mcpVarName} = MCPServerStdio(\n`;
        code += `    name="${mcpData.name || `Custom MCP Server ${index}`}",\n`;
        if (mcpData.cacheToolsList) {
          code += `    cache_tools_list=True,\n`;
        }
        code += `    params={\n`;
        code += `        "command": "${mcpData.command || 'npx'}",\n`;
        code += `        "args": [${(mcpData.args || '').split(',').map((arg: string) => `"${arg.trim()}"`).join(', ')}],\n`;
        code += `    },\n`;
        code += `)\n\n`;
      }
    });
  }

  // Analyze handoffs to determine dependency order
  const handoffMap = new Map();

  // Find all handoff connections
  edges.forEach(edge => {
    if (edge.sourceHandle === 'b') { // Bottom handle = handoff
      const sourceId = edge.source;
      const targetId = edge.target;

      if (!handoffMap.has(sourceId)) {
        handoffMap.set(sourceId, []);
      }

      handoffMap.get(sourceId).push(targetId);
    }
  });

  // Identify leaf nodes (agents with no handoffs to other agents)
  const leafAgentIds = new Set(
    agentNodes
      .filter(node => !handoffMap.has(node.id))
      .map(node => node.id)
  );

  // Sort agent nodes - first leaf nodes, then others
  const sortedAgentNodes = [
    ...agentNodes.filter(node => leafAgentIds.has(node.id)),
    ...agentNodes.filter(node => !leafAgentIds.has(node.id))
  ];

  // Store defined agent variables for later reference
  const agentVarMap = new Map();

  // Define agent nodes in the sorted order
  if (sortedAgentNodes.length > 0) {
    code += "# --- Agent Definitions ---\n";

    sortedAgentNodes.forEach((node) => {
      const agentData = node.data;
      const agentVarName = sanitizeName(agentData.name) || `agent_${node.id}`;
      const agentName = agentData.name || 'Unnamed Agent';
      const instructions = agentData.instructions || 'No instructions provided.';
      const handoffDesc = agentData.handoff_description;

      // Store the variable name for this agent
      agentVarMap.set(node.id, agentVarName);

      code += `${agentVarName} = Agent(\n`;
      code += `    name="${agentName}",\n`;

      if (instructions) {
        code += `    instructions="""${instructions}""",\n`;
      }

      if (handoffDesc) {
        code += `    handoff_description="${handoffDesc}",\n`;
      }

      // Add handoffs if this agent has any
      const handoffTargetIds = handoffMap.get(node.id) || [];
      const handoffVars = handoffTargetIds
        .map((id: string) => agentVarMap.get(id))
        .filter(Boolean); // Filter out undefined entries

      if (handoffVars.length > 0) {
        code += `    handoffs=[${handoffVars.join(', ')}],\n`;
      }

      // Add tools if any
      const toolEdges = edges.filter(edge => edge.target === node.id && edge.targetHandle === 'd');
      const toolSourceNodeIds = toolEdges.map(edge => edge.source);
      const connectedToolNodes = functionToolNodes.filter(toolNode => toolSourceNodeIds.includes(toolNode.id));
      const toolNames = connectedToolNodes.map(toolNode => sanitizeName(toolNode.data.name));

      if (toolNames.length > 0) {
        code += `    tools=[${toolNames.join(', ')}],\n`;
      }

      // Add MCP servers if any
      const mcpEdges = edges.filter(edge => edge.target === node.id && edge.targetHandle === 'a');
      const mcpSourceNodeIds = mcpEdges.map(edge => edge.source);
      const connectedMcpNodes = mcpNodes.filter(mcpNode => mcpSourceNodeIds.includes(mcpNode.id));
      const mcpServerNames = connectedMcpNodes.map(mcpNode =>
        sanitizeName(mcpNode.data.name) || `mcp_server_${mcpNode.id}`
      );

      if (mcpServerNames.length > 0) {
        code += `    mcp_servers=[${mcpServerNames.join(', ')}],\n`;
      }

      code += `)\n\n`;
    });
  }

  // Define runner execution code
  if (runnerNodes.length > 0) {
    code += "# --- Runner Execution ---\n";

    code += `async def main():\n`;

    // Generate trace ID if any runner has tracing enabled
    if (runnerNodes.some(node => node.data.trace) || mcpNodes.length > 0) {
      code += `    # Generate trace ID for debugging\n`;
      code += `    trace_id = gen_trace_id()\n`;
      code += `    print(f"View trace: https://platform.openai.com/traces/trace?trace_id={trace_id}\\n")\n\n`;
    }

    // Using async with blocks for MCP servers if present
    if (mcpNodes.length > 0) {
      // Create an async with block for each MCP server
      mcpNodes.forEach((node, index) => {
        const mcpData = node.data;
        const mcpVarName = sanitizeName(mcpData.name) || `mcp_server_${index}`;

        // We'll use multi-line string for indentation
        code += `    # Use context manager for ${mcpData.name || 'MCP server'}\n`;
        code += `    async with ${mcpVarName}:\n`;
      });

      // Add trace context manager if needed
      if (runnerNodes.some(node => node.data.trace)) {
        code += `        # Tracing for better debugging\n`;
        code += `        with trace(workflow_name="MCP Workflow", trace_id=trace_id):\n`;

        // Additional indentation for each runner
        const indent = "            ";

        runnerNodes.forEach((node, index) => {
          const runnerData = node.data;
          const runnerInput = runnerData.input || 'Default input';

          // Find the agent connected to this runner
          const connectedAgentEdge = edges.find(edge => edge.target === node.id && edge.targetHandle === 'a');
          const sourceAgentNodeId = connectedAgentEdge?.source;
          const connectedAgentVarName = sourceAgentNodeId ? agentVarMap.get(sourceAgentNodeId) : null;

          if (connectedAgentVarName) {
            code += `\n${indent}# Run workflow ${index}\n`;
            code += `${indent}print("\\n" + "-" * 40)\n`;
            code += `${indent}print(f"Running: ${runnerInput}")\n`;
            code += `${indent}result = await Runner.run(starting_agent=${connectedAgentVarName}, input="${runnerInput}")\n`;
            code += `${indent}print(result.final_output)\n`;
          } else {
            code += `\n${indent}# Warning: Runner not connected to any agent\n`;
            code += `${indent}print("Runner not connected to any agent")\n`;
          }
        });
      } else {
        // Direct runner execution without trace
        const indent = "        ";

        runnerNodes.forEach((node, index) => {
          const runnerData = node.data;
          const runnerInput = runnerData.input || 'Default input';

          // Find the agent connected to this runner
          const connectedAgentEdge = edges.find(edge => edge.target === node.id && edge.targetHandle === 'a');
          const sourceAgentNodeId = connectedAgentEdge?.source;
          const connectedAgentVarName = sourceAgentNodeId ? agentVarMap.get(sourceAgentNodeId) : null;

          if (connectedAgentVarName) {
            code += `\n${indent}# Run workflow ${index}\n`;
            code += `${indent}print("\\n" + "-" * 40)\n`;
            code += `${indent}print(f"Running: ${runnerInput}")\n`;
            code += `${indent}result = await Runner.run(starting_agent=${connectedAgentVarName}, input="${runnerInput}")\n`;
            code += `${indent}print(result.final_output)\n`;
          } else {
            code += `\n${indent}# Warning: Runner not connected to any agent\n`;
            code += `${indent}print("Runner not connected to any agent")\n`;
          }
        });
      }
    } else {
      // Simpler case without MCP servers
      if (runnerNodes.some(node => node.data.trace)) {
        code += `    # Tracing for better debugging\n`;
        code += `    with trace(workflow_name="Workflow Example", trace_id=trace_id):\n`;

        const indent = "        ";

        runnerNodes.forEach((node, index) => {
          const runnerData = node.data;
          const runnerInput = runnerData.input || 'Default input';

          // Find the agent connected to this runner
          const connectedAgentEdge = edges.find(edge => edge.target === node.id && edge.targetHandle === 'a');
          const sourceAgentNodeId = connectedAgentEdge?.source;
          const connectedAgentVarName = sourceAgentNodeId ? agentVarMap.get(sourceAgentNodeId) : null;

          if (connectedAgentVarName) {
            code += `\n${indent}# Run workflow ${index}\n`;
            code += `${indent}print("\\n" + "-" * 40)\n`;
            code += `${indent}print(f"Running: ${runnerInput}")\n`;
            code += `${indent}result = await Runner.run(${connectedAgentVarName}, input="${runnerInput}")\n`;
            code += `${indent}print(result.final_output)\n`;
          } else {
            code += `\n${indent}# Warning: Runner not connected to any agent\n`;
            code += `${indent}print("Runner not connected to any agent")\n`;
          }
        });
      } else {
        // Simplest case - no MCP, no tracing
        runnerNodes.forEach((node, index) => {
          const runnerData = node.data;
          const runnerInput = runnerData.input || 'Default input';

          // Find the agent connected to this runner
          const connectedAgentEdge = edges.find(edge => edge.target === node.id && edge.targetHandle === 'a');
          const sourceAgentNodeId = connectedAgentEdge?.source;
          const connectedAgentVarName = sourceAgentNodeId ? agentVarMap.get(sourceAgentNodeId) : null;

          if (connectedAgentVarName) {
            code += `    result = await Runner.run(${connectedAgentVarName}, "${runnerInput}")\n`;
            code += `    print(result.final_output)\n\n`;
          } else {
            code += `    # Warning: Runner not connected to any agent\n`;
            code += `    print("Runner not connected to any agent")\n\n`;
          }
        });
      }
    }

    code += `if __name__ == "__main__":\n`;

    // Check for required dependencies based on node types
    if (mcpNodes.some(node => node.data.serverType === 'git')) {
      code += `    # Check for uvx installation\n`;
      code += `    import shutil\n`;
      code += `    if not shutil.which("uvx"):\n`;
      code += `        raise RuntimeError("uvx is not installed. Please install it with \`pip install uvx\`.")\n\n`;
    }

    if (mcpNodes.some(node => node.data.serverType === 'filesystem' || node.data.serverType === 'custom')) {
      code += `    # Check for npx installation\n`;
      code += `    import shutil\n`;
      code += `    if not shutil.which("npx"):\n`;
      code += `        raise RuntimeError("npx is not installed. Please install it with \`npm install -g npx\`.")\n\n`;
    }

    code += `    asyncio.run(main())\n`;
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

  // Check for MCP nodes
  const mcpNodes = nodes.filter((node) => node.type === 'mcp');
  if (mcpNodes.length > 0) {
    // Add MCP-related dependencies
    const hasGitServer = mcpNodes.some(node => node.data.serverType === 'git');
    const hasFilesystemServer = mcpNodes.some(node => node.data.serverType === 'filesystem');

    if (hasGitServer) {
      dependencies.add('uvx');
    }

    if (hasFilesystemServer || mcpNodes.some(node => node.data.serverType === 'custom')) {
      // Many custom MCP servers require npx
      dependencies.add('npm');
    }
  }

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