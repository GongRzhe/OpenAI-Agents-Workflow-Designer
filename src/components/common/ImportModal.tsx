// src/components/common/ImportModal.tsx
import React, { useState, useRef } from 'react';
import { Modal, Box, Typography, Button, Alert } from '@mui/material';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (jsonData: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onImport }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Try parsing the JSON to validate it
        JSON.parse(content);
        onImport(content);
        onClose();
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Import Project
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select a JSON file to import a previously exported workflow.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {fileName && !error && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Selected file: {fileName}
          </Alert>
        )}
        
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={triggerFileInput} 
            variant="contained" 
            color="primary"
          >
            Select File
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImportModal;