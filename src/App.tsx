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

import { NodeProps } from 'reactflow';
import { exportProject, importProject, ProjectData } from './utils/projectIO';
import ExportModal from './components/common/ExportModal';
import ImportModal from './components/common/ImportModal';

import SciFiBackground from './components/common/SciFiBackground';
import './styles/SciFiTheme.css';


import PythonCodeNode, { PythonCodeNodeData } from './components/nodes/PythonCodeNode';
import { PythonExecutionProvider } from './context/PythonExecutionContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import MCPNode from './components/nodes/MCPNode';
// Define initial elements if needed, or start empty
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Define custom node types
const nodeTypes = {
  agent: AgentNode,
  runner: RunnerNode,
  functionTool: FunctionToolNode,
  mcp: MCPNode,
  pythonCode: (props: NodeProps<PythonCodeNodeData>) => (
    <ErrorBoundary componentName="PythonCodeNode">
      <PythonCodeNode {...props} />
    </ErrorBoundary>
  )
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


  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [projectJson, setProjectJson] = useState('');

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



  const handleExportProject = useCallback(() => {
    const json = exportProject(nodes, edges, 'My Workflow');
    setProjectJson(json);
    setIsExportModalOpen(true);
  }, [nodes, edges]);

  const handleSaveProject = useCallback((projectName: string, description: string) => {
    const json = exportProject(nodes, edges, projectName, description);
    setProjectJson(json);
  }, [nodes, edges]);

  const handleImportProject = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const handleProjectImport = useCallback((jsonData: string) => {
    try {
      const projectData = importProject(jsonData);
      setNodes(projectData.nodes);
      setEdges(projectData.edges);
    } catch (error) {
      console.error('Error importing project:', error);
      alert('Failed to import project. Invalid format.');
    }
  }, [setNodes, setEdges]);


  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      bgcolor: 'rgba(25, 32, 56, 0.7)', // Dark sci-fi background color
      color: '#f6f8ff',
      fontFamily: '"Orbitron", sans-serif'
    }}>
      <CssBaseline />
      <Navbar
        onGenerateCode={handleGenerateCode}
        onExportProject={handleExportProject}
        onImportProject={handleImportProject}
        onDeleteElements={onDeleteElements} // Add this prop
      />
      <Sidebar />
      <Box
        component="main"
        sx={{ width: 'calc(100% - 240px)', height: '100vh', overflow: 'hidden', zIndex: 1, border: '2px solid red', minWidth: 0 /* Explicit width */ }}
      >
        <Toolbar /> {/* Offset for the Navbar */}
        <ReactFlowProvider>
          {/* Wrap ReactFlow with NodeDataProvider */}
          <NodeDataProvider>
            <PythonExecutionProvider>
              <div
                style={{
                  height: 'calc(100% - 64px)',
                  width: '100%',
                  position: 'relative',
                  border: '2px solid rgba(12, 235, 235, 0.3)',
                  borderRadius: '8px',
                  boxShadow: 'inset 0 0 20px rgba(12, 235, 235, 0.2), 0 0 15px rgba(12, 235, 235, 0.1)'
                }}
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
                  <div className="connection-help">
                    <div className="tooltip-wrapper">
                      <div className="tooltip-item">
                        <div className="connector agent"></div>
                        <span>Agent Connection</span>
                      </div>
                      <div className="tooltip-item">
                        <div className="connector runner"></div>
                        <span>Runner Connection</span>
                      </div>
                      <div className="tooltip-item">
                        <div className="connector tool"></div>
                        <span>Tool Connection</span>
                      </div>
                    </div>
                  </div>
                  <Controls
                    showZoom={true}
                    showFitView={true}
                    showInteractive={true}
                    style={{
                      bottom: 20,
                      left: 20,
                      boxShadow: '0 0 10px rgba(12, 235, 235, 0.3)',
                      background: 'rgba(25, 32, 56, 0.8)',
                    }}
                  />
                  <Background />
                </ReactFlow>
                <SciFiBackground opacity={0.25} />

                {contextMenu && (
                  <NodeContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onDelete={handleContextMenuDelete}
                    onClose={() => setContextMenu(null)}
                  />
                )}
              </div>
            </PythonExecutionProvider>
          </NodeDataProvider>
        </ReactFlowProvider>
      </Box>
      <CodeModal
        open={isModalOpen}
        onClose={handleCloseModal}
        code={generatedCode}
      />

      <CodeModal
        open={isModalOpen}
        onClose={handleCloseModal}
        code={generatedCode}
      />

      <ExportModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectJson={projectJson}
        onSave={handleSaveProject}
      />

      <ImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleProjectImport}
      />
    </Box>
  );
}

export default App;
