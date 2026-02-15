# Research: Advanced Task Management Features

**Feature**: 004-advanced-task-features
**Date**: 2026-02-13
**Status**: Complete

---

## Research Summary

This document captures research findings for implementing advanced task features in the existing Todo application. Research focused on best practices, existing codebase patterns, and technical decisions.

---

## 1. SQLModel Many-to-Many Relationships

**Decision**: Use SQLModel's `Relationship` with `link_model` parameter for Task-Tag relationship.

**Rationale**:
- SQLModel (built on SQLAlchemy) supports M:N relationships via junction tables
- Using `link_model=TaskTag` provides clean relationship definition
- Consistent with existing codebase patterns (User-Task relationship)

**Alternatives Considered**:
- Direct SQLAlchemy relationship: Rejected - inconsistent with existing SQLModel usage
- JSON array of tag IDs: Rejected - poor query performance, no referential integrity

**Implementation Pattern**:
```python
class TaskTag(SQLModel, table=True):
    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True)

class Task(SQLModel, table=True):
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model=TaskTag)
```

---

## 2. Enum Handling in SQLModel/FastAPI

**Decision**: Use Python `Enum` class inheriting from `str` for Priority and Recurrence.

**Rationale**:
- `str, Enum` base allows JSON serialization without custom encoders
- FastAPI automatically validates enum values in request schemas
- SQLModel stores as VARCHAR in database

**Alternatives Considered**:
- Integer enum: Rejected - less readable in database, harder to debug
- Plain string with validation: Rejected - no type safety

**Implementation Pattern**:
```python
class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
```

---

## 3. Case-Insensitive Search in PostgreSQL/SQLite

**Decision**: Use ILIKE for PostgreSQL, LIKE with LOWER() for SQLite compatibility.

**Rationale**:
- PostgreSQL supports ILIKE natively for case-insensitive matching
- SQLite requires LOWER() wrapper or COLLATE NOCASE
- SQLAlchemy's `ilike()` method handles database-specific syntax

**Alternatives Considered**:
- Full-text search: Rejected - overkill for simple keyword matching
- Client-side filtering: Rejected - poor performance with large datasets

**Implementation Pattern**:
```python
from sqlalchemy import or_
query = select(Task).where(
    or_(
        Task.title.ilike(f"%{search}%"),
        Task.description.ilike(f"%{search}%")
    )
)
```

---

## 4. Priority Sorting Strategy

**Decision**: Use CASE expression for custom sort order in SQL.

**Rationale**:
- Priority has logical order (high > medium > low), not alphabetical
- CASE expression provides database-level sorting (efficient)
- Works consistently across PostgreSQL and SQLite

**Alternatives Considered**:
- Integer priority column: Rejected - less human-readable
- Application-level sorting: Rejected - inefficient for pagination

**Implementation Pattern**:
```python
from sqlalchemy import case

priority_order = case(
    (Task.priority == "high", 1),
    (Task.priority == "medium", 2),
    else_=3
)
query = query.order_by(priority_order.asc())  # or desc()
```

---

## 5. Null Due Date Sorting

**Decision**: Use COALESCE or NULLS LAST/FIRST for consistent null handling.

**Rationale**:
- Null due dates should sort to end (ascending) or beginning (descending)
- PostgreSQL supports NULLS LAST/FIRST
- SQLite requires COALESCE workaround

**Implementation Pattern**:
```python
# PostgreSQL
query = query.order_by(Task.due_date.asc().nullslast())

# SQLite compatible
from sqlalchemy import func
query = query.order_by(
    func.coalesce(Task.due_date, '9999-12-31').asc()
)
```

---

## 6. Monthly Recurrence Edge Cases

**Decision**: Use Python's `dateutil.relativedelta` for accurate month math.

**Rationale**:
- `timedelta` doesn't handle month-end edge cases correctly
- `relativedelta(months=1)` automatically handles 31→28 transitions
- Well-tested library, standard Python ecosystem

**Alternatives Considered**:
- Manual date calculation: Rejected - error-prone edge cases
- timedelta(days=30): Rejected - incorrect for varying month lengths

**Implementation Pattern**:
```python
from dateutil.relativedelta import relativedelta

def calculate_next_due_date(due_date: datetime, recurrence: str) -> datetime:
    if recurrence == "daily":
        return due_date + timedelta(days=1)
    elif recurrence == "weekly":
        return due_date + timedelta(weeks=1)
    elif recurrence == "monthly":
        return due_date + relativedelta(months=1)
```

**Edge Case Handling**:
| Original | Next |
|----------|------|
| Jan 31 | Feb 28/29 |
| Jan 30 | Feb 28/29 (if Feb, else March 30) |
| Feb 28 | Mar 28 |
| Feb 29 | Mar 29 |

---

## 7. Frontend Date Formatting

**Decision**: Use relative date formatting for user-friendly display.

**Rationale**:
- "Tomorrow" is more intuitive than "Feb 14, 2026"
- Consistent with modern task app UX (Todoist, Things, etc.)
- Can use Intl.RelativeTimeFormat or date-fns library

**Alternatives Considered**:
- Always absolute dates: Rejected - less intuitive
- Moment.js: Rejected - deprecated, large bundle size

**Implementation Pattern**:
```typescript
// Using date-fns (if added) or custom function
function formatDueDate(date: Date): string {
  const now = new Date();
  const today = startOfDay(now);
  const dueDay = startOfDay(date);
  const diffDays = differenceInDays(dueDay, today);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return format(date, "EEEE");
  return format(date, "MMM d");
}
```

---

## 8. Tag Color Validation

**Decision**: Validate hex color format on backend, allow null for system default.

**Rationale**:
- Hex colors (#RRGGBB) are web standard
- Validation prevents XSS via malformed color values
- Null allows system to assign default color

**Alternatives Considered**:
- Color picker with preset colors only: Rejected - limits user customization
- RGB values: Rejected - more complex storage and transmission

**Validation Pattern**:
```python
import re

def validate_color(color: str | None) -> bool:
    if color is None:
        return True
    return bool(re.match(r'^#[0-9A-Fa-f]{6}$', color))
```

---

## 9. Search Input Debouncing

**Decision**: 300ms debounce with immediate clear.

**Rationale**:
- 300ms balances responsiveness with API call reduction
- Industry standard for search UX (Google, Algolia recommendations)
- Clear button should trigger immediate search (no debounce)

**Alternatives Considered**:
- No debounce: Rejected - excessive API calls
- 500ms debounce: Rejected - feels sluggish
- Client-side filtering: Rejected - doesn't scale with task count

**Implementation Pattern**:
```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    fetchTasks({ search: value });
  }, 300),
  []
);

const handleSearchChange = (value: string) => {
  setSearch(value);
  debouncedSearch(value);
};

const handleClear = () => {
  setSearch("");
  fetchTasks({ search: "" }); // Immediate, no debounce
};
```

---

## 10. Reminder State Management

**Decision**: Application-level reminder state with frontend polling/checking.

**Rationale**:
- No background workers or external schedulers (per constraints)
- Frontend can check reminder_at on each render/interval
- Simple boolean "active" state derivable from reminder_at vs now

**Alternatives Considered**:
- WebSocket notifications: Rejected - requires backend infrastructure
- Service worker: Rejected - complex, limited browser support
- Backend cron job: Rejected - violates no-background-worker constraint

**Implementation Pattern**:
```typescript
const isReminderActive = (task: Task): boolean => {
  if (!task.reminder_at || task.completed) return false;
  return new Date(task.reminder_at) <= new Date();
};

// Optional: Periodic check to update UI
useEffect(() => {
  const interval = setInterval(() => {
    // Force re-render to update reminder states
    setForceUpdate(prev => prev + 1);
  }, 60000); // Check every minute
  return () => clearInterval(interval);
}, []);
```

---

## 11. API Query Parameter Design

**Decision**: Use comma-separated values for multi-value filters (tags).

**Rationale**:
- Standard REST convention
- Easy to parse on backend
- Compatible with URL encoding

**Alternatives Considered**:
- Repeated parameters (?tag=a&tag=b): Rejected - parsing varies by framework
- JSON in query string: Rejected - encoding issues, not standard

**Implementation Pattern**:
```
GET /api/tasks?tags=uuid1,uuid2,uuid3
```

```python
@router.get("/tasks")
async def get_tasks(tags: Optional[str] = None):
    tag_ids = tags.split(",") if tags else []
```

---

## 12. Existing Codebase Patterns

**Findings from codebase exploration**:

| Pattern | Current Implementation | Recommendation |
|---------|----------------------|----------------|
| Model structure | SQLModel with UUID primary keys | Continue pattern |
| Route organization | Feature-based (routes/tasks.py) | Add routes/tags.py |
| Schema structure | Pydantic models in schemas/ | Add schemas/tag.py |
| Response format | `{"task": {...}}` wrapper | Maintain consistency |
| Error handling | Custom exceptions (BadRequestException) | Reuse existing |
| Auth dependency | `Depends(get_current_user)` | Apply to new endpoints |
| Frontend types | types/*.ts files | Add types/tag.ts |
| Hooks | Custom hooks in hooks/*.ts | Add useTags.ts |

---

## Unresolved Items

**None** - All technical decisions have been made based on existing codebase patterns and standard practices.

---

## Dependencies to Add

**Backend**:
- `python-dateutil` - For relativedelta in monthly recurrence calculation (check if already installed)

**Frontend**:
- None required - Can implement with existing dependencies
- Optional: `date-fns` for cleaner date formatting (evaluate bundle size impact)

---

## References

- [SQLModel Many-to-Many Documentation](https://sqlmodel.tiangolo.com/tutorial/many-to-many/)
- [FastAPI Query Parameters](https://fastapi.tiangolo.com/tutorial/query-params/)
- [Python dateutil](https://dateutil.readthedocs.io/)
- [Tailwind CSS Color System](https://tailwindcss.com/docs/customizing-colors)
