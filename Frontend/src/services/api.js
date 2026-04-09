import axios from 'axios'

// ─── Centralized API Client ───
// All HTTP calls go through this instance.
// Base URL uses Vite proxy: /api/* → backend-api:3000/*
const api = axios.create({
  baseURL: '/api',
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
    }

    // Extract readable error message from backend response
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Terjadi kesalahan. Silakan coba lagi.'

    // Normalize to single string (NestJS validation returns array of messages)
    const errorMessage = Array.isArray(message) ? message[0] : message

    return Promise.reject(new Error(errorMessage))
  }
)

export default api
