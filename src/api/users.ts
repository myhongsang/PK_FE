import api from './api'
import { API_ENDPOINTS } from '@/constants'

export interface UserItem {
  id: number
  name: string
  email: string
}

function mapUser(raw: any): UserItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.username ?? raw?.fullName ?? '—',
    email: raw?.email ?? '—',
  }
}

export async function getUsers(): Promise<UserItem[]> {
  try {
    const response = await api.get(API_ENDPOINTS.USERS)
    const data = response.data
    const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []

    return rows.map(mapUser)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Không thể tải danh sách người dùng. Vui lòng thử lại.'
    )
  }
}