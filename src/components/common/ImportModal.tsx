// src/components/common/ImportModal.tsx
import React, { useState, useRef } from 'react';
import { Modal, Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CodeIcon from '@mui/icons-material/Code';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (jsonData: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onImport }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }

    setFileName(file.name);
    setLoading(true);

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
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (!file.name.endsWith('.json')) {
        setError('Please select a JSON file');
        return;
      }

      setFileName(file.name);
      setLoading(true);

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
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const FloatingParticles = () => {
    return (
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              borderRadius: '50%',
              backgroundColor: 'var(--sci-fi-primary)',
              opacity: Math.random() * 0.5 + 0.1,
              filter: 'blur(1px)',
              boxShadow: '0 0 8px rgba(12, 235, 235, 0.7)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite linear`,
              animationDelay: `-${Math.random() * 10}s`,
              transform: 'translateZ(0)'
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        p: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.95), rgba(15, 20, 40, 0.98))',
        border: '1px solid var(--sci-fi-primary)',
        boxShadow: '0 0 20px rgba(12, 235, 235, 0.4), inset 0 0 10px rgba(12, 235, 235, 0.1)',
        backdropFilter: 'blur(10px)',
        color: 'var(--sci-fi-light)'
      }}>
        <FloatingParticles />

        {/* Hidden file input */}
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress
              size={40}
              sx={{
                color: 'var(--sci-fi-primary)',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                  filter: 'drop-shadow(0 0 5px rgba(12, 235, 235, 0.5))'
                }
              }}
            />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{
            mb: 2,
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: '#ff1744',
            border: '1px solid rgba(211, 47, 47, 0.3)',
            '& .MuiAlert-icon': {
              color: '#ff1744'
            }
          }}>
            {error}
          </Alert>
        )}

        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            color: 'var(--sci-fi-primary)',
            fontFamily: 'var(--sci-fi-font)',
            textShadow: '0 0 5px rgba(12, 235, 235, 0.5)',
            letterSpacing: '1px',
            pb: 1,
            borderBottom: '1px solid rgba(12, 235, 235, 0.3)'
          }}
        >
          Import Project
        </Typography>

        {/* File drop area with proper event handlers */}
        <Box
          sx={{
            border: `2px dashed ${isDragging ? 'var(--sci-fi-primary)' : 'rgba(12, 235, 235, 0.4)'}`,
            borderRadius: 2,
            p: 3,
            my: 3,
            textAlign: 'center',
            transition: 'all 0.3s ease',
            background: isDragging
              ? 'rgba(12, 235, 235, 0.15)'
              : 'rgba(12, 235, 235, 0.05)',
            boxShadow: isDragging
              ? 'inset 0 0 15px rgba(12, 235, 235, 0.2)'
              : 'none',
            '&:hover': {
              borderColor: 'var(--sci-fi-primary)',
              background: 'rgba(12, 235, 235, 0.1)',
              boxShadow: 'inset 0 0 10px rgba(12, 235, 235, 0.1)'
            }
          }}
          onClick={triggerFileInput}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Box sx={{
            fontSize: 50,
            mb: 2,
            color: 'var(--sci-fi-primary)',
            filter: 'drop-shadow(0 0 5px rgba(12, 235, 235, 0.5))'
          }}>
            📁
          </Box>
          <Typography variant="body1" gutterBottom>
            Click to select a JSON file or drag it here
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Only .json files are supported
          </Typography>
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
            onClick={triggerFileInput}
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
            Select File
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImportModal;