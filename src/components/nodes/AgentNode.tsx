// src/components/nodes/AgentNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Agent Icon
import { useNodeData } from '../../context/NodeDataContext'; // Import the hook

// Define the data structure expected by this node
interface AgentNodeData {
  name?: string;
  instructions?: string;
  handoff_description?: string;
  dimensions?: { width: number; height: number };
  // Add other properties as needed
}

const AgentNode: React.FC<NodeProps<AgentNodeData>> = ({ id, data, isConnectable, selected }) => {
  const { updateNodeData, resizeNode } = useNodeData();

  // Use useCallback for performance, though likely minor here
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      updateNodeData(id, { [name]: value });
    },
    [id, updateNodeData]
  );

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      {/* Add the official NodeResizer (only visible when selected) */}
      <NodeResizer 
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName="node-resize-line"
        handleClassName="node-resize-handle"
        onResize={(event, { width, height }) => {
          console.log(`Agent node ${id} resized to width=${width}, height=${height}`);
          resizeNode(id, width, height);
        }}
      />
      
      <Card
        sx={{
          borderTop: '4px solid #3498db', // Blue top border
          borderRadius: '8px',
          minWidth: 200,
          backgroundColor: selected ? '#e3f2fd' : 'white', // Highlight when selected
          boxShadow: selected ? '0 0 10px rgba(52, 152, 219, 0.5)' : 1,
          ...(data.dimensions && {
            width: `${data.dimensions.width}px`,
            height: `${data.dimensions.height}px`,
          }),
        }}
      >
        {/* Input Handle (Top - for Runner or other Agents) */}
        <Handle
          type="target"
          position={Position.Top}
          id="a"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
        {/* Output Handle (Bottom - for Runner or Handoffs) */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
        {/* Output Handle (Right - for Tools) */}
        <Handle
          type="source"
          position={Position.Right}
          id="c" // Different ID for tool connections
          style={{ top: '70%', background: '#f39c12' }} // Position lower, different color
          isConnectable={isConnectable}
        />
        {/* Input Handle (Left - for Tools) */}
        <Handle
          type="target"
          position={Position.Left}
          id="d" // Different ID for tool connections
          style={{ top: '70%', background: '#f39c12' }} // Position lower, different color
          isConnectable={isConnectable}
        />

        <CardContent sx={{ padding: '10px 16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccountTreeIcon sx={{ mr: 1, color: '#3498db' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Agent
            </Typography>
          </Box>
          <TextField
            label="Name"
            variant="outlined"
            size="small"
            fullWidth
            name="name" // Add name attribute for handler
            value={data.name || ''} // Use value instead of defaultValue for controlled component
            onChange={handleInputChange}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            className="nodrag" // Add this class
            InputProps={{ className: "nodrag" }}
            sx={{ mb: 1 }}
          />
          <TextField
            label="Instructions"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={3}
            name="instructions" // Add name attribute
            value={data.instructions || ''} // Use value
            onChange={handleInputChange}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            className="nodrag" // Add this class
            InputProps={{ className: "nodrag" }}
            sx={{ mb: 1 }}
          />
          <TextField
            label="Handoff Description (Optional)"
            variant="outlined"
            size="small"
            fullWidth
            name="handoff_description" // Add name attribute
            value={data.handoff_description || ''} // Use value
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            className="nodrag" // Add this class
            InputProps={{ className: "nodrag" }}
            onChange={handleInputChange}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default memo(AgentNode);