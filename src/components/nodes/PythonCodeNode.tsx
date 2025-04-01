// src/components/nodes/PythonCodeNode.tsx
import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNodeData } from '../../context/NodeDataContext';
import { usePythonExecution } from '../../context/PythonExecutionContext';

// Define the data structure expected by this node
interface PythonCodeNodeData {
    name?: string;
    code?: string;
    executionId?: string;
    dimensions?: { width: number; height: number };
}

const PythonCodeNode: React.FC<NodeProps<PythonCodeNodeData>> = ({ id, data, isConnectable, selected }) => {
    const { updateNodeData, resizeNode } = useNodeData();
    const { executeCode, stopExecution, getExecutionStatus, executionResults } = usePythonExecution();
    const [isExecuting, setIsExecuting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');

    // Update status based on executionId
    useEffect(() => {
        if (!data.executionId) {
            setStatus('idle');
            return;
        }

        const result = executionResults[data.executionId];
        if (!result) {
            // If we have an executionId but no result, it's probably running
            setStatus('running');
            return;
        }

        setStatus(result.success ? 'completed' : 'error');
    }, [data.executionId, executionResults]);

    // Poll for status updates while executing
    useEffect(() => {
        if (!data.executionId || status !== 'running') return;

        const intervalId = setInterval(async () => {
            try {
                const currentStatus = await getExecutionStatus(data.executionId!);
                if (currentStatus !== 'running') {
                    setIsExecuting(false);
                }
            } catch (error) {
                console.error('Error checking execution status:', error);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [data.executionId, status, getExecutionStatus]);

    // Handler for text input changes
    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = event.target;
            updateNodeData(id, { [name]: value });
        },
        [id, updateNodeData]
    );

    // Handle execute code button click
    const handleExecuteCode = useCallback(async () => {
        if (!data.code) return;

        setIsExecuting(true);
        setStatus('running');

        try {
            const executionId = await executeCode(data.code);
            updateNodeData(id, { executionId });
        } catch (error) {
            console.error('Error executing code:', error);
            setStatus('error');
            setIsExecuting(false);
        }
    }, [data.code, executeCode, id, updateNodeData]);

    // Handle stop execution button click
    const handleStopExecution = useCallback(() => {
        if (!data.executionId) return;

        stopExecution(data.executionId);
        setIsExecuting(false);
        setStatus('idle');
    }, [data.executionId, stopExecution]);

    // Prevent event propagation to parent elements
    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    // Get the result from the context if available
    const result = data.executionId ? executionResults[data.executionId] : null;

    return (
        <>
            {/* Add the official NodeResizer */}
            <NodeResizer
                minWidth={350}
                minHeight={300}
                isVisible={selected}
                lineClassName="node-resize-line"
                handleClassName="node-resize-handle"
                onResize={(event, { width, height }) => {
                    resizeNode(id, width, height);
                }}
            />

            <Card
                sx={{
                    minWidth: 350,
                    background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.8), rgba(15, 40, 35, 0.9))',
                    border: selected ? '1px solid rgba(76, 175, 80, 0.7)' : '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '8px',
                    boxShadow: selected
                        ? '0 0 15px rgba(76, 175, 80, 0.4), inset 0 0 8px rgba(76, 175, 80, 0.2)'
                        : '0 4px 15px rgba(76, 175, 80, 0.2)',
                    backdropFilter: 'blur(5px)',
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4), inset 0 0 10px rgba(76, 175, 80, 0.1)',
                    },
                    // Python Node specific styling
                    '& .MuiInputBase-root': {
                        color: '#f6f8ff',
                        fontFamily: '"Orbitron", sans-serif',
                    },
                    '& .MuiInputLabel-root': {
                        color: '#4CAF50',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(76, 175, 80, 0.3)',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(76, 175, 80, 0.7)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4CAF50',
                        borderWidth: '2px',
                        boxShadow: '0 0 5px rgba(76, 175, 80, 0.3)',
                    },
                }}
            >
                {/* Input Handle (Left) */}
                <Handle
                    type="target"
                    position={Position.Left}
                    id="a"
                    style={{
                        background: '#4CAF50',
                        border: '2px solid #192038',
                        width: '12px',
                        height: '12px'
                    }}
                    className="handle-python"
                    isConnectable={isConnectable}
                />

                {/* Output Handle (Right) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="b"
                    style={{
                        background: '#4CAF50',
                        border: '2px solid #192038',
                        width: '12px',
                        height: '12px'
                    }}
                    className="handle-python"
                    isConnectable={isConnectable}
                />

                <CardContent sx={{ padding: '10px 16px !important' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CodeIcon sx={{ mr: 1, color: '#4CAF50' }} />
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 'bold',
                                color: '#4CAF50',
                                textShadow: '0 0 5px rgba(76, 175, 80, 0.5)',
                                fontFamily: '"Orbitron", sans-serif'
                            }}>
                                Python Code
                            </Typography>
                        </Box>

                        {/* Status Indicator */}
                        {status !== 'idle' && (
                            <Chip
                                size="small"
                                label={status}
                                color={status === 'completed' ? 'success' : status === 'error' ? 'error' : 'primary'}
                                icon={
                                    status === 'running' ? <CircularProgress size={16} color="inherit" /> :
                                        status === 'completed' ? <CheckCircleOutlineIcon /> :
                                            <ErrorOutlineIcon />
                                }
                            />
                        )}
                    </Box>

                    {/* Name Field */}
                    <TextField
                        label="Name"
                        variant="outlined"
                        size="small"
                        fullWidth
                        name="name"
                        value={data.name || ''}
                        onChange={handleInputChange}
                        onMouseDown={stopPropagation}
                        onClick={stopPropagation}
                        className="nodrag"
                        InputProps={{ className: "nodrag" }}
                        sx={{ mb: 1 }}
                    />

                    {/* Code Editor */}
                    <TextField
                        label="Python Code"
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        rows={8}
                        name="code"
                        value={data.code || ''}
                        onChange={handleInputChange}
                        onMouseDown={stopPropagation}
                        onClick={stopPropagation}
                        className="nodrag"
                        InputProps={{
                            className: "nodrag",
                            sx: {
                                fontFamily: '"Roboto Mono", monospace',
                                fontSize: '0.85rem',
                                backgroundColor: 'rgba(15, 20, 25, 0.6)',
                            }
                        }}
                        sx={{ mb: 1 }}
                        placeholder="# Write your Python code here\nimport asyncio\nfrom agents import Agent, Runner\n\nasync def main():\n    # Your code here\n    pass"
                    />

                    {/* Control Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={isExecuting ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                            onClick={(e) => {
                                stopPropagation(e);
                                handleExecuteCode();
                            }}
                            disabled={isExecuting || !data.code}
                            className="nodrag"
                            onMouseDown={stopPropagation}
                            sx={{ width: '48%' }}
                        >
                            {isExecuting ? 'Running...' : 'Run Code'}
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<StopIcon />}
                            onClick={(e) => {
                                stopPropagation(e);
                                handleStopExecution();
                            }}
                            disabled={!isExecuting}
                            className="nodrag"
                            onMouseDown={stopPropagation}
                        >
                            Stop
                        </Button>
                    </Box>

                    {/* Execution Results */}
                    {result && (
                        <Box
                            sx={{
                                p: 1,
                                backgroundColor: 'rgba(15, 20, 25, 0.7)',
                                borderRadius: '4px',
                                borderLeft: `4px solid ${result.success ? '#4CAF50' : '#F44336'}`,
                                maxHeight: '150px',
                                overflowY: 'auto',
                                fontFamily: '"Roboto Mono", monospace',
                                fontSize: '0.8rem',
                                color: '#E0E0E0',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                            className="nodrag"
                            onMouseDown={stopPropagation}
                            onClick={stopPropagation}
                        >
                            {result.error ? (
                                <>
                                    <Typography color="error" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                        Error:
                                    </Typography>
                                    <Box component="pre" sx={{ m: 0, color: '#F44336' }}>
                                        {result.error}
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Typography color="success.light" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                        Output:
                                    </Typography>
                                    <Box component="pre" sx={{ m: 0 }}>
                                        {result.output || '(No output)'}
                                    </Box>
                                </>
                            )}
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#AAAAAA' }}>
                                Execution time: {result.execution_time.toFixed(2)}s
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default memo(PythonCodeNode);