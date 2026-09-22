import api from '@/api/api'
import i18n from '@/i18n'
import {
  API_ENDPOINTS,
  REMEMBER_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '@/constants/api'
import type { LoginPayload, LoginResult } from '@/types/auth'

let verifiedSession: LoginResult | null | undefined

function persistSession(result: LoginResult, remember: boolean): void {
  const primary = remember ? localStorage : sessionStorage
  const secondary = remember ? sessionStorage : localStorage

  primary.setItem(TOKEN_STORAGE_KEY, result.accessToken)
  primary.setItem(USER_STORAGE_KEY, JSON.stringify(result.user))
  secondary.removeItem(TOKEN_STORAGE_KEY)
  secondary.removeItem(USER_STORAGE_KEY)

  try {
    localStorage.setItem(REMEMBER_STORAGE_KEY, remember ? '1' : '0')
  }
  catch { }
}

export function getRememberPreference(): boolean {
  try {
    return localStorage.getItem(REMEMBER_STORAGE_KEY) !== '0'
  }
  catch {
    return true
  }
}

function clearStoredSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  sessionStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export async function login(
  payload: LoginPayload
): Promise<LoginResult> {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: payload.email,
      password: payload.password,
    })

    const raw: any = response.data?.data ?? response.data ?? {}
    const rawUser: any = raw.user ?? {}

    const result: LoginResult = {
      accessToken: raw.accessToken ?? raw.token ?? '',
      user: {
        id: rawUser.id ?? '',
        name: rawUser.name ?? '',
        email: rawUser.email ?? '',
      },
    }

    persistSession(result, payload.remember === true)

    verifiedSession = result

    return result
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      i18n.global.t('auth.loginFailed')
    )
  }
}

export function signOut(): void {
  verifiedSession = null
  clearStoredSession()
}

export function getStoredSession(): LoginResult | null {
  try {
    const accessToken = sessionStorage.getItem(TOKEN_STORAGE_KEY)
      ?? localStorage.getItem(TOKEN_STORAGE_KEY)
    const rawUser = sessionStorage.getItem(USER_STORAGE_KEY)
      ?? localStorage.getItem(USER_STORAGE_KEY)

    if (!accessToken || !rawUser)
      return null

    const storedUser: any = JSON.parse(rawUser)

    return {
      accessToken,
      user: {
        id: storedUser?.id ?? '',
        name: storedUser?.name ?? '',
        email: storedUser?.email ?? '',
      },
    }
  }
  catch {
    clearStoredSession()
    return null
  }
}

export async function verifyStoredSession(): Promise<LoginResult | null> {
  const stored = getStoredSession()

  if (!stored) {
    verifiedSession = undefined
    return null
  }

  if (verifiedSession)
    return verifiedSession

  try {
    await api.get(API_ENDPOINTS.USERS, { timeout: 5000 })
    verifiedSession = stored
    return verifiedSession
  }
  catch {
    signOut()
    return null
  }
}