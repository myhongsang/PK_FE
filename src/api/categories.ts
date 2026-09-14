import api from '@/api/api'
import { API_ENDPOINTS } from '@/constants/api'

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

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const response = await api.get(API_ENDPOINTS.CATEGORIES)
    const data = response.data
    const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []

    return rows.map(mapCategory)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Không thể tải danh sách danh mục. Vui lòng thử lại.'
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
      'Không thể thêm danh mục. Vui lòng thử lại.'
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
      'Không thể cập nhật danh mục. Vui lòng thử lại.'
    )
  }
}

export async function deleteCategory(id: CategoryItem['id']): Promise<void> {
  try {
    await api.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Không thể xoá danh mục. Vui lòng thử lại.'
    )
  }
}