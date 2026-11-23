import axios from 'axios'

const TOKEN_KEY = 'sweety_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
})

let onUnauthorized = null

// Lets the auth context react when a stored token is rejected (expired, user deleted)
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthAttempt = /\/auth\/(login|register)$/.test(error.config?.url || '')
    if (error.response?.status === 401 && !isAuthAttempt && onUnauthorized) onUnauthorized()
    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) return 'Cannot reach the server. Check your connection and try again.'
  return error.response.data?.error?.message || fallback
}

export function getErrorField(error) {
  return error?.response?.data?.error?.field
}

export default api
