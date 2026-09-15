export interface ProductItem {
  id: string | number
  name: string
  description: string
  price: number | string
  stock: number
}

export interface ProductPayload {
  name: string
  description?: string
  price?: number
  stock?: number
}
