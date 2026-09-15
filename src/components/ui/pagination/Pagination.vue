<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreHorizontalIcon,
} from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  currentPage: number
  totalPages: number
  disabled?: boolean
  siblings?: number
}>(), {
  disabled: false,
  siblings: 1,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const { t } = useI18n()

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

const pageItems = computed<PageItem[]>(() => {
  const total = props.totalPages

  if (total <= 1)
    return []

  const current = props.currentPage
  const siblings = props.siblings
  const start = Math.max(2, current - siblings)
  const end = Math.min(total - 1, current + siblings)

  const items: PageItem[] = [1]

  if (start > 2)
    items.push('ellipsis-start')

  for (let page = start; page <= end; page++)
    items.push(page)

  if (end < total - 1)
    items.push('ellipsis-end')

  items.push(total)

  return items
})

function go(page: number) {
  if (page < 1 || page > props.totalPages || page === props.currentPage)
    return

  emit('update:currentPage', page)
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex flex-wrap items-center justify-center gap-1 sm:justify-end"
    role="navigation"
    :aria-label="t('pagination.label')"
  >
    <Button
      variant="outline"
      size="icon-sm"
      :disabled="disabled || currentPage <= 1"
      :aria-label="t('pagination.first')"
      @click="go(1)"
    >
      <ChevronsLeftIcon aria-hidden="true" />
    </Button>

    <Button
      variant="outline"
      size="icon-sm"
      :disabled="disabled || currentPage <= 1"
      :aria-label="t('pagination.previous')"
      @click="go(currentPage - 1)"
    >
      <ChevronLeftIcon aria-hidden="true" />
    </Button>

    <template v-for="item in pageItems" :key="item">
      <div
        v-if="item === 'ellipsis-start' || item === 'ellipsis-end'"
        class="flex size-8 items-center justify-center text-muted-foreground"
      >
        <MoreHorizontalIcon class="size-4" aria-hidden="true" />
      </div>

      <Button
        v-else
        variant="outline"
        size="sm"
        class="min-w-8 px-2 text-xs"
        :class="cn(item === currentPage && 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground')"
        :aria-current="item === currentPage ? 'page' : undefined"
        :aria-label="t('pagination.page', { page: String(item) })"
        :disabled="disabled"
        @click="go(item)"
      >
        {{ item }}
      </Button>
    </template>

    <Button
      variant="outline"
      size="icon-sm"
      :disabled="disabled || currentPage >= totalPages"
      :aria-label="t('pagination.next')"
      @click="go(currentPage + 1)"
    >
      <ChevronRightIcon aria-hidden="true" />
    </Button>

    <Button
      variant="outline"
      size="icon-sm"
      :disabled="disabled || currentPage >= totalPages"
      :aria-label="t('pagination.last')"
      @click="go(totalPages)"
    >
      <ChevronsRightIcon aria-hidden="true" />
    </Button>
  </nav>
</template>