// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallbackUI?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If fallbackUI is provided, use it
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }

      // Default fallback UI
      return (
        <Card sx={{ 
          m: 2, 
          minWidth: 300,
          border: '1px solid #d32f2f',
          backgroundColor: 'rgba(25, 32, 56, 0.8)',
          color: '#f6f8ff'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ErrorOutlineIcon sx={{ color: '#d32f2f', mr: 1 }} />
              <Typography variant="h6" color="error">
                Component Error
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              An error occurred in the {this.props.componentName || 'component'}.
            </Typography>
            <Typography variant="caption" component="div" sx={{ 
              mb: 2, 
              p: 1, 
              backgroundColor: 'rgba(15, 20, 25, 0.7)',
              borderRadius: '4px',
              fontFamily: '"Roboto Mono", monospace',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {this.state.error?.toString() || 'Unknown error'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;