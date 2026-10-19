<script setup lang="ts">
import ListCard from '@/components/ListCard.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { REVENUE_RANGES, useStatistics } from '@/views/statistics/composables/useStatistics'
import RevenueChart from '@/views/statistics/components/RevenueChart.vue'
import StatCards from '@/views/statistics/components/StatCards.vue'
import TopProducts from '@/views/statistics/components/TopProducts.vue'

const {
  stats,
  cards,
  loading,
  errorMessage,
  loadData,
  range,
  revenue,
  topProducts,
  setRange,
} = useStatistics()

function rangeLabel(r: string) {
  if (r === '7d')
    return 'statistics.range7d'
  if (r === '30d')
    return 'statistics.range30d'
  return 'statistics.range12m'
}
</script>

<template>
  <ListCard
    :title="$t('statistics.title')"
    :description="$t('statistics.description')"
    :loading="loading"
    :error-message="errorMessage"
    :is-empty="stats.count === 0 && !revenue.length && !topProducts.length"
    :empty-text="$t('statistics.empty')"
    @retry="loadData()"
  >
    <StatCards :cards="cards" />

    <div class="grid gap-4 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{{ $t('statistics.revenueTitle') }}</CardTitle>
              <CardDescription>{{ $t('statistics.revenueDescription') }}</CardDescription>
            </div>
            <div class="flex gap-1 rounded-lg border p-1">
              <Button
                v-for="r in REVENUE_RANGES"
                :key="r"
                size="sm"
                :variant="range === r ? 'default' : 'ghost'"
                @click="setRange(r)"
              >
                {{ $t(rangeLabel(r)) }}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p v-if="!revenue.length" class="py-16 text-center text-sm text-muted-foreground">
            {{ $t('statistics.noRevenue') }}
          </p>
          <RevenueChart v-else :data="revenue" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{{ $t('statistics.topTitle') }}</CardTitle>
          <CardDescription>{{ $t('statistics.topDescription') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <p v-if="!topProducts.length" class="py-16 text-center text-sm text-muted-foreground">
            {{ $t('statistics.noTop') }}
          </p>
          <TopProducts v-else :items="topProducts" />
        </CardContent>
      </Card>
    </div>
  </ListCard>
</template>


