# OpenAI Agents Workflow Designer - Planning Document

## Project Overview

The OpenAI Agents Workflow Designer provides a visual drag-and-drop interface for creating AI agent workflows, generating Python code, and executing Python code directly within the application.

### Core Goals

- Visual interface for designing OpenAI agent workflows
- Intuitive configuration of agent properties
- Connection system for data and control flow
- Production-ready Python code generation
- Easy workflow modification and iteration
- Direct execution of generated Python code
- Sci-fi themed UI with enhanced user experience
- Integration with external tool systems via MCP

## Architecture

### Technology Stack

- **Frontend**: React with TypeScript
- **UI Components**: Material-UI (MUI)
- **Flow Visualization**: ReactFlow
- **Build System**: Vite
- **State Management**: React Context API
- **Python Execution**: FastAPI backend with sandboxed execution environment
- **Package Management**: npm/yarn for frontend, pip for Python backend
- **Tool Integration**: Model Context Protocol (MCP)

## Node Types

1. **Agent Node**: OpenAI agent with configurable instructions
2. **Runner Node**: Execution environment with input/output handling
3. **Function Tool Node**: Custom Python functions for agent use
4. **Python Code Node**: Directly write and execute custom Python code
5. **MCP Node**: Connect to external tool servers using MCP

## Feature Status

### Implemented ✅

- Drag and drop node placement
- Node property configuration
- Edge connections with visual enhancements
- Python code generation
- Node resizing and deletion
- Import/export functionality
- Sci-fi themed UI with enhanced connection points
- Python Code Execution Environment
  - Backend API with FastAPI
  - Sandboxed execution with timeouts and error handling
  - Sync and async execution modes
  - Code validation and sanitization
  - Real-time execution status feedback
  - Error handling and display in UI
  - Python Bridge availability status indicator
  - Code validation before execution

### Current Sprint 🔄

- UI/UX improvements
  - Enhanced connection point visibility with color coding
  - Improved scrollbar and dropdown styling
  - Delete button in navbar
  - Connection type indicators
- MCP Node implementation
  - Component development
  - Server configuration options
  - Code generation integration
  - Documentation and examples


### Next Sprint 📋

- Fix React compatibility issues
  - Update React version from 19.0.0 to 18.2.0
  - Update Material-UI and other dependencies
- Enhance Python code execution
  - Add error boundary for execution failures
  - Improve execution monitoring
  - Fix memory leaks
- Implement copy/paste functionality
  - Keyboard shortcuts and multi-node selection
  - ID regeneration for duplicated nodes

## MCP Node Implementation Plan

The MCP Node system will enable connection to Model Context Protocol servers, extending agent capabilities by providing access to external tools such as Git repositories, filesystem access, and more.

### Implementation Phases

1. **Phase 1: Component Structure**
   - Create basic MCPNode.tsx component
   - Define data structure and props
   - Implement NodeDataContext integration

2. **Phase 2: UI Development**
   - Design sci-fi themed MCP node card
   - Create server type selection dropdown
   - Implement server configuration fields
   - Add connection handles

3. **Phase 3: Code Generation**
   - Update codeGenerator.ts to support MCP nodes
   - Generate proper imports and server initialization
   - Handle connection to Agent nodes
   - Support different server types

4. **Phase 4: Testing & Documentation**
   - Test with Git MCP server
   - Test with Filesystem MCP server
   - Create examples and documentation
   - Update README.md with MCP features

### Features

1. **Server Type Selection**
   - Git - For repository analysis
   - Filesystem - For file access and manipulation
   - Custom - For other MCP-compatible servers
   - Stdio - For command-line tool integration
   - SSE - For event stream communication

2. **Configuration Options**
   - Command and arguments
   - Working directory
   - Environment variables
   - Server name
   - Tool caching toggle

3. **Connection System**
   - Connection to Agents to provide tools
   - Visual indicator for MCP-Agent connections
   - Proper handle styling and positioning

4. **Generated Code**
   - Server initialization and connection
   - Error handling and cleanup
   - Tool registration with agents
   - Async/await pattern for MCP operations

### Technical Considerations

1. **MCP Server Requirements**
   - Ensure required packages are installed
   - Add documentation for server prerequisites
   - Handle connection errors gracefully

2. **State Management**
   - Store MCP node configuration in NodeDataContext
   - Allow updating server parameters
   - Persist settings in project files

3. **Code Generation**
   - Generate imports for MCP modules
   - Create server initialization code
   - Connect servers to appropriate agents
   - Include error handling and cleanup

4. **UI Elements**
   - Server type selector
   - Command and arguments fields
   - Environment variable editor
   - Tool caching toggle
   - Connection handles
   - Visual feedback for connection status

## Python Code Execution System

The system implements a robust execution environment for Python code directly within the application:

### Components

1. **Python Environment Management**:
   - Virtual environment in the SandBox directory
   - Basic dependencies installed (fastapi, uvicorn, psutil, etc.)
   - Support for additional package installation

2. **Execution Bridge**:
   - FastAPI backend server for Python execution
   - API endpoints for sync/async code submission
   - Secure execution sandbox with process isolation
   - Resource limits and execution timeouts
   - Error handling and execution status tracking

3. **UI Integration**:
   - PythonCodeNode component with editor and execution controls
   - React context for state management (PythonExecutionContext)
   - API client for communication (pythonBridge.ts)
   - Real-time execution status display
   - Results panel for viewing outputs

### Current Issues to Resolve

1. **Race Conditions in Status Updates**:
   - Problem: Multiple concurrent status updates can lead to inconsistent state
   - Solution: Implement more robust state management with useReducer and careful async handling

2. **Code Validation**:
   - Problem: Current validation is minimal and misses many potential errors
   - Solution: Implement more comprehensive validation with clear error messages

3. **Error Handling**:
   - Problem: Inconsistent error handling across components
   - Solution: Standardize error handling and implement error boundaries

4. **Memory Management**:
   - Problem: Long-running or failed executions can cause memory leaks
   - Solution: Implement proper cleanup for completed executions and error cases

5. **Python Bridge Status**:
   - Problem: Users don't always know if the Python backend is available
   - Solution: Implement clear status indicators with automatic reconnection

## Technical Implementation Details

### MCP Node Implementation

- **Component Structure**
  - Node card with server type selector
  - Form fields for server configuration
  - Connection handles for Agent linkage
  - Resizable container with sci-fi theme styling

- **Server Types**
  - Git server (for repository analysis)
  - Filesystem server (for file access and manipulation)
  - Custom server (for other MCP-compatible tools)
  - Support for both stdio and SSE transports

- **Code Generation**
  - Import statements for MCP modules
  - Server initialization with proper parameters
  - Async connection handling
  - Tool registration with connected agents
  - Cleanup and error handling

- **Connection UI**
  - Custom purple handle styling for MCP connections
  - Visual indicators for connection status
  - Proper handle positioning for intuitive connection

### Connection Points Enhancement

- Increased size (12px standard, 16px on hover)
- Color-coding by node type:
  - Agent: Cyan (#0cebeb)
  - Runner: Red (#F44336)
  - Tool: Orange (#FF9800)
  - Python Code: Green (#4CAF50)
  - MCP: Purple (#9C27B0)
- Improved visibility with stronger glow effects
- Added hover effects for better user feedback

### Python Execution Technical Details

- **Execution Process**:
  1. User writes Python code in the PythonCodeNode
  2. Code is sent to FastAPI backend via pythonBridge.ts
  3. Backend validates and sanitizes the code
  4. Code runs in isolated process with resource limits
  5. Results are returned to frontend
  6. UI updates with execution status and results

- **Security Measures**:
  - Process isolation with multiprocessing
  - Resource limits (CPU time, memory)
  - Execution timeouts
  - Blocked unsafe imports and operations
  - Input validation and sanitization

- **Performance Considerations**:
  - Small code snippets run synchronously
  - Larger or async code runs asynchronously with status polling
  - Background cleanup for completed executions
  - Connection pooling for efficient API communication

## Development Workflow

1. Feature definition and planning
2. Component implementation
3. Integration with existing systems
4. UI/UX refinement
5. Testing across browsers
6. Documentation update

## Future Directions

### Short-term (1-2 months)

- Complete MCP Node implementation
- Fix React compatibility issues
- Implement copy/paste functionality
- Refactor components for better maintainability
- Add comprehensive testing

### Medium-term (3-6 months)

- Undo/redo system
- Workflow validation
- Enhanced code generation options
- Template workflows
- OpenAI API integration for testing

### Long-term (6+ months)

- Collaborative editing features
- Advanced debugging tools
- Workflow version control
- Marketplace for custom node types
- Integration with other AI platforms
- Extended MCP server support

## Implementation Priorities

1. **MCP Node Implementation**:
   - Create component structure and UI
   - Update code generator
   - Test with Git and Filesystem servers
   - Document usage and examples

2. **Stability and Bug Fixes**:
   - Fix React compatibility issues
   - Resolve Python execution bugs
   - Implement proper error handling

3. **User Experience Improvements**:
   - Copy/paste functionality
   - Undo/redo system
   - Workflow validation

4. **Feature Expansion**:
   - Enhanced Python execution
   - Template workflows
   - OpenAI API integration

Last updated: April 02, 2025