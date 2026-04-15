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

    <!-- ───────── Background gradient ───────── -->
    <div class="fixed inset-0 z-0 pointer-events-none"
         style="background:
           radial-gradient(ellipse 60% 60% at 10% 20%, #1a3a6e 0%, transparent 70%),
           radial-gradient(ellipse 55% 55% at 85% 50%, #2b174a 0%, transparent 70%),
           radial-gradient(ellipse 40% 40% at 50% 100%, #111830 0%, transparent 80%),
           #0a0f1e;">
    </div>

    <!-- ───────── Floating background icons (Same as Login/Register) ───────── -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-100">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] min-w-[177.77vh] h-[56.25vw] min-h-[100vh]">
        <!-- Piggy bank top-left -->
        <img :src="IconBabi" class="absolute top-[6%] left-[12%] w-[22%] h-auto object-contain -rotate-[10deg]" />
        <!-- Bird center-top -->
        <img :src="IconBurung" class="absolute top-[16%] left-[38%] w-[18%] h-auto object-contain rotate-[2deg]" />
        <!-- Cat top-right -->
        <img :src="IconKucing" class="absolute top-[10%] right-[6%] w-[25%] h-auto object-contain rotate-[10deg]" />
        <!-- Money-box lower-left -->
        <img :src="IconKotak" class="absolute top-[48%] left-[7%] w-[32%] h-auto object-contain -rotate-[32deg]" />
        <!-- Wallet center -->
        <img :src="IconDompet" class="absolute top-[44%] left-[44%] w-[22%] h-auto object-contain rotate-[28deg]" />
        <!-- Coin stacks lower-center -->
        <img :src="IconAngka1" class="absolute top-[68%] left-[33%] w-[12%] h-auto object-contain -rotate-[10deg]" />
        <img :src="IconAngka1" class="absolute top-[78%] left-[45%] w-[12%] h-auto object-contain rotate-[15deg]" />
        <!-- Dollar coin lower-right -->
        <img :src="IconCoin" class="absolute top-[56%] right-[7%] w-[25%] h-auto object-contain -rotate-[5deg]" />
      </div>
    </div>

    <!-- Layout -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
      
      <!-- Top Logo -->
      <div class="absolute top-10 left-10 flex items-center space-x-2.5">
        <img :src="StandingMascot" alt="KomuniTip Logo" class="w-10 h-10 object-contain" />
        <span class="text-[22px] font-bold text-white tracking-tight">KomuniTip</span>
      </div>

      <!-- Main Card Container -->
      <div class="w-full max-w-[560px] relative mt-24">
        
        <!-- Mascot Circular Backdrop -->
        <div class="absolute -top-[100px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div class="relative w-[180px] h-[180px] rounded-full flex items-center justify-center"
               style="background-color: #111624; box-shadow: 0 4px 50px rgba(0,0,0,0.6);">
            <img :src="WizardMascot" class="w-[155%] translate-x-4 max-w-none h-auto object-contain" style="filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));" />
          </div>
        </div>

        <!-- Form container -->
        <div class="w-full rounded-[28px] px-8 pb-8 pt-20 relative"
             style="background-color: #111624; border: 1.5px solid #2e3a51; box-shadow: 0 30px 60px rgba(0,0,0,0.55);">

          <!-- Headings -->
          <div class="text-center mb-8">
            <h2 class="text-[26px] font-black text-white">Reset Password</h2>
          </div>

          <form @submit.prevent="handleReset" class="space-y-6">
            <div v-if="errorMsg" class="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg text-center">{{ errorMsg }}</div>
            <div v-if="successMsg" class="p-3 text-sm text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded-lg text-center">{{ successMsg }}</div>

            <!-- New Password -->
            <div class="space-y-2 text-left">
              <label class="text-[13px] font-bold text-gray-200 block">Password baru</label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="Min. 8 karakter"
                  class="w-full rounded-[16px] px-4 py-3.5 text-white text-[14px] font-medium outline-none transition-all placeholder-gray-500 pr-12 focus:border-blue-500"
                  style="background-color: #1a2235; border: 1.5px solid #334155;"
                  required
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-2 text-left">
              <label class="text-[13px] font-bold text-gray-200 block">Konfirmasi Password</label>
              <div class="relative">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="confirmPassword"
                  placeholder="Masukan Konfirmasi Password Baru"
                  class="w-full rounded-[16px] px-4 py-3.5 text-white text-[14px] font-medium outline-none transition-all placeholder-gray-500 pr-12 focus:border-blue-500"
                  style="background-color: #1a2235; border: 1.5px solid #334155;"
                  required
                />
                <button 
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                >
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <div class="pt-2">
              <button type="submit" :disabled="loading"
                      class="w-full text-white font-[700] text-[15px] py-3.5 rounded-[16px] transition-all hover:translate-y-[2px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                      style="background: #2563eb; border: 2px solid #60a5fa; box-shadow: 0 4px 0 #1e3a8a;">
                <span v-if="loading">Menyimpan...</span>
                <span v-else>Simpan Password Baru</span>
              </button>
            </div>

            <!-- Footer Text -->
            <div class="text-center text-[12px] pt-1" style="color: #7a8ba8;">
              Ingat passwordmu? 
              <router-link to="/login" class="font-bold ml-1 transition-opacity cursor-pointer text-[#60a5fa] hover:text-white">Masuk sekarang</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
