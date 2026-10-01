import { computed, onScopeDispose, shallowRef } from 'vue'

import { ROLE_ADMIN } from '@/constants/role'
import { authStore } from '@/stores/auth'

export function isAdminRole(role?: string | null): boolean {
  return String(role ?? '').trim().toUpperCase() === ROLE_ADMIN
}

export function usePermissions() {
  const state = shallowRef(authStore.getState())

  const unsubscribe = authStore.subscribe((newState) => {
    state.value = newState
  })

  onScopeDispose(unsubscribe)

  const role = computed(() => state.value.user?.role ?? null)
  const isAdmin = computed(() => isAdminRole(role.value))

  return {
    role,
    isAdmin,
    canCreate: computed(() => role.value !== null),
    canEdit: isAdmin,
    canDelete: isAdmin,
  }
}