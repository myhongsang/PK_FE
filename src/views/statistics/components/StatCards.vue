<script setup lang="ts">
import type { StatCardItem } from '@/views/statistics/types'

defineProps<{
  cards: StatCardItem[]
}>()
</script>

<template>
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
</template>
