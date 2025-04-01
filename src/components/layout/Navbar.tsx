// src/components/layout/Navbar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

interface NavbarProps {
  onGenerateCode: () => void;
  onExportProject: () => void;
  onImportProject: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGenerateCode, onExportProject, onImportProject }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          OpenAI Agents Workflow Designer
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onImportProject}
            startIcon={<FileUploadIcon />}
          >
            Import
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onExportProject}
            startIcon={<FileDownloadIcon />}
          >
            Export
          </Button>
          <Button variant="contained" color="secondary" onClick={onGenerateCode}>
            Generate Code
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;