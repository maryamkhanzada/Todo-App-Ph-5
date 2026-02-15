---
id: 003
title: Advanced Task Features Task Breakdown
stage: tasks
date: 2026-02-13
surface: agent
model: claude-opus-4-5-20251101
feature: 004-advanced-task-features
branch: main
user: user
command: /sp.tasks
labels: ["tasks", "implementation", "breakdown", "priorities", "tags", "search", "filtering", "recurring", "reminders"]
links:
  spec: specs/004-advanced-task-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-advanced-task-features/tasks.md
tests:
  - N/A (task generation phase)
---

## Prompt

/sp.tasks

Execute task generation workflow based on design documents from /specs/004-advanced-task-features/:
- plan.md (tech stack, libraries, structure)
- spec.md (user stories with priorities P1-P3)
- data-model.md (entities)
- contracts/api-endpoints.md (API endpoints)
- research.md (decisions)
- quickstart.md (test scenarios)

Generate tasks organized by user story for independent implementation and testing.

## Response snapshot

Generated comprehensive task breakdown with **120 tasks** across 10 phases:

**Phase 1: Setup (18 tasks)**
- Backend model foundation: enums, fields, Tag/TaskTag models
- Schema updates for task and tag operations

**Phase 2: Foundational (15 tasks)**
- Tag CRUD endpoints (T019-T026)
- Recurrence service (T027-T029)
- Frontend types and hooks (T030-T033)

**Phase 3: US1 - Priority (9 tasks)**
- Backend priority validation and sorting
- PriorityBadge, PrioritySelect components
- TaskCard and TaskForm integration

**Phase 4: US2 - Search (8 tasks)**
- ILIKE search on title/description
- SearchInput with 300ms debounce
- Empty state handling

**Phase 5: US3 - Filter/Sort (15 tasks)**
- Status, priority, tags filters
- Sort by created_at, priority, due_date
- FilterBar, SortSelect components
- URL state persistence

**Phase 6: US4 - Tags (13 tasks)**
- Tag linking in task create/update
- TagBadge, TagInput, TagManager components
- Autocomplete and inline creation

**Phase 7: US5 - Due Dates (9 tasks)**
- DueDatePicker with quick options
- Overdue/due soon indicators
- Relative date formatting

**Phase 8: US6 - Recurring (11 tasks)**
- Recurrence validation and logic
- RecurrenceSelect component
- Next occurrence creation on completion

**Phase 9: US7 - Reminders (9 tasks)**
- Reminder validation
- ReminderPicker component
- Active reminder indicators

**Phase 10: Polish (13 tasks)**
- MCP tools updates
- Database indexes
- Manual testing validation

**Key Features:**
- 7 user stories mapped from spec.md
- Parallel opportunities identified (20+ tasks)
- MVP scope defined (65 tasks for Phases 1-5)
- Incremental delivery strategy
- User story dependencies documented

## Outcome

- ✅ Impact: 120 executable tasks ready for implementation
- 🧪 Tests: Tests marked as optional (include if time permits)
- 📁 Files: 1 file created (tasks.md)
- 🔁 Next prompts: /sp.implement to begin implementation, or manually execute tasks
- 🧠 Reflection: Organized by user story for independent testing. MVP scope clearly defined as first 65 tasks (Phases 1-5). Parallel opportunities marked with [P] for team efficiency.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation completed successfully
- Graders run and results (PASS/FAIL): Format validation PASS (all tasks have checkbox, ID, story label, file path)
- Prompt variant (if applicable): Standard /sp.tasks workflow with user story organization
- Next experiment (smallest change to try): Consider adding estimated effort per task for planning
