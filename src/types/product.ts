export interface ProductItem {
  id: string | number
  name: string
  description: string
  price: number | string
  stock: number
  categoryId: string | number | null
}

export interface ProductPayload {
  name: string
  description?: string
  price?: number
  stock?: number
  categoryId?: string
}
