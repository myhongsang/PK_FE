import { readonly, shallowRef } from 'vue'
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LoginResult } from '@/types/auth'

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
  expiresAt: number | null
  setSession: (session: LoginResult) => void
  clearSession: () => void
  isAuthenticated: () => boolean
}

export const authStore = createStore<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      expiresAt: null,

      setSession: (session: LoginResult) => {
        set({
          token: session.accessToken || null,
          user: session.user || null,
          expiresAt: session.expiresAt ?? null,
        })
      },

      clearSession: () => {
        set({
          token: null,
          user: null,
          expiresAt: null,
        })
      },

      isAuthenticated: () => {
        const { token, expiresAt } = get()
        if (!token) return false
        if (expiresAt && Date.now() >= expiresAt) {
          get().clearSession()
          return false
        }
        return true
      },
    }),
    {
      name: 'auth_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
      }),
    },
  ),
)

export function useAuth() {
  const state = shallowRef(authStore.getState())

  const unsubscribe = authStore.subscribe((newState) => {
    state.value = newState
  })

  return {
    state: readonly(state),
    setSession: authStore.getState().setSession,
    clearSession: authStore.getState().clearSession,
    isAuthenticated: authStore.getState().isAuthenticated,
    unsubscribe,
  }
}

