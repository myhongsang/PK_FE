import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { STATUS_ACTIVE } from '@/constants/status'
import { fetchRowsPage } from '@/api/search'
import { excludeInactive } from '@/lib/status'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'

import type { PageResult } from '@/types/pagination'
import type { CreateUserPayload, UserItem } from '@/types/user'

function mapUser(raw: any): UserItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.username ?? raw?.fullName ?? '—',
    email: raw?.email ?? '—',
    role: raw?.role ?? null,
    status: raw?.status ?? STATUS_ACTIVE,
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
      rows: excludeInactive(result.rows.map(mapUser)),
      meta: result.meta,
    }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('users.loadFailed')
    )
  }
}

function unwrap(raw: any): any {
  return raw?.data ?? raw ?? {}
}

export async function createUser(payload: CreateUserPayload): Promise<UserItem> {
  try {
    const response = await api.post(API_ENDPOINTS.USERS, payload)
    void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })

    return mapUser(unwrap(response.data))
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('users.createFailed')
    )
  }
}