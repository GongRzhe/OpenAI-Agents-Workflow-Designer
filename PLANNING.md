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

## Architecture

### Technology Stack

- **Frontend**: React with TypeScript
- **UI Components**: Material-UI (MUI)
- **Flow Visualization**: ReactFlow
- **Build System**: Vite
- **State Management**: React Context API
- **Python Execution**: FastAPI backend with sandboxed execution environment
- **Package Management**: npm/yarn for frontend, pip for Python backend

## Node Types

1. **Agent Node**: OpenAI agent with configurable instructions
2. **Runner Node**: Execution environment with input/output handling
3. **Function Tool Node**: Custom Python functions for agent use
4. **Python Code Node**: Directly write and execute custom Python code

## Feature Status

### Implemented ✅

- Drag and drop node placement
- Node property configuration
- Edge connections with visual enhancements
- Python code generation
- Node resizing and deletion
- Import/export functionality
- Sci-fi themed UI with enhanced connection points
- Initial Python Code execution environment
  - Backend API with FastAPI
  - Sandboxed execution with timeouts and error handling
  - Sync and async execution modes
  - Code validation and sanitization
- Python Code Execution Environment
  - PythonCodeNode component integration
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

### Implementation Status

1. **Phase 1: Basic Execution** ✅
   - Python virtual environment in SandBox
   - FastAPI execution backend
   - Frontend-to-Python bridge
   - Execution results display

2. **Phase 2: Enhanced Features** 🔄
   - Dependency management
   - Improved error handling with validation
   - Execution status tracking
   - Bridge availability indicator

3. **Phase 3: Advanced Integration** 📋
   - Live code editing and testing
   - Variable inspection
   - Performance monitoring
   - OpenAI API key management
   - Code completion and syntax highlighting

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

### Connection Points Enhancement

- Increased size (12px standard, 16px on hover)
- Color-coding by node type:
  - Agent: Cyan (#0cebeb)
  - Runner: Red (#F44336)
  - Tool: Orange (#FF9800)
  - Python Code: Green (#4CAF50)
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

- Complete Python execution environment
- Implement copy/paste functionality
- Fix React compatibility issues
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

## Implementation Priorities

1. **Stability and Bug Fixes**:
   - Fix React compatibility issues
   - Resolve Python execution bugs
   - Implement proper error handling

2. **User Experience Improvements**:
   - Copy/paste functionality
   - Undo/redo system
   - Workflow validation

3. **Feature Expansion**:
   - Enhanced Python execution
   - Template workflows
   - OpenAI API integration

Last updated: April 02, 2025