export interface Tag {
  id: string
  name: string
  color: string | null
  user_id: string
  created_at: string
}

export interface TagListResponse {
  tags: Tag[]
}

export interface TagResponse {
  tag: Tag
}

export interface TagFormData {
  name: string
  color?: string
}
