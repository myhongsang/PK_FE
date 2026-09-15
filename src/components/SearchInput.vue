<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchIcon, XIcon } from '@lucide/vue'

import { Input } from '@/components/ui/input'
import type { SearchSuggestion } from '@/lib/search'

const { t } = useI18n()

const model = defineModel<string>({ required: true })

defineProps<{
  placeholder?: string
  suggestions?: SearchSuggestion[]
}>()

const emit = defineEmits<{
  select: [suggestion: SearchSuggestion]
}>()

const showSuggestions = ref(false)

function selectSuggestion(suggestion: SearchSuggestion) {
  model.value = suggestion.label
  showSuggestions.value = false
  emit('select', suggestion)
}
</script>

<template>
  <div class="relative w-full">
    <SearchIcon
      class="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
      aria-hidden="true"
    />

    <Input
      v-model="model"
      type="text"
      class="pl-9 pr-8"
      :placeholder="placeholder"
      :aria-label="t('common.search')"
      @focus="showSuggestions = true"
      @blur="showSuggestions = false"
      @keydown.esc.prevent="showSuggestions = false"
    />

    <button
      v-if="model"
      type="button"
      class="text-muted-foreground hover:text-foreground absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm transition-colors"
      :aria-label="t('common.clear')"
      @click="model = ''"
    >
      <XIcon class="size-4" />
    </button>

    <div
      v-if="showSuggestions && suggestions?.length"
      role="listbox"
      class="absolute left-0 top-full z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-lg"
    >
      <button
        v-for="suggestion in suggestions"
        :key="`${suggestion.label}:${suggestion.detail ?? ''}`"
        type="button"
        role="option"
        class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        @mousedown.prevent="selectSuggestion(suggestion)"
      >
        <span class="truncate font-medium">{{ suggestion.label }}</span>
        <span v-if="suggestion.detail" class="truncate text-xs text-muted-foreground">{{ suggestion.detail }}</span>
      </button>
    </div>
  </div>
</template>
