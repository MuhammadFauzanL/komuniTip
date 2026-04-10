<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { GoogleLogin } from 'vue3-google-login'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import RegisterMascot from '../assets/Image_(Mascot Register).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const emit = defineEmits(['goToLogin', 'registerSuccess'])

const fullName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const { register, googleAuth } = useAuth()

const handleRegister = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Password dan konfirmasi password tidak cocok!'
    return
  }

  // Validasi spasi untuk username
  if (/\s/.test(username.value)) {
    errorMsg.value = 'Username tidak boleh mengandung spasi'
    return
  }

  loading.value = true
  try {
    await register({ 
      nama_lengkap: fullName.value, 
      username: username.value,
      email: email.value, 
      password: password.value 
    })
    successMsg.value = 'Akun berhasil dibuat! Mengalihkan ke login...'
    setTimeout(() => {
      emit('goToLogin')
    }, 2000)
  } catch (err) {
    errorMsg.value = err.message || 'Gagal mendaftar, silakan coba lagi'
  } finally {
    loading.value = false
  }
}

const handleGoogleCallback = async (response) => {
  if (response.credential) {
    errorMsg.value = ''
    loading.value = true
    try {
      await googleAuth(response.credential)
      emit('registerSuccess') // acts as login
    } catch (err) {
      errorMsg.value = err.message || 'Google Register gagal'
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <!-- Root page wrapper -->
  <div class="min-h-screen w-full relative overflow-hidden font-sans flex flex-col"
       style="background-color: #0a0f1e;">

    <!-- ───────── Background gradient ───────── -->
    <div class="fixed inset-0 z-0 pointer-events-none"
         style="background:
           radial-gradient(ellipse 60% 60% at 10% 20%, #0d4a55 0%, transparent 70%),
           radial-gradient(ellipse 55% 55% at 85% 50%, #174a44 0%, transparent 70%),
           radial-gradient(ellipse 40% 40% at 50% 100%, #112830 0%, transparent 80%),
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
    <div class="relative z-10 flex-1 w-full flex flex-col lg:flex-row items-center lg:items-start justify-between max-w-7xl mx-auto px-6 lg:px-12 pt-4 pb-10 gap-8">

      <!-- ═══ LEFT SECTION ═══ -->
      <div class="flex-1 w-full max-w-xl flex flex-col">

        <!-- Logo -->
        <div class="flex items-center space-x-2.5 mb-8">
          <img :src="StandingMascot" alt="KomuniTip Logo" class="w-10 h-10 object-contain" />
          <span class="text-[22px] font-bold text-white tracking-tight">KomuniTip</span>
        </div>

        <!-- Tag -->
        <div class="mb-4">
          <span class="inline-block px-4 py-1.5 rounded-full border text-[13px] font-bold tracking-tight"
                style="color: #10b981; background-color: rgba(16, 185, 129, 0.1); border-color: #10b981;">
            Mulai Perjalananmu
          </span>
        </div>

        <!-- Welcome text -->
        <div class="mb-8">
          <h1 class="text-[42px] sm:text-[52px] font-[900] text-white leading-[1.05] tracking-tight">
            Daftar & Mulai<br />
            Terima <span style="color: #4a9dff;">Dukungan</span>
          </h1>
          <p class="text-[#7a8ba8] text-[15px] max-w-[420px] font-medium leading-relaxed mt-5">
            Bergabung dengan ribuan kreator lainnya yang telah mengubah hobi menjadi profesi yang menghasilkan.
          </p>
        </div>

        <!-- Features Checklist -->
        <div class="space-y-4 mb-8">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #10b981;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-white text-[14px] font-semibold">Terima dana langsung ke e-wallet & rekening</span>
          </div>
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #10b981;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-white text-[14px] font-semibold">Integrasi overlay live stream yang mudah</span>
          </div>
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color: #10b981;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-white text-[14px] font-semibold">Dashboard analitik lengkap & real-time</span>
          </div>
        </div>

        <!-- Mascot Image -->
        <div class="relative w-full max-w-[320px] aspect-square -mt-6 mx-auto lg:ml-8 flex justify-center items-center">
           <!-- Circular dark backdrop behind mascot (smaller) -->
           <div class="absolute w-[70%] h-[70%] rounded-full border z-0" style="background-color: #161d2d; border-color: #242d42;"></div>
           <img
             :src="RegisterMascot"
             alt="KomuniTip Mascot"
             class="w-[100%] h-auto object-contain relative z-10"
             style="filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));"
           />
        </div>
        
      </div>


      <!-- ═══ RIGHT SECTION — Register Form ═══ -->
      <div class="flex-1 w-full max-w-[520px] flex flex-col items-center lg:items-end mx-auto lg:mt-0 relative">
        
        <!-- Login Link Top Right -->
        <div class="w-full flex justify-end items-center gap-3 text-[14px] font-medium text-[#7a8ba8] mb-8">
          Punya akun? 
          <button @click="emit('goToLogin')" class="bg-[#3b82f6] hover:brightness-110 text-white px-6 py-2.5 rounded-[12px] font-[700] transition-all" style="box-shadow: 0 4px 16px rgba(59,130,246,0.38), inset 0 -2px 0 rgba(0,0,0,0.14);">
            Masuk
          </button>
        </div>

        <!-- Form card -->
        <div class="w-full rounded-[28px] p-8 border relative overflow-hidden"
             style="background-color: #111624; border-color: #242d42; box-shadow: 0 30px 60px rgba(0,0,0,0.55);">

          <!-- Top shimmer -->
          <div class="absolute top-0 left-0 w-full h-[1px]"
               style="background: linear-gradient(90deg, transparent, rgba(59,130,246,0.18), transparent);"></div>

          <h2 class="text-white text-[24px] font-bold mb-6 text-left w-full">Buat Akun Baru</h2>

          <!-- Google button -->
          <div class="w-full relative flex justify-center" style="height: 48px;">
            <GoogleLogin 
              :callback="handleGoogleCallback" 
              :button-config="{
                theme: 'filled_black',
                size: 'large',
                text: 'signup_with',
                shape: 'rectangular',
                width: '456'
              }"
            />
          </div>

          <!-- Divider "ATAU DENGAN EMAIL" -->
          <div class="relative flex items-center my-7">
            <div class="flex-grow border-t" style="border-color: #1e2538;"></div>
            <span class="mx-4 text-[11px] font-[700] tracking-wider uppercase" style="color: #5a6478;">Atau Dengan Email</span>
            <div class="flex-grow border-t" style="border-color: #1e2538;"></div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleRegister" class="space-y-4">

            <!-- Alert Error & Success -->
            <div v-if="errorMsg" class="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg text-center">{{ errorMsg }}</div>
            <div v-if="successMsg" class="p-3 text-sm text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded-lg text-center">{{ successMsg }}</div>

            <!-- Nama Lengkap -->
            <div class="space-y-1.5 text-left">
              <label class="text-[13px] font-semibold text-white block">Nama Lengkap</label>
              <input
                type="text"
                v-model="fullName"
                placeholder="Contoh: Ihsan"
                class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all placeholder-[#5a6478]"
                style="background-color: #161b28; border: 1px solid #252f42;"
                required
              />
            </div>

            <!-- Username -->
            <div class="space-y-1.5 text-left">
              <label class="text-[13px] font-semibold text-white block">Username <span class="text-[#7a8ba8] font-normal">(tanpa spasi)</span></label>
              <input
                type="text"
                v-model="username"
                placeholder="ihsan_gaming"
                class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all placeholder-[#5a6478]"
                style="background-color: #161b28; border: 1px solid #252f42;"
                required
              />
            </div>

            <!-- Email -->
            <div class="space-y-1.5 text-left">
              <label class="text-[13px] font-semibold text-white block">Alamat Email</label>
              <input
                type="email"
                v-model="email"
                placeholder="nama@email.com"
                class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all placeholder-[#5a6478]"
                style="background-color: #161b28; border: 1px solid #252f42;"
                required
              />
            </div>

            <!-- Password and Confirm Password Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Password -->
              <div class="space-y-1.5 text-left">
                <label class="text-[13px] font-semibold text-white block">Password</label>
                <div class="relative">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="password"
                    placeholder="Min. 8 karakter"
                    class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all placeholder-[#5a6478] pr-12"
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

              <!-- Konfirmasi Password -->
              <div class="space-y-1.5 text-left">
                <label class="text-[13px] font-semibold text-white block">Konfirmasi Password</label>
                <div class="relative">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="confirmPassword"
                    placeholder="Ulangi password"
                    class="w-full rounded-[12px] px-4 py-3 text-white text-[14px] outline-none transition-all placeholder-[#5a6478] pr-12"
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
            </div>

            <!-- Consent -->
            <div class="pt-2">
              <p class="text-[12px] font-medium" style="color: #7a8ba8;">
                Saya setuju dengan <a href="#" class="font-bold hover:underline" style="color: #4a9dff;">Syarat & Ketentuan</a> dan <a href="#" class="font-bold hover:underline" style="color: #4a9dff;">Kebijakan Privasi</a>
              </p>
            </div>

            <!-- Submit -->
            <div class="pt-4">
              <button type="submit" :disabled="loading"
                      class="w-full text-white font-[700] text-[15px] py-[14px] rounded-[12px] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      style="background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 4px 24px rgba(37,99,235,0.38), inset 0 -2px 0 rgba(0,0,0,0.14);">
                <span v-if="loading">Memproses...</span>
                <span v-else>Buat Akun Sekarang</span>
              </button>
            </div>

          </form>
        </div>

        <!-- Back to Home button -->
        <div class="mt-6 flex w-full justify-center">
          <a href="#"
             class="inline-flex items-center gap-2 text-[13px] font-semibold transition-all hover:brightness-125 px-5 py-2.5 rounded-full border"
             style="color: #5a6478; background-color: #111624; border-color: #1e2538; box-shadow: 0 8px 20px rgba(0,0,0,0.35);">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Kembali ke Beranda
          </a>
        </div>

      </div>
    </div>
  </div>
</template>
