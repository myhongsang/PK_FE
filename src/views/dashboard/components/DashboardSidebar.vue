<script setup lang="ts">
import { ChartColumnIcon, LogOutIcon, PackageIcon, TagsIcon, UsersIcon } from '@lucide/vue'
import { counts } from '@/stores/counts'

defineEmits<{
  signOut: []
}>()
</script>

<template>
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

      <RouterLink
        to="/dashboard/statistics"
        class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
        active-class="bg-primary/10 text-primary"
      >
        <ChartColumnIcon class="size-4" aria-hidden="true" />
        {{ $t('nav.statistics') }}
      </RouterLink>
    </nav>

    <div class="mt-auto border-t pt-3">
      <button
        type="button"
        class="inline-flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        @click="$emit('signOut')"
      >
        <LogOutIcon class="size-4" aria-hidden="true" />
        {{ $t('nav.signOut') }}
      </button>
    </div>
  </aside>
</template>
