import React, { useState, useCallback, useRef, DragEvent } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  ReactFlowInstance,
  XYPosition,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
// Import custom node components
import AgentNode from './components/nodes/AgentNode';
import RunnerNode from './components/nodes/RunnerNode';
import FunctionToolNode from './components/nodes/FunctionToolNode';
import { NodeDataProvider } from './context/NodeDataContext';
import { generatePythonCode } from './utils/codeGenerator'; // Import the generator
import CodeModal from './components/common/CodeModal'; // Import the modal

// Define initial elements if needed, or start empty
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Define custom node types
const nodeTypes = {
  agent: AgentNode,
  runner: RunnerNode,
  functionTool: FunctionToolNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // console.log('onDragOver triggered'); // Remove log
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      // console.log('onDrop triggered'); // Remove log

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      // console.log('Dropped type:', type); // Remove log

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let nodeData = {};
      switch (type) {
        case 'agent':
          nodeData = { name: 'New Agent', instructions: 'You are a helpful assistant.' };
          break;
        case 'runner':
          nodeData = { input: 'Initial input', isAsync: true };
          break;
        case 'functionTool':
          nodeData = { name: 'new_function', parameters: 'param: str', returnType: 'str', implementation: 'def new_function(param: str) -> str:\n    return f"Processed: {param}"' };
          break;
        default:
          nodeData = { label: `${type} node` };
      }

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
      // console.log('New node added:', newNode); // Remove log
    },
    [reactFlowInstance, setNodes]
  );

  const handleGenerateCode = useCallback(() => {
    const code = generatePythonCode(nodes, edges);
    setGeneratedCode(code);
    setIsModalOpen(true);
    console.log('Generated Code:\n', code);
  }, [nodes, edges]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: 'lightblue' }}>
      <CssBaseline /> 
      <Navbar onGenerateCode={handleGenerateCode} />
      <Sidebar />
      <Box
        component="main"
        sx={{ width: 'calc(100% - 240px)', height: '100vh', overflow: 'hidden', zIndex: 1, border: '2px solid red', minWidth: 0 /* Explicit width */ }}
      >
        <Toolbar /> {/* Offset for the Navbar */}
        <ReactFlowProvider>
          {/* Wrap ReactFlow with NodeDataProvider */}
          <NodeDataProvider>
            <div
              style={{ height: 'calc(100% - 64px)', width: '100%' /* Ensure full width */ }}
              ref={reactFlowWrapper}
              onDrop={onDrop} // Move handler here
              onDragOver={onDragOver} // Move handler here
            > {/* Adjust height considering Toolbar */}
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                // onDrop={onDrop} // Remove handler from here
                // onDragOver={onDragOver} // Remove handler from here
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                noDragClassName="nodrag"
              >
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          </NodeDataProvider>
        </ReactFlowProvider>
      </Box>
      <CodeModal
        open={isModalOpen}
        onClose={handleCloseModal}
        code={generatedCode}
      />
    </Box>
  );
}

export default App;
