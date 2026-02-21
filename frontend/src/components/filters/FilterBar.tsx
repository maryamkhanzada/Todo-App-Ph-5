'use client'

import type { Tag } from '@/types/tag'
import type { Priority, TaskFilters } from '@/types/task'
import { SearchInput } from './SearchInput'
import { SortSelect } from './SortSelect'

interface FilterBarProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  tags: Tag[]
  className?: string
}

export function FilterBar({ filters, onFiltersChange, tags, className }: FilterBarProps) {
  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      priority: 'all',
      tags: [],
      sort_by: 'created_at',
      sort_order: 'desc',
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.tags && filters.tags.length > 0)

  return (
    <div className={className}>
      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={filters.search || ''}
          onChange={(value) => updateFilter('search', value)}
          placeholder="Search tasks..."
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <select
          value={filters.status || 'all'}
          onChange={(e) => updateFilter('status', e.target.value as TaskFilters['status'])}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        {/* Priority filter */}
        <select
          value={filters.priority || 'all'}
          onChange={(e) => updateFilter('priority', e.target.value as Priority | 'all')}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Tags filter */}
        {tags.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              const tagId = e.target.value
              if (tagId && !filters.tags?.includes(tagId)) {
                updateFilter('tags', [...(filters.tags || []), tagId])
              }
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Add tag filter...</option>
            {tags
              .filter((tag) => !filters.tags?.includes(tag.id))
              .map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
          </select>
        )}

        {/* Sort */}
        <SortSelect
          sortBy={filters.sort_by || 'created_at'}
          sortOrder={filters.sort_order || 'desc'}
          onSortByChange={(value) => updateFilter('sort_by', value)}
          onSortOrderChange={(value) => updateFilter('sort_order', value)}
        />

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Active tag filters */}
      {filters.tags && filters.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.tags.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId)
            if (!tag) return null

            return (
              <span
                key={tagId}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() =>
                    updateFilter(
                      'tags',
                      filters.tags?.filter((id) => id !== tagId) || []
                    )
                  }
                  className="hover:opacity-70"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
