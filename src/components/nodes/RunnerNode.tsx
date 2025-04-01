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
          minWidth: 200,
          background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.8), rgba(40, 15, 25, 0.9))',
          border: selected ? '1px solid rgba(244, 67, 54, 0.7)' : '1px solid rgba(244, 67, 54, 0.3)',
          borderRadius: '8px',
          boxShadow: selected
            ? '0 0 15px rgba(244, 67, 54, 0.4), inset 0 0 8px rgba(244, 67, 54, 0.2)'
            : '0 4px 15px rgba(244, 67, 54, 0.2)',
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4), inset 0 0 10px rgba(244, 67, 54, 0.1)',
          },
          // Additional styling specific to Runner
          '& .MuiInputBase-root': {
            color: '#f6f8ff',
            fontFamily: '"Orbitron", sans-serif',
          },
          '& .MuiInputLabel-root': {
            color: '#F44336',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(244, 67, 54, 0.3)',
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(244, 67, 54, 0.7)',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F44336',
            borderWidth: '2px',
            boxShadow: '0 0 5px rgba(244, 67, 54, 0.3)',
          },
          // Checkbox styling
          '& .MuiCheckbox-root': {
            color: 'rgba(244, 67, 54, 0.5)',
          },
          '& .MuiCheckbox-root.Mui-checked': {
            color: '#F44336',
          },
          '& .MuiFormControlLabel-label': {
            color: '#f6f8ff',
          }
        }}
      >
        {/* Input Handle (Top) */}
        <Handle
          type="target"
          position={Position.Top}
          id="a"
          style={{
            background: '#F44336',
            border: '2px solid #192038',
            width: '12px',
            height: '12px'
          }}
          className="handle-runner"
          isConnectable={isConnectable}
        />
        {/* Output Handle (Bottom) */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          style={{
            background: '#F44336',
            border: '2px solid #192038',
            width: '12px',
            height: '12px'
          }}
          className="handle-runner"
          isConnectable={isConnectable}
        />

        <CardContent sx={{ padding: '10px 16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PlayCircleOutlineIcon sx={{ mr: 1, color: '#F44336' }} />
            <Typography variant="subtitle1" sx={{
              fontWeight: 'bold',
              color: '#F44336',  // Bright red color for better visibility
              textShadow: '0 0 5px rgba(244, 67, 54, 0.5)',
              fontFamily: '"Orbitron", sans-serif'
            }}>
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