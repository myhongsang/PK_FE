<script setup lang="ts">
import { LoaderCircleIcon, RefreshCwIcon, TriangleAlertIcon } from '@lucide/vue'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  title: string
  description: string
  loading: boolean
  errorMessage?: string
  isEmpty: boolean
  emptyText: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <Card class="shadow-lg shadow-zinc-950/5">
    <CardHeader>
      <CardTitle class="text-lg">{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
      <CardAction v-if="$slots.action">
        <slot name="action" />
      </CardAction>
    </CardHeader>

    <CardContent class="grid gap-4">
      <slot name="toolbar" />

      <Alert v-if="errorMessage" variant="destructive">
        <TriangleAlertIcon aria-hidden="true" />
        <AlertDescription class="flex flex-wrap items-center justify-between gap-3">
          <span>{{ errorMessage }}</span>
          <Button size="sm" variant="outline" @click="emit('retry')">
            <RefreshCwIcon aria-hidden="true" />
            {{ $t('common.retry') }}
          </Button>
        </AlertDescription>
      </Alert>

      <div v-if="loading" class="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <LoaderCircleIcon class="size-5 animate-spin" aria-hidden="true" />
        {{ $t('common.loading') }}
      </div>

      <p v-else-if="isEmpty" class="py-12 text-center text-sm text-muted-foreground">
        {{ emptyText }}
      </p>

      <slot v-else />
    </CardContent>
  </Card>
</template>
