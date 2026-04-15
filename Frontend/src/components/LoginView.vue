<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { GoogleLogin } from 'vue3-google-login'
import SittingMascot from '../assets/Image_(Sitting Cowboy Mascot).png'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const emit = defineEmits(['goToRegister', 'goToForgotPassword', 'loginSuccess'])

const router = useRouter()
const identifier = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const { login, googleAuth } = useAuth()

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await login({
      identifier: identifier.value,
      password: password.value
    })
    
    if (res.require_onboarding) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    errorMsg.value = err.message || 'Gagal login, silakan coba lagi'
  } finally {
    loading.value = false
  }
}

const handleGoogleSuccess = async (response) => {
  loading.value = true
  try {
    const res = await googleAuth(response.credential)
    
    if (res.require_onboarding) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    errorMsg.value = err.message || 'Google Login gagal'
  } finally {
    loading.value = false
  }
}

const handleGoogleError = (error) => {
  console.error("Google Login Error:", error);
  errorMsg.value = "Koneksi Google gagal / ditutup. (" + (error?.type || 'Unknown') + ")";
}
</script>

<template>
  <!-- Root page wrapper -->
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

    <!-- ───────── Floating background icons ───────── -->
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


    <!-- ───────── Main layout ───────── -->
    <div class="relative z-10 flex-1 w-full flex flex-col xl:flex-row items-center xl:items-start justify-between max-w-7xl mx-auto px-6 xl:px-12 pt-4 pb-10 gap-8 xl:pt-[5%]">

      <!-- ═══ LEFT SECTION ═══ -->
      <div class="flex-1 w-full max-w-xl flex flex-col">

        <!-- Logo -->
        <div class="flex items-center space-x-2.5 mb-10">
          <img :src="StandingMascot" alt="KomuniTip Logo" class="w-10 h-10 object-contain" />
          <span class="text-[22px] font-bold text-white tracking-tight">KomuniTip</span>
        </div>

        <!-- Welcome text -->
        <div class="mb-16">
          <h1 class="text-[42px] sm:text-[52px] font-[900] text-white leading-[1.05] tracking-tight">
            Selamat Datang<br />
            Kembali, <span style="color: #4a9dff;">Kreator!</span>
          </h1>
          <p class="text-[#7a8ba8] text-[15px] max-w-[340px] font-normal leading-relaxed mt-5">
            Masuk ke dashboardmu dan lihat dukungan terbaru dari komunitas.
          </p>
        </div>

        <!-- Revenue card with 3D stack + mascot -->
        <div class="relative w-full max-w-[400px] ml-4">

          <!-- Drop shadow -->
          <div class="absolute -bottom-10 -right-10 w-[115%] h-[115%] bg-black/50 blur-[40px] rounded-[28px] -z-30 pointer-events-none"></div>

          <!-- Back layer (dark, more offset) -->
          <div class="absolute top-10 -right-6 w-full h-full rounded-[28px] -z-20 rotate-[6deg] border border-white/5"
               style="background-color: #0c0e12;"></div>

          <!-- Middle layer (brown/orange, more visible and offset) -->
          <div class="absolute top-5 -right-3 w-full h-full rounded-[28px] -z-10 rotate-[3deg] border shadow-xl"
               style="background: linear-gradient(135deg, #5c3010, #2e1205); border-color: rgba(255,143,64,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.5);"></div>

          <!-- Front card -->
          <div class="relative z-10 rounded-[28px] p-6 pt-5 border shadow-[0_20px_50px_rgba(0,0,0,0.55)] overflow-hidden"
               style="background: linear-gradient(145deg, #18212e, #0f1520); border-color: #252f42;">

            <!-- Top accent line -->
            <div class="absolute top-0 left-0 w-full h-[1px]"
                 style="background: linear-gradient(90deg, transparent, rgba(59,130,246,0.25), transparent);"></div>

            <!-- Card header -->
            <div class="flex justify-between items-start mb-8 relative z-10">
              <!-- Green money icon -->
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center border"
                   style="background-color: #0d3320; border-color: #1a5c38;">
                <!-- Money bag icon -->
                <svg viewBox="0 0 24 24" class="w-6 h-6" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C10.5 2 9.5 2.8 9.1 4H8C6.9 4 6 4.9 6 6C6 6.7 6.3 7.3 6.8 7.7C5.1 9 4 11 4 13C4 17.4 7.6 21 12 21C16.4 21 20 17.4 20 13C20 11 18.9 9 17.2 7.7C17.7 7.3 18 6.7 18 6C18 4.9 17.1 4 16 4H14.9C14.5 2.8 13.5 2 12 2ZM12 4C12.6 4 13 4.4 13 5H11C11 4.4 11.4 4 12 4ZM12 8C15.3 8 18 10.7 18 14C18 17.3 15.3 20 12 20C8.7 20 6 17.3 6 14C6 10.7 8.7 8 12 8ZM12 10V11H11C10.4 11 10 11.4 10 12C10 12.6 10.4 13 11 13H13C13 13 13 13 13 13V14H10V15H12V16H13V15H13C13.6 15 14 14.6 14 14C14 13.4 13.6 13 13 13H11V12H14V11H13V10H12Z"/>
                </svg>
              </div>
              <!-- Green badge -->
              <div class="text-[12px] font-bold px-3 py-1.5 rounded-full mr-12 sm:mr-6"
                   style="color: #10b981; background-color: #053a28;">+12% Bulan ini</div>
            </div>

            <!-- Chart -->
            <div class="h-24 w-[116%] -ml-[8%] absolute top-[72px] pointer-events-none">
              <svg viewBox="0 0 100 40" class="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#2dd4bf"/>
                    <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,36 Q12,20 25,28 T55,22 T100,6" fill="none" stroke="#2dd4bf" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M0,40 L0,36 Q12,20 25,28 T55,22 T100,6 L100,40 Z" fill="url(#chartGrad)" opacity="0.14"/>
              </svg>
            </div>

            <!-- Revenue amount -->
            <div class="mt-[88px] relative z-10">
              <div class="text-[13px] font-medium mb-1" style="color: #7a8ba8;">Total Pendapatan</div>
              <div class="text-[32px] font-[800] text-white tracking-tight">Rp 4.500.000</div>
            </div>
          </div>

          <!-- Mascot: right side, rotated to match reference -->
          <div class="absolute -top-[100px] -right-[12%] z-30 pointer-events-none flex items-center justify-center">
            <!-- Blue tilted backdrop (border only, transparent bg) -->
            <div class="absolute w-[160px] h-[150px] rounded-[36px] rotate-[10deg] border-2 translate-x-17 -z-10"
                 style="background: rgba(34,85,212,0.06); border-color: rgba(80,150,255,0.7); box-shadow: 0 0 18px rgba(60,120,255,0.4), inset 0 0 12px rgba(60,100,255,0.12);"></div>
            <!-- Mascot image rotated to match reference -->
            <img
              :src="SittingMascot"
              alt="Mascot"
              class="relative z-15 w-[260px] h-[260px] object-contain rotate-[10deg] translate-x-17"
              style="filter: drop-shadow(0 16px 24px rgba(0,0,0,0.75));"
            />
          </div>
        </div>
      </div>


      <!-- ═══ RIGHT SECTION — Login Form ═══ -->
      <div class="flex-1 w-full max-w-[460px] flex flex-col items-center lg:mt-[90px] mx-auto">

        <!-- Form card -->
        <div class="w-full rounded-[28px] p-8 border relative overflow-hidden"
             style="background-color: #111624; border-color: #242d42; box-shadow: 0 30px 60px rgba(0,0,0,0.55);">

          <!-- Top shimmer -->
          <div class="absolute top-0 left-0 w-full h-[1px]"
               style="background: linear-gradient(90deg, transparent, rgba(59,130,246,0.18), transparent);"></div>

          <!-- Google button -->
          <div class="w-full relative flex justify-center" style="height: 48px;">
            <GoogleLogin 
              :callback="handleGoogleSuccess" 
              :error-callback="handleGoogleError"
              :button-config="{
                theme: 'filled_black',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: '396'
              }"
            />
          </div>

          <!-- Divider "ATAU EMAIL" -->
          <div class="relative flex items-center my-7">
            <div class="flex-grow border-t" style="border-color: #1e2538;"></div>
            <span class="mx-4 text-[11px] font-[700] tracking-wider uppercase" style="color: #5a6478;">Atau Email</span>
            <div class="flex-grow border-t" style="border-color: #1e2538;"></div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-5">
            <!-- Alert Error -->
            <div v-if="errorMsg" class="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg text-center">{{ errorMsg }}</div>

            <!-- Email / Username -->
            <div class="space-y-1.5 text-left">
              <label class="text-[13px] font-semibold text-white block">Email atau Username</label>
              <input
                type="text"
                v-model="identifier"
                placeholder="email@contoh.com atau username"
                class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all"
                style="background-color: #161b28; border: 1px solid #252f42;"
                required
              />
            </div>

            <!-- Password -->
            <div class="space-y-1.5 text-left">
              <label class="text-[13px] font-semibold text-white block">Password</label>
              <div class="relative">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  placeholder="Ketik password kamu"
                  class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all pr-12"
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

            <!-- Remember me / Forgot password -->
            <div class="flex items-center justify-between text-[13px]">
              <div class="flex items-center">
                <input type="checkbox" v-model="rememberMe" id="remember" class="w-4 h-4 rounded border-[#252f42] bg-[#161b28] text-blue-600 focus:ring-blue-500" />
                <label for="remember" class="ml-2 text-[#7a8ba8] cursor-pointer">Ingat saya</label>
              </div>
              <router-link to="/forgot-password" class="text-[#4a9dff] font-semibold hover:underline">Lupa password?</router-link>
            </div>

            <!-- Submit -->
            <div class="pt-5">
              <button type="submit" :disabled="loading"
                      class="w-full text-white font-[700] text-[15px] py-[14px] rounded-[12px] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      style="background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 4px 24px rgba(37,99,235,0.38), inset 0 -2px 0 rgba(0,0,0,0.14);">
                <span v-if="loading">Memproses...</span>
                <span v-else>Masuk</span>
              </button>
            </div>

            <!-- Register link -->
            <div class="text-center text-[14px] pt-4" style="color: #5a6478;">
              Belum punya akun? 
              <router-link to="/register" class="font-bold ml-1 hover:opacity-80 transition-opacity" style="color: #4a9dff;">Daftar gratis</router-link>
            </div>

          </form>
        </div>

        <!-- Back to Home button -->
        <div class="mt-6 flex w-full justify-center">
          <router-link to="/"
            class="inline-flex items-center gap-2 text-[13px] font-semibold transition-all hover:brightness-125 px-5 py-2.5 rounded-full border"
            style="color: #5a6478; background-color: #111624; border-color: #1e2538; box-shadow: 0 8px 20px rgba(0,0,0,0.35);">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Kembali ke Beranda
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
