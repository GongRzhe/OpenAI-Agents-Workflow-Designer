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
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Choose a style

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
  width: '70%', // Adjust width as needed
  maxWidth: '800px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2, // Reduced padding
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '85vh', // Limit height
};

const CodeModal: React.FC<CodeModalProps> = ({ open, onClose, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error('Failed to copy code: ', err);
      // Optionally show an error message to the user
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="generated-code-modal-title"
      aria-describedby="generated-code-modal-description"
    >
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, borderBottom: '1px solid #ccc', pb: 1 }}>
          <Typography id="generated-code-modal-title" variant="h6" component="h2">
            Generated Python Code
          </Typography>
          <Box>
             <IconButton onClick={handleCopy} size="small" sx={{ mr: 1 }}>
               {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
             </IconButton>
             <IconButton onClick={onClose} size="small">
               <CloseIcon />
             </IconButton>
          </Box>
        </Box>
        <Box sx={{ overflowY: 'auto', flexGrow: 1, backgroundColor: '#1e1e1e' /* Match VSC Dark Plus BG */ }}>
          <SyntaxHighlighter
            language="python"
            style={vscDarkPlus}
            showLineNumbers // Optionally show line numbers
            customStyle={{ margin: 0, padding: '10px', fontSize: '0.85rem' }} // Adjust styling
          >
            {code}
          </SyntaxHighlighter>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 1, borderTop: '1px solid #ccc' }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CodeModal;