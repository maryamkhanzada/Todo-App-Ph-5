'use client'

import { FilterBar } from '@/components/filters/FilterBar'
import type { Tag } from '@/types/tag'
import type { Task, TaskFilters } from '@/types/task'
import Link from 'next/link'
import { Button } from '../ui/Button'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  tags: Tag[]
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  totalCount: number
  filteredCount: number
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onRecurringComplete?: (nextTask: Task) => void
}

export function TaskList({
  tasks,
  tags,
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  onToggle,
  onDelete,
  onRecurringComplete,
}: TaskListProps) {
  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.tags && filters.tags.length > 0)

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        tags={tags}
      />

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {hasActiveFilters
            ? `Showing ${filteredCount} of ${totalCount} tasks`
            : `${totalCount} tasks`}
        </span>
        <Link href="/app/tasks/new">
          <Button size="sm">New Task</Button>
        </Link>
      </div>

      {/* Task list or empty state */}
      {tasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-background p-12 text-center">
          {hasActiveFilters ? (
            <>
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="mt-2 text-sm text-secondary">
                Try adjusting your filters or search term
              </p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() =>
                  onFiltersChange({
                    search: '',
                    status: 'all',
                    priority: 'all',
                    tags: [],
                    sort_by: 'created_at',
                    sort_order: 'desc',
                  })
                }
              >
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium">No tasks yet</h3>
              <p className="mt-2 text-sm text-secondary">
                Create your first task to get started
              </p>
              <Link href="/app/tasks/new">
                <Button className="mt-4">Create Task</Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
