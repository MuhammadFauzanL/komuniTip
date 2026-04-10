<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['onboardingComplete'])

const username = ref('')
const loading = ref(false)
const errorMsg = ref('')

const { completeOnboarding } = useAuth()

const handleSubmit = async () => {
  errorMsg.value = ''
  
  if (/\s/.test(username.value)) {
    errorMsg.value = 'Username tidak boleh mengandung spasi'
    return
  }

  if (username.value.length < 3) {
    errorMsg.value = 'Username minimal 3 karakter'
    return
  }

  loading.value = true
  try {
    await completeOnboarding(username.value)
    emit('onboardingComplete')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message || 'Gagal menyimpan username'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center font-sans relative overflow-hidden" 
       style="background-color: #0a0f1e;">
    
    <!-- Background overlay -->
    <div class="fixed inset-0 z-0 pointer-events-none"
         style="background: radial-gradient(ellipse 50% 50% at 50% 50%, #1a3a6e 0%, transparent 60%);">
    </div>

    <!-- Onboarding Card -->
    <div class="relative z-10 w-full max-w-md rounded-[28px] p-8 border"
         style="background-color: #111624; border-color: #242d42; box-shadow: 0 30px 60px rgba(0,0,0,0.55);">
         
      <div class="absolute top-0 left-0 w-full h-[1px]"
           style="background: linear-gradient(90deg, transparent, rgba(59,130,246,0.18), transparent);"></div>

      <div class="text-center mb-8">
        <h2 class="text-[26px] font-bold text-white mb-2">Selangkah Lagi!</h2>
        <p class="text-[#7a8ba8] text-[14px]">Pilih username unik untuk halaman kreatormu.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        
        <div v-if="errorMsg" class="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg text-center">
          {{ errorMsg }}
        </div>

        <!-- Username Input -->
        <div class="space-y-1.5 text-left">
          <label class="text-[13px] font-semibold text-white block">Username <span class="text-[#7a8ba8] font-normal">(tanpa spasi)</span></label>
          <div class="relative flex items-center">
            <span class="absolute left-4 font-bold" style="color: #4a9dff;">@</span>
            <input
              type="text"
              v-model="username"
              placeholder="Contoh: nitipkekita"
              class="w-full rounded-[12px] pl-10 pr-4 py-3 text-white text-[14px] outline-none transition-all placeholder-[#5a6478]"
              style="background-color: #161b28; border: 1px solid #252f42;"
              required
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button type="submit" :disabled="loading"
                  class="w-full text-white font-[700] text-[15px] py-[14px] rounded-[12px] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  style="background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 4px 24px rgba(37,99,235,0.38), inset 0 -2px 0 rgba(0,0,0,0.14);">
            <span v-if="loading">Menyimpan...</span>
            <span v-else>Selesaikan Pendaftaran</span>
          </button>
        </div>
      </form>

    </div>
  </div>
</template>
