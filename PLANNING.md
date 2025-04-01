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
- **NEW: Python Execution**: Virtual environment in SandBox directory

## Node Types

1. **Agent Node**: OpenAI agent with configurable instructions
2. **Runner Node**: Execution environment with input/output handling
3. **Function Tool Node**: Custom Python functions for agent use

## Feature Status

### Implemented ✅

- Drag and drop node placement
- Node property configuration
- Edge connections with visual enhancements
- Python code generation
- Node resizing and deletion
- Import/export functionality
- Sci-fi themed UI with enhanced connection points

### Current Sprint 🔄

- UI/UX improvements
  - Enhanced connection point visibility
  - Scrollbar and dropdown styling
  - Delete button in navbar
  - Connection type indicators
- **Python Code Execution Environment (Planning)**

### Python Code Execution System

We will implement a system to execute the generated Python code directly within the application using a Python virtual environment in the SandBox directory:

#### Components

1. **Python Environment Management**:
   - Virtual environment creation and activation script
   - Basic dependency installation (openai, asyncio, etc.)
   - Requirements.txt management for custom dependencies

2. **Execution Bridge**:
   - Node.js backend server to interface with Python
   - API endpoints for code submission and execution
   - Secure execution sandbox with timeouts and resource limits

3. **UI Integration**:
   - Execute button alongside Generate Code
   - Real-time execution status feedback
   - Results panel for viewing outputs
   - Error handling and display

#### Implementation Approach

1. **Phase 1: Basic Execution**
   - Set up Python virtual environment in SandBox
   - Create simple execution script
   - Implement basic frontend-to-Python bridge
   - Add execution results display

2. **Phase 2: Enhanced Features**
   - Add dependency management
   - Implement proper error handling
   - Add execution history
   - Create debug mode with step execution

3. **Phase 3: Advanced Integration**
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

## Technical Implementation Details

### Connection Points Enhancement

- Increased size (12px standard, 16px on hover)
- Color-coding by node type:
  - Agent: Cyan (#0cebeb)
  - Runner: Red (#F44336)
  - Tool: Orange (#FF9800)

### Python Execution Technical Details

- Python 3.9+ virtual environment
- Dependency isolation for each execution
- Secure code execution with timeouts
- Output capture and formatting
- Error tracking and feedback
- Potential use of Jupyter kernel for interactive sessions

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

Last updated: April 10, 2025