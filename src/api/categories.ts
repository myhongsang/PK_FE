import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { extractRows, fetchAllRows } from '@/api/search'

import type { CategoryItem } from '@/types/category'

export interface CategoryPayload {
  name: string
  description: string
}

function mapCategory(raw: any): CategoryItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.title ?? raw?.categoryName ?? '—',
    description: raw?.description ?? raw?.desc ?? '—',
  }
}

export async function getCategories(search?: string): Promise<CategoryItem[]> {
  try {
    const term = search?.trim() ?? ''

    const response = term
      ? await fetchAllRows(API_ENDPOINTS.CATEGORIES, { q: term })
      : await api.get(API_ENDPOINTS.CATEGORIES)

    const rows = Array.isArray(response) ? response : extractRows(response.data)

    return rows.map(mapCategory)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('categories.loadFailed')
    )
  }
}

export async function createCategory(payload: CategoryPayload): Promise<CategoryItem> {
  try {
    const response = await api.post(API_ENDPOINTS.CATEGORIES, payload)
    const raw: any = response.data?.data ?? response.data ?? {}

    return mapCategory(raw)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('categories.createFailed')
    )
  }
}

export async function updateCategory(
  id: CategoryItem['id'],
  payload: CategoryPayload,
): Promise<CategoryItem> {
  try {
    const response = await api.put(`${API_ENDPOINTS.CATEGORIES}/${id}`, payload)
    const raw: any = response.data?.data ?? response.data ?? {}

    return mapCategory(raw)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('categories.updateFailed')
    )
  }
}

export async function deleteCategory(id: CategoryItem['id']): Promise<void> {
  try {
    await api.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('categories.deleteFailed')
    )
  }
}