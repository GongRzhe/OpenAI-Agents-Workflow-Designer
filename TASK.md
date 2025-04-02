# OpenAI Agents Workflow Designer - Task List

## Current Sprint (April 2025)

### Completed Tasks ✅

- [x] **XYZ-001**: Implement node deletion via keyboard shortcuts
- [x] **XYZ-002**: Implement node resizing functionality
- [x] **XYZ-003**: Fix UI interaction issues
- [x] **XYZ-004**: Complete node/edge deletion feature
  - Added keyboard shortcuts, context menu, and navbar button
- [x] **XYZ-005**: Enhance UI/UX
  - Improved node connection points visibility with color coding
  - Beautified scrollbars and dropdowns with sci-fi theme
  - Moved delete button to navbar
  - Optimized for different screen sizes
- [x] **XYZ-006**: Implement Python code execution environment (100%)
  - Created Python virtual environment in SandBox directory
  - Implemented execution bridge with FastAPI
  - Added dependency management for generated code
  - Created execution results display in UI

## Upcoming Tasks

### High Priority 🔴

- [ ] **XYZ-009**: Implement MCP Node
  - Create MCPNode component with server configuration options
  - Support for Git, Filesystem, and custom MCP servers
  - Update code generator to handle MCP nodes
  - Integrate with Agent nodes
  - Add documentation and examples

- [ ] **XYZ-007**: Fix React compatibility issues
  - Update React version from 19.0.0 (future version) to 18.2.0
  - Update Material-UI and other dependencies to compatible versions
  - Resolve import conflicts in PythonCodeNode.tsx and PythonExecutionContext.tsx

- [ ] **XYZ-008**: Enhance Python code execution
  - Add error boundary for execution failures
  - Implement progress indicators for long-running tasks
  - Add execution history
  - Improve browser compatibility for execution monitoring
  - Add cleanup for completed executions to prevent memory leaks

- [ ] **ABC-001**: Implement copy/paste functionality
  - Keyboard shortcuts (Ctrl+C, Ctrl+V)
  - Position offset for pasted nodes
  - ID regeneration for duplicated nodes
  - Connection preservation when possible
  - Support for multi-node selection and copying

### Medium Priority 🟠

- [ ] **ABC-002**: Create undo/redo system
  - Operation history tracking
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - Support for complex operations like multi-node deletion
  - UI indicators for undo/redo availability

- [ ] **ABC-003**: Add workflow validation
  - Connection validation (type checking)
  - Required fields validation
  - Visual error indicators
  - Validation before code generation
  - Detailed error messages and suggestions

- [ ] **ABC-006**: Enhance code generation
  - More Python environment options
  - OpenAI model configurations
  - Better documentation in generated code
  - Support for Python dependency specification
  - Integration with Python execution environment

### Low Priority 🟢

- [ ] **ABC-004**: Create template workflows
  - Basic agent-runner templates
  - Multi-agent conversation templates
  - Tool integration examples
  - Python code execution examples
  - MCP server examples
  - Template gallery with previews

- [ ] **ABC-005**: Add OpenAI API testing integration
  - API key management
  - Test execution for agent nodes
  - Response visualization
  - Cost estimation
  - Local result caching

- [ ] **ABC-007**: Performance optimization for large workflows
  - Node virtualization for canvas performance
  - Lazy loading for node properties
  - Optimized code generation for large workflows
  - Memory usage improvements

## Technical Debt

- [ ] Refactor duplicate code across node components
  - Extract common node functionality to shared components
  - Create consistent styling system
  - Standardize node configuration interfaces

- [ ] Implement comprehensive test suite
  - Unit tests for node components
  - Integration tests for workflow operations
  - API tests for Python execution
  - End-to-end tests for complete workflows

- [ ] Update browser compatibility checks
  - Verify functionality across major browsers
  - Add fallbacks for unsupported features
  - Improve mobile/tablet support

## Bug Fixes Needed

- [ ] Fix race conditions in PythonCodeNode.tsx
  - Issue: Multiple status updates can cause state inconsistencies
  - Solution: Implement proper state management with useReducer (started)

- [ ] Fix Python code validation
  - Issue: Current validation is minimal and misses potential errors
  - Solution: Implement more robust validation with clear error messages

- [ ] Resolve React version compatibility issues
  - Issue: Project uses React 19 (not yet released) with incompatible deps
  - Solution: Downgrade to React 18.2.0 and update dependencies

- [ ] Fix memory leaks in Python execution
  - Issue: Long-running executions can cause memory build-up
  - Solution: Implement proper cleanup for completed executions

## Priority Order for Next Sprint

1. **XYZ-009**: Implement MCP Node
   - Create MCPNode component structure
   - Implement UI for server configuration
   - Update code generator for MCP nodes
   - Test with Git and Filesystem MCP servers
   - Add documentation and examples

2. **XYZ-007**: Fix React compatibility issues
   - Update package.json with correct React version and dependencies
   - Resolve import conflicts in components

3. **XYZ-008**: Enhance Python code execution
   - Implement error boundary and progress indicators
   - Add execution history
   - Fix memory leaks

4. **ABC-001**: Implement copy/paste functionality
   - Start with basic node duplication
   - Add multi-node selection and copying

5. **Technical Debt**: Component refactoring
   - Extract common node functionality
   - Standardize styling system

Last updated: April 02, 2025