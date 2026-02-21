'use client'

import { TagInput } from '@/components/tags/TagInput'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTags } from '@/hooks/useTags'
import type { Tag } from '@/types/tag'
import type { Priority, Recurrence, Task, TaskFormData } from '@/types/task'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { DueDatePicker } from './DueDatePicker'
import { PrioritySelect } from './PrioritySelect'
import { RecurrenceSelect } from './RecurrenceSelect'

interface TaskFormProps {
  initialData?: Task
  onSubmit: (data: TaskFormData) => Promise<void>
  submitLabel?: string
}

export function TaskForm({
  initialData,
  onSubmit,
  submitLabel = 'Create Task',
}: TaskFormProps) {
  const router = useRouter()
  const { tags: availableTags, fetchTags, createTag } = useTags()

  const [formData, setFormData] = useState<{
    title: string
    description: string
    priority: Priority
    due_date: string | null
    recurrence: Recurrence | null
    reminder_at: string | null
    selectedTags: Tag[]
  }>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    due_date: initialData?.due_date || null,
    recurrence: initialData?.recurrence || null,
    reminder_at: initialData?.reminder_at || null,
    selectedTags: initialData?.tags || [],
  })

  const [formErrors, setFormErrors] = useState<{ title?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available tags on mount
  useEffect(() => {
    fetchTags().catch(() => {
      // Ignore error - tags are optional
    })
  }, [fetchTags])

  const validateForm = (): boolean => {
    const errors: { title?: string } = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    } else if (formData.title.length > 255) {
      errors.title = 'Title must be less than 255 characters'
    }

    // Validate recurrence requires due_date
    if (formData.recurrence && !formData.due_date) {
      setError('Due date is required for recurring tasks')
      return false
    }

    // Validate reminder requires due_date
    if (formData.reminder_at && !formData.due_date) {
      setError('Due date is required to set a reminder')
      return false
    }

    // Validate reminder is before due_date
    if (formData.reminder_at && formData.due_date) {
      if (new Date(formData.reminder_at) > new Date(formData.due_date)) {
        setError('Reminder must be before or equal to due date')
        return false
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const submitData: TaskFormData = {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        due_date: formData.due_date,
        recurrence: formData.recurrence,
        reminder_at: formData.reminder_at,
        tag_ids: formData.selectedTags.map((t) => t.id),
      }

      await onSubmit(submitData)
      router.push('/app/tasks')
    } catch (err) {
      setError((err as { message: string }).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/app/tasks')
  }

  const handleCreateTag = async (name: string): Promise<Tag> => {
    return await createTag({ name })
  }

  // Clear recurrence if due_date is cleared
  const handleDueDateChange = (value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      due_date: value,
      recurrence: value ? prev.recurrence : null,
      reminder_at: value ? prev.reminder_at : null,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Input
          label="Title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={formErrors.title}
          placeholder="Enter task title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>

      {/* Priority */}
      <PrioritySelect
        value={formData.priority}
        onChange={(value) => setFormData({ ...formData, priority: value })}
      />

      {/* Due Date */}
      <DueDatePicker
        value={formData.due_date}
        onChange={handleDueDateChange}
      />

      {/* Recurrence - only enabled if due_date is set */}
      <RecurrenceSelect
        value={formData.recurrence}
        onChange={(value) => setFormData({ ...formData, recurrence: value })}
        disabled={!formData.due_date}
      />

      {/* Reminder */}
      {formData.due_date && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Reminder</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, reminder_at: null })}
              className={`rounded-md border px-3 py-1 text-sm ${
                !formData.reminder_at
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-background hover:bg-muted'
              }`}
            >
              No reminder
            </button>
            <button
              type="button"
              onClick={() => {
                if (formData.due_date) {
                  const due = new Date(formData.due_date)
                  due.setHours(due.getHours() - 1)
                  setFormData({ ...formData, reminder_at: due.toISOString() })
                }
              }}
              className={`rounded-md border px-3 py-1 text-sm ${
                formData.reminder_at ? 'border-primary bg-primary/10 text-primary' : 'border-input bg-background hover:bg-muted'
              }`}
            >
              1 hour before
            </button>
            <button
              type="button"
              onClick={() => {
                if (formData.due_date) {
                  const due = new Date(formData.due_date)
                  due.setDate(due.getDate() - 1)
                  setFormData({ ...formData, reminder_at: due.toISOString() })
                }
              }}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm hover:bg-muted"
            >
              1 day before
            </button>
          </div>
          {formData.reminder_at && (
            <p className="text-xs text-muted-foreground">
              Reminder set for: {new Date(formData.reminder_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Tags */}
      <TagInput
        selectedTags={formData.selectedTags}
        availableTags={availableTags}
        onChange={(tags) => setFormData({ ...formData, selectedTags: tags })}
        onCreateTag={handleCreateTag}
      />

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={handleCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
