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

// Define execution state type for reducer
type ExecutionState = {
    status: ExecutionStatus;
    isExecuting: boolean;
    result: ExecutionResult | null;
    errorMessage: string;
};

// Define actions for reducer
type ExecutionAction = 
    | { type: 'START_EXECUTION' }
    | { type: 'EXECUTION_COMPLETED', result: ExecutionResult }
    | { type: 'EXECUTION_ERROR', error: string }
    | { type: 'UPDATE_STATUS', status: ExecutionStatus }
    | { type: 'STOP_EXECUTION' }
    | { type: 'RESET' };

// Reducer function for execution state
const executionReducer = (state: ExecutionState, action: ExecutionAction): ExecutionState => {
    switch (action.type) {
        case 'START_EXECUTION':
            return {
                ...state,
                isExecuting: true,
                status: 'running',
                result: null,
                errorMessage: ''
            };
        case 'EXECUTION_COMPLETED':
            return {
                ...state,
                isExecuting: false,
                status: 'completed',
                result: action.result,
                errorMessage: action.result.success ? '' : (action.result.error || '')
            };
        case 'EXECUTION_ERROR':
            return {
                ...state,
                isExecuting: false,
                status: 'error',
                errorMessage: action.error
            };
        case 'UPDATE_STATUS':
            return {
                ...state,
                status: action.status
            };
        case 'STOP_EXECUTION':
            return {
                ...state,
                isExecuting: false,
                status: 'idle',
                errorMessage: 'Execution stopped by user'
            };
        case 'RESET':
            return {
                isExecuting: false,
                status: 'idle',
                result: null,
                errorMessage: ''
            };
        default:
            return state;
    }
};

const initialExecutionState: ExecutionState = {
    isExecuting: false,
    status: 'idle',
    result: null,
    errorMessage: ''
};

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

    // Use reducer for execution state management
    const [executionState, dispatch] = React.useReducer(
        executionReducer,
        initialExecutionState
    );

    // Effect for handling execution status updates
    useEffect(() => {
        if (!data.executionId || executionState.status !== 'running') {
            return;
        }

        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const startTime = Date.now();
        const MAX_POLLING_TIME = 60000; // 60 seconds
        const POLLING_INTERVAL = 1000;  // 1 second

        const fetchStatus = async () => {
            if (!isMounted || !data.executionId) return;

            // Check if we've been polling too long
            if (Date.now() - startTime > MAX_POLLING_TIME) {
                dispatch({ 
                    type: 'EXECUTION_ERROR', 
                    error: 'Execution timed out after 60 seconds' 
                });
                return;
            }

            try {
                const status = await getExecutionStatus(data.executionId);
                
                if (status === 'completed' || status === 'error') {
                    const result = await getResult(data.executionId);
                    dispatch({ type: 'EXECUTION_COMPLETED', result });
                } else {
                    // Schedule next check if still running
                    timeoutId = setTimeout(fetchStatus, POLLING_INTERVAL);
                }
            } catch (error) {
                dispatch({ 
                    type: 'EXECUTION_ERROR', 
                    error: error instanceof Error ? error.message : 'Error checking execution status'
                });
            }
        };

        // Start polling
        fetchStatus();

        // Cleanup function
        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [data.executionId, executionState.status, getExecutionStatus, getResult]);

    // Handler for text input changes
    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = event.target;
            updateNodeData(id, { [name]: value });
        },
        [id, updateNodeData]
    );

    // Validate Python code
    const validatePythonCode = useCallback((code: string): boolean => {
        if (!code || code.trim() === '') return false;

        // Simple syntax checks (could be expanded)
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
            dispatch({ type: 'EXECUTION_ERROR', error: 'Invalid Python code' });
            return;
        }

        dispatch({ type: 'START_EXECUTION' });

        try {
            const executionId = await executeCode(data.code);
            updateNodeData(id, { executionId });
        } catch (error) {
            dispatch({ 
                type: 'EXECUTION_ERROR', 
                error: error instanceof Error ? error.message : 'Error executing code' 
            });
        }
    }, [data.code, executeCode, id, updateNodeData, validatePythonCode]);

    // Handle stop execution button click
    const handleStopExecution = useCallback(async () => {
        if (!data.executionId) return;

        try {
            await stopExecution(data.executionId);
            dispatch({ type: 'STOP_EXECUTION' });
        } catch (error) {
            console.error('Error stopping execution:', error);
            // Even if there's an error stopping, update UI to indicate it's no longer running
            dispatch({ type: 'STOP_EXECUTION' });
        }
    }, [data.executionId, stopExecution]);

    // Refresh bridge status
    const handleRefreshBridgeStatus = useCallback(async () => {
        try {
            await refreshBridgeStatus();
        } catch (error) {
            console.error('Error refreshing bridge status:', error);
        }
    }, [refreshBridgeStatus]);

    // Prevent event propagation
    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const { status, isExecuting, result, errorMessage } = executionState;

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