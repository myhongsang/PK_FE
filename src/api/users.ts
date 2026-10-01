import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'
import { STATUS_ACTIVE } from '@/constants/status'
import { fetchRowsPage } from '@/api/search'
import { excludeInactive } from '@/lib/status'

import type { PageResult } from '@/types/pagination'
import type { UserItem } from '@/types/user'

function mapUser(raw: any): UserItem {
  return {
    id: raw?.id,
    name: raw?.name ?? raw?.username ?? raw?.fullName ?? '—',
    email: raw?.email ?? '—',
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
      // Bản ghi đã xoá (status INACTIVE) không bao giờ được hiển thị lại,
      // kể cả khi API trả về đầy đủ dữ liệu.
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