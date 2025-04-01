// src/components/common/KeyboardShortcutsHelp.tsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CloseIcon from '@mui/icons-material/Close';

interface KeyboardShortcut {
  key: string;
  description: string;
}

const shortcuts: KeyboardShortcut[] = [
  { key: 'Del / Backspace', description: 'Delete selected nodes or edges' },
  { key: 'Ctrl+A', description: 'Select all nodes' },
  { key: 'Escape', description: 'Deselect all elements' },
  { key: 'Right Click', description: 'Open context menu on nodes or edges' },
];

const KeyboardShortcutsHelp: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Keyboard Shortcuts">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 5,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <KeyboardIcon />
        </IconButton>
      </Tooltip>

      {open && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 80,
            right: 20,
            width: 320,
            zIndex: 1000,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Keyboard Shortcuts</Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <List dense>
            {shortcuts.map((shortcut, index) => (
              <ListItem key={index} disableGutters>
                <Chip
                  label={shortcut.key}
                  sx={{
                    minWidth: 120,
                    mr: 2,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                  }}
                  size="small"
                />
                <ListItemText primary={shortcut.description} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
};

export default KeyboardShortcutsHelp;