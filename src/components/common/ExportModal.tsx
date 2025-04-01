// src/components/common/ExportModal.tsx
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Paper } from '@mui/material';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  projectJson: string;
  onSave: (projectName: string, description: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose, projectJson, onSave }) => {
  const [projectName, setProjectName] = useState('My Agent Workflow');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    onSave(projectName, description);
  };

  const handleDownload = () => {
    const blob = new Blob([projectJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Export Project
        </Typography>
        <TextField
          fullWidth
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={2}
        />
        <Paper 
          variant="outlined" 
          sx={{ 
            mt: 2, 
            p: 1, 
            maxHeight: 200, 
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}
        >
          <pre>{projectJson.substring(0, 200)}...</pre>
        </Paper>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button onClick={handleDownload} variant="contained" color="primary">
            Download JSON
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ExportModal;