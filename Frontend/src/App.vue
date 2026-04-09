<script setup>
import { ref, watchEffect } from 'vue'
import { useAuth } from './composables/useAuth'
import LoginView from './components/LoginView.vue'
import RegisterView from './components/RegisterView.vue'
import ForgotPasswordView from './components/ForgotPasswordView.vue'
import DashboardView from './components/DashboardView.vue'
import ProfileView from './components/ProfileView.vue'
import OverlayView from './components/OverlayView.vue'

import OnboardingUsernameStep from './components/OnboardingUsernameStep.vue'

const currentView = ref('login')
const { isAuthenticated, user } = useAuth()

// Automatically redirect based on auth state
watchEffect(() => {
  if (isAuthenticated.value) {
    // If logged in but doesn't have a username yet, force onboarding
    if (!user.value?.username) {
      currentView.value = 'onboarding'
      return
    }
    
    // If logged in and trying to view auth pages, redirect to dashboard
    if (['login', 'register', 'forgot-password', 'onboarding'].includes(currentView.value)) {
      currentView.value = 'dashboard'
    }
  } else {
    // If not logged in and trying to view protected pages, redirect to login
    if (['dashboard', 'profile', 'overlay', 'onboarding'].includes(currentView.value)) {
      currentView.value = 'login'
    }
  }
})

const goToRegister = () => {
  currentView.value = 'register'
}

const goToLogin = () => {
  currentView.value = 'login'
}

const goToForgotPassword = () => {
  currentView.value = 'forgot-password'
}

const goToProfile = () => {
  currentView.value = 'profile'
}

const goToOverlay = () => {
  currentView.value = 'overlay'
}

const goToDashboard = () => {
  currentView.value = 'dashboard'
}

const handleLoginSuccess = () => {
  currentView.value = 'dashboard'
}
</script>

<template>
  <OverlayView v-if="currentView === 'overlay'" @goToDashboard="goToDashboard" @goToProfile="goToProfile" @goToLogin="goToLogin" />
  <ProfileView v-else-if="currentView === 'profile'" @goToDashboard="goToDashboard" @goToLogin="goToLogin" @goToOverlay="goToOverlay" />
  <DashboardView v-else-if="currentView === 'dashboard'" @goToLogin="goToLogin" @goToProfile="goToProfile" @goToOverlay="goToOverlay" />
  <OnboardingUsernameStep v-else-if="currentView === 'onboarding'" @onboardingComplete="handleLoginSuccess" />
  <RegisterView v-else-if="currentView === 'register'" @goToLogin="goToLogin" @registerSuccess="handleLoginSuccess" />
  <ForgotPasswordView v-else-if="currentView === 'forgot-password'" @goToLogin="goToLogin" />
  <LoginView v-else @goToRegister="goToRegister" @goToForgotPassword="goToForgotPassword" @loginSuccess="handleLoginSuccess" />
</template>

<style>
* {
  box-sizing: border-box;
}

html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

input::placeholder {
  color: #4a5568;
}

input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
}
</style>
