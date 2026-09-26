import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BanknoteIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  HourglassIcon,
} from '@lucide/vue'

import { getOrderStatistics } from '@/api/orders'
import type { OrderStats } from '@/types/order'
import type { StatCardItem } from '@/views/statistics/types'

export function useStatistics() {
  const { t, locale } = useI18n()

  const loading = ref(false)
  const errorMessage = ref('')
  const stats = ref<OrderStats>({ count: 0, totalValue: 0, paid: 0, unpaid: 0 })

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
      stats.value = await getOrderStatistics()
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : t('common.unableToLoad')
    } finally {
      loading.value = false
    }
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
  }
}
