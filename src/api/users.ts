import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { fetchRowsPage } from '@/api/search'

import type { PageResult } from '@/types/pagination'
import type { UserItem } from '@/types/user'

function mapUser(raw: any): UserItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.username ?? raw?.fullName ?? '—',
    email: raw?.email ?? '—',
  }
}

export async function getUsers(
  search?: string,
  page = 1,
): Promise<PageResult<UserItem>> {
  try {
    const term = search?.trim() ?? ''

    const result = await fetchRowsPage<UserItem>(
      API_ENDPOINTS.USERS,
      page,
      term ? { q: term } : undefined,
    )

    return {
      rows: result.rows.map(mapUser),
      meta: result.meta,
    }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('users.loadFailed')
    )
  }
}