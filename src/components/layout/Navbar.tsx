// src/components/layout/Navbar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';

interface NavbarProps {
  onGenerateCode: () => void;
  onExportProject: () => void;
  onImportProject: () => void;
  onDeleteElements: () => void; // Add this prop
}

const Navbar: React.FC<NavbarProps> = ({ 
  onGenerateCode, 
  onExportProject, 
  onImportProject, 
  onDeleteElements // Add this prop
}) => {
  return (
    <AppBar position="fixed" sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      background: 'linear-gradient(90deg, rgba(12,27,56,0.9) 0%, rgba(28,45,86,0.9) 100%)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 15px rgba(12, 235, 235, 0.3)'
    }}>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontFamily: '"Orbitron", sans-serif',
            color: '#0cebeb',
            textShadow: '0 0 10px rgba(12, 235, 235, 0.5)'
          }}
        >
          OpenAI Agents Workflow Designer
        </Typography>
        <Box>
          {/* Add Delete Button */}
          <Button
            variant="contained"
            sx={{
              mr: 2,
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              color: '#f6f8ff',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
                boxShadow: '0 6px 15px rgba(231, 76, 60, 0.5)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={onDeleteElements}
            startIcon={<DeleteIcon />}
          >
            Delete Selected
          </Button>
          <Button
            variant="contained"
            sx={{
              mr: 2,
              background: 'linear-gradient(135deg, #20e3b2, #0cebeb)',
              color: '#192038',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 10px rgba(12, 235, 235, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0cebeb, #7303c0)',
                boxShadow: '0 6px 15px rgba(12, 235, 235, 0.5)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={onImportProject}
          >
            Import
          </Button>
          <Button
            variant="contained"
            sx={{
              mr: 2,
              background: 'linear-gradient(135deg, #0cebeb, #7303c0)',
              color: '#f6f8ff',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 10px rgba(12, 235, 235, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7303c0, #0cebeb)',
                boxShadow: '0 6px 15px rgba(12, 235, 235, 0.5)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={onExportProject}
          >
            Export
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #7303c0, #ec38bc)',
              color: '#f6f8ff',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 10px rgba(115, 3, 192, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ec38bc, #7303c0)',
                boxShadow: '0 6px 15px rgba(115, 3, 192, 0.5)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={onGenerateCode}
          >
            Generate Code
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;