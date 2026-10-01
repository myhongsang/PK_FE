import type { EntityStatus } from '@/constants/status'

export interface UserItem {
  id: number
  name: string
  email: string
  status: EntityStatus
}