import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { fetchRowsPage } from '@/api/search'

import type { PageResult } from '@/types/pagination'
import type { ProductItem, ProductPayload } from '@/types/product'

function mapProduct(raw: any): ProductItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.title ?? '—',
    description: raw?.description ?? raw?.desc ?? '—',
    price: raw?.price ?? '—',
    stock: raw?.stock ?? raw?.quantity ?? 0,
    categoryId: raw?.categoryId ?? null,
  }
}

export interface ProductFilters {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
}

export async function getProducts(
  search?: string,
  page = 1,
  filters: ProductFilters = {},
): Promise<PageResult<ProductItem>> {
  try {
    const term = search?.trim() ?? ''
    const params: Record<string, string | number | undefined> = {}

    if (term)
      params.q = term

    if (filters.categoryId)
      params.categoryId = filters.categoryId

    if (filters.minPrice !== undefined)
      params.minPrice = filters.minPrice

    if (filters.maxPrice !== undefined)
      params.maxPrice = filters.maxPrice

    const result = await fetchRowsPage<ProductItem>(
      API_ENDPOINTS.PRODUCTS,
      page,
      params,
    )

    return {
      rows: result.rows.map(mapProduct),
      meta: result.meta,
    }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('products.loadFailed')
    )
  }
}

function unwrap(raw: any): any {
  return raw?.data ?? raw ?? {}
}

export async function createProduct(payload: ProductPayload): Promise<ProductItem> {
  try {
    const response = await api.post(API_ENDPOINTS.PRODUCTS, payload)

    return mapProduct(unwrap(response.data))
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('products.createFailed')
    )
  }
}

export async function updateProduct(
  id: ProductItem['id'],
  payload: ProductPayload,
): Promise<ProductItem> {
  try {
    const response = await api.patch(`${API_ENDPOINTS.PRODUCTS}/${id}`, payload)

    return mapProduct(unwrap(response.data))
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('products.updateFailed')
    )
  }
}

export async function deleteProduct(id: ProductItem['id']): Promise<void> {
  try {
    await api.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('products.deleteFailed')
    )
  }
}