// src/components/nodes/PythonCodeNode.tsx
import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNodeData } from '../../context/NodeDataContext';
import { usePythonExecution } from '../../context/PythonExecutionContext';
import { ExecutionStatus, ExecutionResult } from '../../context/PythonExecutionContext';

// Define the data structure expected by this node
export interface PythonCodeNodeData {
    name?: string;
    code?: string;
    executionId?: string;
    dimensions?: { width: number; height: number };
}

const PythonCodeNode: React.FC<NodeProps<PythonCodeNodeData>> = ({ id, data, isConnectable, selected }) => {
    const { updateNodeData, resizeNode } = useNodeData();
    const {
        executeCode,
        stopExecution,
        getExecutionStatus,
        getResult,
        isPythonBridgeAvailable,
        checkingBridgeStatus,
        refreshBridgeStatus
    } = usePythonExecution();

    const [isExecuting, setIsExecuting] = useState(false);
    const [status, setStatus] = useState<ExecutionStatus>('idle');
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const latestExecutionIdRef = useRef(data.executionId);
    const executionCompletedRef = useRef(false);
    const [forceUpdateCounter, setForceUpdateCounter] = useState(0);

    
    const forceUpdate = useCallback(() => {
        setForceUpdateCounter(prev => prev + 1);
    }, []);

    // useEffect(() => {
    //     latestExecutionIdRef.current = data.executionId;
    // }, [data.executionId]);

    useEffect(() => {
        if (data.executionId) {
            latestExecutionIdRef.current = data.executionId;
            executionCompletedRef.current = false; // Reset completed state
        }
    }, [data.executionId]);



    useEffect(() => {
        if (!data.executionId) {
            setStatus('idle');
            setResult(null);
            return;
        }

        // If we have a new execution ID, set status to running
        if (data.executionId !== latestExecutionIdRef.current) {
            setStatus('running');
        }
    }, [data.executionId]);

    // Use getResult properly

    useEffect(() => {
        // Don't start polling if not running or no ID
        if (!data.executionId || status !== 'running' || executionCompletedRef.current) {
            return;
        }

        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const startTime = Date.now();
        const MAX_POLLING_TIME = 60000;

        const fetchResult = async () => {
            if (!isMounted || !data.executionId) return;

            try {
                // First check status
                const currentStatus = await getExecutionStatus(data.executionId);
                console.log(`Current status for ${data.executionId}: ${currentStatus}`);

                // Only fetch result if not running (either completed or error)
                if (currentStatus !== 'running') {
                    const executionResult = await getResult(data.executionId);
                    console.log('Received execution result:', executionResult);

                    if (isMounted) {
                        // Use a synchronized batch update
                        await Promise.resolve(); // Micro-task to ensure DOM update
                        setResult(executionResult);
                        setStatus(currentStatus);
                        setIsExecuting(false);

                        // Force component to re-render after state updates
                        forceUpdate();

                        // Add this line to clear error message on success
                        if (executionResult.success) {
                            setErrorMessage('');
                        }

                        // Early return to avoid setting another timeout
                        return;
                    }
                }

                // If still running AND component is still mounted, schedule next check
                if (isMounted) {
                    timeoutId = setTimeout(fetchResult, 1000);
                }
            } catch (error) {
                console.error('Error fetching execution result:', error);
                if (isMounted) {
                    setStatus('error');
                    setIsExecuting(false);
                    setErrorMessage('Error checking execution status');
                    forceUpdate(); // Ensure UI updates on error too
                }
            }
        };

        // Initial check
        fetchResult();

        return () => {
            console.log('Cleaning up polling useEffect');
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [data.executionId, status, getExecutionStatus, getResult]);

    // Handler for text input changes
    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = event.target;
            updateNodeData(id, { [name]: value });
        },
        [id, updateNodeData]
    );

    const validatePythonCode = useCallback((code: string): boolean => {
        if (!code || code.trim() === '') return false;

        // Simple syntax checks
        const syntaxErrors = [
            { pattern: /^\s*import\s+$/, message: "Incomplete import statement" },
            { pattern: /\bdef\s+[^\(]*$/, message: "Incomplete function definition" },
            { pattern: /[\(\[\{]\s*$/, message: "Unclosed brackets" }
        ];

        for (const { pattern } of syntaxErrors) {
            if (code.match(pattern)) return false;
        }

        return true;
    }, []);

    // Handle execute code button click
    const handleExecuteCode = useCallback(async () => {
        if (!data.code || !validatePythonCode(data.code)) {
            setStatus('error');
            setErrorMessage('Invalid Python code');
            return;
        }

        // Clear previous results and errors
        setResult(null);
        setErrorMessage('');
        setIsExecuting(true);
        setStatus('running');
        executionCompletedRef.current = false; // Reset completed state

        try {
            const executionId = await executeCode(data.code);
            updateNodeData(id, {
                executionId,
                hasError: false
            });
        } catch (error) {
            handleExecutionError(error, 'executing code');
        }
    }, [data.code, executeCode, id, updateNodeData, validatePythonCode]);

    // Handle stop execution button click
    const handleStopExecution = useCallback(async () => {
        if (!data.executionId) return;

        try {
            await stopExecution(data.executionId);
            setIsExecuting(false);
            setStatus('idle');
            setErrorMessage('Execution stopped by user');
        } catch (error) {
            console.error('Error stopping execution:', error);
            // Even if there's an error stopping, update UI to indicate it's no longer running
            setIsExecuting(false);
        }
    }, [data.executionId, stopExecution]);

    // Add handler to refresh bridge status
    const handleRefreshBridgeStatus = useCallback(async () => {
        try {
            await refreshBridgeStatus();
        } catch (error) {
            console.error('Error refreshing bridge status:', error);
        }
    }, [refreshBridgeStatus]);

    const handleExecutionError = useCallback((error: unknown, action: string) => {
        console.error(`Error ${action}:`, error);
        setStatus('error');
        setIsExecuting(false);
        setErrorMessage(error instanceof Error ? error.message : `Unknown error while ${action}`);
        updateNodeData(id, { hasError: true });
    }, [id, updateNodeData]);

    // Prevent event propagation to parent elements
    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

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
                    width: data.dimensions?.width || 'auto',
                    height: data.dimensions?.height || 'auto',
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

                {data.executionId && (
                    <Box sx={{ mb: 1, fontSize: '0.7rem', color: '#aaa' }}>
                        <Typography variant="caption">
                            Execution ID: {data.executionId.substring(0, 8)}... |
                            Status: {status} |
                            isExecuting: {isExecuting.toString()} |
                            Has Result: {result ? 'Yes' : 'No'}
                        </Typography>
                    </Box>
                )}

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
                    {!isPythonBridgeAvailable && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            mb: 1,
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            borderRadius: '4px'
                        }}>
                            <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
                                {checkingBridgeStatus ? (
                                    <>
                                        <CircularProgress size={12} color="error" sx={{ mr: 1 }} />
                                        Checking Python bridge...
                                    </>
                                ) : (
                                    <>
                                        <ErrorOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                                        Python bridge unavailable
                                    </>
                                )}
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<RefreshIcon />}
                                onClick={(e) => {
                                    stopPropagation(e);
                                    handleRefreshBridgeStatus();
                                }}
                                disabled={checkingBridgeStatus}
                                className="nodrag"
                                onMouseDown={stopPropagation}
                            >
                                Refresh
                            </Button>
                        </Box>
                    )}
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
                                color={(status === 'completed' && result?.success) ? 'success' :
                                    (status === 'error' || (result && !result.success)) ? 'error' : 'primary'}
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
                            disabled={isExecuting || !data.code || !isPythonBridgeAvailable}
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
                    {(result || errorMessage) && (
                        <Box
                            sx={{
                                p: 1,
                                backgroundColor: 'rgba(15, 20, 25, 0.7)',
                                borderRadius: '4px',
                                borderLeft: `4px solid ${(result && result.success && !errorMessage) ? '#4CAF50' : '#F44336'}`,
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
                            {(errorMessage || (result && result.error)) ? (
                                <>
                                    <Typography color="error" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                        Error:
                                    </Typography>
                                    <Box component="pre" sx={{ m: 0, color: '#F44336' }}>
                                        {errorMessage || (result && result.error) || 'Unknown error'}
                                    </Box>
                                </>
                            ) : result && (
                                <>
                                    <Typography color="success.light" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                        Output:
                                    </Typography>
                                    <Box component="pre" sx={{ m: 0 }}>
                                        {result.output || '(No output)'}
                                    </Box>
                                </>
                            )}
                            {result && (
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#AAAAAA' }}>
                                    Execution time: {(result.execution_time !== undefined ? result.execution_time.toFixed(2) : '0.00')}s
                                </Typography>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default memo(PythonCodeNode);