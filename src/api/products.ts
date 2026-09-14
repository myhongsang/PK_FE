import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { extractRows, fetchAllRows } from '@/api/search'

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

export async function getProducts(search?: string): Promise<ProductItem[]> {
  try {
    const term = search?.trim() ?? ''

    const response = term
      ? await fetchAllRows(API_ENDPOINTS.PRODUCTS, { q: term })
      : await api.get(API_ENDPOINTS.PRODUCTS)

    const rows = Array.isArray(response) ? response : extractRows(response.data)

    return rows.map(mapProduct)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('products.loadFailed')
    )
  }
}