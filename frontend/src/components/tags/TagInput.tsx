'use client'

import { cn } from '@/lib/utils'
import type { Tag } from '@/types/tag'
import { useEffect, useRef, useState } from 'react'
import { TagBadge } from './TagBadge'

interface TagInputProps {
  selectedTags: Tag[]
  availableTags: Tag[]
  onChange: (tags: Tag[]) => void
  onCreateTag?: (name: string) => Promise<Tag>
  className?: string
}

export function TagInput({
  selectedTags,
  availableTags,
  onChange,
  onCreateTag,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter available tags based on input and exclude already selected
  const filteredTags = availableTags.filter(
    (tag) =>
      !selectedTags.some((st) => st.id === tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Check if we can create a new tag with this name
  const canCreateNew =
    inputValue.trim() &&
    !availableTags.some(
      (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    ) &&
    onCreateTag

  const handleSelect = (tag: Tag) => {
    onChange([...selectedTags, tag])
    setInputValue('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleRemove = (tagId: string) => {
    onChange(selectedTags.filter((t) => t.id !== tagId))
  }

  const handleCreateNew = async () => {
    if (!onCreateTag || !inputValue.trim() || isCreating) return

    setIsCreating(true)
    try {
      const newTag = await onCreateTag(inputValue.trim())
      handleSelect(newTag)
    } catch {
      // Error handled by parent
    } finally {
      setIsCreating(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium">Tags</label>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => handleRemove(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Add tags..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />

        {/* Dropdown */}
        {isOpen && (filteredTags.length > 0 || canCreateNew) && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
            <ul className="max-h-48 overflow-auto py-1">
              {filteredTags.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(tag)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  >
                    {tag.color && (
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    {tag.name}
                  </button>
                </li>
              ))}
              {canCreateNew && (
                <li>
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    disabled={isCreating}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-muted"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {isCreating ? 'Creating...' : `Create "${inputValue}"`}
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
