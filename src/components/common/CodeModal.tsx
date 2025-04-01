// src/components/common/CodeModal.tsx
import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { alpha } from '@mui/material/styles';

interface CodeModalProps {
  open: boolean;
  onClose: () => void;
  code: string;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '900px',
  bgcolor: 'rgba(25, 32, 56, 0.95)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(12, 235, 235, 0.6)',
  borderRadius: '8px',
  boxShadow: '0 0 30px rgba(12, 235, 235, 0.3), inset 0 0 15px rgba(12, 235, 235, 0.1)',
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '85vh',
  overflow: 'hidden',
};

const CodeModal: React.FC<CodeModalProps> = ({ open, onClose, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  // Create a pulse animation for the copy success icon
  const pulseAnimation = copied ? {
    animation: 'pulse 1s infinite',
    '@keyframes pulse': {
      '0%': { opacity: 1, transform: 'scale(1)' },
      '50%': { opacity: 0.8, transform: 'scale(1.1)' },
      '100%': { opacity: 1, transform: 'scale(1)' },
    },
  } : {};

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="generated-code-modal-title"
      aria-describedby="generated-code-modal-description"
    >
      <Box sx={style}>
        {/* Header section */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2,
            borderBottom: '1px solid rgba(12, 235, 235, 0.3)',
            background: 'linear-gradient(90deg, rgba(12,27,56,0.9) 0%, rgba(28,45,86,0.9) 100%)',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          <Typography 
            id="generated-code-modal-title" 
            variant="h6" 
            component="h2"
            sx={{
              fontFamily: '"Orbitron", sans-serif',
              color: '#0cebeb',
              textShadow: '0 0 10px rgba(12, 235, 235, 0.5)'
            }}
          >
            Generated Python Code
          </Typography>
          <Box>
            <IconButton 
              onClick={handleCopy} 
              size="small" 
              sx={{ 
                mr: 1, 
                color: copied ? '#20e3b2' : '#0cebeb',
                '&:hover': {
                  background: 'rgba(12, 235, 235, 0.1)',
                  boxShadow: '0 0 8px rgba(12, 235, 235, 0.4)',
                },
                ...pulseAnimation
              }}
            >
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
            <IconButton 
              onClick={onClose} 
              size="small"
              sx={{ 
                color: '#f6f8ff',
                '&:hover': {
                  background: 'rgba(244, 67, 54, 0.1)',
                  color: '#ff5858',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Code content section */}
        <Box 
          sx={{ 
            overflowY: 'auto', 
            flexGrow: 1, 
            backgroundColor: 'rgba(30, 30, 45, 0.8)',
            borderLeft: '3px solid rgba(12, 235, 235, 0.4)',
            borderRight: '3px solid rgba(12, 235, 235, 0.4)',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.4)'
          }}
        >
          <SyntaxHighlighter
            language="python"
            style={vscDarkPlus}
            showLineNumbers
            wrapLines={true}
            customStyle={{ 
              margin: 0, 
              padding: '16px',
              fontSize: '0.9rem',
              backgroundColor: 'transparent',
              fontFamily: '"Fira Code", "Roboto Mono", monospace',
            }}
            lineNumberStyle={{
              minWidth: '2.5em',
              paddingRight: '1em',
              color: 'rgba(12, 235, 235, 0.4)',
              textAlign: 'right',
              borderRight: '1px solid rgba(12, 235, 235, 0.2)',
              marginRight: '1em'
            }}
          >
            {code}
          </SyntaxHighlighter>
        </Box>
        
        {/* Footer section */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            p: 2, 
            borderTop: '1px solid rgba(12, 235, 235, 0.3)',
            background: 'linear-gradient(90deg, rgba(12,27,56,0.9) 0%, rgba(28,45,86,0.9) 100%)',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
          }}
        >
          <Button 
            onClick={onClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #0cebeb, #20e3b2)',
              color: '#192038',
              fontFamily: '"Orbitron", sans-serif',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 10px rgba(12, 235, 235, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #20e3b2, #0cebeb)',
                boxShadow: '0 6px 15px rgba(12, 235, 235, 0.5)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease',
            }}
          >
            CLOSE
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CodeModal;