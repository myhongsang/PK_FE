import type { EntityStatus } from '@/constants/status'
import type { UserRole } from '@/constants/role'

export interface UserItem {
  id: number
  name: string
  email: string
  role?: UserRole | string | null
  status: EntityStatus
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
}
