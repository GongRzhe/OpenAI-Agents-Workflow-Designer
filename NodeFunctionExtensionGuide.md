# Node Function Extension Guide

## 1. Project Architecture Analysis

The OpenAI Agents Workflow Designer follows a component-based architecture with clear separation of concerns:

- **Components**: React components for UI rendering (`src/components/`)
- **Context**: State management using React Context API (`src/context/`)
- **Utils**: Helper functions including code generation (`src/utils/`)
- **Styles**: Sci-fi themed styling (`src/styles/`)

The node system is built on ReactFlow, with each node type implemented as a separate component, following a consistent pattern across all node types.

## 2. Node Component Structure

### 2.1 Essential Files

When adding a new node type, you'll need to create or modify these files:

| File | Purpose | Location |
|------|---------|----------|
| `{NodeType}Node.tsx` | Main node component | `src/components/nodes/` |
| `NodeDataContext.tsx` | State management | `src/context/` |
| `codeGenerator.ts` | Code generation | `src/utils/` |
| `App.tsx` | Node type registration | `src/` |
| `Sidebar.tsx` | Adding node to sidebar | `src/components/layout/` |

### 2.2 Component Hierarchy

```
App.tsx
├── NodeDataContext (state provider)
├── Sidebar (node creation)
└── ReactFlow
    └── Custom Nodes
        ├── AgentNode
        ├── RunnerNode
        ├── FunctionToolNode
        ├── PythonCodeNode
        └── YourNewNode
```

## 3. Step-by-Step Implementation Guide

### 3.1 Define Node Data Structure

First, define the data structure for your node type in TypeScript:

```typescript
// In your NewTypeNode.tsx
interface NewTypeNodeData {
  name?: string;
  // Add specific properties for your node type
  property1?: string;
  property2?: boolean;
  dimensions?: { width: number; height: number };
}
```

### 3.2 Create the Node Component

Create a new file in `src/components/nodes/` named `NewTypeNode.tsx`:

```typescript
// src/components/nodes/NewTypeNode.tsx
import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CustomIcon from '@mui/icons-material/Custom'; // Choose appropriate icon
import { useNodeData } from '../../context/NodeDataContext';

// Your node data interface

const NewTypeNode: React.FC<NodeProps<NewTypeNodeData>> = ({ id, data, isConnectable, selected }) => {
  const { updateNodeData, resizeNode } = useNodeData();

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
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName="node-resize-line"
        handleClassName="node-resize-handle"
        onResize={(event, { width, height }) => {
          resizeNode(id, width, height);
        }}
      />

      <Card
        sx={{
          minWidth: 200,
          background: 'linear-gradient(135deg, rgba(25, 32, 56, 0.8), rgba(18, 25, 45, 0.9))',
          border: selected ? '1px solid rgba(YOUR_COLOR, 0.7)' : '1px solid rgba(YOUR_COLOR, 0.3)',
          borderRadius: '8px',
          // Add your specific styling
        }}
      >
        {/* Add your handles based on connection requirements */}
        <Handle
          type="target"
          position={Position.Top}
          id="a"
          style={{
            background: '#YOUR_COLOR',
            border: '2px solid #192038',
            width: '12px',
            height: '12px'
          }}
          className="handle-newtype"
          isConnectable={isConnectable}
        />
        
        {/* Add more handles as needed */}

        <CardContent sx={{ padding: '10px 16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CustomIcon sx={{ mr: 1, color: '#YOUR_COLOR' }} />
            <Typography variant="subtitle1" sx={{
              fontWeight: 'bold',
              color: '#YOUR_COLOR', 
              textShadow: '0 0 5px rgba(YOUR_COLOR_RGB, 0.5)',
              fontFamily: '"Orbitron", sans-serif'
            }}>
              New Node Type
            </Typography>
          </Box>
          
          {/* Add your input fields */}
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
          
          {/* Add more input fields */}
          
        </CardContent>
      </Card>
    </>
  );
};

export default memo(NewTypeNode);
```

### 3.3 Update NodeDataContext

If your node type requires special state handling, update the NodeDataContext:

1. Open `src/context/NodeDataContext.tsx`
2. Add support for your node type's data structure
3. Implement any special methods needed

### 3.4 Register the Node Type

In `src/App.tsx`, add your node type to the nodeTypes object:

```typescript
// In App.tsx
import NewTypeNode from './components/nodes/NewTypeNode';

const nodeTypes = {
  agent: AgentNode,
  runner: RunnerNode,
  functionTool: FunctionToolNode,
  pythonCode: PythonCodeNode,
  newType: NewTypeNode, // Add your new node type
};
```

### 3.5 Add to Sidebar

Update `src/components/layout/Sidebar.tsx` to include your new node type:

```typescript
// In Sidebar.tsx
// Add import for your node icon if needed

// Add a new item to the sidebar menu
const handleDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

// Then in the component return:
<div
  className="sidebar-item"
  onDragStart={(event) => handleDragStart(event, 'newType')}
  draggable
>
  <CustomIcon /> New Node Type
</div>
```

### 3.6 Update Code Generator

Modify `src/utils/codeGenerator.ts` to handle your new node type:

```typescript
// In codeGenerator.ts

// Add a section to handle your new node type
const newTypeNodes = nodes.filter((node) => node.type === 'newType');

if (newTypeNodes.length > 0) {
  code += "\n# --- New Node Type Code ---\n";
  newTypeNodes.forEach((node) => {
    // Generate code for your node type
    const nodeData = node.data;
    // Your code generation logic
    code += `\n# Code for ${nodeData.name || 'Unnamed Node'}\n`;
    // More code generation
  });
}

// Also update any other parts of the generator that need to be aware of your node type
```

## 4. Node UI Guidelines

### 4.1 Visual Consistency

- Use consistent styling with the sci-fi theme
- Choose a unique color for your node type
- Maintain the card-based approach with proper shadows and gradients
- Use the NodeResizer component for resizability

### 4.2 Connection Points

- Position handles logically based on expected connections
- Use consistent sizing (12px standard, 16px on hover)
- Apply your node's color theme to handles
- Add proper styling for selected/hover states

### 4.3 Form Elements

- Use Material-UI components for consistency
- Apply the `nodrag` class to prevent text selection issues
- Use consistent spacing and padding
- Keep labels clear and concise

## 5. State Management

### 5.1 Data Structure

Define a clear data structure for your node's state, using TypeScript interfaces.

### 5.2 Context Integration

Use the existing NodeDataContext for state management:
- `updateNodeData` for property changes
- `resizeNode` for dimension changes
- Add custom methods if needed

### 5.3 Optimization

- Use `useCallback` for event handlers
- Use `memo` to prevent unnecessary rerenders
- Consider performance with large workflows

## 6. Code Generation Strategy

### 6.1 Code Structure

Generate code that follows the project's conventions:
- Proper imports
- Clear function/class definitions
- Logical organization
- Appropriate error handling

### 6.2 Python Integration

Ensure your generated code works with the OpenAI Agents Python library:
- Follow library patterns
- Test with actual execution if applicable
- Handle dependencies properly

### 6.3 Connection Handling

Generate code that properly handles connections to other node types:
- Agent connections
- Tool connections
- Runner connections
- Other specific connections

## 7. Testing Strategy

### 7.1 Component Testing

Test your node component:
- Basic rendering
- Input handling
- Resize functionality
- Connection handling

### 7.2 Integration Testing

Test integration with other node types:
- Connection compatibility
- Workflow functionality
- State management

### 7.3 Code Generation Testing

Test the generated code:
- Syntax correctness
- Runtime behavior
- Integration with the agents library

## 8. Documentation Requirements

### 8.1 Component Documentation

Document your node component:
- Purpose and use cases
- Configuration options
- Connection capabilities
- Special features

### 8.2 User Documentation

Update user documentation:
- Add to README.md
- Update PLANNING.md if needed
- Add examples

### 8.3 Code Comments

Add meaningful comments to your code:
- Component structure
- State management
- Complex logic
- Edge cases

## 9. Example Implementation: MCP Node

As a reference, here's how the MCP Node is being implemented:

1. Created `MCPNode.tsx` with server configuration options
2. Updated NodeDataContext to handle MCP-specific data
3. Modified codeGenerator.ts to handle MCP servers
4. Added to App.tsx and Sidebar.tsx
5. Documented in README.md, TASK.md, and PLANNING.md

## 10. Checklist for New Node Types

- [ ] Define node data structure interface
- [ ] Create node component file
- [ ] Design UI with proper handles and styling
- [ ] Implement state management
- [ ] Update code generator
- [ ] Register in App.tsx
- [ ] Add to Sidebar.tsx
- [ ] Test component functionality
- [ ] Test integration with other nodes
- [ ] Test generated code
- [ ] Update documentation



