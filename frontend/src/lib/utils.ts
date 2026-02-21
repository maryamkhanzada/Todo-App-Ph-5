import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export type DueDateState = 'overdue' | 'dueToday' | 'dueSoon' | 'normal' | null

/**
 * Determine the due date state for visual styling
 */
export function getDueDateState(dueDate: string | null): DueDateState {
  if (!dueDate) return null

  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  // Overdue
  if (diffMs < 0) return 'overdue'

  // Due today (within 24 hours and same calendar day)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  if (today.getTime() === dueDay.getTime()) return 'dueToday'

  // Due soon (within 3 days)
  if (diffDays <= 3) return 'dueSoon'

  return 'normal'
}

/**
 * Format a due date as a relative string
 */
export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return ''

  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  // Check if overdue
  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays)
    if (overdueDays === 0) return 'Overdue (today)'
    if (overdueDays === 1) return 'Overdue by 1 day'
    return `Overdue by ${overdueDays} days`
  }

  // Check if today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  if (today.getTime() === dueDay.getTime()) {
    return 'Due today'
  }

  // Check if tomorrow
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (tomorrow.getTime() === dueDay.getTime()) {
    return 'Due tomorrow'
  }

  // Within a week
  if (diffDays <= 7) {
    return `Due in ${diffDays} days`
  }

  // Otherwise, format as date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(due)
}

/**
 * Check if a reminder is currently active (past due but task not completed)
 */
export function isReminderActive(reminderAt: string | null): boolean {
  if (!reminderAt) return false
  return new Date(reminderAt) <= new Date()
}

/**
 * Get priority badge colors
 */
export function getPriorityColor(priority: string): {
  bg: string
  text: string
  border: string
} {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
      }
    case 'medium':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      }
    case 'low':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
      }
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
      }
  }
}

/**
 * Get due date state colors
 */
export function getDueDateColor(state: DueDateState): {
  bg: string
  text: string
} {
  switch (state) {
    case 'overdue':
      return { bg: 'bg-red-50', text: 'text-red-600' }
    case 'dueToday':
      return { bg: 'bg-orange-50', text: 'text-orange-600' }
    case 'dueSoon':
      return { bg: 'bg-yellow-50', text: 'text-yellow-600' }
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600' }
  }
}
