// src/components/nodes/RunnerNode.tsx
import React, { memo, useCallback } from 'react'; // Remove useState, add useCallback
import { Handle, Position, NodeProps } from 'reactflow';
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
  // context?: any; // Add later if needed
}

const RunnerNode: React.FC<NodeProps<RunnerNodeData>> = ({ id, data, isConnectable, selected }) => {
  const { updateNodeData } = useNodeData();

  // Handler for text input changes
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

  // Handler for the async/sync switch change
  const handleModeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { isAsync: event.target.checked });
    },
    [id, updateNodeData]
  );

  return (
    <Card sx={{
      borderTop: '4px solid #e74c3c', // Red top border
      borderRadius: '8px',
      minWidth: 200,
      backgroundColor: selected ? '#ffebee' : 'white', // Highlight when selected
      boxShadow: selected ? '0 0 10px rgba(231, 76, 60, 0.5)' : 1,
    }}>
      {/* Input Handle (Top - expects connection from an Agent) */}
      <Handle
        type="target"
        position={Position.Top}
        id="a" // Connects to Agent's bottom handle ('b')
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      {/* No source handle needed for a typical runner */}

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
          name="input" // Add name attribute
          value={data.input || ''} // Use value
          onChange={handleInputChange}
          onMouseDown={stopPropagation}
          onClick={stopPropagation}
          className="nodrag" // Add this class
          InputProps={{ className: "nodrag" }}
          sx={{ mb: 1 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={data.isAsync ?? true} // Use data directly
              onChange={handleModeChange}
              name="isAsync" // Match the data key
              color="primary"
            />
          }
          label={data.isAsync ?? true ? 'Async Execution' : 'Sync Execution'} // Use data directly
          sx={{ display: 'block', textAlign: 'left', mb: 1 }}
        />
         {/* Add Context configuration later if needed */}
         {/* <TextField
          label="Context (JSON)"
          variant="outlined"
          size="small"
          fullWidth
          multiline
          rows={2}
          defaultValue={data.context ? JSON.stringify(data.context, null, 2) : ''}
          // onChange={(e) => updateNodeData({ context: JSON.parse(e.target.value) })} // Add later with error handling
        /> */}
      </CardContent>
    </Card>
  );
};

export default memo(RunnerNode);