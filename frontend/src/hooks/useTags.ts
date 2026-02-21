'use client'

import { apiClient } from '@/lib/api-client'
import type { Tag, TagFormData, TagListResponse, TagResponse } from '@/types/tag'
import { useCallback, useState } from 'react'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient<TagListResponse>('/api/tags')
      setTags(data.tags)
      return data.tags
    } catch (err) {
      setError((err as { message: string }).message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTag = useCallback(
    async (formData: TagFormData) => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await apiClient<TagResponse>('/api/tags', {
          method: 'POST',
          body: JSON.stringify(formData),
        })

        setTags((prev) => [...prev, data.tag])
        return data.tag
      } catch (err) {
        setError((err as { message: string }).message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const updateTag = useCallback(
    async (id: string, updates: Partial<TagFormData>) => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await apiClient<TagResponse>(`/api/tags/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        })

        setTags((prev) => prev.map((tag) => (tag.id === id ? data.tag : tag)))
        return data.tag
      } catch (err) {
        setError((err as { message: string }).message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const deleteTag = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await apiClient(`/api/tags/${id}`, { method: 'DELETE' })
      setTags((prev) => prev.filter((tag) => tag.id !== id))
    } catch (err) {
      setError((err as { message: string }).message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
  }
}
