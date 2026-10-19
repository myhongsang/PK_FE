import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BanknoteIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  HourglassIcon,
} from '@lucide/vue'

import { getOrderStatistics } from '@/api/orders'
import type { OrderStats, RevenuePoint, RevenueRange, TopProduct } from '@/types/order'
import type { StatCardItem } from '@/views/statistics/types'

export const REVENUE_RANGES: RevenueRange[] = ['7d', '30d', '12m']
const TOP_LIMIT = 5

export function useStatistics() {
  const { t, locale } = useI18n()

  const loading = ref(false)
  const errorMessage = ref('')
  const stats = ref<OrderStats>({ count: 0, totalValue: 0, paid: 0, unpaid: 0 })
  const range = ref<RevenueRange>('7d')
  const allRevenue = ref<RevenuePoint[]>([])
  const revenueByRange = ref<Partial<Record<RevenueRange, RevenuePoint[]>>>({})
  const allTopProducts = ref<TopProduct[]>([])

  const currencyFormatter = computed(() =>
    new Intl.NumberFormat(locale.value === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }),
  )

  const cards = computed<StatCardItem[]>(() => [
    {
      key: 'count',
      label: t('statistics.orderCount'),
      value: new Intl.NumberFormat(locale.value === 'vi' ? 'vi-VN' : 'en-US').format(stats.value.count),
      icon: ClipboardListIcon,
    },
    {
      key: 'totalValue',
      label: t('statistics.orderValue'),
      value: currencyFormatter.value.format(stats.value.totalValue),
      icon: CircleDollarSignIcon,
    },
    {
      key: 'paid',
      label: t('statistics.paid'),
      value: currencyFormatter.value.format(stats.value.paid),
      icon: BanknoteIcon,
    },
    {
      key: 'unpaid',
      label: t('statistics.outstanding'),
      value: currencyFormatter.value.format(stats.value.unpaid),
      icon: HourglassIcon,
    },
  ])

  async function loadData(showLoading = true) {
    if (showLoading) loading.value = true
    errorMessage.value = ''

    try {
      const data = await getOrderStatistics()
      stats.value = {
        count: data.count,
        totalValue: data.totalValue,
        paid: data.paid,
        unpaid: data.unpaid,
      }
      allRevenue.value = data.revenue ?? []
      revenueByRange.value = data.revenueByRange ?? {}
      allTopProducts.value = data.topProducts ?? []
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : t('common.unableToLoad')
    } finally {
      loading.value = false
    }
  }

  const revenue = computed(() => {
    const preset = revenueByRange.value[range.value]
    if (preset?.length)
      return preset
    if (range.value === '7d')
      return allRevenue.value.slice(-7)
    if (range.value === '30d')
      return allRevenue.value.slice(-30)
    return allRevenue.value.slice(-12)
  })

  const topProducts = computed(() =>
    [...allTopProducts.value]
      .sort((a, b) => b.sold - a.sold || b.revenue - a.revenue)
      .slice(0, TOP_LIMIT),
  )

  function setRange(next: RevenueRange) {
    range.value = next
  }

  onMounted(() => {
    void loadData()
  })

  return {
    stats,
    cards,
    loading,
    errorMessage,
    loadData,
    range,
    revenue,
    topProducts,
    setRange,
  }
}
