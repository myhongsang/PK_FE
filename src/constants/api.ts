export const API_BASE_URL = 'http://localhost:3000'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  USERS: '/users',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ORDERS: '/orders',
  ORDER_STATISTICS: '/orders/statistics',
} as const

export const TOKEN_STORAGE_KEY = 'access_token'

export const TOKEN_EXPIRY_STORAGE_KEY = 'access_token_expires_at'

export const USER_STORAGE_KEY = 'user'

export const REMEMBER_STORAGE_KEY = 'remember_login'

export const REMEMBERED_EMAIL_STORAGE_KEY = 'remembered_email'