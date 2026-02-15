# Tasks: Advanced Task Management Features

**Input**: Design documents from `/specs/004-advanced-task-features/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/api-endpoints.md (✅)

**Tests**: Tests are OPTIONAL in this implementation. Include if time permits after core features.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- Web application structure with separate backend/frontend directories

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Backend model foundation and database schema changes

- [ ] T001 Create Priority enum (low, medium, high) in backend/src/models.py
- [ ] T002 Create Recurrence enum (daily, weekly, monthly) in backend/src/models.py
- [ ] T003 Add priority field to Task model with default='medium' in backend/src/models.py
- [ ] T004 Add due_date field (Optional[datetime]) to Task model in backend/src/models.py
- [ ] T005 Add recurrence field (Optional[Recurrence]) to Task model in backend/src/models.py
- [ ] T006 Add reminder_at field (Optional[datetime]) to Task model in backend/src/models.py
- [ ] T007 Create Tag model with id, name, color, user_id, created_at in backend/src/models.py
- [ ] T008 Create TaskTag junction table model in backend/src/models.py
- [ ] T009 Add tags relationship to Task model using link_model=TaskTag in backend/src/models.py
- [ ] T010 Verify database tables auto-create on server restart (SQLite dev)
- [ ] T011 [P] Create TagCreateRequest schema in backend/src/schemas/tag.py
- [ ] T012 [P] Create TagUpdateRequest schema in backend/src/schemas/tag.py
- [ ] T013 [P] Create TagResponse schema in backend/src/schemas/tag.py
- [ ] T014 [P] Create TagListResponse schema in backend/src/schemas/tag.py
- [ ] T015 Update TaskCreateRequest with priority, due_date, recurrence, reminder_at, tag_ids in backend/src/schemas/task.py
- [ ] T016 Update TaskUpdateRequest with priority, due_date, recurrence, reminder_at, tag_ids in backend/src/schemas/task.py
- [ ] T017 Update TaskResponse with priority, due_date, recurrence, reminder_at, tags array in backend/src/schemas/task.py
- [ ] T018 Update TaskListResponse with total and filtered counts in backend/src/schemas/task.py

**Checkpoint**: Database schema and schemas ready - backend API work can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tag CRUD endpoints and core validation (required before user story features)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T019 Create tag router with /api/tags prefix in backend/src/routes/tags.py
- [ ] T020 Implement GET /api/tags endpoint (list user's tags) in backend/src/routes/tags.py
- [ ] T021 Implement POST /api/tags endpoint with name validation in backend/src/routes/tags.py
- [ ] T022 Implement PUT /api/tags/{tag_id} endpoint with ownership check in backend/src/routes/tags.py
- [ ] T023 Implement DELETE /api/tags/{tag_id} endpoint with cascade in backend/src/routes/tags.py
- [ ] T024 Add unique constraint validation (case-insensitive) for tag names in backend/src/routes/tags.py
- [ ] T025 Add color format validation (#RRGGBB) in backend/src/routes/tags.py
- [ ] T026 Register tags router in backend/src/main.py
- [ ] T027 [P] Create recurrence service module in backend/src/services/recurrence.py
- [ ] T028 Implement calculate_next_due_date function (daily/weekly/monthly) in backend/src/services/recurrence.py
- [ ] T029 Implement create_next_occurrence function in backend/src/services/recurrence.py
- [ ] T030 [P] Update Tag TypeScript interface in frontend/src/types/tag.ts (create file)
- [ ] T031 [P] Update Task TypeScript interface with new fields in frontend/src/types/task.ts
- [ ] T032 [P] Create TaskFilters interface in frontend/src/types/task.ts
- [ ] T033 Create useTags hook with CRUD operations in frontend/src/hooks/useTags.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Task Priority Management (Priority: P1) 🎯 MVP

**Goal**: Users can assign priority levels (Low/Medium/High) to tasks and see visual indicators

**Independent Test**: Create task with High priority, verify red badge appears, sort by priority

### Implementation for User Story 1

- [ ] T034 [P] [US1] Add priority validation in POST /api/tasks in backend/src/routes/tasks.py
- [ ] T035 [P] [US1] Add priority validation in PUT /api/tasks/{task_id} in backend/src/routes/tasks.py
- [ ] T036 [US1] Add priority sorting logic with CASE expression in GET /api/tasks in backend/src/routes/tasks.py
- [ ] T037 [US1] Add sort_by and sort_order query parameters to GET /api/tasks in backend/src/routes/tasks.py
- [ ] T038 [P] [US1] Create PriorityBadge component (Low=green, Medium=yellow, High=red) in frontend/src/components/tasks/PriorityBadge.tsx
- [ ] T039 [P] [US1] Create PrioritySelect dropdown component in frontend/src/components/tasks/PrioritySelect.tsx
- [ ] T040 [US1] Add priority badge display to TaskCard component in frontend/src/components/tasks/TaskCard.tsx
- [ ] T041 [US1] Add priority select to TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [ ] T042 [US1] Update useTasks hook to include priority in create/update in frontend/src/hooks/useTasks.ts

**Checkpoint**: User Story 1 complete - tasks can have priorities with visual indicators

---

## Phase 4: User Story 2 - Task Search (Priority: P1)

**Goal**: Users can search tasks by keyword (title + description) with real-time filtering

**Independent Test**: Create tasks, search for keyword, verify matching tasks appear in real-time

### Implementation for User Story 2

- [ ] T043 [US2] Add search query parameter to GET /api/tasks in backend/src/routes/tasks.py
- [ ] T044 [US2] Implement case-insensitive ILIKE search on title in backend/src/routes/tasks.py
- [ ] T045 [US2] Implement case-insensitive ILIKE search on description in backend/src/routes/tasks.py
- [ ] T046 [US2] Combine title and description search with OR logic in backend/src/routes/tasks.py
- [ ] T047 [P] [US2] Create SearchInput component with debounce (300ms) in frontend/src/components/filters/SearchInput.tsx
- [ ] T048 [US2] Add search input to TaskList page in frontend/src/components/tasks/TaskList.tsx
- [ ] T049 [US2] Update useTasks hook with search filter parameter in frontend/src/hooks/useTasks.ts
- [ ] T050 [US2] Add "No tasks found" empty state for search results in frontend/src/components/tasks/TaskList.tsx

**Checkpoint**: User Story 2 complete - search works with real-time filtering

---

## Phase 5: User Story 3 - Filter and Sort Tasks (Priority: P1)

**Goal**: Users can filter by status/priority/tags and sort by creation date/priority/due date

**Independent Test**: Apply filters, verify only matching tasks shown; sort by priority, verify order

### Implementation for User Story 3

- [ ] T051 [US3] Add status filter parameter (completed/pending) to GET /api/tasks in backend/src/routes/tasks.py
- [ ] T052 [US3] Add priority filter parameter to GET /api/tasks in backend/src/routes/tasks.py
- [ ] T053 [US3] Add tags filter parameter (comma-separated UUIDs) to GET /api/tasks in backend/src/routes/tasks.py
- [ ] T054 [US3] Implement AND logic for multiple filters in backend/src/routes/tasks.py
- [ ] T055 [US3] Implement due_date sorting with nulls last/first handling in backend/src/routes/tasks.py
- [ ] T056 [US3] Add total and filtered counts to response in backend/src/routes/tasks.py
- [ ] T057 [P] [US3] Create FilterBar component container in frontend/src/components/filters/FilterBar.tsx
- [ ] T058 [P] [US3] Create StatusFilter dropdown (All/Pending/Completed) in frontend/src/components/filters/FilterBar.tsx
- [ ] T059 [P] [US3] Create PriorityFilter dropdown (All/Low/Medium/High) in frontend/src/components/filters/FilterBar.tsx
- [ ] T060 [P] [US3] Create TagFilter multi-select dropdown in frontend/src/components/filters/FilterBar.tsx
- [ ] T061 [P] [US3] Create SortSelect dropdown component in frontend/src/components/filters/SortSelect.tsx
- [ ] T062 [US3] Add FilterBar and SortSelect to TaskList page in frontend/src/components/tasks/TaskList.tsx
- [ ] T063 [US3] Add Clear Filters button to FilterBar in frontend/src/components/filters/FilterBar.tsx
- [ ] T064 [US3] Update useTasks hook with filter and sort parameters in frontend/src/hooks/useTasks.ts
- [ ] T065 [US3] Persist filter/sort state in URL query parameters in frontend/src/app/app/tasks/page.tsx

**Checkpoint**: User Story 3 complete - full filter and sort functionality working

---

## Phase 6: User Story 4 - Tags and Labels (Priority: P2)

**Goal**: Users can add multiple tags to tasks, filter by tags, and manage tags globally

**Independent Test**: Create tags, assign to task, filter by tag, delete tag from Tag Manager

### Implementation for User Story 4

- [ ] T066 [US4] Add tag_ids handling in POST /api/tasks (validate and link) in backend/src/routes/tasks.py
- [ ] T067 [US4] Add tag_ids handling in PUT /api/tasks/{task_id} (clear and re-link) in backend/src/routes/tasks.py
- [ ] T068 [US4] Add tags eager loading to task queries in backend/src/routes/tasks.py
- [ ] T069 [P] [US4] Create TagBadge component with color and remove button in frontend/src/components/tags/TagBadge.tsx
- [ ] T070 [P] [US4] Create TagInput autocomplete component in frontend/src/components/tags/TagInput.tsx
- [ ] T071 [US4] Implement tag autocomplete with existing tags in frontend/src/components/tags/TagInput.tsx
- [ ] T072 [US4] Implement create new tag inline in TagInput in frontend/src/components/tags/TagInput.tsx
- [ ] T073 [P] [US4] Create TagManager modal component in frontend/src/components/tags/TagManager.tsx
- [ ] T074 [US4] Implement tag list with edit/delete in TagManager in frontend/src/components/tags/TagManager.tsx
- [ ] T075 [US4] Implement tag color picker in TagManager in frontend/src/components/tags/TagManager.tsx
- [ ] T076 [US4] Add tags display to TaskCard component in frontend/src/components/tasks/TaskCard.tsx
- [ ] T077 [US4] Add TagInput to TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [ ] T078 [US4] Add TagManager access to Navbar or settings in frontend/src/components/layouts/Navbar.tsx

**Checkpoint**: User Story 4 complete - full tag management and filtering working

---

## Phase 7: User Story 5 - Due Dates (Priority: P2)

**Goal**: Users can set due dates, see overdue/due soon indicators, and sort by due date

**Independent Test**: Set due date, verify display; set past date, verify "Overdue" indicator

### Implementation for User Story 5

- [ ] T079 [US5] Add due_date validation in POST /api/tasks in backend/src/routes/tasks.py
- [ ] T080 [US5] Add due_date validation in PUT /api/tasks/{task_id} in backend/src/routes/tasks.py
- [ ] T081 [P] [US5] Create DueDatePicker component with date/time input in frontend/src/components/tasks/DueDatePicker.tsx
- [ ] T082 [US5] Add quick date options (Today, Tomorrow, Next Week) in frontend/src/components/tasks/DueDatePicker.tsx
- [ ] T083 [US5] Add clear button for due date in frontend/src/components/tasks/DueDatePicker.tsx
- [ ] T084 [US5] Create formatDueDate utility for relative dates in frontend/src/lib/utils.ts
- [ ] T085 [US5] Create getDueDateState function (overdue/dueToday/dueSoon) in frontend/src/lib/utils.ts
- [ ] T086 [US5] Add due date display with state styling to TaskCard in frontend/src/components/tasks/TaskCard.tsx
- [ ] T087 [US5] Add DueDatePicker to TaskForm component in frontend/src/components/tasks/TaskForm.tsx

**Checkpoint**: User Story 5 complete - due dates with visual indicators working

---

## Phase 8: User Story 6 - Recurring Tasks (Priority: P3)

**Goal**: Completing a recurring task automatically creates the next occurrence

**Independent Test**: Create weekly recurring task, complete it, verify new task with next due date

### Implementation for User Story 6

- [ ] T088 [US6] Add recurrence validation (requires due_date) in POST /api/tasks in backend/src/routes/tasks.py
- [ ] T089 [US6] Add recurrence validation in PUT /api/tasks/{task_id} in backend/src/routes/tasks.py
- [ ] T090 [US6] Integrate recurrence logic in task completion flow in backend/src/routes/tasks.py
- [ ] T091 [US6] Return next_occurrence in response when recurring task completed in backend/src/routes/tasks.py
- [ ] T092 [US6] Copy tags to new occurrence in recurrence service in backend/src/services/recurrence.py
- [ ] T093 [P] [US6] Create RecurrenceSelect dropdown (None/Daily/Weekly/Monthly) in frontend/src/components/tasks/RecurrenceSelect.tsx
- [ ] T094 [US6] Disable RecurrenceSelect when no due date set in frontend/src/components/tasks/RecurrenceSelect.tsx
- [ ] T095 [US6] Add recurrence indicator icon to TaskCard in frontend/src/components/tasks/TaskCard.tsx
- [ ] T096 [US6] Add RecurrenceSelect to TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [ ] T097 [US6] Handle next_occurrence in task completion response in frontend/src/hooks/useTasks.ts
- [ ] T098 [US6] Show toast notification "Next occurrence created" on recurring completion in frontend/src/components/tasks/TaskList.tsx

**Checkpoint**: User Story 6 complete - recurring tasks auto-generate next occurrence

---

## Phase 9: User Story 7 - Reminders (Priority: P3)

**Goal**: Users can set reminder times and see active reminder indicators

**Independent Test**: Set reminder in past, verify "Active Reminder" indicator appears

### Implementation for User Story 7

- [ ] T099 [US7] Add reminder_at validation (requires due_date, must be <= due_date) in backend/src/routes/tasks.py
- [ ] T100 [US7] Clear reminder_at on task completion in backend/src/routes/tasks.py
- [ ] T101 [P] [US7] Create ReminderPicker component (relative to due date) in frontend/src/components/tasks/ReminderPicker.tsx
- [ ] T102 [US7] Add reminder options (At due date, 15min, 30min, 1hr, 1 day before) in frontend/src/components/tasks/ReminderPicker.tsx
- [ ] T103 [US7] Disable ReminderPicker when no due date set in frontend/src/components/tasks/ReminderPicker.tsx
- [ ] T104 [US7] Create isReminderActive utility function in frontend/src/lib/utils.ts
- [ ] T105 [US7] Add reminder indicator (bell icon) to TaskCard in frontend/src/components/tasks/TaskCard.tsx
- [ ] T106 [US7] Highlight tasks with active reminders in TaskCard in frontend/src/components/tasks/TaskCard.tsx
- [ ] T107 [US7] Add ReminderPicker to TaskForm component in frontend/src/components/tasks/TaskForm.tsx

**Checkpoint**: User Story 7 complete - reminders with visual indicators working

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Integration, MCP tools, and final cleanup

- [ ] T108 Update add_task MCP tool with priority, due_date, recurrence, reminder_at, tags in backend/src/agents/mcp_tools.py
- [ ] T109 Update list_tasks MCP tool with filter parameters in backend/src/agents/mcp_tools.py
- [ ] T110 Update update_task MCP tool with new fields in backend/src/agents/mcp_tools.py
- [ ] T111 Update complete_task MCP tool to handle recurring tasks in backend/src/agents/mcp_tools.py
- [ ] T112 [P] Add schedule_reminder MCP tool in backend/src/agents/mcp_tools.py
- [ ] T113 [P] Add index on tasks.due_date column for sort performance in backend/src/models.py
- [ ] T114 [P] Add index on tasks.priority column for filter performance in backend/src/models.py
- [ ] T115 [P] Add index on tags.name column for autocomplete performance in backend/src/models.py
- [ ] T116 Verify backward compatibility - existing tasks work with default priority in backend/src/routes/tasks.py
- [ ] T117 [P] Update quickstart.md with feature testing scenarios in specs/004-advanced-task-features/quickstart.md
- [ ] T118 Run manual testing scenarios from plan.md Phase 5
- [ ] T119 [P] Code cleanup - remove any debug logs in backend/src/
- [ ] T120 [P] Code cleanup - remove any debug logs in frontend/src/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-9)**: All depend on Foundational phase completion
  - US1 (Priority), US2 (Search), US3 (Filter/Sort) can run in parallel (P1 stories)
  - US4 (Tags), US5 (Due Dates) can run in parallel after P1 stories (P2 stories)
  - US6 (Recurring), US7 (Reminders) can run in parallel after P2 stories (P3 stories)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Can Start After | Dependencies |
|-------|-----------------|--------------|
| US1 - Priority | Phase 2 (Foundational) | None |
| US2 - Search | Phase 2 (Foundational) | None |
| US3 - Filter/Sort | Phase 2 (Foundational) | US1 (for priority sorting) |
| US4 - Tags | Phase 2 (Foundational) | US3 (for tag filtering) |
| US5 - Due Dates | Phase 2 (Foundational) | US3 (for due date sorting) |
| US6 - Recurring | Phase 2 (Foundational) | US5 (requires due dates) |
| US7 - Reminders | Phase 2 (Foundational) | US5 (requires due dates) |

### Within Each User Story

- Backend validation before frontend display
- Models/schemas before routes
- Routes before frontend hooks
- Hooks before components
- Components before integration

### Parallel Opportunities

**Phase 1 (Setup)**:
- T011-T014 (Tag schemas) can run in parallel
- T015-T018 (Task schema updates) run sequentially (same file)

**Phase 2 (Foundational)**:
- T027-T029 (Recurrence service) parallel to T019-T026 (Tag routes)
- T030-T033 (Frontend types/hooks) parallel to backend work

**Phase 3-9 (User Stories)**:
- Backend tasks marked [P] can run in parallel within each story
- Frontend component creation tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Backend parallel tasks:
Task T034: Add priority validation in POST /api/tasks
Task T035: Add priority validation in PUT /api/tasks/{task_id}

# Frontend parallel tasks (after backend):
Task T038: Create PriorityBadge component
Task T039: Create PrioritySelect component
```

## Parallel Example: User Story 4 (Tags)

```bash
# Frontend component creation (parallel):
Task T069: Create TagBadge component
Task T070: Create TagInput component (basic)
Task T073: Create TagManager modal component
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (T001-T018)
2. Complete Phase 2: Foundational (T019-T033)
3. Complete Phase 3: US1 - Priority (T034-T042)
4. **STOP and VALIDATE**: Test priority creation and display
5. Complete Phase 4: US2 - Search (T043-T050)
6. Complete Phase 5: US3 - Filter/Sort (T051-T065)
7. **STOP and VALIDATE**: Full search/filter/sort working
8. Deploy/demo if ready - this is the MVP!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Priority) → Test independently → **Increment 1**
3. Add US2 (Search) → Test independently → **Increment 2**
4. Add US3 (Filter/Sort) → Test independently → **Increment 3** (MVP Complete)
5. Add US4 (Tags) → Test independently → **Increment 4**
6. Add US5 (Due Dates) → Test independently → **Increment 5**
7. Add US6 (Recurring) → Test independently → **Increment 6**
8. Add US7 (Reminders) → Test independently → **Increment 7** (Full Feature)
9. Polish Phase → Final testing → **Release**

### Parallel Team Strategy

With multiple developers:

| Developer | Phase 2 | Phase 3-5 | Phase 6-7 | Phase 8-9 |
|-----------|---------|-----------|-----------|-----------|
| Backend | T019-T029 | T034-T056 | T066-T092 | T099-T100 |
| Frontend | T030-T033 | T038-T065 | T069-T098 | T101-T107 |

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| 1 | Setup | 18 |
| 2 | Foundational | 15 |
| 3 | US1 - Priority | 9 |
| 4 | US2 - Search | 8 |
| 5 | US3 - Filter/Sort | 15 |
| 6 | US4 - Tags | 13 |
| 7 | US5 - Due Dates | 9 |
| 8 | US6 - Recurring | 11 |
| 9 | US7 - Reminders | 9 |
| 10 | Polish | 13 |
| **TOTAL** | | **120** |

### Parallel Opportunities

- **Phase 1**: 4 parallel tasks (T011-T014)
- **Phase 2**: 8 parallel tasks
- **Phase 3-9**: 20+ parallel tasks marked [P]
- **Phase 10**: 6 parallel tasks

### MVP Scope (Recommended)

- **Phases 1-5**: 65 tasks
- **Deliverables**: Priority, Search, Filter, Sort
- **Value**: Core task organization features

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend validation must precede frontend display logic
- All new API fields are optional to maintain backward compatibility
