// src/components/common/ExportModal.tsx
import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CodeIcon from '@mui/icons-material/Code';
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
        width: 550,
        p: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.95), rgba(15, 20, 40, 0.98))',
        border: '1px solid var(--sci-fi-primary)',
        boxShadow: '0 0 20px rgba(12, 235, 235, 0.4), inset 0 0 10px rgba(12, 235, 235, 0.1)',
        backdropFilter: 'blur(10px)',
        color: 'var(--sci-fi-light)'
      }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            color: 'var(--sci-fi-primary)',
            fontFamily: 'var(--sci-font)',
            textShadow: '0 0 5px rgba(12, 235, 235, 0.5)',
            letterSpacing: '1px',
            pb: 1,
            borderBottom: '1px solid rgba(12, 235, 235, 0.3)'
          }}
        >
          Export Project
        </Typography>

        <TextField
          fullWidth
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          margin="normal"
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'var(--sci-fi-light)',
              '& fieldset': {
                borderColor: 'rgba(12, 235, 235, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(12, 235, 235, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--sci-fi-primary)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'var(--sci-fi-primary)',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'var(--sci-primary)',
            },
          }}
        />

        <TextField
          fullWidth
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={2}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'var(--sci-fi-light)',
              '& fieldset': {
                borderColor: 'rgba(12, 235, 235, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(12, 235, 235, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--sci-fi-primary)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'var(--sci-fi-primary)',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'var(--sci-fi-primary)',
            },
          }}
        />

        <Box
          sx={{
            mt: 3,
            p: 2,
            maxHeight: 240,
            overflow: 'auto',
            borderRadius: 2,
            position: 'relative',
            border: '1px solid rgba(12, 235, 235, 0.3)',
            background: 'rgba(15, 20, 30, 0.8)',
            '&::before': {
              content: '"JSON"',
              position: 'absolute',
              top: '-10px',
              right: '10px',
              background: 'var(--sci-fi-primary)',
              color: 'var(--sci-fi-dark)',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '4px',
              fontFamily: 'var(--sci-fi-font)'
            }
          }}
        >
          <pre style={{
            fontFamily: '"Roboto Mono", monospace',
            fontSize: '0.85rem',
            color: '#e0e0e0',
            margin: 0
          }}>
            {projectJson}
          </pre>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              fontFamily: 'var(--sci-fi-font)',
              letterSpacing: '1px',
              background: 'transparent',
              color: 'var(--sci-fi-primary)',
              border: '1px solid var(--sci-fi-primary)',
              '&:hover': {
                background: 'rgba(12, 235, 235, 0.1)',
                boxShadow: '0 0 10px rgba(12, 235, 235, 0.3)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            variant="contained"
            sx={{
              fontFamily: 'var(--sci-fi-font)',
              letterSpacing: '1px',
              background: 'linear-gradient(135deg, var(--sci-fi-primary), var(--sci-fi-accent))',
              color: 'var(--sci-fi-dark)',
              border: 'none',
              boxShadow: '0 0 10px rgba(12, 235, 235, 0.5)',
              '&:hover': {
                boxShadow: '0 0 15px rgba(12, 235, 235, 0.7)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Download JSON
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ExportModal;