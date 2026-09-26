<script setup lang="ts">
import ListCard from '@/components/ListCard.vue'

import { useStatistics } from '@/views/statistics/composables/useStatistics'
import StatCards from '@/views/statistics/components/StatCards.vue'

const { stats, cards, loading, errorMessage, loadData } = useStatistics()
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
    <StatCards :cards="cards" />
  </ListCard>
</template>
