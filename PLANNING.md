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
- MCP Node UI Component (80%)
  - Basic component structure and styling
  - Server type selection (Git, Filesystem, Custom)
  - Connection handles for Agent integration
  - Code generation support

### Current Sprint 🔄

- Complete MCP Node implementation
  - Test integration with Agent nodes
  - Fix deployment issues with MCP servers
  - Add environment variable support
  - Implement status indicators
  - Create documentation and examples
  - Improve error handling for server connections
- Enhance Python code execution
  - Implement error boundaries
  - Add execution history
  - Fix memory leaks
  - Improve code validation

### Next Sprint 📋

- Implement copy/paste functionality
  - Multi-node selection and copying
  - Position offset for pasted nodes
  - ID regeneration for duplicated nodes
- Create undo/redo system
  - Operation history tracking
  - Support for complex operations
- Add workflow validation
  - Connection type checking
  - Required fields validation

## MCP Node Implementation Plan

The MCP Node system enables connection to Model Context Protocol servers, extending agent capabilities by providing access to external tools such as Git repositories, filesystem access, and more.

### Implementation Progress

1. ✅ **Phase 1: Component Structure**
   - Created basic MCPNode.tsx component
   - Defined data structure and props
   - Implemented NodeDataContext integration

2. ✅ **Phase 2: UI Development**
   - Designed sci-fi themed MCP node card
   - Created server type selection dropdown
   - Implemented server configuration fields
   - Added connection handles

3. ✅ **Phase 3: Code Generation**
   - Updated codeGenerator.ts to support MCP nodes
   - Generated proper imports and server initialization
   - Handled connection to Agent nodes
   - Added support for different server types

4. 🔄 **Phase 4: Testing & Documentation**
   - Testing with Git MCP server
   - Testing with Filesystem MCP server
   - Creating examples and documentation
   - Updating README.md with MCP features

### Features Implemented

1. ✅ **Server Type Selection**
   - Git - For repository analysis
   - Filesystem - For file access and manipulation
   - Custom - For other MCP-compatible servers

2. ✅ **Configuration Options**
   - Command and arguments
   - Working directory
   - Server name
   - Tool caching toggle

3. ✅ **Connection System**
   - Connection to Agents to provide tools
   - Visual indicator for MCP-Agent connections
   - Proper handle styling and positioning

4. ✅ **Generated Code**
   - Server initialization and connection
   - Error handling and cleanup
   - Tool registration with agents
   - Async/await pattern for MCP operations

### Remaining MCP Tasks

1. 🔄 **Integration Testing**
   - Test with real Git repositories
   - Test with filesystem access
   - Verify tool registration with agents
   - Test error handling scenarios

2. 🔄 **Environment Variables Support**
   - Add environment variable editor
   - Update code generation for env vars
   - Create secure storage for sensitive values

3. 🔄 **Documentation and Examples**
   - Create example workflows using MCP
   - Add detailed documentation for MCP usage
   - Include troubleshooting guide

4. 🔄 **Connection Status Indicators**
   - Add visual feedback for MCP server status
   - Implement connection testing
   - Add error reporting for failed connections

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
   - Progress: Started implementing useReducer for better state management
   - Next steps: Complete reducer implementation and test with concurrent operations

2. **Code Validation**:
   - Problem: Current validation is minimal and misses many potential errors
   - Progress: Added basic syntax checking
   - Next steps: Implement more comprehensive validation with clear error messages

3. **Error Handling**:
   - Problem: Inconsistent error handling across components
   - Progress: Started implementing error boundaries
   - Next steps: Complete error boundary implementation and standardize error handling

4. **Memory Management**:
   - Problem: Long-running or failed executions can cause memory leaks
   - Progress: Implemented background cleanup for completed executions
   - Next steps: Enhance cleanup process and add monitoring for resource usage

5. **Python Bridge Status**:
   - Problem: Users don't always know if the Python backend is available
   - Progress: Added status indicator and refresh button
   - Next steps: Implement automatic reconnection and better error reporting

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

## React Compatibility Issues

The project currently uses React 19.0.0, which is a future version not yet officially released. This causes several compatibility issues:

1. **Dependency Conflicts**:
   - Material-UI version 7.0.1 expects React 19 features
   - ReactFlow version 11.11.4 is designed for React 18
   - TypeScript types are inconsistent

2. **Import Errors**:
   - PythonCodeNode.tsx and PythonExecutionContext.tsx have import conflicts
   - Some React 19 specific hooks are not available in production builds

3. **Resolution Plan**:
   - Downgrade React to version 18.2.0
   - Update Material-UI to compatible version (5.x)
   - Fix import statements and type definitions
   - Update TypeScript configuration

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

1. **Complete MCP Node Implementation**:
   - Finish integration testing
   - Add environment variable support
   - Create documentation and examples
   - Implement connection status indicators

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