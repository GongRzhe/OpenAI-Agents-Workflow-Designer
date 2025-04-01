// src/components/layout/Sidebar.tsx
import React from 'react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Placeholder for Agent
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'; // Placeholder for Runner
import BuildIcon from '@mui/icons-material/Build'; // Placeholder for Function Tool

const drawerWidth = 240;

const Sidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', p: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mt: 1 }}>
          Components
        </Typography>
        <Divider />
        <List>
          {/* Draggable Agent Node */}
          <ListItem disablePadding>
            <ListItemButton
              onDragStart={(event) => onDragStart(event, 'agent')}
              draggable
              sx={{ cursor: 'grab', border: '1px dashed grey', mb: 1, borderRadius: 1 }}
            >
              <ListItemIcon>
                <AccountTreeIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Agent" />
            </ListItemButton>
          </ListItem>

          {/* Draggable Runner Node */}
          <ListItem disablePadding>
            <ListItemButton
              onDragStart={(event) => onDragStart(event, 'runner')}
              draggable
              sx={{ cursor: 'grab', border: '1px dashed grey', mb: 1, borderRadius: 1 }}
            >
              <ListItemIcon>
                <PlayCircleOutlineIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Runner" />
            </ListItemButton>
          </ListItem>

          {/* Draggable Function Tool Node */}
          <ListItem disablePadding>
            <ListItemButton
              onDragStart={(event) => onDragStart(event, 'functionTool')}
              draggable
              sx={{ cursor: 'grab', border: '1px dashed grey', mb: 1, borderRadius: 1 }}
            >
              <ListItemIcon>
                <BuildIcon color="warning" />
              </ListItemIcon>
              <ListItemText primary="Function Tool" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }}/>
        <Box sx={{ p: 2, mt: 'auto', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Drag components onto the canvas to build your workflow. Connect nodes to define relationships.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;