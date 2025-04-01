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
  NodeResizeControl,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  applyEdgeChanges,
  useKeyPress,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';


import NodeContextMenu from './components/common/NodeContextMenu';
import KeyboardShortcutsHelp from './components/common/KeyboardShortcutsHelp';
import { useEffect } from 'react';
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


  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
    edgeId?: string;
  } | null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const deleteKeyPressed = useKeyPress(['Delete', 'Backspace']);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Log resize events to debug
      const resizeChanges = changes.filter(change =>
        change.type === 'dimensions' ||
        change.type === 'position' ||
        (change.type === 'reset' && 'style' in change)
      );

      // Log delete events
      const deleteChanges = changes.filter(change => change.type === 'remove');
      if (deleteChanges.length > 0) {
        console.log('Nodes deleted:', deleteChanges);
      }

      if (resizeChanges.length > 0) {
        console.log('Node resize/position changes:', resizeChanges);
      }

      // Apply all changes
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );


  const onDeleteElements = useCallback(() => {
    // Get selected nodes and edges to delete
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);

    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      console.log('Deleting selected elements:', { nodes: selectedNodes, edges: selectedEdges });

      // For nodes, create delete changes
      const nodeChanges: NodeChange[] = selectedNodes.map((node) => ({
        id: node.id,
        type: 'remove',
      }));

      // For edges, create delete changes
      const edgeChanges: EdgeChange[] = selectedEdges.map((edge) => ({
        id: edge.id,
        type: 'remove',
      }));

      // Apply the changes
      if (nodeChanges.length > 0) {
        setNodes((nds) => applyNodeChanges(nodeChanges, nds));
      }

      if (edgeChanges.length > 0) {
        setEdges((eds) => applyEdgeChanges(edgeChanges, eds));
      }
    }
  }, [nodes, edges, setNodes, setEdges]);


  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Log delete events
      const deleteChanges = changes.filter(change => change.type === 'remove');
      if (deleteChanges.length > 0) {
        console.log('Edges deleted:', deleteChanges);
      }

      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

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


  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Prevent default context menu
      event.preventDefault();

      // Select the node that was right-clicked
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );

      // Set context menu position and node id
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [setNodes]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      // Prevent default context menu
      event.preventDefault();

      // Select the edge that was right-clicked
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id,
        }))
      );

      // Set context menu position and edge id
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        edgeId: edge.id,
      });
    },
    [setEdges]
  );

  const onPaneClick = useCallback(() => {
    // Close context menu on pane click
    setContextMenu(null);
  }, []);


  const handleContextMenuDelete = useCallback(() => {
    if (contextMenu?.nodeId) {
      // Create and apply a node remove change
      const nodeChange: NodeChange = {
        id: contextMenu.nodeId,
        type: 'remove',
      };
      setNodes((nds) => applyNodeChanges([nodeChange], nds));
    } else if (contextMenu?.edgeId) {
      // Create and apply an edge remove change
      const edgeChange: EdgeChange = {
        id: contextMenu.edgeId,
        type: 'remove',
      };
      setEdges((eds) => applyEdgeChanges([edgeChange], eds));
    }
  }, [contextMenu, setNodes, setEdges]);

  useEffect(() => {
    if (deleteKeyPressed) {
      onDeleteElements();
    }
  }, [deleteKeyPressed, onDeleteElements]);


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
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                noDragClassName="nodrag"
                selectNodesOnDrag={false}
                elementsSelectable={true}
                nodesDraggable={true}
                zoomOnScroll={true}
                panOnScroll={false}
                panOnDrag={[1, 2]}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onPaneClick={onPaneClick}
              >
                <Controls />
                <Background />
                <Panel position="top-right" style={{ marginTop: 65, marginRight: 10 }}>
                  <button
                    onClick={onDeleteElements}
                    className="delete-button"
                    style={{
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Delete Selected
                  </button>
                </Panel>
              </ReactFlow>


              {contextMenu && (
                <NodeContextMenu
                  x={contextMenu.x}
                  y={contextMenu.y}
                  onDelete={handleContextMenuDelete}
                  onClose={() => setContextMenu(null)}
                />
              )}
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
