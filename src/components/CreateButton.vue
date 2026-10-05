<script setup lang="ts">
import { PlusIcon } from '@lucide/vue'

import { Button } from '@/components/ui/button'

defineProps<{
  label: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <Button @click="emit('click')">
    <PlusIcon aria-hidden="true" />
    {{ label }}
  </Button>
</template>
