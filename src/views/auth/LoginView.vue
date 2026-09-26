<script setup lang="ts">
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LoginForm from '@/views/auth/components/LoginForm.vue'
</script>

<template>
  <div class="grid min-h-svh w-full">
    <div class="relative flex items-center justify-center bg-background p-6 md:p-10">
      <div class="absolute right-4 top-4 flex items-center gap-2">
        <ThemeToggle tone="light" />
        <LanguageSwitcher tone="light" />
      </div>

      <div class="w-full max-w-sm space-y-6">
        <div class="flex flex-col gap-1.5">
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            {{ $t('auth.title') }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ $t('auth.subtitle') }}
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  </div>
</template>
