<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import WizardMascot from '../assets/Image_(Wizard Mascot).png'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const router = useRouter()
const route = useRoute()
const token = ref(route.query.token || '')
const emit = defineEmits(['goToLogin', 'resetSuccess'])

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const { resetPassword } = useAuth()

const handleReset = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Password dan konfirmasi password tidak cocok!'
    return
  }

  if (password.value.length < 8) {
    errorMsg.value = 'Password minimal 8 karakter!'
    return
  }

  loading.value = true
  try {
    await resetPassword({
      token: token.value,
      new_password: password.value
    })
    successMsg.value = 'Password berhasil diperbarui! Mengalihkan ke halaman login...'
    setTimeout(() => {
      router.push('/login')
    }, 2500)
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message || 'Gagal reset password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full relative overflow-hidden font-sans flex flex-col"
       style="background-color: #0a0f1e;">

    <!-- Background gradient -->
    <div class="fixed inset-0 z-0 pointer-events-none"
         style="background:
           radial-gradient(ellipse 60% 60% at 10% 20%, #1a3a6e 0%, transparent 70%),
           radial-gradient(ellipse 55% 55% at 85% 50%, #2b174a 0%, transparent 70%),
           radial-gradient(ellipse 40% 40% at 50% 100%, #111830 0%, transparent 80%),
           #0a0f1e;">
    </div>

    <!-- Floating background icons (Same as Login/Register) -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-100">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] min-w-[177.77vh] h-[56.25vw] min-h-[100vh]">
        <img :src="IconBabi" class="absolute top-[6%] left-[12%] w-[22%] h-auto object-contain -rotate-[10deg] opacity-20" />
        <img :src="IconBurung" class="absolute top-[16%] left-[38%] w-[18%] h-auto object-contain rotate-[2deg] opacity-20" />
        <img :src="IconKucing" class="absolute top-[10%] right-[6%] w-[25%] h-auto object-contain rotate-[10deg] opacity-20" />
        <img :src="IconKotak" class="absolute top-[48%] left-[7%] w-[32%] h-auto object-contain -rotate-[32deg] opacity-20" />
        <img :src="IconDompet" class="absolute top-[44%] left-[44%] w-[22%] h-auto object-contain rotate-[28deg] opacity-20" />
        <img :src="IconAngka1" class="absolute top-[68%] left-[33%] w-[12%] h-auto object-contain -rotate-[10deg] opacity-20" />
        <img :src="IconCoin" class="absolute top-[56%] right-[7%] w-[25%] h-auto object-contain -rotate-[5deg] opacity-20" />
      </div>
    </div>

    <!-- Layout -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
      
      <!-- Top Logo -->
      <div class="absolute top-10 left-10 flex items-center space-x-2.5">
        <img :src="StandingMascot" alt="KomuniTip Logo" class="w-10 h-10 object-contain" />
        <span class="text-[22px] font-bold text-white tracking-tight">KomuniTip</span>
      </div>

      <!-- Main Card -->
      <div class="w-full max-w-[460px] relative mt-16">
        
        <!-- Mascot Circular Backdrop -->
        <div class="absolute -top-[100px] left-1/2 -translate-x-1/2 z-20">
          <div class="relative w-[180px] h-[180px] rounded-full border-2 p-4 flex items-center justify-center overflow-hidden"
               style="background-color: #0c1223; border-color: #242d42; box-shadow: 0 0 40px rgba(59,130,246,0.3);">
            <img :src="WizardMascot" class="w-[140%] h-auto object-contain mt-4" style="filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));" />
          </div>
        </div>

        <!-- Form container -->
        <div class="w-full rounded-[28px] p-8 pt-24 border relative overflow-hidden"
             style="background-color: #111624; border-color: #242d42; box-shadow: 0 30px 60px rgba(0,0,0,0.55);">
          
          <div class="absolute top-0 left-0 w-full h-[1px]"
               style="background: linear-gradient(90deg, transparent, rgba(59,130,246,0.18), transparent);"></div>

          <div class="flex items-center gap-4 mb-4">
            <router-link to="/login" class="p-2.5 rounded-xl border border-[#242d42] bg-[#111624] text-white hover:bg-[#161b28] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <h2 class="text-[26px] font-bold text-white">Reset Password</h2>
          </div>

          <form @submit.prevent="handleReset" class="space-y-6">
            <div v-if="errorMsg" class="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg text-center">{{ errorMsg }}</div>
            <div v-if="successMsg" class="p-3 text-sm text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded-lg text-center">{{ successMsg }}</div>

            <!-- New Password -->
            <div class="space-y-1.5 text-left">
              <label class="text-[13px] font-semibold text-white block">Password baru</label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="Masukan Password Baru"
                  class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all placeholder-[#404a5f] pr-12"
                  style="background-color: #161b28; border: 1px solid #252f42;"
                  required
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a6478] hover:text-[#4a9dff] transition-colors focus:outline-none"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.225 0 2.39.215 3.475.608M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5 text-left">
              <label class="text-[13px] font-semibold text-white block">Konfirmasi Password</label>
              <div class="relative">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="confirmPassword"
                  placeholder="Ulangi password baru"
                  class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all placeholder-[#404a5f] pr-12"
                  style="background-color: #161b28; border: 1px solid #252f42;"
                  required
                />
                <button 
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a6478] hover:text-[#4a9dff] transition-colors focus:outline-none"
                >
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.225 0 2.39.215 3.475.608M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <div class="pt-4">
              <button type="submit" :disabled="loading"
                      class="w-full text-white font-[700] text-[18px] py-[14px] rounded-[16px] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      style="background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 4px 24px rgba(37,99,235,0.38), inset 0 -2px 0 rgba(0,0,0,0.14);">
                <span v-if="loading">Menyimpan...</span>
                <span v-else>Save</span>
              </button>
            </div>

            <div class="text-center text-[14px] pt-2" style="color: #5a6478;">
              Ingat passwordmu? 
              <router-link to="/login" class="font-bold ml-1 hover:opacity-80 transition-opacity cursor-pointer" style="color: #4a9dff;">Masuk sekarang</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
