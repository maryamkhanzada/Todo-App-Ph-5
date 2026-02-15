# Quickstart: Advanced Task Management Features

**Feature**: 004-advanced-task-features
**Date**: 2026-02-13

---

## Overview

This quickstart guide provides a step-by-step setup for implementing and testing the advanced task management features.

---

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- PostgreSQL running (or SQLite for development)
- Existing Todo application codebase
- JWT authentication working

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend

# Add python-dateutil for monthly recurrence (if not already installed)
pip install python-dateutil

# Verify all dependencies
pip install -r requirements.txt
```

### 2. Apply Database Migrations

After updating models.py with new fields and models:

```bash
# For development with SQLite (auto-creates tables)
# Just restart the server - SQLModel creates tables on startup

# For production with PostgreSQL
# Use Alembic migrations (if configured) or manual SQL:
```

**Manual Migration SQL** (if needed):
```sql
-- Add new columns to tasks table
ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) NOT NULL DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN recurrence VARCHAR(10);
ALTER TABLE tasks ADD COLUMN reminder_at TIMESTAMP WITH TIME ZONE;

-- Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create unique index for tag names per user
CREATE UNIQUE INDEX idx_tags_user_name ON tags (user_id, LOWER(name));

-- Create task_tags junction table
CREATE TABLE task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Create index for reverse lookup
CREATE INDEX idx_task_tags_tag_id ON task_tags (tag_id);
```

### 3. Start Backend Server

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

### 4. Verify API

```bash
# Check health
curl http://localhost:8000/health

# Login to get token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

# List tasks (should include new fields)
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# List tags (new endpoint)
curl http://localhost:8000/api/tags \
  -H "Authorization: Bearer $TOKEN"
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend

# Install existing dependencies
npm install

# Optional: Add date-fns for date formatting
npm install date-fns
```

### 2. Update Environment

Verify `.env.local` has correct backend URL:
```env
# Should proxy through Next.js middleware to backend
NEXT_PUBLIC_API_URL=/api
```

### 3. Start Frontend Server

```bash
cd frontend
npm run dev
```

### 4. Access Application

Open http://localhost:3000 in your browser.

---

## Feature Testing

### Test Priority

1. Create a new task
2. Select "High" priority
3. Verify red priority badge appears on task card
4. Edit task, change to "Low"
5. Verify green badge appears

### Test Tags

1. Open Tag Manager (settings or task form)
2. Create tag "work" with blue color (#3B82F6)
3. Create tag "personal" with green color (#10B981)
4. Edit a task, add both tags
5. Verify tags appear on task card
6. Click tag to filter tasks

### Test Search

1. Create several tasks with different titles
2. Type a keyword in search box
3. Verify results filter in real-time (300ms delay)
4. Clear search, verify all tasks return

### Test Filter & Sort

1. Create tasks with different priorities and completion states
2. Filter by "Pending" status
3. Add priority filter "High"
4. Verify only pending high-priority tasks shown
5. Sort by priority (High to Low)
6. Clear filters

### Test Due Dates

1. Create task with due date tomorrow
2. Verify "Tomorrow" text appears
3. Create task with due date in past
4. Verify "Overdue" red indicator
5. Sort by due date

### Test Recurring Tasks

1. Create task with due date today
2. Set recurrence to "Daily"
3. Complete the task
4. Verify new task created with due date tomorrow
5. Verify toast notification

### Test Reminders

1. Create task with due date tomorrow
2. Set reminder to "1 day before" (should be today)
3. Verify reminder indicator appears
4. Complete task
5. Verify reminder clears

---

## API Quick Reference

### Tasks

```bash
# Create task with all features
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete report",
    "description": "Q4 summary",
    "priority": "high",
    "due_date": "2026-02-20T17:00:00Z",
    "recurrence": "weekly",
    "tag_ids": ["tag-uuid-here"]
  }'

# Search and filter
curl "http://localhost:8000/api/tasks?search=report&priority=high&status=pending&sort_by=due_date&sort_order=asc" \
  -H "Authorization: Bearer $TOKEN"

# Complete recurring task (creates next occurrence)
curl -X PUT http://localhost:8000/api/tasks/{task_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Tags

```bash
# List tags
curl http://localhost:8000/api/tags \
  -H "Authorization: Bearer $TOKEN"

# Create tag
curl -X POST http://localhost:8000/api/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "work", "color": "#3B82F6"}'

# Update tag
curl -X PUT http://localhost:8000/api/tags/{tag_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "important", "color": "#EF4444"}'

# Delete tag
curl -X DELETE http://localhost:8000/api/tags/{tag_id} \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Database Issues

**Error**: "Column does not exist"
- Run database migrations
- For SQLite: Delete `todo.db` and restart (development only)

**Error**: "Unique constraint violation" (tags)
- Tag names are unique per user (case-insensitive)
- Check for existing tag with same name

### API Issues

**Error**: 400 "Recurrence requires due date"
- Set `due_date` before setting `recurrence`

**Error**: 400 "Reminder must be before due date"
- Ensure `reminder_at` is earlier than or equal to `due_date`

**Error**: 404 "Tag not found"
- Verify tag UUID exists and belongs to authenticated user

### Frontend Issues

**Tags not loading in autocomplete**
- Check `/api/tags` endpoint is working
- Verify useTags hook is fetching correctly

**Due date picker not showing**
- Ensure date picker component is imported
- Check for JavaScript console errors

**Search not working**
- Check browser network tab for API calls
- Verify debounce is not blocking requests

---

## Development Workflow

### Adding a New Feature

1. Update `models.py` with any model changes
2. Update `schemas/` with request/response schemas
3. Update `routes/` with API endpoints
4. Update frontend `types/` with TypeScript interfaces
5. Update frontend `hooks/` with data fetching
6. Create/update frontend components
7. Write tests

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests (if configured)
cd frontend
npm test
```

---

## Next Steps

After completing setup:

1. Review `specs/004-advanced-task-features/plan.md` for implementation order
2. Check `specs/004-advanced-task-features/checklists/requirements.md` for progress tracking
3. Run `/sp.tasks` to generate detailed task breakdown
4. Begin implementation following the batched approach
