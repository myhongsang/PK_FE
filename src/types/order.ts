export interface OrderStats {
  count: number
  totalValue: number
  paid: number
  unpaid: number
}

export type RevenueRange = '7d' | '30d' | '12m'

export interface RevenuePoint {
  label: string
  revenue: number
  orderCount: number
}

export interface TopProduct {
  id: string | number
  name: string
  sold: number
  revenue: number
  orderCount: number
}

export interface StatisticsResponse extends OrderStats {
  revenue: RevenuePoint[]
  revenueByRange?: Partial<Record<RevenueRange, RevenuePoint[]>>
  topProducts: TopProduct[]
}

