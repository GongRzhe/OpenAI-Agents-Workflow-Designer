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
import CodeIcon from '@mui/icons-material/Code'; // New import for Python Code

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
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, rgba(12,27,56,0.9) 0%, rgba(28,45,86,0.9) 100%)',
          backdropFilter: 'blur(8px)',
          border: 'none',
          boxShadow: '4px 0 15px rgba(0,0,0,0.3)'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', p: 1 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            textAlign: 'center',
            mt: 1,
            color: '#0cebeb',  // Bright cyan color
            fontFamily: '"Orbitron", sans-serif',
            textShadow: '0 0 10px rgba(12, 235, 235, 0.5)',
          }}
        >
          Components
        </Typography>
        <Divider />
        <List>
          {/* Draggable Agent Node */}
          <ListItem disablePadding>
            <ListItemButton
              onDragStart={(event) => onDragStart(event, 'agent')}
              draggable
              sx={{
                cursor: 'grab',
                mb: 1,
                borderRadius: 1,
                background: 'rgba(32, 227, 178, 0.1)',
                border: '1px solid rgba(32, 227, 178, 0.3)',
                boxShadow: '0 2px 8px rgba(32, 227, 178, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(32, 227, 178, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(32, 227, 178, 0.3)',
                }
              }}
            >
              <ListItemIcon>
                <AccountTreeIcon sx={{ color: '#20e3b2' }} />
              </ListItemIcon>
              <ListItemText
                primary="Agent"
                primaryTypographyProps={{
                  sx: {
                    fontFamily: '"Orbitron", sans-serif',
                    color: '#f6f8ff'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Draggable Runner Node */}
          <ListItem disablePadding>
            <ListItemButton
              onDragStart={(event) => onDragStart(event, 'runner')}
              draggable
              sx={{
                cursor: 'grab',
                mb: 1,
                borderRadius: 1,
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(244, 67, 54, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                }
              }}
            >
              <ListItemIcon>
                <PlayCircleOutlineIcon sx={{ color: '#F44336' }} />
              </ListItemIcon>
              <ListItemText
                primary="Runner"
                primaryTypographyProps={{
                  sx: {
                    fontFamily: '"Orbitron", sans-serif',
                    color: '#f6f8ff'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Draggable Function Tool Node */}
          <ListItem disablePadding>
            <ListItemButton
              onDragStart={(event) => onDragStart(event, 'functionTool')}
              draggable
              sx={{
                cursor: 'grab',
                mb: 1,
                borderRadius: 1,
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 152, 0, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                }
              }}
            >
              <ListItemIcon>
                <BuildIcon sx={{ color: '#FF9800' }} />
              </ListItemIcon>
              <ListItemText
                primary="Function Tool"
                primaryTypographyProps={{
                  sx: {
                    fontFamily: '"Orbitron", sans-serif',
                    color: '#f6f8ff'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Draggable Python Code Node - NEW */}
          <ListItem disablePadding>
            <ListItemButton
              onDragStart={(event) => onDragStart(event, 'pythonCode')}
              draggable
              sx={{
                cursor: 'grab',
                mb: 1,
                borderRadius: 1,
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(76, 175, 80, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                }
              }}
            >
              <ListItemIcon>
                <CodeIcon sx={{ color: '#4CAF50' }} />
              </ListItemIcon>
              <ListItemText
                primary="Python Code"
                primaryTypographyProps={{
                  sx: {
                    fontFamily: '"Orbitron", sans-serif',
                    color: '#f6f8ff'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider sx={{ my: 2 }} />
        <Box sx={{
          p: 2,
          mt: 'auto',
          backgroundColor: 'rgba(25, 32, 56, 0.8)',
          border: '1px solid rgba(12, 235, 235, 0.3)',
          borderRadius: 1,
          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)'
        }}>
          <Typography
            variant="body2"
            sx={{
              color: '#f6f8ff',
              fontFamily: '"Orbitron", sans-serif',
              fontSize: '0.75rem'
            }}
          >
            Drag components onto the canvas to build your workflow. Connect nodes to define relationships.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;