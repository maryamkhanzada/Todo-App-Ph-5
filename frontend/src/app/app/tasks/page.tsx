'use client'

import { TaskList } from '@/components/tasks/TaskList'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { useTags } from '@/hooks/useTags'
import { useTasks } from '@/hooks/useTasks'
import type { TaskFilters } from '@/types/task'
import { useCallback, useEffect, useState } from 'react'

export default function TasksPage() {
  const {
    tasks,
    totalCount,
    filteredCount,
    isLoading,
    error,
    fetchTasks,
    toggleCompletion,
    deleteTask,
  } = useTasks()

  const { tags, fetchTags } = useTags()

  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    tags: [],
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const [notification, setNotification] = useState<string | null>(null)

  // Fetch tasks when filters change
  useEffect(() => {
    fetchTasks(filters)
  }, [fetchTasks, filters])

  // Fetch tags on mount
  useEffect(() => {
    fetchTags().catch(() => {
      // Ignore - tags are optional
    })
  }, [fetchTags])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters)
  }, [])

  // Handle task toggle with recurring task notification
  const handleToggle = useCallback(
    async (id: string, completed: boolean) => {
      try {
        const result = await toggleCompletion(id, completed)
        if (result?.nextOccurrence) {
          setNotification('Next occurrence created for recurring task')
          setTimeout(() => setNotification(null), 3000)
        }
      } catch {
        // Error handled by hook
      }
    },
    [toggleCompletion]
  )

  if (isLoading && tasks.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Tasks</h1>
        </div>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">My Tasks</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">Error loading tasks</p>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={() => fetchTasks(filters)} variant="secondary">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          {notification}
        </div>
      )}

      <TaskList
        tasks={tasks}
        tags={tags}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalCount={totalCount}
        filteredCount={filteredCount}
        onToggle={handleToggle}
        onDelete={deleteTask}
      />
    </div>
  )
}
