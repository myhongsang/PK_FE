<script setup lang="ts">
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

defineProps<{
  displayName: string
  email?: string
  avatarLetter: string
}>()
</script>

<template>
  <header class="flex h-14 shrink-0 items-center justify-between border-b bg-[#16587B] px-4 md:px-6 text-white dark:bg-[#0B1F2A]">
    <div class="flex items-center gap-2">
      <span class="flex size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground dark:bg-white/15 dark:text-white">PK</span>
      <span class="text-sm font-semibold">{{ $t('nav.brand') }}</span>
    </div>

    <div class="flex items-center gap-3">
      <ThemeToggle tone="dark" />
      <LanguageSwitcher tone="dark" />

      <div class="hidden text-right sm:block">
        <p class="text-sm leading-none font-medium">{{ displayName }}</p>
        <p class="text-muted-foreground mt-1 text-xs">{{ email }}</p>
      </div>
      <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary uppercase">
        {{ avatarLetter }}
      </span>
    </div>
  </header>
</template>
