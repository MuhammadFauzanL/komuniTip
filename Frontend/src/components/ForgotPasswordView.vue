<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import WizardMascot from '../assets/Image_(Wizard Mascot).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const emit = defineEmits(['goToLogin'])

const router = useRouter()
const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const { forgotPassword } = useAuth()

const handleReset = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = true
  try {
    const res = await forgotPassword(email.value)
    successMsg.value = res?.message || 'Link reset password telah dikirim ke email kamu'
    email.value = ''
  } catch (err) {
    errorMsg.value = err.message || 'Gagal memproses request'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Root page wrapper -->
  <div class="min-h-screen w-full relative overflow-hidden font-sans flex items-center justify-center"
       style="background-color: #0a0f1e;">

    <!-- ───────── Background gradient ───────── -->
    <div class="fixed inset-0 z-0 pointer-events-none"
         style="background:
           radial-gradient(ellipse 55% 55% at 15% 15%, #2d1b69 0%, transparent 65%),
           radial-gradient(ellipse 50% 60% at 88% 20%, #0d3a5e 0%, transparent 65%),
           radial-gradient(ellipse 45% 45% at 80% 85%, #1a0e4a 0%, transparent 60%),
           radial-gradient(ellipse 40% 40% at 20% 88%, #0a2a4a 0%, transparent 60%),
           #060b17;">
    </div>

    <!-- ───────── Floating background icons ───────── -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-100">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] min-w-[177.77vh] h-[56.25vw] min-h-[100vh]">
        <img :src="IconBabi"   class="absolute top-[6%]  left-[12%] w-[22%] h-auto object-contain -rotate-[10deg] opacity-75" />
        <img :src="IconBurung" class="absolute top-[16%] left-[38%] w-[18%] h-auto object-contain  rotate-[2deg]  opacity-80" />
        <img :src="IconKucing" class="absolute top-[10%] right-[6%]  w-[25%] h-auto object-contain  rotate-[10deg] opacity-75" />
        <img :src="IconKotak"  class="absolute top-[48%] left-[7%]  w-[32%] h-auto object-contain -rotate-[32deg] opacity-65 blur-[1px]" />
        <img :src="IconDompet" class="absolute top-[44%] left-[44%] w-[22%] h-auto object-contain  rotate-[28deg] opacity-80" />
        <img :src="IconAngka1" class="absolute top-[68%] left-[33%] w-[12%] h-auto object-contain -rotate-[10deg] opacity-70" />
        <img :src="IconAngka1" class="absolute top-[78%] left-[45%] w-[12%] h-auto object-contain  rotate-[15deg] opacity-70" />
        <img :src="IconCoin"   class="absolute top-[56%] right-[7%]  w-[25%] h-auto object-contain -rotate-[5deg]  opacity-65 blur-[1px]" />
      </div>
    </div>

    <!-- Logo top left -->
    <div class="absolute top-6 left-6 lg:top-8 lg:left-10 flex items-center space-x-2.5 z-20">
      <img :src="StandingMascot" alt="KomuniTip Logo" class="w-8 h-8 object-contain" />
      <span class="text-[18px] font-bold text-white tracking-tight">KomuniTip</span>
    </div>

    <!-- ───────── Main layout (Centered Card) ───────── -->
    <div class="relative z-10 w-full max-w-[580px] px-6 mt-24">

      <!-- Form card -->
      <div class="w-full rounded-[28px] px-8 pb-8 pt-24 border relative"
           style="background-color: #111624; border: 1.5px solid #2e3a51; box-shadow: 0 30px 60px rgba(0,0,0,0.55);">

        <!-- Top shimmer -->
        <div class="absolute top-0 left-0 w-full h-[1px] rounded-t-[28px]"
             style="background: linear-gradient(90deg, transparent, rgba(59,130,246,0.18), transparent);"></div>

        <!-- Wizard Mascot overlapping top edge -->
        <div class="absolute -top-[160px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] flex items-center justify-center">
          <!-- Circular dark backdrop behind mascot -->
          <div class="absolute w-[220px] h-[220px] rounded-full border z-0" style="background-color: #161d2d; border-color: #242d42;"></div>
          <!-- Wizard Mascot Image -->
          <img
            :src="WizardMascot"
            alt="Wizard Mascot"
            class="w-[280px] h-auto object-contain relative z-10 translate-x-6"
            style="filter: drop-shadow(0 15px 25px rgba(0,0,0,0.5));"
          />
        </div>

        <!-- Title & Description -->
        <div class="text-center mb-8 mt-2">
          <h2 class="text-white text-[24px] font-[800] tracking-tight mb-3">Lupa Password?</h2>
          <p class="text-[#7a8ba8] text-[13px] font-medium leading-relaxed px-2">
            Jangan khawatir! Masukkan email kamu di bawah ini dan kami akan mengirimkan link untuk mereset passwordmu.
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleReset" class="space-y-6">

          <!-- Alert Messages -->
          <div v-if="errorMsg" class="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg text-center">{{ errorMsg }}</div>
          <div v-if="successMsg" class="p-3 text-sm text-green-400 bg-green-900/30 border border-green-800 rounded-lg text-center">{{ successMsg }}</div>

          <!-- Email -->
          <div class="space-y-1.5 text-left">
            <label class="text-[13px] font-semibold text-white block">Alamat Email</label>
              <input
                type="email"
                v-model="email"
                placeholder="nama@emailanda.com"
                class="w-full rounded-[16px] px-4 py-3 text-white text-[14px] font-medium outline-none transition-all placeholder-gray-500"
                style="background-color: #1a2235; border: 1.5px solid #334155;"
                required
              />
          </div>

          <!-- Submit -->
          <div class="pt-2">
            <button type="submit" :disabled="loading"
                    class="w-full text-white font-[700] text-[15px] py-3.5 rounded-[16px] transition-all hover:translate-y-[2px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: #2563eb; border: 2px solid #60a5fa; box-shadow: 0 4px 0 #1e3a8a;">
              <span v-if="loading">Memproses...</span>
              <span v-else>Kirim Link Reset</span>
            </button>
          </div>

          <!-- Go back to login -->
          <div class="text-center text-[13px] pt-4 pb-1" style="color: #7a8ba8;">
            Kembali ke 
            <router-link to="/login" class="font-bold ml-1 hover:opacity-80 transition-opacity" style="color: #4a9dff;">Halaman Login</router-link>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>
