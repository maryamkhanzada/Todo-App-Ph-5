# Requirements Checklist: Advanced Task Management Features

**Feature**: 004-advanced-task-features
**Created**: 2026-02-13
**Status**: Pending Implementation

---

## Priority Management

### Backend
- [ ] **FR-PRI-001**: Add `Priority` enum (low, medium, high) to models
- [ ] **FR-PRI-002**: Add `priority` field to Task model with default "medium"
- [ ] **FR-PRI-003**: Update TaskCreateRequest schema with priority field
- [ ] **FR-PRI-004**: Update TaskUpdateRequest schema with priority field
- [ ] **FR-PRI-005**: Update TaskResponse schema with priority field
- [ ] **FR-PRI-006**: Validate priority values in create/update endpoints
- [ ] **FR-PRI-007**: Add sorting by priority in GET /api/tasks

### Frontend
- [ ] **FR-PRI-008**: Create PriorityBadge component with color coding
- [ ] **FR-PRI-009**: Create PrioritySelect dropdown component
- [ ] **FR-PRI-010**: Add priority display to TaskCard component
- [ ] **FR-PRI-011**: Add priority input to TaskForm component
- [ ] **FR-PRI-012**: Update Task TypeScript interface with priority field

---

## Tags & Labels

### Backend
- [ ] **FR-TAG-001**: Create Tag model with id, name, color, user_id, created_at
- [ ] **FR-TAG-002**: Create TaskTag junction table model
- [ ] **FR-TAG-003**: Add tags relationship to Task model
- [ ] **FR-TAG-004**: Create TagCreateRequest schema
- [ ] **FR-TAG-005**: Create TagUpdateRequest schema
- [ ] **FR-TAG-006**: Create TagResponse schema
- [ ] **FR-TAG-007**: Implement GET /api/tags endpoint
- [ ] **FR-TAG-008**: Implement POST /api/tags endpoint with validation
- [ ] **FR-TAG-009**: Implement PUT /api/tags/{tag_id} endpoint
- [ ] **FR-TAG-010**: Implement DELETE /api/tags/{tag_id} endpoint
- [ ] **FR-TAG-011**: Update TaskCreateRequest to accept tag_ids array
- [ ] **FR-TAG-012**: Update TaskUpdateRequest to accept tag_ids array
- [ ] **FR-TAG-013**: Update TaskResponse to include tags array
- [ ] **FR-TAG-014**: Enforce unique tag names per user (case-insensitive)
- [ ] **FR-TAG-015**: Add filter by tags in GET /api/tasks

### Frontend
- [ ] **FR-TAG-016**: Create TagBadge component with color support
- [ ] **FR-TAG-017**: Create TagInput autocomplete component
- [ ] **FR-TAG-018**: Create TagManager modal component
- [ ] **FR-TAG-019**: Add tags display to TaskCard component
- [ ] **FR-TAG-020**: Add tag input to TaskForm component
- [ ] **FR-TAG-021**: Create useTags hook for tag CRUD operations
- [ ] **FR-TAG-022**: Update Tag TypeScript interface
- [ ] **FR-TAG-023**: Add tag filter to FilterBar component

---

## Search

### Backend
- [ ] **FR-SRC-001**: Add search query parameter to GET /api/tasks
- [ ] **FR-SRC-002**: Implement case-insensitive search on title
- [ ] **FR-SRC-003**: Implement case-insensitive search on description
- [ ] **FR-SRC-004**: Use ILIKE or equivalent for partial matching
- [ ] **FR-SRC-005**: Ensure search respects user isolation

### Frontend
- [ ] **FR-SRC-006**: Create SearchInput component with clear button
- [ ] **FR-SRC-007**: Implement 300ms debounce on search input
- [ ] **FR-SRC-008**: Add search to TaskList page
- [ ] **FR-SRC-009**: Display "No tasks found" empty state
- [ ] **FR-SRC-010**: Preserve search query on page refresh (URL param)

---

## Filter & Sort

### Backend
- [ ] **FR-FLT-001**: Add status filter parameter (completed/pending)
- [ ] **FR-FLT-002**: Add priority filter parameter
- [ ] **FR-FLT-003**: Add tags filter parameter (comma-separated IDs)
- [ ] **FR-FLT-004**: Implement AND logic for multiple filters
- [ ] **FR-FLT-005**: Add sort_by parameter (created_at, priority, due_date)
- [ ] **FR-FLT-006**: Add sort_order parameter (asc, desc)
- [ ] **FR-FLT-007**: Implement priority sort order (High > Medium > Low)
- [ ] **FR-FLT-008**: Handle null due_dates in sorting (sort to end)
- [ ] **FR-FLT-009**: Return total and filtered counts in response

### Frontend
- [ ] **FR-FLT-010**: Create FilterBar component
- [ ] **FR-FLT-011**: Create StatusFilter dropdown
- [ ] **FR-FLT-012**: Create PriorityFilter dropdown
- [ ] **FR-FLT-013**: Create TagFilter multi-select
- [ ] **FR-FLT-014**: Create SortSelect dropdown
- [ ] **FR-FLT-015**: Implement Clear Filters button
- [ ] **FR-FLT-016**: Update useTasks hook with filter/sort params
- [ ] **FR-FLT-017**: Persist filter/sort state in URL params

---

## Due Dates

### Backend
- [ ] **FR-DUE-001**: Add due_date field to Task model (datetime, nullable)
- [ ] **FR-DUE-002**: Update TaskCreateRequest with due_date field
- [ ] **FR-DUE-003**: Update TaskUpdateRequest with due_date field
- [ ] **FR-DUE-004**: Update TaskResponse with due_date field
- [ ] **FR-DUE-005**: Store due_date in UTC timezone

### Frontend
- [ ] **FR-DUE-006**: Create DueDatePicker component
- [ ] **FR-DUE-007**: Add due date display to TaskCard
- [ ] **FR-DUE-008**: Add due date input to TaskForm
- [ ] **FR-DUE-009**: Implement "Overdue" visual indicator (red)
- [ ] **FR-DUE-010**: Implement "Due Soon" indicator (< 24 hours)
- [ ] **FR-DUE-011**: Format due dates user-friendly (e.g., "Tomorrow")
- [ ] **FR-DUE-012**: Update Task TypeScript interface with due_date

---

## Recurring Tasks

### Backend
- [ ] **FR-REC-001**: Create Recurrence enum (daily, weekly, monthly)
- [ ] **FR-REC-002**: Add recurrence field to Task model (nullable)
- [ ] **FR-REC-003**: Update TaskCreateRequest with recurrence field
- [ ] **FR-REC-004**: Update TaskUpdateRequest with recurrence field
- [ ] **FR-REC-005**: Update TaskResponse with recurrence field
- [ ] **FR-REC-006**: Implement recurrence logic in task completion
- [ ] **FR-REC-007**: Calculate next due date based on recurrence pattern
- [ ] **FR-REC-008**: Copy priority, tags to new occurrence
- [ ] **FR-REC-009**: Ensure new occurrence is not marked completed
- [ ] **FR-REC-010**: Validate: recurrence requires due_date

### Frontend
- [ ] **FR-REC-011**: Create RecurrenceSelect dropdown
- [ ] **FR-REC-012**: Add recurrence indicator to TaskCard
- [ ] **FR-REC-013**: Add recurrence select to TaskForm
- [ ] **FR-REC-014**: Disable recurrence if no due date set
- [ ] **FR-REC-015**: Show confirmation when completing recurring task
- [ ] **FR-REC-016**: Update Task TypeScript interface with recurrence

---

## Reminders

### Backend
- [ ] **FR-REM-001**: Add reminder_at field to Task model (datetime, nullable)
- [ ] **FR-REM-002**: Update TaskCreateRequest with reminder_at field
- [ ] **FR-REM-003**: Update TaskUpdateRequest with reminder_at field
- [ ] **FR-REM-004**: Update TaskResponse with reminder_at field
- [ ] **FR-REM-005**: Validate: reminder_at requires due_date
- [ ] **FR-REM-006**: Validate: reminder_at must be before due_date

### Frontend
- [ ] **FR-REM-007**: Create ReminderPicker component
- [ ] **FR-REM-008**: Add reminder indicator to TaskCard
- [ ] **FR-REM-009**: Add reminder input to TaskForm
- [ ] **FR-REM-010**: Implement "Active Reminder" state detection
- [ ] **FR-REM-011**: Highlight tasks with active reminders
- [ ] **FR-REM-012**: Clear reminder on task completion
- [ ] **FR-REM-013**: Update Task TypeScript interface with reminder_at

---

## Database Migration

- [ ] **DB-001**: Create migration for Task table alterations (priority, due_date, recurrence, reminder_at)
- [ ] **DB-002**: Create migration for Tag table
- [ ] **DB-003**: Create migration for TaskTag junction table
- [ ] **DB-004**: Ensure migrations are reversible
- [ ] **DB-005**: Set default values for existing tasks (priority = medium)

---

## Testing

### Backend Tests
- [ ] **TEST-001**: Test priority CRUD operations
- [ ] **TEST-002**: Test tag CRUD operations
- [ ] **TEST-003**: Test search functionality
- [ ] **TEST-004**: Test filter combinations
- [ ] **TEST-005**: Test sort operations
- [ ] **TEST-006**: Test recurring task creation
- [ ] **TEST-007**: Test reminder validation
- [ ] **TEST-008**: Test user isolation on all new endpoints

### Frontend Tests
- [ ] **TEST-009**: Test PriorityBadge rendering
- [ ] **TEST-010**: Test TagBadge rendering
- [ ] **TEST-011**: Test SearchInput debouncing
- [ ] **TEST-012**: Test FilterBar functionality
- [ ] **TEST-013**: Test due date formatting
- [ ] **TEST-014**: Test overdue/due soon indicators

---

## Integration Validation

- [ ] **INT-001**: Verify backward compatibility with existing tasks
- [ ] **INT-002**: Verify AI chatbot integration with new fields
- [ ] **INT-003**: Verify API documentation updated (OpenAPI/Swagger)
- [ ] **INT-004**: Performance test with 1000 tasks
- [ ] **INT-005**: Cross-browser testing (Chrome, Firefox, Safari)

---

## Progress Summary

| Category | Total | Completed | Progress |
|----------|-------|-----------|----------|
| Priority Backend | 7 | 0 | 0% |
| Priority Frontend | 5 | 0 | 0% |
| Tags Backend | 15 | 0 | 0% |
| Tags Frontend | 8 | 0 | 0% |
| Search Backend | 5 | 0 | 0% |
| Search Frontend | 5 | 0 | 0% |
| Filter Backend | 9 | 0 | 0% |
| Filter Frontend | 8 | 0 | 0% |
| Due Dates Backend | 5 | 0 | 0% |
| Due Dates Frontend | 7 | 0 | 0% |
| Recurring Backend | 10 | 0 | 0% |
| Recurring Frontend | 6 | 0 | 0% |
| Reminders Backend | 6 | 0 | 0% |
| Reminders Frontend | 7 | 0 | 0% |
| Database | 5 | 0 | 0% |
| Testing | 14 | 0 | 0% |
| Integration | 5 | 0 | 0% |
| **TOTAL** | **127** | **0** | **0%** |
