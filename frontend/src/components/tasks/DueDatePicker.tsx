'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'

interface DueDatePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  className?: string
}

export function DueDatePicker({ value, onChange, className }: DueDatePickerProps) {
  const [showQuickOptions, setShowQuickOptions] = useState(false)

  // Format date for input
  const formatForInput = (dateStr: string | null): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    return date.toISOString().slice(0, 16)
  }

  // Parse input value to ISO string
  const parseInput = (inputValue: string): string | null => {
    if (!inputValue) return null
    return new Date(inputValue).toISOString()
  }

  // Quick date options
  const setQuickDate = (daysFromNow: number, hours = 17, minutes = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    date.setHours(hours, minutes, 0, 0)
    onChange(date.toISOString())
    setShowQuickOptions(false)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium">Due Date</label>

      <div className="relative">
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={formatForInput(value)}
            onChange={(e) => onChange(parseInput(e.target.value))}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
              aria-label="Clear due date"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick options toggle */}
        <button
          type="button"
          onClick={() => setShowQuickOptions(!showQuickOptions)}
          className="mt-2 text-sm text-primary hover:underline"
        >
          {showQuickOptions ? 'Hide quick options' : 'Quick options'}
        </button>

        {/* Quick options */}
        {showQuickOptions && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm hover:bg-muted"
            >
              Today 5PM
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm hover:bg-muted"
            >
              Tomorrow 5PM
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(7)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm hover:bg-muted"
            >
              Next Week
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(14)}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm hover:bg-muted"
            >
              In 2 Weeks
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
