// src/components/common/ResizeHandle.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

interface ResizeHandleProps {
  onResize: (width: number, height: number) => void;
  minWidth?: number;
  minHeight?: number;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ 
  onResize, 
  minWidth = 200, 
  minHeight = 150 
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const initialPositionRef = useRef({ x: 0, y: 0 });
  const initialSizeRef = useRef({ width: 0, height: 0 });
  const parentRef = useRef<HTMLElement | null>(null);
  
  // When mouse down, start resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Get parent node element (Card component)
    const parent = (e.currentTarget as HTMLElement).closest('.resizable-node') as HTMLElement;
    if (!parent) return;
    
    parentRef.current = parent;
    initialPositionRef.current = { x: e.clientX, y: e.clientY };
    initialSizeRef.current = { 
      width: parent.offsetWidth, 
      height: parent.offsetHeight 
    };
    
    setIsResizing(true);
    
    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Resize as mouse moves
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !parentRef.current) return;
    
    const deltaX = e.clientX - initialPositionRef.current.x;
    const deltaY = e.clientY - initialPositionRef.current.y;
    
    const newWidth = Math.max(initialSizeRef.current.width + deltaX, minWidth);
    const newHeight = Math.max(initialSizeRef.current.height + deltaY, minHeight);
    
    // Call the onResize callback
    onResize(newWidth, newHeight);
  };
  
  // Stop resizing when mouse up
  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up event listeners if component unmounts during resize
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  return (
    <Box
      className="nodrag resize-handle"
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 15,
        height: 15,
        cursor: 'nwse-resize',
        background: 'transparent',
        '&::after': {
          content: '""',
          position: 'absolute',
          right: 3,
          bottom: 3,
          width: 8,
          height: 8,
          borderRight: '2px solid rgba(0,0,0,0.5)',
          borderBottom: '2px solid rgba(0,0,0,0.5)',
          borderRadius: '0 0 2px 0',
        },
        '&:hover::after': {
          borderColor: '#3498db',
        }
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default ResizeHandle;