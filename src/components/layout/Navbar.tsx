// src/components/layout/Navbar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface NavbarProps {
  onGenerateCode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGenerateCode }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          OpenAI Agents Workflow Designer
        </Typography>
        <Box>
          {/* Add Save/Load buttons here if needed */}
          <Button variant="contained" color="secondary" onClick={onGenerateCode}>
            Generate Code
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;