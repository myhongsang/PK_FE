<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoonIcon, SunIcon } from '@lucide/vue'

import { theme, toggleTheme } from '@/stores/theme'

const props = withDefaults(defineProps<{
  tone?: 'dark' | 'light'
}>(), {
  tone: 'dark',
})

const { t } = useI18n()

const iconClasses = computed(() =>
  props.tone === 'dark'
    ? 'text-white'
    : 'text-foreground',
)
</script>

<template>
  <button
    type="button"
    class="inline-flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors"
    :class="tone === 'dark'
      ? 'border-white/25 hover:bg-white/10'
      : 'border-border hover:bg-accent'"
    :aria-label="theme.mode === 'dark' ? t('theme.toLight') : t('theme.toDark')"
    :title="theme.mode === 'dark' ? t('theme.toLight') : t('theme.toDark')"
    @click="toggleTheme"
  >
    <SunIcon v-if="theme.mode === 'dark'" class="size-4" :class="iconClasses" aria-hidden="true" />
    <MoonIcon v-else class="size-4" :class="iconClasses" aria-hidden="true" />
  </button>
</template>
