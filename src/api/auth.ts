import api from '@/api/api'
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/constants/api'
import type { LoginPayload, LoginResult } from '@/types/auth'

let verifiedSession: LoginResult | null | undefined

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

    localStorage.setItem(TOKEN_STORAGE_KEY, result.accessToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user))

    verifiedSession = result

    return result
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Incorrect email or password. Please try again.'
    )
  }
}

export function signOut(): void {
  verifiedSession = null
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function getStoredSession(): LoginResult | null {
  try {
    const accessToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    const rawUser = localStorage.getItem(USER_STORAGE_KEY)

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
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
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