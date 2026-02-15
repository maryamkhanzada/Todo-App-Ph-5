# API Contracts: Advanced Task Management Features

**Feature**: 004-advanced-task-features
**Created**: 2026-02-13
**Base URL**: `/api`

---

## Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

---

## Task Endpoints (Extended)

### GET /api/tasks

Retrieve tasks with optional search, filter, and sort.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Keyword search (title + description) |
| status | string | No | Filter by "completed" or "pending" |
| priority | string | No | Filter by "low", "medium", or "high" |
| tags | string | No | Comma-separated tag IDs |
| sort_by | string | No | Sort field: "created_at", "priority", "due_date" (default: created_at) |
| sort_order | string | No | Sort order: "asc" or "desc" (default: desc) |

**Response 200**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Complete project report",
      "description": "Write Q4 summary report",
      "completed": false,
      "priority": "high",
      "due_date": "2026-02-20T17:00:00Z",
      "recurrence": null,
      "reminder_at": "2026-02-20T09:00:00Z",
      "tags": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "name": "work",
          "color": "#3B82F6"
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "name": "urgent",
          "color": "#EF4444"
        }
      ],
      "user_id": "880e8400-e29b-41d4-a716-446655440003",
      "created_at": "2026-02-10T10:30:00Z",
      "updated_at": "2026-02-13T14:45:00Z"
    }
  ],
  "total": 50,
  "filtered": 5
}
```

**Example Requests**:
```bash
# Search for tasks containing "meeting"
GET /api/tasks?search=meeting

# Filter by high priority, pending status
GET /api/tasks?status=pending&priority=high

# Filter by tags
GET /api/tasks?tags=660e8400-e29b-41d4-a716-446655440001,770e8400-e29b-41d4-a716-446655440002

# Sort by due date ascending
GET /api/tasks?sort_by=due_date&sort_order=asc

# Combined filters
GET /api/tasks?search=report&status=pending&priority=high&sort_by=due_date&sort_order=asc
```

---

### POST /api/tasks

Create a new task with extended fields.

**Request Body**:
```json
{
  "title": "Complete project report",
  "description": "Write Q4 summary report",
  "priority": "high",
  "due_date": "2026-02-20T17:00:00Z",
  "recurrence": null,
  "reminder_at": "2026-02-20T09:00:00Z",
  "tag_ids": [
    "660e8400-e29b-41d4-a716-446655440001",
    "770e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Field Validation**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | 1-255 characters, non-empty after trim |
| description | string | No | Max 1000 characters |
| priority | string | No | One of: "low", "medium", "high" (default: "medium") |
| due_date | string (ISO8601) | No | Valid datetime |
| recurrence | string | No | One of: "daily", "weekly", "monthly", or null |
| reminder_at | string (ISO8601) | No | Valid datetime, must be <= due_date if set |
| tag_ids | array of UUIDs | No | All IDs must exist and belong to user |

**Response 201**:
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project report",
    "description": "Write Q4 summary report",
    "completed": false,
    "priority": "high",
    "due_date": "2026-02-20T17:00:00Z",
    "recurrence": null,
    "reminder_at": "2026-02-20T09:00:00Z",
    "tags": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "work",
        "color": "#3B82F6"
      }
    ],
    "user_id": "880e8400-e29b-41d4-a716-446655440003",
    "created_at": "2026-02-13T15:00:00Z",
    "updated_at": "2026-02-13T15:00:00Z"
  }
}
```

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Empty title | `{"detail": "Title cannot be empty"}` |
| 400 | Invalid priority | `{"detail": "Invalid priority value. Must be 'low', 'medium', or 'high'"}` |
| 400 | Invalid recurrence | `{"detail": "Invalid recurrence value. Must be 'daily', 'weekly', 'monthly', or null"}` |
| 400 | Recurrence without due_date | `{"detail": "Due date is required for recurring tasks"}` |
| 400 | Reminder after due_date | `{"detail": "Reminder time must be before or equal to due date"}` |
| 400 | Invalid tag_id | `{"detail": "Tag not found: <id>"}` |
| 401 | Missing/invalid token | `{"detail": "Invalid or missing authentication token"}` |

---

### PUT /api/tasks/{task_id}

Update an existing task. When `completed` is set to `true` for a recurring task, the endpoint creates the next occurrence automatically.

**Path Parameters**:
- `task_id` (UUID): The task ID to update

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "priority": "medium",
  "due_date": "2026-02-25T17:00:00Z",
  "recurrence": "weekly",
  "reminder_at": null,
  "tag_ids": ["660e8400-e29b-41d4-a716-446655440001"]
}
```

**Response 200** (Recurring task completed - includes new occurrence):
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project report",
    "completed": true,
    "priority": "high",
    "due_date": "2026-02-20T17:00:00Z",
    "recurrence": "weekly",
    ...
  },
  "next_occurrence": {
    "id": "990e8400-e29b-41d4-a716-446655440099",
    "title": "Complete project report",
    "completed": false,
    "priority": "high",
    "due_date": "2026-02-27T17:00:00Z",
    "recurrence": "weekly",
    ...
  }
}
```

**Response 200** (Non-recurring or regular update):
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated title",
    ...
  }
}
```

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Validation error | `{"detail": "<error message>"}` |
| 401 | Missing/invalid token | `{"detail": "Invalid or missing authentication token"}` |
| 404 | Task not found or not owned | `{"detail": "Task not found"}` |

---

### DELETE /api/tasks/{task_id}

Delete a task permanently.

**Path Parameters**:
- `task_id` (UUID): The task ID to delete

**Response 204**: No content

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Missing/invalid token | `{"detail": "Invalid or missing authentication token"}` |
| 404 | Task not found or not owned | `{"detail": "Task not found"}` |

---

## Tag Endpoints (New)

### GET /api/tags

Retrieve all tags for the authenticated user.

**Response 200**:
```json
{
  "tags": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "work",
      "color": "#3B82F6",
      "user_id": "880e8400-e29b-41d4-a716-446655440003",
      "created_at": "2026-02-01T10:00:00Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "personal",
      "color": "#10B981",
      "user_id": "880e8400-e29b-41d4-a716-446655440003",
      "created_at": "2026-02-01T10:05:00Z"
    }
  ]
}
```

---

### POST /api/tags

Create a new tag.

**Request Body**:
```json
{
  "name": "urgent",
  "color": "#EF4444"
}
```

**Field Validation**:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 1-50 chars, alphanumeric + hyphens + underscores, unique per user (case-insensitive) |
| color | string | No | Hex format #RRGGBB (e.g., "#EF4444") |

**Response 201**:
```json
{
  "tag": {
    "id": "aa0e8400-e29b-41d4-a716-446655440010",
    "name": "urgent",
    "color": "#EF4444",
    "user_id": "880e8400-e29b-41d4-a716-446655440003",
    "created_at": "2026-02-13T15:30:00Z"
  }
}
```

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Empty name | `{"detail": "Tag name cannot be empty"}` |
| 400 | Invalid name format | `{"detail": "Tag name must be alphanumeric with hyphens or underscores only"}` |
| 400 | Name too long | `{"detail": "Tag name must be 50 characters or less"}` |
| 400 | Invalid color format | `{"detail": "Color must be in hex format (#RRGGBB)"}` |
| 409 | Duplicate name | `{"detail": "Tag with this name already exists"}` |
| 401 | Missing/invalid token | `{"detail": "Invalid or missing authentication token"}` |

---

### PUT /api/tags/{tag_id}

Update an existing tag.

**Path Parameters**:
- `tag_id` (UUID): The tag ID to update

**Request Body** (all fields optional):
```json
{
  "name": "important",
  "color": "#F59E0B"
}
```

**Response 200**:
```json
{
  "tag": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "important",
    "color": "#F59E0B",
    "user_id": "880e8400-e29b-41d4-a716-446655440003",
    "created_at": "2026-02-01T10:00:00Z"
  }
}
```

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Validation error | `{"detail": "<error message>"}` |
| 401 | Missing/invalid token | `{"detail": "Invalid or missing authentication token"}` |
| 404 | Tag not found or not owned | `{"detail": "Tag not found"}` |
| 409 | Duplicate name | `{"detail": "Tag with this name already exists"}` |

---

### DELETE /api/tags/{tag_id}

Delete a tag. This removes the tag from all associated tasks.

**Path Parameters**:
- `tag_id` (UUID): The tag ID to delete

**Response 204**: No content

**Notes**:
- Deleting a tag automatically removes it from all tasks that have it (via CASCADE)
- Tasks are not deleted, only the tag association is removed

**Error Responses**:

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Missing/invalid token | `{"detail": "Invalid or missing authentication token"}` |
| 404 | Tag not found or not owned | `{"detail": "Tag not found"}` |

---

## Schema Definitions

### TaskResponse (Extended)

```json
{
  "id": "UUID",
  "title": "string",
  "description": "string | null",
  "completed": "boolean",
  "priority": "low | medium | high",
  "due_date": "ISO8601 datetime | null",
  "recurrence": "daily | weekly | monthly | null",
  "reminder_at": "ISO8601 datetime | null",
  "tags": "array<TagResponse>",
  "user_id": "UUID",
  "created_at": "ISO8601 datetime",
  "updated_at": "ISO8601 datetime"
}
```

### TagResponse

```json
{
  "id": "UUID",
  "name": "string",
  "color": "string (hex) | null",
  "user_id": "UUID",
  "created_at": "ISO8601 datetime"
}
```

### TaskCreateRequest

```json
{
  "title": "string (required, 1-255 chars)",
  "description": "string | null (max 1000 chars)",
  "priority": "low | medium | high (default: medium)",
  "due_date": "ISO8601 datetime | null",
  "recurrence": "daily | weekly | monthly | null",
  "reminder_at": "ISO8601 datetime | null",
  "tag_ids": "array<UUID> | null"
}
```

### TaskUpdateRequest

```json
{
  "title": "string | null (1-255 chars if provided)",
  "description": "string | null (max 1000 chars)",
  "completed": "boolean | null",
  "priority": "low | medium | high | null",
  "due_date": "ISO8601 datetime | null",
  "recurrence": "daily | weekly | monthly | null",
  "reminder_at": "ISO8601 datetime | null",
  "tag_ids": "array<UUID> | null"
}
```

### TagCreateRequest

```json
{
  "name": "string (required, 1-50 chars, alphanumeric + hyphens/underscores)",
  "color": "string (hex #RRGGBB) | null"
}
```

### TagUpdateRequest

```json
{
  "name": "string | null (1-50 chars if provided)",
  "color": "string (hex #RRGGBB) | null"
}
```

---

## Priority Sort Order

When sorting by priority:

**Descending (High to Low)**:
1. high
2. medium
3. low

**Ascending (Low to High)**:
1. low
2. medium
3. high

---

## Due Date Handling

- Dates are stored and returned in UTC (ISO8601 format with Z suffix)
- Frontend is responsible for converting to user's local timezone for display
- Null due dates sort to the end when sorting by due_date ascending
- Null due dates sort to the beginning when sorting by due_date descending

---

## Recurrence Calculation

When a recurring task is completed:

| Pattern | Calculation |
|---------|-------------|
| daily | original_due_date + 1 day |
| weekly | original_due_date + 7 days |
| monthly | original_due_date + 1 month (same day, adjusted for month length) |

**Edge Cases**:
- Monthly recurrence on Jan 31 → Feb 28 (or 29 in leap year)
- Monthly recurrence on Jan 30 → Feb 28 (or 29 in leap year)
- Monthly recurrence on Jan 29 → Feb 28 (or 29 in leap year)

---

## OpenAPI Specification (Excerpt)

```yaml
openapi: 3.0.3
info:
  title: Todo API - Advanced Features
  version: 2.0.0

components:
  schemas:
    Priority:
      type: string
      enum: [low, medium, high]
      default: medium

    Recurrence:
      type: string
      enum: [daily, weekly, monthly]
      nullable: true

    Tag:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          maxLength: 50
        color:
          type: string
          pattern: '^#[0-9A-Fa-f]{6}$'
          nullable: true
        user_id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time

    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
          maxLength: 255
        description:
          type: string
          maxLength: 1000
          nullable: true
        completed:
          type: boolean
        priority:
          $ref: '#/components/schemas/Priority'
        due_date:
          type: string
          format: date-time
          nullable: true
        recurrence:
          $ref: '#/components/schemas/Recurrence'
        reminder_at:
          type: string
          format: date-time
          nullable: true
        tags:
          type: array
          items:
            $ref: '#/components/schemas/Tag'
        user_id:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
```
