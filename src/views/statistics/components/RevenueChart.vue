<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { RevenuePoint } from '@/types/order'

const props = withDefaults(defineProps<{
  data?: RevenuePoint[]
  height?: number
}>(), {
  data: () => [],
  height: 220,
})

const { locale } = useI18n()

const W = 640
const H = 240
const PAD_L = 52
const PAD_R = 12
const PAD_T = 12
const PAD_B = 28

const currencyFormatter = computed(() =>
  new Intl.NumberFormat(locale.value === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 1,
  }),
)

const fullFormatter = computed(() =>
  new Intl.NumberFormat(locale.value === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }),
)

const maxRevenue = computed(() => Math.max(1, ...props.data.map(d => d.revenue)))

function xAt(i: number) {
  const n = Math.max(props.data.length, 1)
  if (n === 1)
    return PAD_L + (W - PAD_L - PAD_R) / 2
  return PAD_L + ((W - PAD_L - PAD_R) * i) / (n - 1)
}

function yAt(v: number) {
  return PAD_T + (H - PAD_T - PAD_B) * (1 - v / maxRevenue.value)
}

const linePath = computed(() => {
  if (!props.data.length)
    return ''
  return props.data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(d.revenue).toFixed(1)}`).join(' ')
})

const areaPath = computed(() => {
  if (!props.data.length)
    return ''
  const base = H - PAD_B
  return `${linePath.value} L${xAt(props.data.length - 1).toFixed(1)},${base} L${xAt(0).toFixed(1)},${base} Z`
})

const ticks = computed(() => {
  const steps = 4
  return Array.from({ length: steps + 1 }, (_, i) => {
    const v = (maxRevenue.value * i) / steps
    return { v, y: yAt(v) }
  })
})

function shortLabel(label: string) {
  // '2026-10-01' -> '01/10', '2026-10' -> '10/26', giữ nguyên label khác
  const d = label.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (d)
    return `${d[3]}/${d[2]}`
  const m = label.match(/(\d{4})-(\d{2})/)
  if (m)
    return `${m[2]}/${m[1].slice(2)}`
  return label
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      :style="{ minWidth: '520px', width: '100%', height: `${height}px` }"
      role="img"
      aria-label="revenue-chart"
    >
      <defs>
        <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--chart-1)" stop-opacity="0.35" />
          <stop offset="100%" stop-color="var(--chart-1)" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <g v-for="t in ticks" :key="t.v">
        <line
          :x1="PAD_L" :x2="W - PAD_R" :y1="t.y" :y2="t.y"
          stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="4 4"
        />
        <text
          :x="PAD_L - 8" :y="t.y + 4" text-anchor="end"
          font-size="11" fill="currentColor" opacity="0.6"
        >
          {{ currencyFormatter.format(t.v) }}
        </text>
      </g>

      <path v-if="areaPath" :d="areaPath" fill="url(#revenue-fill)" />
      <path
        v-if="linePath" :d="linePath" fill="none"
        stroke="var(--chart-1)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      />

      <g v-for="(d, i) in data" :key="`${d.label}-${i}`">
        <circle :cx="xAt(i)" :cy="yAt(d.revenue)" r="4" fill="var(--chart-1)" stroke="var(--background)" stroke-width="2">
          <title>{{ d.label }} · {{ fullFormatter.format(d.revenue) }} · {{ d.orderCount }} đơn</title>
        </circle>
        <text
          v-if="data.length <= 12 || i % Math.ceil(data.length / 12) === 0"
          :x="xAt(i)" :y="H - 8" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.6"
        >
          {{ shortLabel(d.label) }}
        </text>
      </g>
    </svg>
  </div>
</template>
