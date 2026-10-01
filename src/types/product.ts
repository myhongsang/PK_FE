import type { EntityStatus } from '@/constants/status'

export interface ProductItem {
  id: string | number
  name: string
  description: string
  price: number | string
  stock: number
  categoryId: string | number | null
  status: EntityStatus
}

export interface ProductPayload {
  name: string
  description?: string
  price?: number
  stock?: number
  categoryId?: string
}
