<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LogOutIcon, PackageIcon, TagsIcon, UsersIcon } from '@lucide/vue'

import { getStoredSession, signOut as clearSession } from '@/api/auth'
import { counts } from '@/stores/counts'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const { t } = useI18n()
const user = getStoredSession()!

const displayName = computed(() =>
  user?.user?.name || user?.user?.email || t('nav.userFallback'),
)
const avatarLetter = computed(() =>
  (displayName.value || 'U').charAt(0).toUpperCase(),
)

function handleSignOut() {
  clearSession()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="flex h-svh flex-col bg-background">
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
          <p class="text-muted-foreground mt-1 text-xs">{{ user?.user?.email }}</p>
        </div>
        <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary uppercase">
          {{ avatarLetter }}
        </span>
      </div>
    </header>

    <div class="flex min-h-0 flex-1">
      <aside class="hidden w-56 shrink-0 flex-col border-r bg-[#84B3CE] p-3 sm:flex dark:bg-[#101E28]">
        <p class="text-muted-foreground px-3 pb-2 pt-1 text-xs font-medium tracking-wide uppercase">{{ $t('nav.functions') }}</p>
        <nav class="grid gap-1">
          <RouterLink
            to="/dashboard/users"
            class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
            active-class="bg-primary/10 text-primary"
          >
            <UsersIcon class="size-4" aria-hidden="true" />
            {{ $t('nav.users') }}
            <span class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{{ counts.users }}</span>
          </RouterLink>

          <RouterLink
            to="/dashboard/products"
            class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
            active-class="bg-primary/10 text-primary"
          >
            <PackageIcon class="size-4" aria-hidden="true" />
            {{ $t('nav.products') }}
            <span class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{{ counts.products }}</span>
          </RouterLink>

          <RouterLink
            to="/dashboard/categories"
            class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
            active-class="bg-primary/10 text-primary"
          >
            <TagsIcon class="size-4" aria-hidden="true" />
            {{ $t('nav.categories') }}
            <span class="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{{ counts.categories }}</span>
          </RouterLink>
        </nav>

        <div class="mt-auto border-t pt-3">
          <button
            type="button"
            class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            @click="handleSignOut"
          >
            <LogOutIcon class="size-4" aria-hidden="true" />
            {{ $t('nav.signOut') }}
          </button>
        </div>
      </aside>

      <main class="min-w-0 flex-1 space-y-6 overflow-y-auto bg-[#F5EEDD] p-4 md:p-6 dark:bg-background">
        <RouterView />
      </main>
    </div>
  </div>
</template>