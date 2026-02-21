'use client'

import { cn, getPriorityColor } from '@/lib/utils'
import type { Priority } from '@/types/task'

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colors = getPriorityColor(priority)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {priorityLabels[priority]}
    </span>
  )
}
