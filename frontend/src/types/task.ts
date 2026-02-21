import type { Tag } from './tag'

export type Priority = 'low' | 'medium' | 'high'
export type Recurrence = 'daily' | 'weekly' | 'monthly'

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: Priority
  due_date: string | null
  recurrence: Recurrence | null
  reminder_at: string | null
  tags: Tag[]
  user_id: string
  created_at: string
  updated_at: string
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  filtered: number
}

export interface TaskResponse {
  task: Task
  next_occurrence?: Task
}

export interface TaskFormData {
  title: string
  description?: string
  priority?: Priority
  due_date?: string | null
  recurrence?: Recurrence | null
  reminder_at?: string | null
  tag_ids?: string[]
}

export interface TaskFilters {
  search?: string
  status?: 'all' | 'pending' | 'completed'
  priority?: Priority | 'all'
  tags?: string[]
  sort_by?: 'created_at' | 'priority' | 'due_date'
  sort_order?: 'asc' | 'desc'
}
