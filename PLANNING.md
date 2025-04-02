# OpenAI Agents Workflow Designer - Planning Document

## Project Overview

The OpenAI Agents Workflow Designer provides a visual drag-and-drop interface for creating AI agent workflows and generating Python code.

### Core Goals

- Visual interface for designing OpenAI agent workflows
- Intuitive configuration of agent properties
- Connection system for data and control flow
- Production-ready Python code generation
- Easy workflow modification and iteration
- **NEW: Direct execution of generated Python code**

## Architecture

### Technology Stack

- **Frontend**: React with TypeScript
- **UI Components**: Material-UI (MUI)
- **Flow Visualization**: ReactFlow
- **Build System**: Vite
- **State Management**: React Context API
- **Python Execution**: FastAPI backend with sandboxed execution environment

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

### Current Sprint 🔄

- UI/UX improvements
  - Enhanced connection point visibility
  - Scrollbar and dropdown styling
  - Delete button in navbar
  - Connection type indicators
- **Python Code Execution Environment (Implementation)**
  - PythonCodeNode component integration
  - Real-time execution status feedback
  - Error handling and display in UI
  - Python Bridge availability status indicator
  - Code validation before execution

### Python Code Execution System

The system implements a robust execution environment for Python code directly within the application:

#### Components

1. **Python Environment Management**:
   - Virtual environment in the SandBox directory
   - Basic dependencies installed (openai, asyncio, etc.)
   - Support for additional package installation

2. **Execution Bridge**:
   - FastAPI backend server for Python execution
   - API endpoints for sync/async code submission and execution
   - Secure execution sandbox with timeouts and resource limits
   - Error handling and execution status tracking

3. **UI Integration**:
   - PythonCodeNode component with editor and execution controls
   - Real-time execution status display
   - Results panel for viewing outputs
   - Error handling with detailed feedback

#### Implementation Status

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

### Upcoming Features 📋

- Copy/paste functionality
- Undo/redo system
- Workflow validation
- Enhanced code generation options
- Template workflows
- OpenAI API integration
- Resolving bugs in PythonCodeNode.tsx:
  - Fix useRef import
  - Fix race conditions in execution status updates
  - Add validation for Python code
  - Improve error handling
  - Add proper cleanup in useEffect hooks

## Technical Implementation Details

### Connection Points Enhancement

- Increased size (12px standard, 16px on hover)
- Color-coding by node type:
  - Agent: Cyan (#0cebeb)
  - Runner: Red (#F44336)
  - Tool: Orange (#FF9800)
  - Python Code: Green (#4CAF50)

### Python Execution Technical Details

- Python 3.9+ virtual environment
- FastAPI backend with async/sync execution modes
- Secure code execution with timeouts and resource limits
- Multiprocessing for isolation
- Comprehensive error handling and status tracking
- Real-time feedback via polling mechanism

## Development Workflow

1. Feature definition and planning
2. Component implementation
3. Integration with existing systems
4. UI/UX refinement
5. Testing across browsers
6. Documentation update

## Future Directions

- Advanced workflow templates
- Shareable workflow library
- OpenAI API integration for testing
- Versioning and branching for workflows
- Collaborative editing features
- Enhanced debugging tools for Python code execution

Last updated: April 01, 2025