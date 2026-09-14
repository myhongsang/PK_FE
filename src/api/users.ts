import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'

import type { UserItem } from '@/types/user'

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
      i18n.global.t('users.loadFailed')
    )
  }
}