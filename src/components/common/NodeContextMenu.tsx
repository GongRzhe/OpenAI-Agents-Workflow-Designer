// src/components/common/NodeContextMenu.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

interface NodeContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({ x, y, onDelete, onClose }) => {
  // Create a ref for the menu element
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Handle global click events to close the menu when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [onClose]);

  return (
    <Box
      ref={menuRef}
      sx={{
        position: 'absolute',
        top: y,
        left: x,
        zIndex: 1000,
      }}
    >
      <Paper elevation={3} sx={{ width: 200 }}>
        <MenuList>
          <MenuItem
            onClick={() => {
              onDelete();
              onClose();
            }}
            sx={{
              color: '#e74c3c',
              '&:hover': {
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </MenuList>
      </Paper>
    </Box>
  );
};

export default NodeContextMenu;