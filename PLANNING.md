# OpenAI Agents Workflow Designer - Planning Document

## Project Overview

The OpenAI Agents Workflow Designer is a visual tool for creating, configuring, and connecting AI agent systems. It enables users to design complex agent workflows through an intuitive drag-and-drop interface and automatically generates the corresponding Python code.

### Core Goals

- Provide a visual interface for designing OpenAI agent workflows
- Allow intuitive configuration of agent properties
- Support component connections to define data and control flow
- Generate production-ready Python code
- Enable easy modification and iteration of designs

## Architecture

### Technology Stack

- **Frontend Framework**: React with TypeScript
- **UI Components**: Material-UI (MUI)
- **Flow Visualization**: ReactFlow
- **Build System**: Vite
- **State Management**: React Context API

### Component Structure

```
src/
├── components/
│   ├── common/           # Shared components like modals, menus
│   ├── layout/           # Layout components (Navbar, Sidebar)
│   └── nodes/            # Node implementations for different component types
├── context/              # Context providers for state management
├── utils/                # Utility functions and code generation
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## Node Types

1. **Agent Node**
   - Represents an OpenAI agent
   - Configurable instructions, name, and handoff descriptions
   - Connects to Runners and Function Tools

2. **Runner Node**
   - Execution environment for agents
   - Configurable input and execution mode (sync/async)
   - Acts as a flow controller

3. **Function Tool Node**
   - Custom Python functions that agents can use
   - Configurable parameters, return types, and implementation
   - Provides extended functionality to agents

## Feature Roadmap

### Core Features (Implemented)

- [x] Drag and drop node placement
- [x] Node property configuration
- [x] Edge connections between nodes
- [x] Python code generation
- [x] Node resizing

### Current Sprint

- [ ] Node and edge deletion
  - Keyboard shortcuts (Delete/Backspace)
  - Context menu
  - Delete button in UI
- [ ] Improved node selection
- [ ] Multi-node operations

### Future Features

- [ ] Save/load workflows
- [ ] Workflow validation
- [ ] Undo/redo functionality
- [ ] Import/export to JSON
- [ ] Template workflows
- [ ] Integration with OpenAI API for testing

## Implementation Details

### Node/Edge Deletion Feature

The deletion feature will provide multiple interaction paths:

#### 1. Keyboard Shortcuts
- **Delete** or **Backspace** keys will delete selected nodes/edges
- Implementation using ReactFlow's `useKeyPress` hook:

```typescript
const deleteKeyPressed = useKeyPress(['Delete', 'Backspace']);

useEffect(() => {
  if (deleteKeyPressed) {
    onDeleteElements();
  }
}, [deleteKeyPressed, onDeleteElements]);
```

#### 2. Context Menu
- Right-click on nodes/edges to show a context menu with delete option
- Implemented as a custom component:

```typescript
const [contextMenu, setContextMenu] = useState<{
  x: number;
  y: number;
  nodeId?: string; 
  edgeId?: string;
} | null>(null);

const onNodeContextMenu = useCallback((event, node) => {
  // Show context menu
}, [setNodes]);
```

#### 3. Delete Button
- UI button in the canvas controls area
- Uses the same deletion logic as other methods:

```typescript
const onDeleteElements = useCallback(() => {
  const selectedNodes = nodes.filter(node => node.selected);
  const selectedEdges = edges.filter(edge => edge.selected);
  
  // Create and apply deletion changes
  const nodeChanges = selectedNodes.map(node => ({
    id: node.id,
    type: 'remove' as const,
  }));
  
  // Similar for edges...
}, [nodes, edges, setNodes, setEdges]);
```

### Changes Required

1. **App.tsx**:
   - Add imports for new functionality: `useKeyPress`, `applyEdgeChanges`
   - Add state for context menu
   - Implement handlers for deletion operations
   - Update ReactFlow component with new event handlers

2. **New Components**:
   - Create `NodeContextMenu.tsx` for right-click functionality
   - Create `KeyboardShortcutsHelp.tsx` for displaying available shortcuts

3. **CSS Updates**:
   - Style for delete button
   - Styling for context menu
   - Visual indicators for selected nodes/edges

## UI/UX Considerations

- **Visual Feedback**: Clear indication when nodes/edges are selected
- **Multiple Interaction Paths**: Support different user preferences
- **Confirmation**: Consider adding confirmation for bulk deletions
- **Keyboard Shortcuts**: Provide discoverable documentation
- **Undo Support**: Future enhancement to allow reverting deletions

## Technical Approach

- Use ReactFlow's built-in mechanisms for node/edge changes
- Leverage the `applyNodeChanges` and `applyEdgeChanges` methods
- Maintain a clean separation between:
  - Event detection (key press, right-click)
  - Operation handling (determining what to delete)
  - State updates (applying the changes)
- Ensure all interaction methods share the same core logic

## Testing Strategy

- Manual testing of all deletion paths
- Edge cases to test:
  - Deleting nodes with connected edges
  - Deleting the last node
  - Keyboard shortcuts with different node selections
  - Right-click behavior on overlapping elements

## Implementation Sequence

1. Set up basic keyboard deletion
2. Implement context menu component
3. Add right-click handlers
4. Create delete button UI
5. Add keyboard shortcuts help
6. Refine styles and interactions
7. Test and debug all paths

## Conclusion

This deletion feature enhances the usability of the OpenAI Agents Workflow Designer by providing intuitive ways to remove nodes and connections. The implementation leverages ReactFlow's built-in capabilities while adding custom UI elements for improved user experience.

The feature is designed to be consistent with existing interaction patterns in the application and follows best practices for visual feedback and multiple interaction paths.