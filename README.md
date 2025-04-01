# OpenAI Agents Workflow Designer

A visual drag-and-drop interface for designing and orchestrating OpenAI agent workflows. This tool allows you to visually create complex AI agent systems by connecting different components and automatically generates the corresponding Python code.

![OpenAI Agents Workflow Designer Interface](public/screenshot.png)

## Features

- **Visual Workflow Design**: Drag and drop components to build your agent workflow
- **Component Library**: Choose from various pre-built components:
  - Agent nodes (LLM-powered assistants)
  - Runner nodes (execution environments)
  - Function Tool nodes (custom Python functions)
- **Connection System**: Visually connect components to define relationships and data flow
- **Node Customization**: Resize and configure nodes with intuitive controls
- **Node Management**: Delete nodes and connections via keyboard shortcuts or context menu
- **Code Generation**: Automatically generate Python code from your visual workflow
- **React Flow Integration**: Built on top of React Flow for smooth, interactive node-based interfaces

## Installation

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/openai-agents-designer.git
   cd openai-agents-designer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Usage

### Building a Workflow

1. **Add Components**: Drag components from the left sidebar onto the canvas
2. **Configure Nodes**: Click on nodes to edit their properties in the node panel
3. **Resize Nodes**: Select a node and use the resize handles to adjust its size
4. **Create Connections**: Connect nodes by dragging from one node's handle to another
5. **Delete Components**: Select nodes or edges and press Delete key, or use the context menu
6. **Generate Code**: Click the "Generate Code" button in the top bar to create Python code for your workflow

### Component Types

#### Agent Node
Represents an OpenAI-powered agent with specific instructions and capabilities.
- Configure name, instructions, and handoff descriptions
- Connect to Runner nodes and Function Tool nodes
- Customize appearance and size

#### Runner Node
Execution environment that orchestrates the agent interactions.
- Configure input parameters and execution settings (sync/async)
- Acts as a flow controller for agent execution
- Connect multiple agents in a workflow

#### Function Tool Node
Custom Python functions that can be used by agents.
- Define function parameters, return types, and implementation in Python
- Provide extended capabilities to agents
- Access and manipulate data within the workflow

### Keyboard Shortcuts

- **Delete/Backspace**: Delete selected nodes or edges
- **Escape**: Deselect all elements
- **Mouse Controls**:
  - Click and drag to move nodes
  - Click node handles and drag to create connections
  - Right-click on nodes or edges for context menu

## Project Structure

```
openai-agents-designer/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # React components
│   │   ├── common/     # Shared UI components
│   │   │   ├── CodeModal.tsx           # Code display modal
│   │   │   ├── KeyboardShortcutsHelp.tsx # Keyboard shortcuts help
│   │   │   ├── NodeContextMenu.tsx     # Right-click context menu
│   │   │   └── ResizeHandle.tsx        # Custom resize handles
│   │   ├── layout/     # Layout components (Navbar, Sidebar)
│   │   └── nodes/      # Custom node implementations
│   ├── context/        # React context providers
│   │   └── NodeDataContext.tsx  # State management for nodes
│   ├── utils/          # Utility functions
│   │   └── codeGenerator.ts     # Python code generation logic
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── index.html          # HTML entry point
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── README.md           # Project documentation
```

## Development

### Built With

- React 19 + TypeScript
- [React Flow](https://reactflow.dev/) - For the node-based UI
- [Material-UI](https://mui.com/) - UI component library
- Vite - Build tool and development server

### Adding New Node Types

1. Create a new component in `src/components/nodes/`
2. Register the node type in the `nodeTypes` object in `App.tsx`
3. Add the node to the sidebar in `Sidebar.tsx`
4. Update the code generator in `utils/codeGenerator.ts` to handle the new node type

### Recently Added Features

1. **Node Resizing**: Resize nodes using corner handles
2. **Node Deletion**: Delete nodes and edges with keyboard shortcuts
3. **Context Menu**: Right-click on nodes and edges for quick actions
4. **Keyboard Shortcuts**: Added keyboard shortcut support and help panel

## Troubleshooting

### Common Issues

- **Layout Problems**: If the canvas area appears too narrow, check the CSS in App.css and index.css to ensure the application takes full width
- **Drag and Drop Issues**: Ensure the onDragStart event is properly setting the node type data
- **Text Selection**: Use the nodrag class for interactive elements within nodes to prevent unwanted dragging
- **Connection Issues**: Check that handle IDs are correctly configured in node components

### Browser Compatibility

This application works best in modern browsers (Chrome, Firefox, Edge, Safari). Internet Explorer is not supported.

## Planned Features

- Copy/paste functionality for nodes
- Save/load workflows
- Undo/redo system
- Workflow validation
- Import/export to JSON
- Template workflows

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [OpenAI](https://openai.com/) for their powerful API and agent capabilities
- [React Flow](https://reactflow.dev/) for the excellent node-based interface library
- [Material-UI](https://mui.com/) for the comprehensive UI component library