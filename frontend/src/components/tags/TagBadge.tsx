'use client'

import { cn } from '@/lib/utils'
import type { Tag } from '@/types/tag'

interface TagBadgeProps {
  tag: Tag
  onRemove?: () => void
  className?: string
}

export function TagBadge({ tag, onRemove, className }: TagBadgeProps) {
  const bgColor = tag.color
    ? { backgroundColor: `${tag.color}20` }
    : undefined

  const textColor = tag.color || '#6B7280'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        !tag.color && 'bg-gray-100 text-gray-700',
        className
      )}
      style={tag.color ? { ...bgColor, color: textColor } : undefined}
    >
      {tag.color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
      )}
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 hover:opacity-70 focus:outline-none"
          aria-label={`Remove ${tag.name} tag`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  )
}
