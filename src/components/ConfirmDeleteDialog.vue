<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LoaderCircleIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    loading?: boolean
    errorMessage?: string
  }>(),
  {
    description: '',
    loading: false,
    errorMessage: '',
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const { t } = useI18n()

function handleOpenChange(value: boolean) {
  emit('update:open', value)
  if (!value) {
    emit('cancel')
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <p v-if="errorMessage" class="text-xs text-destructive" role="alert">
        {{ errorMessage }}
      </p>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          :disabled="loading"
          @click="handleOpenChange(false)"
        >
          {{ t('common.cancel') }}
        </Button>
        <Button
          type="button"
          variant="destructive"
          :disabled="loading"
          @click="emit('confirm')"
        >
          <LoaderCircleIcon v-if="loading" class="animate-spin" aria-hidden="true" />
          {{ t('common.delete') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
