'use client'

import { TagBadge } from '@/components/tags/TagBadge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  cn,
  formatDueDate,
  getDueDateColor,
  getDueDateState,
  isReminderActive,
} from '@/lib/utils'
import type { Task } from '@/types/task'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PriorityBadge } from './PriorityBadge'

interface TaskCardProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const router = useRouter()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggle = () => {
    onToggle(task.id, !task.completed)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(task.id)
      setIsDeleteModalOpen(false)
    } catch {
      // Error handled by parent
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    router.push(`/app/tasks/${task.id}/edit`)
  }

  const dueDateState = getDueDateState(task.due_date)
  const dueDateColors = getDueDateColor(dueDateState)
  const hasActiveReminder = !task.completed && isReminderActive(task.reminder_at)

  return (
    <>
      <div
        className={cn(
          'rounded-lg border bg-background p-4 transition-shadow hover:shadow-md',
          hasActiveReminder && 'ring-2 ring-orange-400 ring-offset-1',
          task.completed && 'opacity-60'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed && (
              <svg
                className="h-full w-full text-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with title and badges */}
            <div className="flex items-start gap-2 flex-wrap">
              <h3
                className={cn(
                  'text-lg font-medium',
                  task.completed && 'text-secondary line-through'
                )}
              >
                {task.title}
              </h3>
              <PriorityBadge priority={task.priority} />
              {task.recurrence && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {task.recurrence}
                </span>
              )}
              {hasActiveReminder && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Reminder
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p
                className={cn(
                  'mt-1 text-sm',
                  task.completed ? 'text-secondary/70' : 'text-secondary',
                  'line-clamp-2'
                )}
              >
                {task.description}
              </p>
            )}

            {/* Meta row: tags, due date */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              )}

              {/* Due date */}
              {task.due_date && !task.completed && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium',
                    dueDateColors.bg,
                    dueDateColors.text
                  )}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDueDate(task.due_date)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              aria-label="Edit task"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-destructive hover:bg-destructive/10"
              aria-label="Delete task"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
      />
    </>
  )
}
