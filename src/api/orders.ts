import api from '@/api/api'
import i18n from '@/i18n'
import { API_ENDPOINTS } from '@/constants/api'

import type {
  OrderStats,
  RevenuePoint,
  RevenueRange,
  StatisticsResponse,
  TopProduct,
} from '@/types/order'

function toNumber(value: any): number {
  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function mapStats(raw: any): OrderStats {
  return {
    count: toNumber(raw?.orderCount ?? raw?.count ?? raw?.totalOrders),
    totalValue: toNumber(raw?.orderValue ?? raw?.totalValue ?? raw?.totalRevenue ?? raw?.revenue),
    paid: toNumber(raw?.totalPaid ?? raw?.paid ?? raw?.collected),
    unpaid: toNumber(raw?.totalUnpaid ?? raw?.unpaid ?? raw?.outstanding),
  }
}

function mapRevenuePoint(raw: any): RevenuePoint {
  const label =
    raw?.label ?? raw?.date ?? raw?.day ?? raw?.month ?? raw?.name ?? ''
  const revenue = toNumber(
    raw?.revenue ?? raw?.total ?? raw?.totalRevenue ?? raw?.income ?? raw?.value ?? raw?.amount,
  )
  const orderCount = toNumber(
    raw?.orderCount ?? raw?.orders ?? raw?.count ?? raw?.totalOrders,
  )

  return { label: String(label), revenue, orderCount }
}

function unwrapList(value: any): any[] {
  if (Array.isArray(value))
    return value
  if (!value || typeof value !== 'object')
    return []
  const list =
    value?.items ?? value?.rows ?? value?.points ?? value?.series ?? value?.list ?? value?.data ?? []

  return Array.isArray(list) ? list : []
}

function pickRevenueList(raw: any): any[] {
  const candidates = [
    raw?.revenue,
    raw?.revenueByRange,
    raw?.revenueByDay,
    raw?.revenueByMonth,
    raw?.revenueChart,
    raw?.revenueSeries,
    raw?.dailyRevenue,
    raw?.monthlyRevenue,
    raw?.chart,
    raw?.series,
  ]
  for (const c of candidates) {
    if (Array.isArray(c) && c.length)
      return c
    if (c && typeof c === 'object' && !Array.isArray(c)) {
      const merged = [
        ...(Array.isArray(c['7d']) ? c['7d'] : []),
        ...(Array.isArray(c['30d']) ? c['30d'] : []),
        ...(Array.isArray(c['12m']) ? c['12m'] : []),
      ]
      if (merged.length)
        return merged
    }
  }
  const flat = unwrapList(raw)
  const points = flat.filter(
    item => item && typeof item === 'object' && ('revenue' in item || 'date' in item || 'label' in item),
  )

  return points.length ? points : flat
}

function pickRevenueByRange(raw: any): Partial<Record<RevenueRange, RevenuePoint[]>> | undefined {
  const holder =
    (raw?.revenueByRange && typeof raw.revenueByRange === 'object' ? raw.revenueByRange : undefined)
    ?? (raw?.revenue && typeof raw.revenue === 'object' && !Array.isArray(raw.revenue) ? raw.revenue : undefined)
  if (holder) {
    const out: Partial<Record<RevenueRange, RevenuePoint[]>> = {}
    for (const key of ['7d', '30d', '12m'] as RevenueRange[]) {
      const list = unwrapList(holder[key])
      if (list.length)
        out[key] = list.map(mapRevenuePoint)
    }
    if (Object.keys(out).length)
      return out
  }

  const byDay = unwrapList(raw?.revenueByDay)
  const byMonth = unwrapList(raw?.revenueByMonth)
  if (byDay.length || byMonth.length) {
    const days = byDay.map(mapRevenuePoint)
    const months = byMonth.map(mapRevenuePoint)
    days.sort((a, b) => a.label.localeCompare(b.label))
    months.sort((a, b) => a.label.localeCompare(b.label))

    return {
      '7d': days.slice(-7),
      '30d': days.slice(-30),
      '12m': months.length ? months.slice(-12) : days.slice(-12),
    }
  }

  return undefined
}

function mapTopProduct(raw: any, index: number): TopProduct {
  return {
    id: raw?.id ?? raw?.productId ?? index,
    name: raw?.name ?? raw?.title ?? raw?.productName ?? '—',
    sold: toNumber(raw?.sold ?? raw?.quantity ?? raw?.totalSold ?? raw?.count ?? raw?.soldCount),
    revenue: toNumber(raw?.revenue ?? raw?.totalRevenue ?? raw?.total ?? raw?.value ?? raw?.amount),
    orderCount: toNumber(raw?.orderCount ?? raw?.orders ?? 0),
  }
}

function pickTopList(raw: any): any[] {
  const candidates = [
    raw?.topProducts,
    raw?.topSelling,
    raw?.bestSellers,
    raw?.products,
  ]
  for (const c of candidates) {
    const list = unwrapList(c)
    if (list.length)
      return list
  }

  return []
}

export async function getOrderStatistics(): Promise<StatisticsResponse> {
  try {
    const response = await api.get(API_ENDPOINTS.ORDER_STATISTICS)
    const raw: any = response.data?.data ?? response.data ?? {}
    const base = mapStats(raw)
    const revenueByRange = pickRevenueByRange(raw)
    const revenue = revenueByRange
      ? Object.values(revenueByRange).flat()
      : pickRevenueList(raw).map(mapRevenuePoint)
    const topProducts = pickTopList(raw).map(mapTopProduct)

    return { ...base, revenue, revenueByRange, topProducts }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('statistics.loadFailed')
    )
  }
}
