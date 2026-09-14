export const API_BASE_URL = 'http://localhost:3000'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  USERS: '/users',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
} as const

export const TOKEN_STORAGE_KEY = 'access_token'

export const USER_STORAGE_KEY = 'user'