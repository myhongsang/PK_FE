<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { getStoredSession, signOut as clearSession } from '@/api/auth'
import DashboardHeader from '@/views/dashboard/components/DashboardHeader.vue'
import DashboardSidebar from '@/views/dashboard/components/DashboardSidebar.vue'

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
    <DashboardHeader
      :display-name="displayName"
      :email="user?.user?.email"
      :avatar-letter="avatarLetter"
    />

    <div class="flex min-h-0 flex-1">
      <DashboardSidebar @sign-out="handleSignOut" />

      <main class="min-w-0 flex-1 space-y-6 overflow-y-auto bg-[#F5EEDD] p-4 md:p-6 dark:bg-background">
        <RouterView />
      </main>
    </div>
  </div>
</template>
