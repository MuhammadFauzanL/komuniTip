import { ref, computed } from 'vue'
import api from '../services/api'

// ─── Shared Reactive State (Singleton) ───
// Declared outside the composable so all components share the same state.
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const token = ref(localStorage.getItem('access_token'))

const isAuthenticated = computed(() => !!token.value)

// ─── Helper: Persist Auth State ───
function setAuth(authData) {
  token.value = authData.access_token
  user.value = authData.user
  localStorage.setItem('access_token', authData.access_token)
  localStorage.setItem('user', JSON.stringify(authData.user))
}

function clearAuth() {
  token.value = null
  user.value = null
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
}

// ─── Auth Composable ───
export function useAuth() {

  /**
   * Register a new user account
   * @param {{ email: string, nama_lengkap: string, password: string }} payload
   */
  async function register(payload) {
    const { data } = await api.post('/auth/register', {
      email: payload.email,
      nama_lengkap: payload.nama_lengkap,
      username: payload.username,
      password: payload.password,
    })
    // Tidak auto-login, memaksa user secara manual menuju halaman login setelah daftar
    return data
  }

  /**
   * Login with email & password
   * @param {{ email: string, password: string }} payload
   */
  async function login(payload) {
    const { data } = await api.post('/auth/login', {
      identifier: payload.identifier,
      password: payload.password,
    })
    setAuth(data.data)
    return data
  }

  /**
   * Login/Register via Google OAuth
   * @param {string} idToken - Google ID token from frontend SDK
   */
  async function googleAuth(idToken) {
    const { data } = await api.post('/auth/google', {
      id_token: idToken,
    })
    setAuth(data.data)
    return data
  }

  /**
   * Complete onboarding by providing a username
   * @param {string} username 
   */
  async function completeOnboarding(username) {
    const { data } = await api.post('/auth/onboarding', { username })
    setAuth(data.data)
    return data
  }

  /**
   * Request password reset link
   * @param {string} email
   */
  async function forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  }

  /**
   * Logout — clear all stored credentials
   */
  function logout() {
    clearAuth()
  }

  /**
   * Reset password using token from email
   * @param {{ token: string, new_password: string }} payload
   */
  async function resetPassword(payload) {
    const { data } = await api.post('/auth/reset-password', payload)
    return data
  }

  return {
    user,
    token,
    isAuthenticated,
    register,
    login,
    googleAuth,
    forgotPassword,
    completeOnboarding,
    resetPassword,
    logout,
  }
}
