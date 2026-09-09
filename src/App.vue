<script setup lang="ts">
import { ref } from 'vue'

import { getStoredSession, signOut as clearSession, type LoginResult } from '@/api/auth'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'

// Khôi phục phiên đăng nhập đã lưu trong localStorage (nếu có)
// -> refresh trang không bị bắt đăng nhập lại
const user = ref<LoginResult | null>(getStoredSession())

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
