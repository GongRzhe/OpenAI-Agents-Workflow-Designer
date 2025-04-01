// src/components/nodes/RunnerNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'; // Runner Icon
import { useNodeData } from '../../context/NodeDataContext'; // Import the hook

// Define the data structure expected by this node
interface RunnerNodeData {
  input?: string;
  isAsync?: boolean;
  dimensions?: { width: number; height: number };
}

const RunnerNode: React.FC<NodeProps<RunnerNodeData>> = ({ id, data, isConnectable, selected }) => {
  const { updateNodeData, resizeNode } = useNodeData();

  // Handler for text input changes
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      updateNodeData(id, { [name]: value });
    },
    [id, updateNodeData]
  );

  // Handler for toggle changes
  const handleToggleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = event.target;
      updateNodeData(id, { [name]: checked });
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
          console.log(`Runner resized to width=${width}, height=${height}`);
          resizeNode(id, width, height);
        }}
      />
    
      <Card
        sx={{
          borderTop: '4px solid #e74c3c', // Red top border
          borderRadius: '8px',
          minWidth: 200,
          backgroundColor: selected ? '#fee' : 'white', // Highlight when selected
          boxShadow: selected ? '0 0 10px rgba(231, 76, 60, 0.5)' : 1,
          ...(data.dimensions && {
            width: `${data.dimensions.width}px`,
            height: `${data.dimensions.height}px`,
          }),
        }}
      >
        {/* Input Handle (Top) */}
        <Handle
          type="target"
          position={Position.Top}
          id="a"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
        {/* Output Handle (Bottom) */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />

        <CardContent sx={{ padding: '10px 16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PlayCircleOutlineIcon sx={{ mr: 1, color: '#e74c3c' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Runner
            </Typography>
          </Box>
          <TextField
            label="Input"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={2}
            name="input"
            value={data.input || ''}
            onChange={handleInputChange}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            className="nodrag"
            InputProps={{ className: "nodrag" }}
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={data.isAsync || false}
                onChange={handleToggleChange}
                name="isAsync"
                onMouseDown={stopPropagation}
                onClick={stopPropagation}
                className="nodrag"
              />
            }
            label="Async Execution"
            className="nodrag"
          />
        </CardContent>
      </Card>
    </>
  );
};

export default memo(RunnerNode);