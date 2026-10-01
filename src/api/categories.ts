import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { STATUS_ACTIVE } from '@/constants/status'
import { fetchRowsPage } from '@/api/search'
import { excludeInactive } from '@/lib/status'
import { buildCacheKey, getCached, invalidatePageCache, setCached } from '@/lib/page-cache'

import type { PageResult } from '@/types/pagination'
import type { CategoryItem, CategoryPayload } from '@/types/category'

export type { CategoryPayload }


function mapCategory(raw: any): CategoryItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.title ?? raw?.categoryName ?? '—',
    description: raw?.description ?? raw?.desc ?? '—',
    status: raw?.status ?? STATUS_ACTIVE,
  }
}

export async function getCategories(
  search?: string,
  page = 1,
): Promise<PageResult<CategoryItem>> {
  try {
    const term = search?.trim() ?? ''

    const result = await fetchRowsPage<CategoryItem>(
      API_ENDPOINTS.CATEGORIES,
      page,
      term ? { q: term } : undefined,
    )

    return {
      rows: excludeInactive(result.rows.map(mapCategory)),
      meta: result.meta,
    }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('categories.loadFailed')
    )
  }
}

function invalidateCategoryCaches(): void {
  invalidatePageCache('categories')
  invalidatePageCache('products')
}

export async function getAllCategories(): Promise<CategoryItem[]> {
  const cacheKey = buildCacheKey('categories', { all: 1 })
  const cached = getCached<CategoryItem[]>(cacheKey)

  if (cached)
    return cached

  const all: CategoryItem[] = []
  const maxPages = 20

  for (let page = 1; page <= maxPages; page++) {
    const result = await getCategories('', page)

    all.push(...result.rows)

    if (result.rows.length === 0 || page >= result.meta.totalPages)
      break
  }

  return setCached(cacheKey, all)
}

export async function createCategory(payload: CategoryPayload): Promise<CategoryItem> {
  try {
    const response = await api.post(API_ENDPOINTS.CATEGORIES, payload)
    const raw: any = response.data?.data ?? response.data ?? {}
    invalidateCategoryCaches()

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
    invalidateCategoryCaches()

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
    if (error.response?.status !== 404)
      throw new Error(
        error.response?.data?.message ||
        i18n.global.t('categories.deleteFailed')
      )
  }

  invalidateCategoryCaches()
}