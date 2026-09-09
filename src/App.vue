<script setup lang="ts">
import { ref } from 'vue'

import { signOut as clearSession, type LoginResult } from '@/api/auth'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'

const user = ref<LoginResult | null>(null)

function handleLoggedIn(result: LoginResult) {
  user.value = result
}

function handleSignOut() {
  clearSession()
  user.value = null
}
</script>

<template>
  <LoginView v-if="!user" @logged-in="handleLoggedIn" />
  <DashboardView v-else :user="user" @sign-out="handleSignOut" />
</template>
