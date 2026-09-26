<script setup lang="ts">
import { PencilIcon, Trash2Icon } from '@lucide/vue'
import { Button } from '@/components/ui/button'

withDefaults(
  defineProps<{
    editLabel?: string
    deleteLabel?: string
    disabled?: boolean
  }>(),
  {
    editLabel: 'Edit',
    deleteLabel: 'Delete',
    disabled: false,
  },
)

const emit = defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="flex justify-end gap-1">
    <Button
      variant="ghost"
      size="icon-sm"
      :aria-label="editLabel"
      :disabled="disabled"
      @click="emit('edit')"
    >
      <PencilIcon aria-hidden="true" />
    </Button>
    <Button
      variant="ghost"
      size="icon-sm"
      class="text-destructive hover:text-destructive"
      :aria-label="deleteLabel"
      :disabled="disabled"
      @click="emit('delete')"
    >
      <Trash2Icon aria-hidden="true" />
    </Button>
  </div>
</template>
