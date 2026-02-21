'use client'

import type { TaskFilters } from '@/types/task'

interface SortSelectProps {
  sortBy: NonNullable<TaskFilters['sort_by']>
  sortOrder: NonNullable<TaskFilters['sort_order']>
  onSortByChange: (value: NonNullable<TaskFilters['sort_by']>) => void
  onSortOrderChange: (value: NonNullable<TaskFilters['sort_order']>) => void
}

const sortOptions: { value: NonNullable<TaskFilters['sort_by']>; label: string }[] = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'priority', label: 'Priority' },
  { value: 'due_date', label: 'Due Date' },
]

export function SortSelect({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as NonNullable<TaskFilters['sort_by']>)}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="rounded-md border border-input bg-background p-1.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
      >
        {sortOrder === 'asc' ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
      </button>
    </div>
  )
}
