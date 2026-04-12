import { ref, computed } from 'vue'
import api from '../services/api'

// ─── Shared Reactive State (Singleton) ───.
let initialUser = null
try {
  const storedUser = localStorage.getItem('user')
  if (storedUser && storedUser !== 'undefined') {
    initialUser = JSON.parse(storedUser)  
  }
} catch (error) {
  console.warn('WARNING: Data profil lokal korup/rusak. Mereset sesi otomatis...', error)
  localStorage.removeItem('user')
  localStorage.removeItem('access_token')
}

const user = ref(initialUser)
const token = ref(localStorage.getItem('access_token'))

const isAuthenticated = computed(() => !!token.value && token.value !== 'undefined')

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
    if (user.value) {
    user.value = { ...user.value, username: username }
  }
  
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

  const fetchMyProfile = async () => {
    try {
      const response = await api.get('/auth/me')
      // Update variabel user dengan data dari database asli
      user.value = response.data.data
      // Timpa data user lama di LocalStorage
      localStorage.setItem('user', JSON.stringify(response.data.data)) 
      return response.data.data
    } catch (error) {
      console.error('Gagal mengambil data profil terbaru:', error)
      if (error.response?.status === 401) {
        logout();
      }
    }
  }
  const updateMyProfile = async (profileData) => {
    // Tembak backend dengan data yang baru
    const { data } = await api.patch('/auth/me/update', profileData)
    
    // Timpa memori browser dengan data terupdate (pakai data.data karena interseptor)
    user.value = data.data.user
    localStorage.setItem('user', JSON.stringify(data.data.user)) 
    // Jangan lupa tokennya juga kalau ikut terganti
    token.value = data.data.access_token
    localStorage.setItem('access_token', data.data.access_token)
    
    return data.data
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
    fetchMyProfile,
    updateMyProfile,
  }
}