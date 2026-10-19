<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { TopProduct } from '@/types/order'

const props = withDefaults(defineProps<{
  items?: TopProduct[]
}>(), {
  items: () => [],
})

const { locale } = useI18n()

const currencyFormatter = computed(() =>
  new Intl.NumberFormat(locale.value === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }),
)

const maxSold = computed(() => Math.max(1, ...props.items.map(i => i.sold)))
</script>

<template>
  <ol class="grid gap-3">
    <li
      v-for="(item, idx) in items"
      :key="item.id"
      class="flex items-center gap-3"
    >
      <span
        class="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        :class="idx < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
      >
        {{ idx + 1 }}
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-2">
          <p class="truncate text-sm font-medium">{{ item.name }}</p>
          <p class="shrink-0 text-xs font-semibold tabular-nums">
            {{ currencyFormatter.format(item.revenue) }}
          </p>
        </div>
        <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary transition-all"
            :style="{ width: `${Math.max(4, (item.sold / maxSold) * 100)}%` }"
          />
        </div>
        <p class="mt-1 text-xs text-muted-foreground tabular-nums">
          {{ $t('statistics.soldCount', { count: item.sold, orders: item.orderCount }) }}
        </p>
      </div>
    </li>
  </ol>
</template>
