<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import TopHatMascot from '../assets/Image (Top Hat Mascot).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const emit = defineEmits(['onboardingComplete'])

const username = ref('')
const loading = ref(false)
const errorMsg = ref('')

const router = useRouter()
const { completeOnboarding } = useAuth()

const handleSubmit = async () => {
  errorMsg.value = ''
  
  if (/[^a-z0-9_]/.test(username.value)) {
    errorMsg.value = 'Username hanya boleh berisi huruf kecil, angka, dan underscore'
    return
  }

  if (username.value.length < 3) {
    errorMsg.value = 'Username minimal 3 karakter'
    return
  }

  loading.value = true
  try {
    await completeOnboarding(username.value)
    router.push('/dashboard')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message || 'Gagal menyimpan username'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full relative overflow-hidden font-sans flex flex-col items-center justify-center p-6"
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

    <!-- Logo Top Left -->
    <div class="absolute top-8 left-8 z-20 flex items-center space-x-3">
      <img :src="StandingMascot" alt="KomuniTip Logo" class="w-12 h-12 object-contain" />
      <span class="text-[24px] font-bold text-white tracking-tight">KomuniTip</span>
    </div>

    <!-- Onboarding Card -->
    <div class="relative z-10 w-full max-w-[500px] rounded-[32px] px-10 pb-10 pt-[120px] mt-[120px] -translate-y-6 md:-translate-y-8 border"
         style="background-color: #111624; border-color: #242d42; box-shadow: 0 30px 60px rgba(0,0,0,0.55);">

      <div class="absolute top-0 left-0 w-full h-[1px] rounded-t-[32px]"
           style="background: linear-gradient(90deg, transparent, rgba(59,130,246,0.18), transparent);"></div>

      <!-- Mascot overlapping top border (Separated background & image) -->
      <div class="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[280px] h-[280px] flex items-center justify-center pointer-events-none z-30">
        <!-- Separate round background layer -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full"
             style="background-color: #182136; border: 1px solid #242d42; box-shadow: 0 16px 30px rgba(0,0,0,0.4), inset 0 2px 10px rgba(255,255,255,0.02); transform: translateY(-40%);">
        </div>
        <!-- Mascot layer (larger than background) -->
        <img :src="TopHatMascot" alt="Top Hat Mascot" class="relative z-10 w-[270px] h-[270px] object-contain drop-shadow-2xl" style="transform: translateY(-5px);" />
      </div>

      <div class="text-center mb-10 relative z-20">
        <h2 class="text-[32px] font-bold text-white mb-3 tracking-tight">Selangkah lagi!</h2>
        <p class="text-[#7a8ba8] text-[15px]">Pilih username unik untuk halaman kreator kamu.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6 relative z-20">
        
        <div v-if="errorMsg" class="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-[12px] text-center">
          {{ errorMsg }}
        </div>

        <!-- Username Input -->
        <div class="space-y-1.5 text-left">
          <label class="text-[13px] font-semibold text-white block">Username <span class="text-[#7a8ba8] font-normal">(tanpa spasi)</span></label>
          <div class="relative flex items-center">
            <span class="absolute left-4 font-bold text-[#7a8ba8] text-[15px]">@</span>
            <input
              type="text"
              v-model="username"
              placeholder="Contoh: nitipkekita"
              class="w-full rounded-[12px] pl-10 pr-4 py-3.5 text-white text-[14px] outline-none transition-all placeholder-[#5a6478]"
              style="background-color: #1a2235; border: 1px solid #252f42;"
              @input="username = username.toLowerCase().replace(/[^a-z0-9_]/g, '')"
              required
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <button type="submit" :disabled="loading"
                  class="w-full text-white font-[700] text-[16px] py-[16px] rounded-[16px] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed leading-tight tracking-wide"
                  style="background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 4px 24px rgba(37,99,235,0.38), inset 0 -2px 0 rgba(0,0,0,0.14);">
            <span v-if="loading">Menyimpan...</span>
            <span v-else>Selesaikan Pendaftaran</span>
          </button>
        </div>
      </form>

    </div>
  </div>
</template>
