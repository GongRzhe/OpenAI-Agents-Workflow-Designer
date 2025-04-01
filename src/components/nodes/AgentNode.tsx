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
          minWidth: 200,
          background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.8), rgba(18, 25, 45, 0.9))',
          border: selected ? '1px solid rgba(12, 235, 235, 0.7)' : '1px solid rgba(32, 227, 178, 0.3)',
          borderRadius: '8px',
          boxShadow: selected
            ? '0 0 15px rgba(12, 235, 235, 0.4), inset 0 0 8px rgba(12, 235, 235, 0.2)'
            : '0 4px 15px rgba(12, 235, 235, 0.2)',
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(12, 235, 235, 0.4), inset 0 0 10px rgba(12, 235, 235, 0.1)',
          },
          // Additional styling specific to Agent
          '& .MuiInputBase-root': {
            color: '#f6f8ff',
            fontFamily: '"Orbitron", sans-serif',
          },
          '& .MuiInputLabel-root': {
            color: '#0cebeb',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(32, 227, 178, 0.3)',
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(12, 235, 235, 0.7)',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0cebeb',
            borderWidth: '2px',
            boxShadow: '0 0 5px rgba(12, 235, 235, 0.3)',
          },
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