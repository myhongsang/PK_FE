<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BanknoteIcon,
  ClipboardListIcon,
  CircleDollarSignIcon,
  HourglassIcon,
} from '@lucide/vue'

import { getOrderStatistics } from '@/api/orders'
import ListCard from '@/components/ListCard.vue'

import type { OrderStats } from '@/types/order'

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

const cards = computed(() => [
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
  if (showLoading)
    loading.value = true
  errorMessage.value = ''

  try {
    stats.value = await getOrderStatistics()
  }
  catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : t('common.unableToLoad')
  }
  finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<template>
  <ListCard
    :title="$t('statistics.title')"
    :description="$t('statistics.description')"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="stats.count === 0"
    :empty-text="$t('statistics.empty')"
    @retry="loadData()"
  >
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.key"
        class="flex items-center gap-3 rounded-lg border bg-card p-4"
      >
        <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <component :is="card.icon" class="size-5" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <p class="text-muted-foreground truncate text-xs font-medium">{{ card.label }}</p>
          <p class="mt-0.5 truncate text-lg font-semibold tabular-nums">{{ card.value }}</p>
        </div>
      </div>
    </div>
  </ListCard>
</template>
