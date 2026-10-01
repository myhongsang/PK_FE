import type { EntityStatus } from '@/constants/status'

export interface CategoryItem {
  id: number
  name: string
  description: string
  status: EntityStatus
}

export interface CategoryPayload {
  name: string
  description: string
}
