import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'

import type { OrderStats } from '@/types/order'

function toNumber(value: any): number {
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function mapStats(raw: any): OrderStats {
  return {
    count: toNumber(raw?.orderCount),
    totalValue: toNumber(raw?.orderValue),
    paid: toNumber(raw?.totalPaid),
    unpaid: toNumber(raw?.totalUnpaid),
  }
}

export async function getOrderStatistics(): Promise<OrderStats> {
  try {
    const response = await api.get(API_ENDPOINTS.ORDER_STATISTICS)
    const raw: any = response.data?.data ?? response.data ?? {}

    return mapStats(raw)
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('statistics.loadFailed')
    )
  }
}
