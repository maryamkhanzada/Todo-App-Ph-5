'use client'

import { apiClient } from '@/lib/api-client'
import type { Task, TaskFilters, TaskFormData, TaskListResponse, TaskResponse } from '@/types/task'
import { useCallback, useState } from 'react'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [filteredCount, setFilteredCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query string from filters
      const params = new URLSearchParams()

      if (filters?.search) {
        params.set('search', filters.search)
      }
      if (filters?.status && filters.status !== 'all') {
        params.set('status', filters.status)
      }
      if (filters?.priority && filters.priority !== 'all') {
        params.set('priority', filters.priority)
      }
      if (filters?.tags && filters.tags.length > 0) {
        params.set('tags', filters.tags.join(','))
      }
      if (filters?.sort_by) {
        params.set('sort_by', filters.sort_by)
      }
      if (filters?.sort_order) {
        params.set('sort_order', filters.sort_order)
      }

      const queryString = params.toString()
      const url = `/api/tasks${queryString ? `?${queryString}` : ''}`

      const data = await apiClient<TaskListResponse>(url)
      setTasks(data.tasks)
      setTotalCount(data.total)
      setFilteredCount(data.filtered)
      return data
    } catch (err) {
      setError((err as { message: string }).message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTaskById = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient<TaskResponse>(`/api/tasks/${id}`)
      return data.task
    } catch (err) {
      setError((err as { message: string }).message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTask = useCallback(
    async (formData: TaskFormData) => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await apiClient<TaskResponse>('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(formData),
        })

        setTasks((prev) => [data.task, ...prev])
        setTotalCount((prev) => prev + 1)
        setFilteredCount((prev) => prev + 1)
        return data.task
      } catch (err) {
        setError((err as { message: string }).message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const updateTask = useCallback(
    async (id: string, updates: Partial<TaskFormData & { completed: boolean }>) => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await apiClient<TaskResponse>(`/api/tasks/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        })

        // Handle recurring task completion - add new occurrence
        if (data.next_occurrence) {
          setTasks((prev) => [
            data.next_occurrence!,
            ...prev.map((task) => (task.id === id ? data.task : task)),
          ])
          setTotalCount((prev) => prev + 1)
          setFilteredCount((prev) => prev + 1)
        } else {
          setTasks((prev) => prev.map((task) => (task.id === id ? data.task : task)))
        }

        return data
      } catch (err) {
        setError((err as { message: string }).message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const deleteTask = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await apiClient(`/api/tasks/${id}`, { method: 'DELETE' })
      setTasks((prev) => prev.filter((task) => task.id !== id))
      setTotalCount((prev) => prev - 1)
      setFilteredCount((prev) => prev - 1)
    } catch (err) {
      setError((err as { message: string }).message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const toggleCompletion = useCallback(
    async (id: string, completed: boolean) => {
      const originalTasks = [...tasks]
      const originalTotal = totalCount
      const originalFiltered = filteredCount

      // Optimistic update
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, completed } : task))
      )

      try {
        const result = await updateTask(id, { completed })

        // If recurring task and completed, show notification
        if (result.next_occurrence) {
          // The updateTask already handles adding the new occurrence to state
          return { nextOccurrence: result.next_occurrence }
        }

        return {}
      } catch {
        // Rollback on error
        setTasks(originalTasks)
        setTotalCount(originalTotal)
        setFilteredCount(originalFiltered)
        throw new Error('Failed to update task')
      }
    },
    [tasks, totalCount, filteredCount, updateTask]
  )

  return {
    tasks,
    totalCount,
    filteredCount,
    isLoading,
    error,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    toggleCompletion,
  }
}
