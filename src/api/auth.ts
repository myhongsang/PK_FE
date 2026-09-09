import api from './api'
import { API_ENDPOINTS, TOKEN_STORAGE_KEY } from '@/constants'

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResult {
  accessToken: string
  user: {
    id: string
    name: string
    email: string
  }
}

export async function login(
  payload: LoginPayload
): Promise<LoginResult> {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: payload.email,
      password: payload.password,
    })

    // Backend có thể trả payload trực tiếp hoặc bọc trong { data: ... } -> chuẩn hóa
    const raw: any = response.data?.data ?? response.data ?? {}
    const rawUser: any = raw.user ?? {}

    // Đảm bảo các trường luôn tồn tại để UI không bị lỗi khi backend trả thiếu
    const result: LoginResult = {
      accessToken: raw.accessToken ?? raw.token ?? '',
      user: {
        id: rawUser.id ?? '',
        name: rawUser.name ?? '',
        email: rawUser.email ?? '',
      },
    }

    // Lưu token để interceptor tự gắn vào mọi request sau này (users, products...)
    localStorage.setItem(TOKEN_STORAGE_KEY, result.accessToken)

    return result
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      'Incorrect email or password. Please try again.'
    )
  }
}

export function signOut(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}