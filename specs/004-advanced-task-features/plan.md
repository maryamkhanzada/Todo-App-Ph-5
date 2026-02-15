# Implementation Plan: Advanced Task Management Features

**Branch**: `004-advanced-task-features` | **Date**: 2026-02-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-advanced-task-features/spec.md`

---

## Summary

Implement intermediate and advanced task management features for the existing Todo application:
- **Intermediate**: Task priorities, tags/labels, search, filter & sort
- **Advanced**: Due dates, recurring tasks, application-level reminders

Technical approach: Extend existing SQLModel/FastAPI backend and Next.js/React frontend with new fields, models, and UI components. All logic executes synchronously within API calls. Design for future event-driven upgrade compatibility.

---

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: FastAPI 0.109.0, SQLModel 0.0.14, Next.js 16.1.1, React 19.2.3, Tailwind CSS 4
**Storage**: PostgreSQL (production), SQLite (development)
**Testing**: pytest (backend), Jest/React Testing Library (frontend - to be added)
**Target Platform**: Web application (Linux/Windows server, modern browsers)
**Project Type**: Web application (frontend + backend)
**Performance Goals**:
- API responses < 500ms for 1000 tasks
- Frontend search debounce 300ms
- Tag autocomplete < 200ms
**Constraints**:
- Synchronous logic only (no background workers)
- No Kafka/Dapr/external schedulers
- Backward compatible with existing tasks
**Scale/Scope**: Single-user isolation, ~1000 tasks per user

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-First Development | ✅ PASS | Spec exists at `specs/004-advanced-task-features/spec.md` |
| II. Authentication & Security | ✅ PASS | All endpoints enforce JWT auth, user isolation maintained |
| V. Tech Stack Enforcement | ✅ PASS | Using approved stack (FastAPI, SQLModel, Next.js, React) |
| VII. Phase-Aware Implementation | ✅ PASS | Features explicitly in scope; no infrastructure |
| VIII. AI Agent Architecture | ✅ PASS | MCP tools extended for new fields |
| IX. MCP Tools | ✅ PASS | Tools updated for priority, tags, due_date, recurrence |

**Constitution Violations Requiring Justification**: None

**Future-Readiness Notes**:
- Design task completion to emit events (currently synchronous, can add Dapr pub/sub later)
- Reminder evaluation can migrate to Dapr binding/cron when infrastructure is added
- Tag operations can emit events for activity logging

---

## Project Structure

### Documentation (this feature)

```text
specs/004-advanced-task-features/
├── spec.md              # Feature specification (✅ exists)
├── plan.md              # This file
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Data model details (✅ exists)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/
│   └── api-endpoints.md # API contracts (✅ exists)
├── checklists/
│   └── requirements.md  # Requirements checklist (✅ exists)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models.py           # Extended Task model + new Tag, TaskTag models
│   ├── routes/
│   │   ├── tasks.py        # Extended with search, filter, sort, recurring logic
│   │   └── tags.py         # NEW: Tag CRUD endpoints
│   ├── schemas/
│   │   ├── task.py         # Extended request/response schemas
│   │   └── tag.py          # NEW: Tag schemas
│   ├── services/           # Business logic services
│   │   └── recurrence.py   # NEW: Recurring task logic
│   └── agents/
│       └── mcp_tools.py    # Extended MCP tools for new fields
└── tests/
    ├── test_tasks.py       # Extended task tests
    └── test_tags.py        # NEW: Tag tests

frontend/
├── src/
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx      # Extended with priority, due date, tags
│   │   │   ├── TaskForm.tsx      # Extended with new inputs
│   │   │   ├── TaskList.tsx      # Extended with search, filter, sort
│   │   │   ├── PriorityBadge.tsx # NEW
│   │   │   ├── PrioritySelect.tsx # NEW
│   │   │   ├── DueDatePicker.tsx # NEW
│   │   │   ├── RecurrenceSelect.tsx # NEW
│   │   │   └── ReminderPicker.tsx # NEW
│   │   ├── tags/
│   │   │   ├── TagBadge.tsx      # NEW
│   │   │   ├── TagInput.tsx      # NEW
│   │   │   └── TagManager.tsx    # NEW
│   │   └── filters/
│   │       ├── SearchInput.tsx   # NEW
│   │       ├── FilterBar.tsx     # NEW
│   │       └── SortSelect.tsx    # NEW
│   ├── hooks/
│   │   ├── useTasks.ts           # Extended with filter/sort
│   │   └── useTags.ts            # NEW
│   └── types/
│       ├── task.ts               # Extended Task interface
│       └── tag.ts                # NEW: Tag interface
└── tests/
    └── components/               # Component tests
```

**Structure Decision**: Web application structure with separate backend/frontend directories. Extending existing codebase rather than rewriting.

---

## Complexity Tracking

> No constitution violations requiring justification.

---

## PHASE 1 — Domain & Data Model Planning

### 1.1 New Fields for Task Model

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `priority` | Enum(low, medium, high) | medium | NOT NULL | Task importance level |
| `due_date` | datetime (UTC) | NULL | Optional | Task deadline |
| `recurrence` | Enum(daily, weekly, monthly) | NULL | Optional, requires due_date | Repeat pattern |
| `reminder_at` | datetime (UTC) | NULL | Optional, requires due_date, must be <= due_date | Reminder trigger time |

### 1.2 New Tag Model

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `id` | UUID | auto | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(50) | - | NOT NULL, alphanumeric + hyphens/underscores | Display name |
| `color` | VARCHAR(7) | NULL | Format: #RRGGBB | Hex color code |
| `user_id` | UUID | - | FOREIGN KEY (users.id), NOT NULL | Owner |
| `created_at` | datetime | auto | NOT NULL | Creation timestamp |

**Constraints**:
- UNIQUE(user_id, LOWER(name)) - case-insensitive uniqueness per user

### 1.3 New TaskTag Junction Table

| Field | Type | Constraints |
|-------|------|-------------|
| `task_id` | UUID | FOREIGN KEY (tasks.id), ON DELETE CASCADE |
| `tag_id` | UUID | FOREIGN KEY (tags.id), ON DELETE CASCADE |

**Constraints**:
- PRIMARY KEY (task_id, tag_id)

### 1.4 Relationships

```
User (1) ──────< (N) Task
User (1) ──────< (N) Tag
Task (M) ─────── (N) Tag  [via TaskTag]
```

### 1.5 Validation Rules

| Rule | Location | Description |
|------|----------|-------------|
| Priority valid | Backend | Must be 'low', 'medium', or 'high' |
| Recurrence valid | Backend | Must be 'daily', 'weekly', 'monthly', or null |
| Recurrence requires due_date | Backend | If recurrence set, due_date required |
| Reminder requires due_date | Backend | If reminder_at set, due_date required |
| Reminder before due_date | Backend | reminder_at <= due_date |
| Tag name format | Backend | Alphanumeric + hyphens + underscores only |
| Tag name length | Backend | 1-50 characters |
| Tag color format | Backend | #RRGGBB or null |
| Tag unique per user | Backend | Case-insensitive |

### 1.6 Backward Compatibility

- All new fields have defaults or are nullable
- Existing tasks auto-populate with `priority='medium'`, other fields NULL
- Existing API responses include new fields (nullable)
- No breaking changes to existing endpoints

---

## PHASE 2 — Backend API Planning

### 2.1 Extended GET /api/tasks

**New Query Parameters**:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `search` | string | Keyword search (title + description) | - |
| `status` | string | "completed" or "pending" | - |
| `priority` | string | "low", "medium", or "high" | - |
| `tags` | string | Comma-separated tag UUIDs | - |
| `sort_by` | string | "created_at", "priority", "due_date" | "created_at" |
| `sort_order` | string | "asc" or "desc" | "desc" |

**Response Extension**:
- Add `priority`, `due_date`, `recurrence`, `reminder_at`, `tags` to each task
- Add `total` and `filtered` counts to response

### 2.2 Extended POST /api/tasks

**New Request Fields**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `priority` | string | No | One of: low, medium, high (default: medium) |
| `due_date` | ISO8601 | No | Valid datetime |
| `recurrence` | string | No | One of: daily, weekly, monthly |
| `reminder_at` | ISO8601 | No | Must be <= due_date |
| `tag_ids` | UUID[] | No | All must exist and belong to user |

### 2.3 Extended PUT /api/tasks/{task_id}

**All fields from POST, plus**:
- When `completed=true` for recurring task → Create next occurrence
- Return `next_occurrence` in response if created

### 2.4 New Tag Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tags` | GET | List all tags for authenticated user |
| `/api/tags` | POST | Create new tag |
| `/api/tags/{tag_id}` | PUT | Update tag (name, color) |
| `/api/tags/{tag_id}` | DELETE | Delete tag (cascade remove from tasks) |

### 2.5 Edge Cases

| Scenario | Handling |
|----------|----------|
| Search empty string | Return all tasks (no filter) |
| Multiple filters | AND logic (all conditions must match) |
| Invalid priority in request | 400 Bad Request |
| Tag ID not found | 400 Bad Request with specific error |
| Recurring without due_date | 400 Bad Request |
| Reminder after due_date | 400 Bad Request |
| Delete tag with tasks | Remove tag from tasks (cascade) |
| Sort by due_date with nulls | Nulls sort to end (asc) or beginning (desc) |

---

## PHASE 3 — Business Logic Planning

### 3.1 Priority Evaluation & Sorting

**Priority Numeric Mapping** (for sorting):
| Priority | Value (desc) | Value (asc) |
|----------|--------------|-------------|
| high | 1 | 3 |
| medium | 2 | 2 |
| low | 3 | 1 |

**SQL Sort Expression**:
```sql
ORDER BY CASE priority
  WHEN 'high' THEN 1
  WHEN 'medium' THEN 2
  ELSE 3
END [ASC|DESC]
```

### 3.2 Tag Assignment & Filtering

**Assignment Flow**:
1. Receive `tag_ids` in create/update request
2. Validate all tag_ids exist AND belong to current user
3. Clear existing task_tags for this task
4. Insert new task_tag rows
5. Return task with populated tags

**Filter Flow**:
1. Receive `tags` query parameter (comma-separated UUIDs)
2. Parse into list of UUIDs
3. Filter tasks that have ALL specified tags (AND logic)
4. Alternative: ANY of specified tags (OR logic) - configurable

### 3.3 Due Date State Calculation

**Frontend Calculation** (real-time, no backend needed):

| State | Condition | Visual |
|-------|-----------|--------|
| Overdue | due_date < now AND !completed | Red badge, red text |
| Due Today | due_date is today AND !completed | Orange/yellow badge |
| Due Soon | due_date within 24 hours AND !completed | Orange text |
| Upcoming | due_date > 24 hours | Normal display |
| No Due Date | due_date is null | No indicator |

**Relative Formatting**:
| Time Range | Display |
|------------|---------|
| Today | "Today" |
| Tomorrow | "Tomorrow" |
| Yesterday | "Yesterday" |
| Within 7 days | Day name (e.g., "Monday") |
| This year | "Feb 15" |
| Other years | "Feb 15, 2026" |

### 3.4 Recurring Task Generation Flow

**Trigger**: Task update with `completed=true` AND task has `recurrence`

**Steps**:
1. Mark original task as completed
2. Calculate next due date:
   - Daily: due_date + 1 day
   - Weekly: due_date + 7 days
   - Monthly: due_date + 1 month (handle month-end edge cases)
3. Create new task with:
   - Same: title, description, priority, tags, recurrence
   - New: id, due_date (calculated), created_at, updated_at
   - Reset: completed=false, reminder_at=null
4. Save both tasks in same transaction
5. Return both in response: `{task: original, next_occurrence: new}`

**Month-End Edge Cases**:
| Original Date | Recurrence | Next Date |
|---------------|------------|-----------|
| Jan 31 | monthly | Feb 28/29 (last day of Feb) |
| Jan 30 | monthly | Feb 28/29 |
| Jan 29 | monthly | Feb 28/29 |
| Feb 28 | monthly | Mar 28 |

### 3.5 Reminder Trigger Conditions

**Application-Level Reminder** (no background jobs):

**Evaluation**: Frontend checks on each render/interval:
```typescript
const isReminderActive = (task: Task): boolean => {
  if (!task.reminder_at || task.completed) return false;
  return new Date(task.reminder_at) <= new Date();
}
```

**Display**:
- Tasks with active reminders get special highlight
- Bell icon with "!" indicator
- Can be sorted/filtered to show active reminders first

**Clear Reminder**:
- On task completion → reminder_at = null (or ignored)
- On acknowledge action → set reminder_acknowledged flag (if needed)

---

## PHASE 4 — Frontend UI Planning

### 4.1 Priority Selection & Display

**PriorityBadge Component**:
- Props: `priority: 'low' | 'medium' | 'high'`
- Colors: Low=green-500, Medium=yellow-500, High=red-500
- Display: Pill badge with text (e.g., "High")

**PrioritySelect Component**:
- Props: `value`, `onChange`
- Options: Low, Medium, High with color indicators
- Used in TaskForm

### 4.2 Tag Creation and Filtering

**TagBadge Component**:
- Props: `tag: Tag`, `onRemove?`
- Display: Colored pill with name, optional X button
- Click: Navigate to filter by tag

**TagInput Component**:
- Autocomplete dropdown with existing tags
- Type to create new tag (Enter to confirm)
- Shows selected tags as badges
- Remove by clicking X on badge

**TagManager Modal**:
- List all user tags
- Edit name/color
- Delete (with confirmation)
- Create new tag

### 4.3 Due Date & Reminder Input

**DueDatePicker Component**:
- Date picker (native or library)
- Time picker (optional)
- Clear button
- Quick options: Today, Tomorrow, Next Week

**ReminderPicker Component**:
- Dropdown relative to due date
- Options: At due date, 15 min before, 30 min before, 1 hour before, 1 day before
- Disabled if no due date set

**RecurrenceSelect Component**:
- Dropdown: None, Daily, Weekly, Monthly
- Disabled if no due date set
- Show icon indicator on task card

### 4.4 Search, Filter, Sort Controls

**SearchInput Component**:
- Text input with search icon
- Clear button (X)
- Debounced (300ms)
- Placeholder: "Search tasks..."

**FilterBar Component**:
- Horizontal row of dropdowns
- Status filter: All, Pending, Completed
- Priority filter: All, Low, Medium, High
- Tag filter: Multi-select dropdown
- Clear all filters button

**SortSelect Component**:
- Dropdown for sort field + order
- Options: Created (Newest), Created (Oldest), Priority (High-Low), Priority (Low-High), Due Date (Earliest), Due Date (Latest)

### 4.5 State Management Strategy

**URL State** (for shareability):
- Search query: `?search=keyword`
- Filters: `?status=pending&priority=high&tags=uuid1,uuid2`
- Sort: `?sort=priority&order=desc`

**useTasks Hook Extension**:
```typescript
const useTasks = (filters?: TaskFilters) => {
  // Build query params from filters
  // Fetch with filters applied
  // Return { tasks, total, filtered, isLoading, error, refetch }
}
```

**useTags Hook** (new):
```typescript
const useTags = () => {
  // Fetch all user tags
  // Provide CRUD operations
  // Return { tags, createTag, updateTag, deleteTag, isLoading }
}
```

### 4.6 UX Edge Cases

| Scenario | Handling |
|----------|----------|
| No tasks match filter | Show empty state with message + clear filters button |
| No tasks at all | Show "Create your first task" prompt |
| Search loading | Show skeleton/spinner in task list |
| Tag limit (>10 on task) | Show "+N more" badge, expand on click |
| Long tag name | Truncate with ellipsis |
| Recurring task completed | Show toast "Next occurrence created" |
| Reminder active | Show notification-style badge/highlight |
| Due date overdue | Red styling, show "Overdue by X days" |

---

## PHASE 5 — Integration & Flow Validation

### 5.1 End-to-End Task Lifecycle Flows

**Flow 1: Create Task with All Features**
1. User clicks "New Task"
2. Enter title, description
3. Select priority (default: Medium)
4. Add tags (autocomplete existing or create new)
5. Set due date (optional)
6. Set recurrence (requires due date)
7. Set reminder (requires due date)
8. Submit → POST /api/tasks
9. Task appears in list with all indicators

**Flow 2: Complete Recurring Task**
1. User clicks complete on recurring task
2. PUT /api/tasks/{id} with completed=true
3. Backend creates next occurrence
4. Response contains both tasks
5. Frontend shows completion toast
6. List updates: original marked complete, new task appears

**Flow 3: Search and Filter**
1. User types in search box
2. 300ms debounce
3. GET /api/tasks?search=keyword
4. Results update in real-time
5. User adds priority filter
6. GET /api/tasks?search=keyword&priority=high
7. Results narrow further
8. User clears all → full list restored

**Flow 4: Tag Management**
1. User opens Tag Manager
2. Sees all their tags
3. Renames a tag → all tasks with tag update
4. Deletes a tag → removed from all tasks
5. Creates new tag → available in autocomplete

### 5.2 Data Consistency

| Scenario | Validation |
|----------|------------|
| Tag deleted | Cascade remove from task_tags |
| Task deleted | Cascade remove from task_tags |
| User deleted | Cascade delete tasks, tags, task_tags |
| Priority enum change | Backend rejects invalid values |
| Recurrence without due_date | Backend rejects, frontend disables |
| Reminder after due_date | Backend rejects, frontend validates |

### 5.3 Handling Invalid/Missing Data

| Data Issue | Frontend Handling | Backend Handling |
|------------|-------------------|------------------|
| Missing priority | Display as Medium | Default to Medium |
| Invalid priority value | Display as Medium | Return 400 error |
| Null due_date | No due date indicator | Allow, no validation |
| Invalid date format | Show validation error | Return 400 error |
| Tag ID not found | Show error toast | Return 400 error |
| Empty search | Show all tasks | Return all tasks |

### 5.4 Manual Testing Scenarios

| Test | Steps | Expected |
|------|-------|----------|
| Create task with priority | Create task, select High priority | Task shows red High badge |
| Search case-insensitive | Search "MEETING", task has "meeting" | Task appears in results |
| Filter by multiple criteria | Filter: pending + high priority | Only matching tasks shown |
| Complete recurring task | Complete weekly task | New task created for next week |
| Tag autocomplete | Type partial tag name | Matching tags shown |
| Overdue indicator | Create task with past due date | Red "Overdue" badge |
| Clear all filters | Apply filters, click clear | All tasks shown |
| Sort by priority | Sort high-to-low | High priority tasks first |
| Reminder active | Set reminder in past | Task highlighted |
| Delete tag cascade | Delete tag used by tasks | Tag removed from all tasks |

---

## PHASE 6 — Future-Readiness Review

### 6.1 Event-Driven Upgrade Points

| Current Implementation | Future Event | Dapr Topic |
|------------------------|--------------|------------|
| Task created | `TaskCreated` event | `task-events` |
| Task updated | `TaskUpdated` event | `task-events` |
| Task completed | `TaskCompleted` event | `task-events` |
| Recurring task created | `RecurringTaskCreated` event | `task-events` |
| Reminder triggered | `ReminderTriggered` event | `reminders` |
| Tag created/updated/deleted | `TagChanged` event | `task-events` |

### 6.2 Current Design Considerations

**Recurrence Logic**:
- Currently: Synchronous in task completion endpoint
- Future: Emit `TaskCompleted` event, separate consumer creates next occurrence
- Design: Keep recurrence logic in separate service function for easy extraction

**Reminder Logic**:
- Currently: Frontend polling/checking
- Future: Dapr binding/cron triggers `ReminderCheck`, emits `ReminderTriggered`
- Design: Keep reminder evaluation logic in separate function

**Tag Operations**:
- Currently: Synchronous CRUD
- Future: Emit events for activity logging
- Design: No special preparation needed, simple to add event emission

### 6.3 No-Block Validation

| Feature | Blocks Event-Driven? | Notes |
|---------|---------------------|-------|
| Priority | No | Simple field, no special handling |
| Tags | No | Standard M:N, events easy to add |
| Search | No | Query parameter, stateless |
| Filter/Sort | No | Query parameters, stateless |
| Due Dates | No | Simple field, frontend state |
| Recurrence | No | Service function extractable |
| Reminders | No | Service function extractable |

**Conclusion**: All features designed for synchronous operation can be upgraded to event-driven without architectural changes. Key service functions are isolated for future extraction.

---

## Implementation Order

Based on dependencies and priorities:

### Batch 1: Foundation (Backend)
1. Create enums (Priority, Recurrence) in models.py
2. Add new fields to Task model
3. Create Tag and TaskTag models
4. Run database migrations
5. Update task schemas

### Batch 2: Tag CRUD (Backend)
6. Create tag schemas
7. Implement tag routes (CRUD)
8. Add tag relationship loading to task queries

### Batch 3: Search/Filter/Sort (Backend)
9. Extend GET /api/tasks with query parameters
10. Implement search logic (ILIKE)
11. Implement filter logic (status, priority, tags)
12. Implement sort logic with priority mapping

### Batch 4: Task Extensions (Backend)
13. Extend POST/PUT task with new fields
14. Implement recurrence logic service
15. Integrate recurrence into task completion
16. Add reminder validation

### Batch 5: Frontend Types & Hooks
17. Update Task type definition
18. Create Tag type definition
19. Update useTasks hook with filters
20. Create useTags hook

### Batch 6: Frontend Components (Priority)
21. Create PriorityBadge component
22. Create PrioritySelect component
23. Extend TaskCard with priority
24. Extend TaskForm with priority

### Batch 7: Frontend Components (Search/Filter)
25. Create SearchInput component
26. Create FilterBar component
27. Create SortSelect component
28. Extend TaskList with controls

### Batch 8: Frontend Components (Tags)
29. Create TagBadge component
30. Create TagInput component
31. Create TagManager modal
32. Extend TaskCard/TaskForm with tags

### Batch 9: Frontend Components (Due Date/Recurrence)
33. Create DueDatePicker component
34. Create RecurrenceSelect component
35. Create ReminderPicker component
36. Extend TaskCard/TaskForm

### Batch 10: Integration & Testing
37. Update MCP tools for new fields
38. Backend unit tests
39. Frontend component tests
40. End-to-end testing

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database migration issues | High | Test migrations on copy of prod data |
| Performance with 1000+ tasks | Medium | Add indexes, test with realistic data |
| Tag autocomplete slowness | Low | Limit results, add index on name |
| Recurring task edge cases | Medium | Comprehensive unit tests for date math |
| Frontend bundle size increase | Low | Tree-shaking, lazy load tag manager |
| Breaking existing API consumers | High | All new fields optional, defaults provided |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time | < 500ms | Backend timing middleware |
| Search results latency | < 300ms | Frontend performance timing |
| Feature adoption | > 50% tasks have priority | Database query |
| Zero breaking changes | 0 errors from existing clients | Error monitoring |
| Test coverage | > 80% new code | Coverage reports |
