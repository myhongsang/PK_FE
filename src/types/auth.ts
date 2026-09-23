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
  expiresAt?: number
}