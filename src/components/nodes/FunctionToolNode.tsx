// src/components/nodes/FunctionToolNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import BuildIcon from '@mui/icons-material/Build'; // Function Tool Icon
import { useNodeData } from '../../context/NodeDataContext'; // Import the hook

// Define the data structure expected by this node
interface FunctionToolNodeData {
  name?: string;
  parameters?: string; // Simplified for now, maybe JSON or structured list later
  returnType?: string;
  implementation?: string;
  dimensions?: { width: number; height: number };
}

const returnTypes = ['str', 'int', 'float', 'bool', 'list', 'dict', 'None'];

const FunctionToolNode: React.FC<NodeProps<FunctionToolNodeData>> = ({ id, data, isConnectable, selected }) => {
  const { updateNodeData, resizeNode } = useNodeData();

  // Handler for text input changes
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      updateNodeData(id, { [name]: value });
    },
    [id, updateNodeData]
  );

  // Handler for the return type select change
  const handleReturnTypeChange = useCallback(
    (event: SelectChangeEvent) => {
      updateNodeData(id, { returnType: event.target.value });
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
        minWidth={250}
        minHeight={300}
        isVisible={selected}
        lineClassName="node-resize-line"
        handleClassName="node-resize-handle"
        onResize={(event, { width, height }) => {
          console.log(`Function Tool resized to width=${width}, height=${height}`);
          resizeNode(id, width, height);
        }}
      />

      <Card
        sx={{
          minWidth: 200,
          background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.8), rgba(30, 20, 40, 0.9))',
          border: selected ? '1px solid rgba(255, 152, 0, 0.7)' : '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: '8px',
          boxShadow: selected
            ? '0 0 15px rgba(255, 152, 0, 0.4), inset 0 0 8px rgba(255, 152, 0, 0.2)'
            : '0 4px 15px rgba(255, 152, 0, 0.2)',
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4), inset 0 0 10px rgba(255, 152, 0, 0.1)',
          },
          // Additional styling specific to Function Tool
          '& .MuiInputBase-root': {
            color: '#f6f8ff',
            fontFamily: '"Orbitron", sans-serif',
          },
          '& .MuiInputLabel-root': {
            color: '#FF9800',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 152, 0, 0.3)',
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 152, 0, 0.7)',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF9800',
            borderWidth: '2px',
            boxShadow: '0 0 5px rgba(255, 152, 0, 0.3)',
          },
          // Code editor styling
          '& pre': {
            background: 'rgba(20, 20, 30, 0.8) !important',
            borderRadius: '4px',
            border: '1px solid rgba(255, 152, 0, 0.3) !important',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        {/* Output Handle (Connects *to* Agent's left handle 'd') */}
        <Handle
          type="source"
          position={Position.Left} // Connect from left side of tool to right side of agent
          id="a"
          style={{ top: '70%', background: '#555' }}
          isConnectable={isConnectable}
        />

        <CardContent sx={{ padding: '10px 16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BuildIcon sx={{ mr: 1, color: '#FF9800' }} />
            <Typography variant="subtitle1" sx={{
              fontWeight: 'bold',
              color: '#FF9800',  // Bright orange color for better visibility
              textShadow: '0 0 5px rgba(255, 152, 0, 0.5)',
              fontFamily: '"Orbitron", sans-serif'
            }}>
              Function Tool
            </Typography>
          </Box>
          <TextField
            label="Function Name"
            variant="outlined"
            size="small"
            fullWidth
            name="name"
            value={data.name || ''}
            onChange={handleInputChange}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            className="nodrag"
            InputProps={{ className: "nodrag" }}
            sx={{ mb: 1 }}
          />
          <TextField
            label="Parameters (e.g., city: str, count: int)"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={2}
            name="parameters"
            value={data.parameters || ''}
            onChange={handleInputChange}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            className="nodrag"
            InputProps={{ className: "nodrag" }}
            sx={{ mb: 1 }}
            placeholder="param1: type, param2: type"
          />
          <FormControl fullWidth size="small" sx={{ mb: 1 }} className="nodrag">
            <InputLabel id="return-type-label" className="nodrag">Return Type</InputLabel>
            <Select
              labelId="return-type-label"
              id="return-type-select"
              name="returnType"
              value={data.returnType || 'str'}
              label="Return Type"
              onChange={handleReturnTypeChange}
              onMouseDown={stopPropagation}
              onClick={stopPropagation}
              className="nodrag"
              inputProps={{ className: "nodrag" }}
            >
              {returnTypes.map((type) => (
                <MenuItem key={type} value={type} className="nodrag">
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Implementation (Python Code)"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            rows={4}
            name="implementation"
            value={data.implementation || ''}
            onChange={handleInputChange}
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            className="nodrag"
            InputProps={{ className: "nodrag" }}
            sx={{ fontFamily: 'monospace' }}
            placeholder={`def ${data.name || 'my_function'}(${data.parameters?.split(',').map(p => p.split(':')[0].trim()).join(', ') || '...'}):\n    # Your code here\n    return ...`}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default memo(FunctionToolNode);