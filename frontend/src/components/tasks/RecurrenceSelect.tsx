'use client'

import { cn } from '@/lib/utils'
import type { Recurrence } from '@/types/task'

interface RecurrenceSelectProps {
  value: Recurrence | null
  onChange: (value: Recurrence | null) => void
  disabled?: boolean
  className?: string
}

const recurrenceOptions: { value: Recurrence | 'none'; label: string }[] = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function RecurrenceSelect({
  value,
  onChange,
  disabled,
  className,
}: RecurrenceSelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium">Repeat</label>
      <select
        value={value || 'none'}
        onChange={(e) => {
          const val = e.target.value
          onChange(val === 'none' ? null : (val as Recurrence))
        }}
        disabled={disabled}
        className={cn(
          'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {recurrenceOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {disabled && (
        <p className="text-xs text-muted-foreground">
          Set a due date to enable recurrence
        </p>
      )}
    </div>
  )
}
