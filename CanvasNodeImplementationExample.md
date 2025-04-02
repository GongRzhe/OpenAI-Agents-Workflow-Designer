# Canvas Node Implementation Example

## 1. Node Data Structure

```typescript
// src/components/nodes/CanvasNode.tsx
interface CanvasNodeData {
  name?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  drawingData?: string; // Base64 encoded canvas data
  dimensions?: { width: number; height: number };
}
```

## 2. Component Implementation

```typescript
// src/components/nodes/CanvasNode.tsx
import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import BrushIcon from '@mui/icons-material/Brush';
import Button from '@mui/material/Button';
import { useNodeData } from '../../context/NodeDataContext';

const CanvasNode: React.FC<NodeProps<CanvasNodeData>> = ({ id, data, isConnectable, selected }) => {
  const { updateNodeData, resizeNode } = useNodeData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      setCtx(context);
      
      // Restore drawing if it exists
      if (data.drawingData && context) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
        };
        img.src = data.drawingData;
      }
    }
  }, [canvasRef, data.drawingData]);

  // Handle canvas interactions
  const startDrawing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  }, [ctx]);

  const draw = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawing && ctx) {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  }, [isDrawing, ctx]);

  const stopDrawing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawing && ctx && canvasRef.current) {
      setIsDrawing(false);
      // Save drawing data
      const drawingData = canvasRef.current.toDataURL();
      updateNodeData(id, { drawingData });
    }
  }, [isDrawing, ctx, canvasRef, id, updateNodeData]);

  const clearCanvas = useCallback(() => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      updateNodeData(id, { drawingData: '' });
    }
  }, [ctx, canvasRef, id, updateNodeData]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      updateNodeData(id, { [name]: value });
    },
    [id, updateNodeData]
  );

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <>
      <NodeResizer
        minWidth={300}
        minHeight={250}
        isVisible={selected}
        lineClassName="node-resize-line"
        handleClassName="node-resize-handle"
        onResize={(event, { width, height }) => {
          resizeNode(id, width, height);
        }}
      />

      <Card
        sx={{
          minWidth: 300,
          background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.8), rgba(18, 25, 45, 0.9))',
          border: selected ? '1px solid rgba(255, 152, 0, 0.7)' : '1px solid rgba(255, 152, 0, 0.3)',
          borderRadius: '8px',
          boxShadow: selected
            ? '0 0 15px rgba(255, 152, 0, 0.4), inset 0 0 8px rgba(255, 152, 0, 0.2)'
            : '0 4px 15px rgba(255, 152, 0, 0.2)',
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
            background: '#FF9800',
            border: '2px solid #192038',
            width: '12px',
            height: '12px'
          }}
          className="handle-canvas"
          isConnectable={isConnectable}
        />
        
        {/* Output Handle (Bottom) */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          style={{
            background: '#FF9800',
            border: '2px solid #192038',
            width: '12px',
            height: '12px'
          }}
          className="handle-canvas"
          isConnectable={isConnectable}
        />

        <CardContent sx={{ padding: '10px 16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BrushIcon sx={{ mr: 1, color: '#FF9800' }} />
            <Typography variant="subtitle1" sx={{
              fontWeight: 'bold',
              color: '#FF9800',
              textShadow: '0 0 5px rgba(255, 152, 0, 0.5)',
              fontFamily: '"Orbitron", sans-serif'
            }}>
              Canvas
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
            sx={{ mb: 1 }}
          />
          
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
            <TextField
              label="Width"
              variant="outlined"
              size="small"
              type="number"
              name="width"
              value={data.width || 280}
              onChange={handleInputChange}
              onMouseDown={stopPropagation}
              onClick={stopPropagation}
              className="nodrag"
              InputProps={{ className: "nodrag" }}
              sx={{ width: '48%' }}
            />
            <TextField
              label="Height"
              variant="outlined"
              size="small"
              type="number"
              name="height"
              value={data.height || 200}
              onChange={handleInputChange}
              onMouseDown={stopPropagation}
              onClick={stopPropagation}
              className="nodrag"
              InputProps={{ className: "nodrag" }}
              sx={{ width: '48%' }}
            />
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <canvas
              ref={canvasRef}
              width={data.width || 280}
              height={data.height || 200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="nodrag"
              style={{
                background: data.backgroundColor || 'white',
                borderRadius: '4px',
                cursor: 'crosshair'
              }}
            />
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            onClick={clearCanvas}
            onMouseDown={stopPropagation}
            className="nodrag"
            sx={{
              color: '#FF9800',
              borderColor: '#FF9800',
              '&:hover': {
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)'
              }
            }}
          >
            Clear Canvas
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default memo(CanvasNode);
```

## 3. Code Generator Update

```typescript
// Update to codeGenerator.ts

// Add canvas node handling
const canvasNodes = nodes.filter((node) => node.type === 'canvas');

if (canvasNodes.length > 0) {
  code += "\n# --- Canvas Visualization Code ---\n";
  code += "import matplotlib.pyplot as plt\nimport base64\nimport io\nfrom PIL import Image\n\n";
  
  canvasNodes.forEach((node, index) => {
    const canvasData = node.data;
    const varName = sanitizeName(canvasData.name) || `canvas_${index}`;
    
    code += `def load_${varName}_image():\n`;
    if (canvasData.drawingData) {
      // Generate code to recreate image from base64 data
      code += `    # Decode base64 image data\n`;
      code += `    image_data = "${canvasData.drawingData.split(',')[1]}"\n`;
      code += `    decoded_data = base64.b64decode(image_data)\n`;
      code += `    image = Image.open(io.BytesIO(decoded_data))\n`;
      code += `    return image\n\n`;
      
      code += `def display_${varName}():\n`;
      code += `    image = load_${varName}_image()\n`;
      code += `    plt.figure(figsize=(8, 6))\n`;
      code += `    plt.imshow(image)\n`;
      code += `    plt.axis('off')\n`;
      code += `    plt.title("${canvasData.name || `Canvas ${index}`}")\n`;
      code += `    plt.show()\n\n`;
    } else {
      code += `    # No drawing data available\n`;
      code += `    return None\n\n`;
    }
  });
}
```

## 4. Node Registration

```typescript
// In App.tsx
import CanvasNode from './components/nodes/CanvasNode';

const nodeTypes = {
  agent: AgentNode,
  runner: RunnerNode,
  functionTool: FunctionToolNode,
  pythonCode: PythonCodeNode,
  canvas: CanvasNode, // Add Canvas node
};
```

## 5. Sidebar Integration

```typescript
// In Sidebar.tsx
import BrushIcon from '@mui/icons-material/Brush';

// Then in the render method
<div
  className="sidebar-item"
  onDragStart={(event) => handleDragStart(event, 'canvas')}
  draggable
>
  <BrushIcon sx={{ mr: 1 }} /> Canvas
</div>
```

## 6. Node Integration Patterns

### 6.1 Node-to-Node Connection Patterns

When implementing a new node type, consider how it will connect to existing nodes:

| Connection Type | Source Node | Target Node | Connection Purpose |
|-----------------|-------------|-------------|-------------------|
| Data Flow | Any Node | Agent Node | Provide data for analysis |
| Control Flow | Runner Node | Agent Node | Execution orchestration |
| Tool Access | Function Tool | Agent Node | Provide capabilities |
| Visualization | Canvas Node | Python Code | Display generated visuals |
| MCP Integration | MCP Node | Agent Node | External tool access |

### 6.2 Data Flow Patterns

Consider how data flows through your node:

1. **Input Processing**: How does your node receive data?
2. **Data Transformation**: What does your node do with the data?
3. **Output Generation**: What does your node produce?
4. **State Management**: What state needs to be maintained?

### 6.3 Event Handling Patterns

Common event handling patterns:

1. **User Input**: Form fields, buttons, interactive elements
2. **Node Selection**: Handle selection state
3. **Node Resizing**: Use NodeResizer component
4. **Node Connection**: Handle connections through ReactFlow
5. **State Updates**: Update through NodeDataContext

## 7. Testing Your Node

### 7.1 Component Testing

```typescript
// Example test for Canvas Node
import { render, fireEvent, screen } from '@testing-library/react';
import CanvasNode from './CanvasNode';
import { NodeDataContext } from '../../context/NodeDataContext';

describe('CanvasNode', () => {
  it('renders correctly with default props', () => {
    // Test rendering
  });
  
  it('handles input changes', () => {
    // Test input handling
  });
  
  it('supports drawing operations', () => {
    // Test canvas operations
  });
});
```

### 7.2 Integration Testing

Test your node's integration with the rest of the system:

1. Add node to canvas
2. Connect to other nodes
3. Configure properties
4. Generate code
5. Verify output

## 8. Documentation Template

```markdown
### Canvas Node

The Canvas Node provides drawing and visualization capabilities within your agent workflows.

#### Features

- Interactive canvas for drawing
- Configurable dimensions
- Base64 image encoding/decoding
- Integration with Python visualization libraries

#### Configuration Options

- **Name**: Node identifier
- **Width**: Canvas width in pixels
- **Height**: Canvas height in pixels
- **Background Color**: Canvas background color

#### Connection Points

- **Top (Input)**: Receive data from other nodes
- **Bottom (Output)**: Send visual data to other nodes

#### Generated Code

The Canvas Node generates Python code using matplotlib to visualize your drawings.

#### Example Use Cases

- Data visualization
- Sketch-based input for agents
- Interactive interface elements
- Visual output for analysis results
```

## 9. Common Pitfalls and Solutions

| Pitfall | Solution |
|---------|----------|
| Node drag issues with interactive elements | Add `nodrag` class to form elements |
| State updates not reflecting | Verify NodeDataContext integration |
| Connection handles not working | Check handle IDs and positioning |
| Resizing issues | Use proper NodeResizer configuration |
| Code generation problems | Test with different code scenarios |
| Performance with complex nodes | Optimize with memoization and useCallback |
| Styling inconsistencies | Follow the project's sci-fi theme |

## 10. Advanced Node Features

For complex node types, consider implementing:

1. **Custom controls**: Specialized UI elements
2. **Interactive elements**: Canvas, charts, sliders
3. **Validation**: Input validation with error messages
4. **Advanced state management**: For complex data
5. **Custom connection logic**: For specialized connections
6. **Conditional rendering**: Show/hide elements based on state
7. **Tooltips and help text**: For better usability
