# OpenAI Agents Workflow Designer - Task List

## Current Sprint (April 2025)

### Completed Tasks ✅

- [x] **XYZ-001**: Implement node deletion via keyboard shortcuts
  - [x] Add Delete/Backspace key handling
  - [x] Update onNodesChange handler
  - [x] Apply changes with applyNodeChanges
  - [x] Test with multiple selection scenarios

- [x] **XYZ-002**: Implement node resizing functionality
  - [x] Add NodeResizer component to all node types
  - [x] Fix TypeScript errors with resize handler signature
  - [x] Store dimensions in node data
  - [x] Style resize handles for better visibility

- [x] **XYZ-003**: Fix UI interaction issues
  - [x] Resolve text selection vs. node dragging conflicts
  - [x] Fix dropdown menu behavior
  - [x] Implement nodrag class properly
  - [x] Improve form field interactions

### In Progress 🔄

- [ ] **XYZ-004**: Complete node/edge deletion feature
  - [x] Basic keyboard shortcut implementation
  - [ ] Add context menu for right-click deletion (80%)
  - [ ] Create delete button in UI (50%)
  - [ ] Add visual confirmation for delete operations

## Upcoming Tasks

### New Tasks 📋

- [ ] **ABC-001**: Implement copy/paste functionality
  - [ ] Design clipboard data structure
  - [ ] Add keyboard shortcuts (Ctrl+C, Ctrl+V)
  - [ ] Generate unique IDs for pasted nodes
  - [ ] Maintain connections between copied nodes
  - [ ] Position pasted nodes near but offset from originals

- [ ] **ABC-002**: Create workflow save/load system
  - [ ] Design JSON schema for workflow serialization
  - [ ] Add local storage integration
  - [ ] Create export/import functionality
  - [ ] Add file-based workflow saving

- [ ] **ABC-003**: Implement undo/redo system
  - [ ] Track operation history
  - [ ] Add keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - [ ] Create UI controls for history navigation
  - [ ] Handle complex operations (multi-node changes)

- [ ] **ABC-004**: Add workflow validation
  - [ ] Validate node connections
  - [ ] Check for required field completion
  - [ ] Verify workflow has proper start/end points
  - [ ] Show validation errors inline

## Technical Debt

- [ ] Refactor duplicate code across node components
- [ ] Improve error handling for component operations
- [ ] Implement comprehensive test suite
- [ ] Optimize rendering performance for large workflows

## Priority Order for Next Sprint

1. **ABC-001**: Copy/paste functionality (High priority)
2. **ABC-002**: Save/load system (High priority)
3. **ABC-003**: Undo/redo system (Medium priority)
4. **ABC-004**: Workflow validation (Medium priority)

## Notes

- Complete XYZ-004 before starting ABC tasks
- ABC-001 and ABC-002 are critical for user productivity
- Consider breaking ABC-003 into smaller subtasks if needed
- Address at least one technical debt item in the next sprint

Last updated: April 1, 2025