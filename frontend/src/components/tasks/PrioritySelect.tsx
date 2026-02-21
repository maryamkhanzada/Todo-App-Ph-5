'use client'

import { cn, getPriorityColor } from '@/lib/utils'
import type { Priority } from '@/types/task'

interface PrioritySelectProps {
  value: Priority
  onChange: (value: Priority) => void
  className?: string
}

const priorities: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function PrioritySelect({ value, onChange, className }: PrioritySelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium">Priority</label>
      <div className="flex gap-2">
        {priorities.map((priority) => {
          const colors = getPriorityColor(priority.value)
          const isSelected = value === priority.value

          return (
            <button
              key={priority.value}
              type="button"
              onClick={() => onChange(priority.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md border transition-all',
                isSelected
                  ? cn(colors.bg, colors.text, colors.border, 'ring-2 ring-offset-1 ring-primary')
                  : 'bg-background border-input hover:bg-muted'
              )}
            >
              {priority.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
