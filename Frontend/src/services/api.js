import axios from 'axios'
import { appConfig } from '../config/app-config'

let unauthorizedHandler = () => {}

export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : () => {}
}

// ─── Centralized API Client ───
// All HTTP calls go through this instance.
const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// ─── Request Interceptor: Auto-attach JWT Token ───
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor: Handle 401 & Format Errors ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      unauthorizedHandler()
    }

    const responseData = error.response?.data
    const rawMessage =
      responseData?.message ??
      responseData?.reason ??
      responseData?.error ??
      'Terjadi kesalahan. Silakan coba lagi.'

    // Normalize to single string (NestJS validation returns array of messages)
    const errorMessage = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage
    const normalizedError = new Error(errorMessage)

    normalizedError.status = error.response?.status
    normalizedError.details = responseData

    return Promise.reject(normalizedError)
  }
)

export default api
