import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'

import type { ProductItem } from '@/types/product'

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
      i18n.global.t('products.loadFailed')
    )
  }
}