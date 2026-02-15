# Feature Specification: Advanced Task Management Features

**Feature Branch**: `004-advanced-task-features`
**Created**: 2026-02-13
**Status**: Draft
**Input**: User description: "Implement intermediate and advanced task features including priorities, tags, search, filtering, sorting, due dates, recurring tasks, and reminders"

---

## Overview

This specification defines the implementation of intermediate and advanced task management features for the existing Todo application. The features extend the current Task model and APIs while maintaining backward compatibility with existing functionality.

**Scope Constraints**:
- No Kubernetes, Dapr, Kafka, CI/CD, or Cloud infrastructure
- All logic must work synchronously (no background workers)
- Focus on application logic, APIs, UI, and data models only

---

## User Scenarios & Testing

### User Story 1 - Task Priority Management (Priority: P1)

As a user, I want to assign priority levels to my tasks so I can focus on the most important items first.

**Why this priority**: Priority is the most fundamental way users organize and triage their work. Without priorities, task lists become overwhelming and users cannot effectively manage their workload.

**Independent Test**: Can be fully tested by creating tasks with different priorities, viewing the priority badge on each task, and sorting tasks by priority.

**Acceptance Scenarios**:

1. **Given** I am creating a new task, **When** I select a priority level (Low/Medium/High), **Then** the task is created with that priority and displays the corresponding priority indicator.

2. **Given** I have existing tasks with different priorities, **When** I view my task list, **Then** each task shows a visual priority indicator (color-coded badge).

3. **Given** I am editing a task, **When** I change the priority level, **Then** the task updates immediately and reflects the new priority.

4. **Given** I have tasks with no explicit priority set, **When** I view the task, **Then** it defaults to "Medium" priority.

---

### User Story 2 - Task Search (Priority: P1)

As a user, I want to search my tasks by keyword so I can quickly find specific items without scrolling through my entire list.

**Why this priority**: Search is essential for users with many tasks. It provides immediate value and is a fundamental productivity feature.

**Independent Test**: Can be fully tested by entering search terms in the search input and verifying matching tasks appear in real-time.

**Acceptance Scenarios**:

1. **Given** I have multiple tasks, **When** I type a keyword in the search box, **Then** the task list filters in real-time to show only matching tasks.

2. **Given** I search for "meeting", **When** tasks contain "Meeting", "MEETING", or "meeting" in title or description, **Then** all are returned (case-insensitive).

3. **Given** I have a search active, **When** I clear the search box, **Then** all tasks are displayed again.

4. **Given** no tasks match my search, **When** I view the results, **Then** I see an empty state message "No tasks found matching your search."

---

### User Story 3 - Filter and Sort Tasks (Priority: P1)

As a user, I want to filter tasks by status, priority, and tags, and sort them by different criteria so I can organize my view.

**Why this priority**: Filtering and sorting are core organizational tools that work alongside search to help users manage their task lists effectively.

**Independent Test**: Can be fully tested by applying filters and sort options and verifying the task list updates accordingly.

**Acceptance Scenarios**:

1. **Given** I have completed and pending tasks, **When** I filter by "Completed", **Then** only completed tasks are shown.

2. **Given** I have tasks with different priorities, **When** I filter by "High Priority", **Then** only high-priority tasks are shown.

3. **Given** I have multiple tasks, **When** I sort by "Priority (High to Low)", **Then** tasks are ordered High > Medium > Low.

4. **Given** I have tasks with due dates, **When** I sort by "Due Date", **Then** tasks are ordered by due date (earliest first, null dates last).

5. **Given** I have filters applied, **When** I click "Clear Filters", **Then** all filters are removed and all tasks are displayed.

---

### User Story 4 - Tags and Labels (Priority: P2)

As a user, I want to add multiple tags to my tasks so I can categorize and group related work together.

**Why this priority**: Tags provide flexible categorization beyond priority. They're important but build on the foundation of priority, search, and filtering.

**Independent Test**: Can be fully tested by creating tags, assigning them to tasks, and filtering by specific tags.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task, **When** I add tags (e.g., "work", "urgent"), **Then** the tags are saved and displayed on the task card.

2. **Given** I have tasks with tags, **When** I click on a tag, **Then** the task list filters to show only tasks with that tag.

3. **Given** I want to create a new tag, **When** I type a new tag name and press Enter, **Then** the tag is created and applied to the task.

4. **Given** I have a tag on a task, **When** I click the remove button on the tag, **Then** the tag is removed from that task only.

5. **Given** I want to manage my tags globally, **When** I access tag management, **Then** I can rename or delete tags (deletion removes from all tasks).

---

### User Story 5 - Due Dates (Priority: P2)

As a user, I want to set due dates on my tasks so I can track deadlines and see what's coming up.

**Why this priority**: Due dates are essential for time-based task management but require the sorting infrastructure from P1 features.

**Independent Test**: Can be fully tested by setting due dates on tasks and verifying they display correctly with visual indicators.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task, **When** I set a due date, **Then** the task saves with that due date and displays it.

2. **Given** a task has a due date in the past, **When** I view the task, **Then** it shows an "Overdue" visual indicator (red styling).

3. **Given** a task has a due date within 24 hours, **When** I view the task, **Then** it shows a "Due Soon" indicator (orange/yellow styling).

4. **Given** I have tasks with due dates, **When** I sort by due date, **Then** tasks are ordered chronologically.

5. **Given** I want to remove a due date, **When** I clear the due date field, **Then** the due date is removed from the task.

---

### User Story 6 - Recurring Tasks (Priority: P3)

As a user, I want to mark tasks as recurring so that when I complete them, the next occurrence is automatically created.

**Why this priority**: Recurring tasks add automation complexity and depend on all previous features working correctly.

**Independent Test**: Can be fully tested by creating a recurring task, completing it, and verifying a new occurrence is automatically created.

**Acceptance Scenarios**:

1. **Given** I am creating a task, **When** I set it as recurring (Daily/Weekly/Monthly), **Then** the task is saved with recurrence metadata and shows a recurring indicator.

2. **Given** I complete a recurring task, **When** the system processes the completion, **Then** a new task is created with the next due date based on the recurrence pattern.

3. **Given** I complete a daily recurring task due today, **When** the new task is created, **Then** its due date is tomorrow.

4. **Given** I complete a weekly recurring task, **When** the new task is created, **Then** its due date is 7 days from the original due date.

5. **Given** I want to stop recurrence, **When** I edit the task and remove the recurrence setting, **Then** completing the task no longer creates a new occurrence.

---

### User Story 7 - Reminders (Priority: P3)

As a user, I want to set reminder times for my tasks so I can be notified before deadlines.

**Why this priority**: Reminders are an advanced feature that enhances due dates. Currently implemented as application-level state (no external schedulers).

**Independent Test**: Can be fully tested by setting a reminder time and verifying the reminder state is displayed in the UI.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task with a due date, **When** I set a reminder time (e.g., "30 minutes before"), **Then** the reminder is saved and displayed on the task.

2. **Given** a task has a reminder, **When** the current time reaches the reminder time, **Then** the task displays an "Active Reminder" indicator.

3. **Given** a task has an active reminder, **When** I view my tasks, **Then** tasks with active reminders are visually highlighted.

4. **Given** I want to remove a reminder, **When** I clear the reminder field, **Then** the reminder is removed from the task.

5. **Given** a reminder has triggered, **When** I acknowledge or complete the task, **Then** the reminder state is cleared.

---

### Edge Cases

- **Empty tag names**: System rejects tags with empty or whitespace-only names.
- **Duplicate tags**: System prevents adding the same tag twice to a task (case-insensitive comparison).
- **Due date in past on create**: System allows past due dates (user may be logging completed work).
- **Recurring task without due date**: System requires a due date to enable recurrence.
- **Search with special characters**: System handles regex-special characters safely (no injection).
- **Very long search queries**: System limits search input to 255 characters.
- **Multiple filters applied**: Filters combine with AND logic (all conditions must match).
- **Reminder before current time**: System allows but marks as "Active" immediately.
- **Completing recurring task with no due date**: System creates next occurrence with due date = today + interval.

---

## Requirements

### Functional Requirements

#### Priority Management
- **FR-PRI-001**: System MUST support three priority levels: Low, Medium, High (stored as enum/string).
- **FR-PRI-002**: System MUST default new tasks to Medium priority if not specified.
- **FR-PRI-003**: System MUST validate priority values on backend (reject invalid values).
- **FR-PRI-004**: Frontend MUST display color-coded priority badges (Green=Low, Yellow=Medium, Red=High).

#### Tags & Labels
- **FR-TAG-001**: System MUST support multiple tags per task (many-to-many relationship).
- **FR-TAG-002**: Tag names MUST be limited to 50 characters, alphanumeric with hyphens and underscores.
- **FR-TAG-003**: Tags MUST be user-scoped (each user has their own tags).
- **FR-TAG-004**: System MUST support tag CRUD operations (create, read, update, delete).
- **FR-TAG-005**: Deleting a tag MUST remove it from all associated tasks.
- **FR-TAG-006**: Tag names MUST be unique per user (case-insensitive).

#### Search
- **FR-SRC-001**: System MUST support keyword search across task title and description.
- **FR-SRC-002**: Search MUST be case-insensitive.
- **FR-SRC-003**: Search MUST support partial matching (substring search).
- **FR-SRC-004**: Frontend MUST implement real-time search (debounced, 300ms delay).
- **FR-SRC-005**: Backend MUST limit search results to tasks owned by authenticated user.

#### Filter & Sort
- **FR-FLT-001**: System MUST support filtering by: status (completed/pending), priority, tags.
- **FR-FLT-002**: Multiple filters MUST combine with AND logic.
- **FR-FLT-003**: System MUST support sorting by: creation date, priority, due date.
- **FR-FLT-004**: Sort MUST support ascending and descending order.
- **FR-FLT-005**: Sorting by priority MUST use logical order: High > Medium > Low (desc) or Low > Medium > High (asc).
- **FR-FLT-006**: Null due dates MUST sort to the end when sorting by due date ascending.

#### Due Dates
- **FR-DUE-001**: System MUST support optional due date field (datetime with timezone).
- **FR-DUE-002**: Frontend MUST display due dates in user-friendly format (e.g., "Tomorrow", "Feb 15").
- **FR-DUE-003**: Frontend MUST visually indicate overdue tasks (past due date, not completed).
- **FR-DUE-004**: Frontend MUST visually indicate tasks due within 24 hours.

#### Recurring Tasks
- **FR-REC-001**: System MUST support recurrence patterns: Daily, Weekly, Monthly.
- **FR-REC-002**: Completing a recurring task MUST trigger creation of next occurrence.
- **FR-REC-003**: Next occurrence MUST calculate due date based on pattern and original due date.
- **FR-REC-004**: Recurring logic MUST execute synchronously within task completion API call.
- **FR-REC-005**: New occurrence MUST copy title, description, priority, tags from original.
- **FR-REC-006**: System MUST prevent infinite recursion (new task is NOT marked as completed).

#### Reminders
- **FR-REM-001**: System MUST support reminder_at field (datetime with timezone).
- **FR-REM-002**: Reminder MUST only be settable if task has a due date.
- **FR-REM-003**: Frontend MUST display reminder indicator on tasks with set reminders.
- **FR-REM-004**: Frontend MUST highlight tasks where current time >= reminder_at and task not completed.
- **FR-REM-005**: Completing or acknowledging task MUST clear the active reminder state.

---

### Key Entities

#### Task (Extended)
The existing Task entity extended with new fields:
- `priority`: Priority level (low/medium/high), defaults to medium
- `due_date`: Optional datetime for task deadline
- `recurrence`: Optional recurrence pattern (daily/weekly/monthly)
- `reminder_at`: Optional datetime for reminder trigger
- `tags`: Many-to-many relationship to Tag entity

#### Tag (New)
- `id`: UUID primary key
- `name`: Tag display name (max 50 chars)
- `user_id`: Foreign key to User (tags are user-scoped)
- `color`: Optional hex color for display
- `created_at`: Creation timestamp

#### TaskTag (New - Junction Table)
- `task_id`: Foreign key to Task
- `tag_id`: Foreign key to Tag
- Composite primary key on (task_id, tag_id)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create tasks with priorities and the priority is correctly displayed within 200ms response time.
- **SC-002**: Search returns results in under 500ms for users with up to 1000 tasks.
- **SC-003**: Filter and sort operations complete in under 300ms.
- **SC-004**: 100% of API endpoints validate user ownership before returning/modifying data.
- **SC-005**: All new fields are backward compatible (existing tasks without new fields work correctly).
- **SC-006**: Recurring task completion creates new occurrence in the same API transaction (atomic).
- **SC-007**: Frontend renders new UI components without layout breaking for existing task cards.

---

## API Contract Summary

### Modified Endpoints

#### GET /api/tasks
**Query Parameters (New)**:
- `search`: string - Keyword search (title + description)
- `status`: string - Filter by "completed" or "pending"
- `priority`: string - Filter by "low", "medium", or "high"
- `tags`: string - Comma-separated tag IDs to filter by
- `sort_by`: string - "created_at", "priority", "due_date"
- `sort_order`: string - "asc" or "desc"

**Response (Extended)**:
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "completed": "boolean",
      "priority": "low | medium | high",
      "due_date": "ISO8601 | null",
      "recurrence": "daily | weekly | monthly | null",
      "reminder_at": "ISO8601 | null",
      "tags": [{"id": "uuid", "name": "string", "color": "string | null"}],
      "user_id": "uuid",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ],
  "total": "number",
  "filtered": "number"
}
```

#### POST /api/tasks
**Request (Extended)**:
```json
{
  "title": "string (required)",
  "description": "string | null",
  "priority": "low | medium | high (default: medium)",
  "due_date": "ISO8601 | null",
  "recurrence": "daily | weekly | monthly | null",
  "reminder_at": "ISO8601 | null",
  "tag_ids": ["uuid"]
}
```

#### PUT /api/tasks/{task_id}
**Request (Extended)**:
All fields from POST plus ability to update `completed` status. When `completed` is set to `true` for a recurring task, the endpoint creates the next occurrence.

### New Endpoints

#### Tags CRUD
- `GET /api/tags` - List all tags for authenticated user
- `POST /api/tags` - Create new tag
- `PUT /api/tags/{tag_id}` - Update tag (name, color)
- `DELETE /api/tags/{tag_id}` - Delete tag (removes from all tasks)

---

## Data Model Changes

### Backend (SQLModel)

```python
# New enum for priority
class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

# New enum for recurrence
class Recurrence(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

# Extended Task model
class Task(SQLModel, table=True):
    # ... existing fields ...
    priority: Priority = Field(default=Priority.MEDIUM)
    due_date: Optional[datetime] = Field(default=None)
    recurrence: Optional[Recurrence] = Field(default=None)
    reminder_at: Optional[datetime] = Field(default=None)

    # Relationship to tags
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model=TaskTag)

# New Tag model
class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=50)
    color: Optional[str] = Field(default=None, max_length=7)  # Hex color
    user_id: UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    tasks: List["Task"] = Relationship(back_populates="tags", link_model=TaskTag)

# Junction table
class TaskTag(SQLModel, table=True):
    __tablename__ = "task_tags"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True)
```

### Frontend (TypeScript)

```typescript
type Priority = 'low' | 'medium' | 'high';
type Recurrence = 'daily' | 'weekly' | 'monthly';

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  due_date: string | null;  // ISO8601
  recurrence: Recurrence | null;
  reminder_at: string | null;  // ISO8601
  tags: Tag[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TaskFilters {
  search?: string;
  status?: 'completed' | 'pending';
  priority?: Priority;
  tagIds?: string[];
  sortBy?: 'created_at' | 'priority' | 'due_date';
  sortOrder?: 'asc' | 'desc';
}
```

---

## UI Components

### New Components

1. **PriorityBadge**: Displays colored priority indicator (Low=green, Medium=yellow, High=red)
2. **PrioritySelect**: Dropdown for selecting priority level
3. **TagBadge**: Displays tag with optional color and remove button
4. **TagInput**: Autocomplete input for adding tags to tasks
5. **TagManager**: Modal for creating/editing/deleting tags
6. **SearchInput**: Debounced search input with clear button
7. **FilterBar**: Horizontal bar with filter dropdowns and clear button
8. **SortSelect**: Dropdown for selecting sort field and order
9. **DueDatePicker**: Date/time picker for due date
10. **RecurrenceSelect**: Dropdown for recurrence pattern
11. **ReminderPicker**: Input for setting reminder time relative to due date

### Modified Components

1. **TaskCard**: Extended to show priority badge, due date, recurrence icon, reminder icon, tags
2. **TaskForm**: Extended with priority, due date, recurrence, reminder, and tag inputs
3. **TaskList**: Extended with search, filter, and sort controls

---

## Non-Functional Requirements

### Performance
- Search/filter/sort queries must complete in < 500ms for 1000 tasks
- Tag autocomplete must respond in < 200ms
- Real-time search must be debounced (300ms) to avoid excessive API calls

### Backward Compatibility
- Existing tasks without new fields must continue to work (defaults applied)
- Existing API consumers must not break (new fields are optional in responses)
- Database migrations must be non-destructive

### Security
- All new endpoints must enforce user authentication
- All new queries must enforce user isolation
- Tag names must be sanitized (prevent XSS in frontend display)
- Search input must be sanitized (prevent SQL injection)

---

## Out of Scope

- Push notifications (requires infrastructure)
- Email reminders (requires email service)
- Shared tasks between users
- Task subtasks/checklists
- File attachments
- Time tracking
- Calendar integration
- Mobile app
- Offline support
- Background job processing
- Kafka/Dapr/event-driven architecture
- Kubernetes deployment
- CI/CD pipelines
