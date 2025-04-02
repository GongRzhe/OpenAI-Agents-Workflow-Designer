// src/components/nodes/MCPNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ApiIcon from '@mui/icons-material/Api'; // MCP Icon
import { useNodeData } from '../../context/NodeDataContext';
import { SelectChangeEvent } from '@mui/material/Select';
// Define the data structure for MCP node
interface MCPNodeData {
    name?: string;
    serverType?: 'git' | 'filesystem' | 'custom';
    command?: string;
    args?: string;
    directory?: string;
    dimensions?: { width: number; height: number };
}

const MCPNode: React.FC<NodeProps<MCPNodeData>> = ({ id, data, isConnectable, selected }) => {
    const { updateNodeData, resizeNode } = useNodeData();

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = event.target;
            updateNodeData(id, { [name]: value });
        },
        [id, updateNodeData]
    );

    const handleSelectChange = useCallback(
        (event: SelectChangeEvent<'git' | 'filesystem' | 'custom'>) => {
            const { name, value } = event.target;
            updateNodeData(id, { [name as string]: value });
        },
        [id, updateNodeData]
    );

    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    return (
        <>
            <NodeResizer
                minWidth={250}
                minHeight={200}
                isVisible={selected}
                lineClassName="node-resize-line"
                handleClassName="node-resize-handle"
                onResize={(event, { width, height }) => {
                    resizeNode(id, width, height);
                }}
            />

            <Card
                sx={{
                    minWidth: 250,
                    background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.8), rgba(18, 25, 45, 0.9))',
                    border: selected ? '1px solid rgba(100, 100, 255, 0.7)' : '1px solid rgba(100, 100, 255, 0.3)',
                    borderRadius: '8px',
                    boxShadow: selected
                        ? '0 0 15px rgba(100, 100, 255, 0.4), inset 0 0 8px rgba(100, 100, 255, 0.2)'
                        : '0 4px 15px rgba(100, 100, 255, 0.2)',
                    backdropFilter: 'blur(5px)',
                    transition: 'all 0.3s',
                }}
            >
                {/* Input Handle (Top) */}
                <Handle
                    type="target"
                    position={Position.Top}
                    id="a"
                    style={{
                        background: '#6464FF',
                        border: '2px solid #192038',
                        width: '12px',
                        height: '12px'
                    }}
                    className="handle-mcp"
                    isConnectable={isConnectable}
                />

                {/* Output Handle (Bottom) */}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="b"
                    style={{
                        background: '#6464FF',
                        border: '2px solid #192038',
                        width: '12px',
                        height: '12px'
                    }}
                    className="handle-mcp"
                    isConnectable={isConnectable}
                />

                <CardContent sx={{ padding: '10px 16px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ApiIcon sx={{ mr: 1, color: '#6464FF' }} />
                        <Typography variant="subtitle1" sx={{
                            fontWeight: 'bold',
                            color: '#6464FF',
                            textShadow: '0 0 5px rgba(100, 100, 255, 0.5)',
                            fontFamily: '"Orbitron", sans-serif'
                        }}>
                            MCP Server
                        </Typography>
                    </Box>

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
                        sx={{
                            mb: 1,
                            '& .MuiInputBase-input': {
                                color: '#f6f8ff', // Light color for input text
                            },
                            '& .MuiInputLabel-root': {
                                color: '#6464FF', // Light blue color for labels
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(100, 100, 255, 0.3)',
                            },
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(100, 100, 255, 0.7)',
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6464FF',
                                borderWidth: '2px',
                            },
                        }}
                    />

                    <FormControl
                        fullWidth
                        size="small"
                        sx={{
                            mb: 1,
                            '& .MuiInputLabel-root': {
                                color: '#6464FF',
                            },
                            '& .MuiSelect-select': {
                                color: '#f6f8ff', // Light color for selected value text
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(100, 100, 255, 0.3)',
                            },
                            '& .MuiSvgIcon-root': {
                                color: '#6464FF', // Color for the dropdown icon
                            }
                        }}
                        className="nodrag"
                    >
                        <InputLabel>Server Type</InputLabel>
                        <Select
                            name="serverType"
                            value={data.serverType || ''}
                            label="Server Type"
                            onChange={handleSelectChange}
                            onMouseDown={stopPropagation}
                            onClick={stopPropagation}
                            className="nodrag"
                            inputProps={{ className: "nodrag" }}
                        >
                            <MenuItem value="git">Git</MenuItem>
                            <MenuItem value="filesystem">Filesystem</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                    </FormControl>

                    {data.serverType === 'custom' && (
                        <>
                            <TextField
                                label="Command"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="command"
                                value={data.command || ''}
                                onChange={handleInputChange}
                                onMouseDown={stopPropagation}
                                onClick={stopPropagation}
                                className="nodrag"
                                InputProps={{ className: "nodrag" }}
                                sx={{
                                    mb: 1,
                                    '& .MuiInputBase-input': {
                                        color: '#f6f8ff', // Light color for input text
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#6464FF', // Light blue color for labels
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(100, 100, 255, 0.3)',
                                    },
                                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(100, 100, 255, 0.7)',
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#6464FF',
                                        borderWidth: '2px',
                                    },
                                }}
                            />
                            <TextField
                                label="Arguments (comma separated)"
                                variant="outlined"
                                size="small"
                                fullWidth
                                name="args"
                                value={data.args || ''}
                                onChange={handleInputChange}
                                onMouseDown={stopPropagation}
                                onClick={stopPropagation}
                                className="nodrag"
                                InputProps={{ className: "nodrag" }}
                                sx={{
                                    mb: 1,
                                    '& .MuiInputBase-input': {
                                        color: '#f6f8ff', // Light color for input text
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#6464FF', // Light blue color for labels
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(100, 100, 255, 0.3)',
                                    },
                                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(100, 100, 255, 0.7)',
                                    },
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#6464FF',
                                        borderWidth: '2px',
                                    },
                                }}
                            />
                        </>
                    )}

                    {(data.serverType === 'git' || data.serverType === 'filesystem') && (
                        <TextField
                            label={data.serverType === 'git' ? "Repository Path" : "Directory Path"}
                            variant="outlined"
                            size="small"
                            fullWidth
                            name="directory"
                            value={data.directory || ''}
                            onChange={handleInputChange}
                            onMouseDown={stopPropagation}
                            onClick={stopPropagation}
                            className="nodrag"
                            InputProps={{ className: "nodrag" }}
                            sx={{
                                mb: 1,
                                '& .MuiInputBase-input': {
                                    color: '#f6f8ff', // Light color for input text
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#6464FF', // Light blue color for labels
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(100, 100, 255, 0.3)',
                                },
                                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(100, 100, 255, 0.7)',
                                },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6464FF',
                                    borderWidth: '2px',
                                },
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default memo(MCPNode);