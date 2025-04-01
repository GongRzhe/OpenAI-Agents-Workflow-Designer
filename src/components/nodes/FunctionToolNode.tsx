// src/components/nodes/FunctionToolNode.tsx
import React, { memo, useCallback } from 'react'; // Add useCallback
import { Handle, Position, NodeProps } from 'reactflow';
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
}

const returnTypes = ['str', 'int', 'float', 'bool', 'list', 'dict', 'None'];

const FunctionToolNode: React.FC<NodeProps<FunctionToolNodeData>> = ({ id, data, isConnectable, selected }) => {
  const { updateNodeData } = useNodeData();
  // TODO: Implement better parameter handling (e.g., list of objects {name: string, type: string})

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

  return (
    <Card sx={{
      borderTop: '4px solid #f39c12', // Yellow top border
      borderRadius: '8px',
      minWidth: 250,
      backgroundColor: selected ? '#fff8e1' : 'white', // Highlight when selected
      boxShadow: selected ? '0 0 10px rgba(243, 156, 18, 0.5)' : 1,
    }}>
      {/* No target handle needed if tools only connect *to* Agents */}
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
          <BuildIcon sx={{ mr: 1, color: '#f39c12' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Function Tool
          </Typography>
        </Box>
        <TextField
          label="Function Name"
          variant="outlined"
          size="small"
          fullWidth
          name="name" // Add name attribute
          value={data.name || ''} // Use value
          onChange={handleInputChange}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Parameters (e.g., city: str, count: int)"
          variant="outlined"
          size="small"
          fullWidth
          multiline
          rows={2}
          name="parameters" // Add name attribute
          value={data.parameters || ''} // Use value
          onChange={handleInputChange}
          sx={{ mb: 1 }}
          placeholder="param1: type, param2: type"
        />
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel id="return-type-label">Return Type</InputLabel>
          <Select
            labelId="return-type-label"
            id="return-type-select"
            name="returnType" // Add name attribute
            value={data.returnType || 'str'} // Use value
            label="Return Type"
            onChange={handleReturnTypeChange} // Use updated handler
          >
            {returnTypes.map((type) => (
              <MenuItem key={type} value={type}>
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
          name="implementation" // Add name attribute
          value={data.implementation || ''} // Use value
          onChange={handleInputChange}
          sx={{ fontFamily: 'monospace' }} // Use monospace font for code
          placeholder={`def ${data.name || 'my_function'}(${data.parameters?.split(',').map(p => p.split(':')[0].trim()).join(', ') || '...'}):\n    # Your code here\n    return ...`} // Dynamic placeholder
        />
      </CardContent>
    </Card>
  );
};

export default memo(FunctionToolNode);