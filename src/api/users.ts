import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { extractRows, fetchAllRows } from '@/api/search'

import type { UserItem } from '@/types/user'

function mapUser(raw: any): UserItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.username ?? raw?.fullName ?? '—',
    email: raw?.email ?? '—',
  }
}

export async function getUsers(search?: string): Promise<UserItem[]> {
  try {
    const term = search?.trim() ?? ''

    const response = term
      ? await fetchAllRows(API_ENDPOINTS.USERS, { q: term })
      : await api.get(API_ENDPOINTS.USERS)

    const rows = Array.isArray(response) ? response : extractRows(response.data)

    return rows.map(mapUser)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('users.loadFailed')
    )
  }
}