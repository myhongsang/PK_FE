<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LanguagesIcon } from '@lucide/vue'

import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '@/i18n'

const props = withDefaults(defineProps<{
  tone?: 'dark' | 'light'
}>(), {
  tone: 'light',
})

const { locale } = useI18n()

const languages: Array<{ value: string, short: string, label: string }> = [
  { value: 'vi', short: 'VI', label: 'Tiếng Việt' },
  { value: 'en', short: 'EN', label: 'English' },
]

const activeClasses = computed(() =>
  props.tone === 'dark'
    ? 'bg-white/20 text-white'
    : 'bg-primary text-primary-foreground',
)

const idleClasses = computed(() =>
  props.tone === 'dark'
    ? 'text-white/70 hover:text-white'
    : 'text-muted-foreground hover:text-foreground',
)

function switchTo(next: string) {
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(next))
    return

  locale.value = next

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
  }
  catch { }

  document.documentElement.lang = next
}
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-md border p-0.5"
    :class="tone === 'dark' ? 'border-white/25' : 'border-border'"
    role="group"
    :aria-label="$t('common.language')"
  >
    <LanguagesIcon
      class="ml-1 size-3.5 shrink-0"
      :class="tone === 'dark' ? 'text-white/70' : 'text-muted-foreground'"
      aria-hidden="true"
    />

    <button
      v-for="language in languages"
      :key="language.value"
      type="button"
      class="rounded-sm px-2 py-1 text-xs font-medium transition-colors"
      :class="locale === language.value ? activeClasses : idleClasses"
      :aria-pressed="locale === language.value"
      :title="language.label"
      @click="switchTo(language.value)"
    >
      {{ language.short }}
    </button>
  </div>
</template>
