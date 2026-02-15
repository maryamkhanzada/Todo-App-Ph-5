# Data Model: Advanced Task Management Features

**Feature**: 004-advanced-task-features
**Created**: 2026-02-13

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │    Task     │       │    Tag      │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ email       │  │    │ title       │  │    │ name        │
│ password_   │  │    │ description │  │    │ color       │
│   hash      │  └───►│ user_id(FK) │  │    │ user_id(FK) │◄──┐
│ created_at  │       │ completed   │  │    │ created_at  │   │
└─────────────┘       │ priority    │  │    └─────────────┘   │
                      │ due_date    │  │          ▲           │
                      │ recurrence  │  │          │           │
                      │ reminder_at │  │    ┌─────┴─────┐     │
                      │ created_at  │  │    │ TaskTag   │     │
                      │ updated_at  │  │    ├───────────┤     │
                      └─────────────┘  └───►│ task_id   │     │
                            │               │ tag_id    │─────┘
                            └──────────────►└───────────┘
```

---

## Enums

### Priority

| Value | Database | Description |
|-------|----------|-------------|
| LOW | "low" | Low priority task |
| MEDIUM | "medium" | Normal priority (default) |
| HIGH | "high" | High priority task |

### Recurrence

| Value | Database | Description |
|-------|----------|-------------|
| DAILY | "daily" | Repeat every day |
| WEEKLY | "weekly" | Repeat every 7 days |
| MONTHLY | "monthly" | Repeat every month (same day) |

---

## Tables

### tasks (Extended)

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | uuid4() | Unique identifier |
| title | VARCHAR(255) | NOT NULL | - | Task title |
| description | VARCHAR(1000) | NULLABLE | NULL | Task description |
| completed | BOOLEAN | NOT NULL | FALSE | Completion status |
| priority | VARCHAR(10) | NOT NULL | "medium" | Priority level (low/medium/high) |
| due_date | TIMESTAMP WITH TZ | NULLABLE | NULL | Due date/time in UTC |
| recurrence | VARCHAR(10) | NULLABLE | NULL | Recurrence pattern (daily/weekly/monthly) |
| reminder_at | TIMESTAMP WITH TZ | NULLABLE | NULL | Reminder trigger time in UTC |
| user_id | UUID | FOREIGN KEY (users.id) | - | Owner user |
| created_at | TIMESTAMP WITH TZ | NOT NULL | now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TZ | NOT NULL | now() | Last update timestamp |

**Indexes**:
- `idx_tasks_user_id` on (user_id)
- `idx_tasks_due_date` on (due_date) - for sorting/filtering
- `idx_tasks_priority` on (priority) - for filtering

**Constraints**:
- `chk_priority` CHECK (priority IN ('low', 'medium', 'high'))
- `chk_recurrence` CHECK (recurrence IS NULL OR recurrence IN ('daily', 'weekly', 'monthly'))
- `chk_recurrence_requires_due_date` CHECK (recurrence IS NULL OR due_date IS NOT NULL)
- `chk_reminder_before_due` CHECK (reminder_at IS NULL OR due_date IS NULL OR reminder_at <= due_date)

### tags (New)

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | uuid4() | Unique identifier |
| name | VARCHAR(50) | NOT NULL | - | Tag display name |
| color | VARCHAR(7) | NULLABLE | NULL | Hex color code (e.g., #FF5733) |
| user_id | UUID | FOREIGN KEY (users.id) | - | Owner user |
| created_at | TIMESTAMP WITH TZ | NOT NULL | now() | Creation timestamp |

**Indexes**:
- `idx_tags_user_id` on (user_id)
- `uq_tags_user_name` UNIQUE on (user_id, LOWER(name)) - case-insensitive uniqueness per user

**Constraints**:
- `chk_tag_name_format` CHECK (name ~ '^[a-zA-Z0-9_-]+$') - alphanumeric, hyphens, underscores
- `chk_color_format` CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')

### task_tags (New - Junction Table)

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| task_id | UUID | FOREIGN KEY (tasks.id) | - | Associated task |
| tag_id | UUID | FOREIGN KEY (tags.id) | - | Associated tag |

**Indexes**:
- `pk_task_tags` PRIMARY KEY on (task_id, tag_id)
- `idx_task_tags_tag_id` on (tag_id) - for reverse lookup

**Constraints**:
- ON DELETE CASCADE for both foreign keys

---

## SQLModel Definitions

### Python Backend

```python
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

from sqlmodel import Column, Field, Relationship, SQLModel
from sqlalchemy import JSON, String


class Priority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Recurrence(str, Enum):
    """Task recurrence patterns."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class TaskTag(SQLModel, table=True):
    """Junction table for Task-Tag many-to-many relationship."""
    __tablename__ = "task_tags"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True, ondelete="CASCADE")
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True, ondelete="CASCADE")


class Tag(SQLModel, table=True):
    """Tag model for categorizing tasks."""
    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=50, nullable=False)
    color: Optional[str] = Field(default=None, max_length=7)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="tags", link_model=TaskTag)


class Task(SQLModel, table=True):
    """Task model with extended fields for advanced features."""
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, nullable=False)

    # New fields
    priority: Priority = Field(
        default=Priority.MEDIUM,
        sa_column=Column(String(10), nullable=False, default="medium")
    )
    due_date: Optional[datetime] = Field(default=None)
    recurrence: Optional[Recurrence] = Field(
        default=None,
        sa_column=Column(String(10), nullable=True)
    )
    reminder_at: Optional[datetime] = Field(default=None)

    # Foreign key
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    owner: "User" = Relationship(back_populates="tasks")
    tags: List[Tag] = Relationship(back_populates="tasks", link_model=TaskTag)
```

---

## TypeScript Definitions

### Frontend

```typescript
// Enums
export type Priority = 'low' | 'medium' | 'high';
export type Recurrence = 'daily' | 'weekly' | 'monthly';

// Tag entity
export interface Tag {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_at: string;
}

// Extended Task entity
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  due_date: string | null;      // ISO8601 datetime
  recurrence: Recurrence | null;
  reminder_at: string | null;   // ISO8601 datetime
  tags: Tag[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Task creation payload
export interface TaskCreateData {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
  recurrence?: Recurrence;
  reminder_at?: string;
  tag_ids?: string[];
}

// Task update payload
export interface TaskUpdateData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  due_date?: string | null;
  recurrence?: Recurrence | null;
  reminder_at?: string | null;
  tag_ids?: string[];
}

// Tag creation payload
export interface TagCreateData {
  name: string;
  color?: string;
}

// Tag update payload
export interface TagUpdateData {
  name?: string;
  color?: string | null;
}

// Filter options
export interface TaskFilters {
  search?: string;
  status?: 'completed' | 'pending';
  priority?: Priority;
  tag_ids?: string[];
  sort_by?: 'created_at' | 'priority' | 'due_date';
  sort_order?: 'asc' | 'desc';
}
```

---

## Migration Strategy

### Phase 1: Schema Updates (Non-Breaking)

1. Add new columns to `tasks` table with defaults:
   ```sql
   ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) NOT NULL DEFAULT 'medium';
   ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
   ALTER TABLE tasks ADD COLUMN recurrence VARCHAR(10);
   ALTER TABLE tasks ADD COLUMN reminder_at TIMESTAMP WITH TIME ZONE;
   ```

2. Create new tables:
   ```sql
   CREATE TABLE tags (...);
   CREATE TABLE task_tags (...);
   ```

3. Add indexes and constraints.

### Phase 2: Data Migration

1. All existing tasks automatically have priority='medium' (via default).
2. No data migration needed for other fields (all nullable).

### Phase 3: Validation

1. Verify all existing tasks have valid priority values.
2. Verify foreign key integrity.
3. Run application tests.

### Rollback Plan

```sql
-- Reverse migration if needed
DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS tags;
ALTER TABLE tasks DROP COLUMN IF EXISTS reminder_at;
ALTER TABLE tasks DROP COLUMN IF EXISTS recurrence;
ALTER TABLE tasks DROP COLUMN IF EXISTS due_date;
ALTER TABLE tasks DROP COLUMN IF EXISTS priority;
```

---

## Query Patterns

### Search with Filters

```sql
SELECT t.*,
       ARRAY_AGG(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)) as tags
FROM tasks t
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags tg ON tt.tag_id = tg.id
WHERE t.user_id = :user_id
  AND (t.title ILIKE :search OR t.description ILIKE :search)
  AND t.completed = :status
  AND t.priority = :priority
  AND tt.tag_id IN (:tag_ids)
GROUP BY t.id
ORDER BY
  CASE WHEN :sort_by = 'priority' AND :sort_order = 'desc'
       THEN CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END
  END,
  CASE WHEN :sort_by = 'due_date' AND :sort_order = 'asc'
       THEN COALESCE(t.due_date, '9999-12-31')
  END
LIMIT :limit OFFSET :offset;
```

### Create Recurring Task Occurrence

```python
async def create_next_occurrence(completed_task: Task, session: AsyncSession):
    """Create next occurrence when recurring task is completed."""
    if not completed_task.recurrence or not completed_task.due_date:
        return None

    # Calculate next due date
    if completed_task.recurrence == Recurrence.DAILY:
        next_due = completed_task.due_date + timedelta(days=1)
    elif completed_task.recurrence == Recurrence.WEEKLY:
        next_due = completed_task.due_date + timedelta(weeks=1)
    elif completed_task.recurrence == Recurrence.MONTHLY:
        next_due = completed_task.due_date + relativedelta(months=1)

    # Create new task
    new_task = Task(
        title=completed_task.title,
        description=completed_task.description,
        completed=False,  # NEVER mark as completed
        priority=completed_task.priority,
        due_date=next_due,
        recurrence=completed_task.recurrence,
        reminder_at=None,  # Reset reminder
        user_id=completed_task.user_id
    )

    # Copy tags
    for tag in completed_task.tags:
        new_task.tags.append(tag)

    session.add(new_task)
    await session.commit()

    return new_task
```

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| priority | Must be 'low', 'medium', or 'high' | "Invalid priority value" |
| recurrence | Must be 'daily', 'weekly', 'monthly', or null | "Invalid recurrence value" |
| recurrence | Requires due_date to be set | "Due date required for recurring tasks" |
| reminder_at | Must be before or equal to due_date | "Reminder must be before due date" |
| reminder_at | Requires due_date to be set | "Due date required to set reminder" |
| tag.name | Max 50 chars, alphanumeric + hyphens + underscores | "Invalid tag name format" |
| tag.name | Unique per user (case-insensitive) | "Tag already exists" |
| tag.color | Must match #RRGGBB format | "Invalid color format" |
