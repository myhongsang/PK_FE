import api from './api'
import { API_ENDPOINTS } from '@/constants'

export interface ProductItem {
  id: number
  name: string
  description: string
  price: number | string
  stock: number
}

function mapProduct(raw: any): ProductItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.title ?? '—',
    description: raw?.description ?? raw?.desc ?? '—',
    price: raw?.price ?? '—',
    stock: raw?.stock ?? raw?.quantity ?? 0,
  }
}

export async function getProducts(): Promise<ProductItem[]> {
  try {
    const response = await api.get(API_ENDPOINTS.PRODUCTS)
    const data = response.data
    const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []

    return rows.map(mapProduct)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Không thể tải danh sách sản phẩm. Vui lòng thử lại.'
    )
  }
}