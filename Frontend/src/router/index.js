import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

// Views
import LoginView from '../components/LoginView.vue'
import RegisterView from '../components/RegisterView.vue'
import ForgotPasswordView from '../components/ForgotPasswordView.vue'
import ResetPasswordView from '../components/ResetPasswordView.vue'
import DashboardView from '../components/DashboardView.vue'
import ProfileView from '../components/ProfileView.vue'
import OverlayView from '../components/OverlayView.vue'
import OnboardingUsernameStep from '../components/OnboardingUsernameStep.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guest: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { guest: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: { guest: true }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: OnboardingUsernameStep,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/overlay',
    name: 'overlay',
    component: OverlayView,
    meta: { requiresAuth: true }
  },
  // Catch-all 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const { isAuthenticated, user } = useAuth()
  
  const loggedIn = isAuthenticated.value
  const hasUsername = !!user.value?.username

  if (to.meta.requiresAuth && !loggedIn) {
    // Mau masuk halaman terproteksi tapi belum login
    next('/login')
  } else if (to.meta.guest && loggedIn) {
    // Mau masuk halaman guest (login/register) tapi sudah login
    next('/dashboard')
  } else if (loggedIn && !hasUsername && to.name !== 'onboarding') {
    // Sudah login tapi belum set username, paksa ke onboarding
    next('/onboarding')
  } else if (loggedIn && hasUsername && to.name === 'onboarding') {
    // Sudah punya username tapi mencoba akses onboarding, balikin ke dashboard
    next('/dashboard')
  } else {
    next()
  }
})

export default router
