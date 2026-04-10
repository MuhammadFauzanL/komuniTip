<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import ProfileImage from '../assets/Image_(Profile).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const router = useRouter()

const currentTab = ref('Default')
const browserSourceUrl = ref('https://overlay.komunitip.id/alert/h7szxreuy7d6ff56u6-8h76ff4vzd9zklbb11')

// Form states
const nameColor = ref('#FFFFFF')
const templateColor = ref('#2BBBA0')
const amountColor = ref('#3BA2FF')
const messageColor = ref('#FF914D')
const templateText = ref('{name} baru saja memberikan {amount}')
const minDonation = ref(15000)
const soundEnabled = ref(true)
const ttsEnabled = ref(false)
const aiFilterEnabled = ref(false)
const manualKeywords = ref('')

const { logout } = useAuth()

const handleLogout = () => {
  logout()
  router.push('/login')
}

const handleGoToDashboard = () => router.push('/dashboard')

const handleGoToProfile = () => router.push('/profile')

const copyUrl = () => {
  navigator.clipboard.writeText(browserSourceUrl.value)
  alert('URL Copied!')
}
</script>

<template>
  <div class="min-h-screen w-full relative flex font-sans text-white" style="background-color: #0d1224;">
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
        <img :src="IconBabi" class="absolute top-[6%] left-[12%] w-[22%] h-auto object-contain -rotate-[10deg] opacity-60" />
        <img :src="IconBurung" class="absolute top-[16%] left-[38%] w-[18%] h-auto object-contain rotate-[2deg] opacity-60" />
        <img :src="IconKucing" class="absolute top-[10%] right-[6%] w-[25%] h-auto object-contain rotate-[10deg] opacity-60" />
        <img :src="IconKotak" class="absolute top-[48%] left-[7%] w-[32%] h-auto object-contain -rotate-[32deg] opacity-60" />
        <img :src="IconDompet" class="absolute top-[44%] left-[44%] w-[22%] h-auto object-contain rotate-[28deg] opacity-60" />
        <img :src="IconAngka1" class="absolute top-[68%] left-[33%] w-[12%] h-auto object-contain -rotate-[10deg] opacity-60" />
        <img :src="IconAngka1" class="absolute top-[78%] left-[45%] w-[12%] h-auto object-contain rotate-[15deg] opacity-60" />
        <img :src="IconCoin" class="absolute top-[56%] right-[7%] w-[25%] h-auto object-contain -rotate-[5deg] opacity-60" />
      </div>
    </div>

    <!-- SIDEBAR -->
    <aside class="relative z-10 w-[280px] m-4 mr-0 rounded-[30px] flex flex-col pt-8 pb-6 px-4"
           style="background-color: #12192a; box-shadow: 0 4px 40px rgba(0,0,0,0.3);">
      
      <!-- Logo -->
      <div class="flex items-center space-x-3 px-4 mb-10">
        <img :src="StandingMascot" alt="KomuniTip" class="w-10 h-10 object-contain drop-shadow-md" />
        <span class="text-xl font-bold tracking-wide">KomuniTip</span>
      </div>

      <!-- User Profile -->
      <div @click="handleGoToProfile" 
           class="flex items-center space-x-4 px-4 py-3 mx-2 mb-8 rounded-2xl cursor-pointer hover:bg-[#1a2337] transition-all border border-transparent hover:border-blue-500/30 shadow-sm" 
           style="background-color: #161e31;">
        <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-[#1c263e]">
          <img :src="ProfileImage" class="w-full h-full object-cover" />
        </div>
        <div>
          <div class="text-[15px] font-semibold text-white">PPL 4</div>
          <div class="text-[12px] font-medium" style="color: #4c82f6;">Kreator Pro</div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="px-2 mb-4">
        <div class="text-[11px] font-semibold tracking-wider text-gray-500 mb-3 px-4 uppercase">Menu Utama</div>
        <nav class="space-y-2">
          <button @click="handleGoToDashboard" 
                  class="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-[#1a2337] transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span class="font-medium text-[14px]">Dashboard</span>
          </button>
          <button class="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl text-white bg-purple-600 shadow-lg shadow-purple-600/20 transition-all font-semibold">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
            </svg>
            <span class="text-[14px]">Overlay</span>
          </button>
          <a href="#" class="flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-[#1a2337] transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            <span class="font-medium text-[14px]">Wallet</span>
          </a>
          <a href="#" class="flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-[#1a2337] transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span class="font-medium text-[14px]">Settings</span>
          </a>
        </nav>
      </div>

      <div class="mt-auto px-2">
        <button @click="handleLogout" class="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-[#1a2337] transition-all">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span class="font-medium text-[14px]">Keluar</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="relative z-10 flex-1 h-screen overflow-y-auto px-6 py-10 scrollbar-hide">
      
      <!-- CENTERED CONTAINER (Slight left offset to balance sidebar) -->
     <div class="max-w-[1300px] mx-auto pl-10 pr-6">
        
        <!-- HEADER (One Row) -->
        <div class="flex justify-between items-center mb-8 relative z-30">
          <div>
            <h1 class="text-3xl font-bold mb-1">Halo, PPL 4!</h1>
            <div class="flex items-center space-x-2 text-purple-400">
               <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
               </svg>
               <h2 class="text-2xl font-bold text-white">Overlay Alert</h2>
            </div>
            <p class="text-[14px] text-[#7a8ba8] mt-0.5">Konfigurasi notifikasi donasi untuk live streamingmu.</p>
          </div>
          <div class="flex items-center space-x-4">
            <button class="flex items-center space-x-2 px-6 py-3 rounded-xl border border-[#2c3953] bg-[#0d121e]/50 hover:bg-[#1a2337] transition-all shadow-sm">
               <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
               <span class="text-sm font-bold">Share My Page</span>
            </button>
            <div class="w-12 h-12 rounded-xl bg-[#12192a] border border-[#2c3953] flex items-center justify-center relative cursor-pointer">
              <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <div class="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-pink-500 border-2 border-[#12192a]"></div>
            </div>
          </div>
        </div>

        <!-- MAIN LAYOUT STACK (32px vertical spacing) -->
        <div class="flex flex-col gap-8">
          
          <!-- 1. ALERT PREVIEW CARD (Dominant focal point) -->
          <div class="rounded-[32px] border border-[#212b42] bg-[#12192a]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
             <!-- Tabs header -->
             <div class="flex border-b border-[#212b42]">
                <button @click="currentTab = 'Default'" 
                        :class="['px-10 py-5 font-bold text-sm transition-all relative', currentTab === 'Default' ? 'text-blue-400' : 'text-gray-500']">
                   Default
                   <div v-if="currentTab === 'Default'" class="absolute bottom-0 left-0 w-full h-[2px] bg-blue-400"></div>
                </button>
                <button @click="currentTab = 'Custom'" 
                        :class="['px-10 py-5 font-bold text-sm transition-all relative', currentTab === 'Custom' ? 'text-blue-400' : 'text-gray-500']">
                   Custom <span class="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded ml-1">PRO</span>
                   <div v-if="currentTab === 'Custom'" class="absolute bottom-0 left-0 w-full h-[2px] bg-blue-400"></div>
                </button>
             </div>

             <!-- Preview content (Dominant) -->
             <div class="p-10">
                <div class="w-full aspect-[2.8/1] bg-[url('../assets/Icon_kotak.png')] bg-cover bg-center rounded-3xl relative overflow-hidden flex items-center justify-center border-2 border-black"
                     style="background-color: #050810;">
                   <div class="absolute inset-0 bg-black/40"></div>
                   <div class="relative z-10 text-center scale-125">
                      <div class="text-white font-black text-2xl drop-shadow-lg">
                         <span class="text-white">Lukisda</span> <span class="text-emerald-400">baru saja memberikan</span>
                      </div>
                      <div class="text-blue-400 font-extrabold text-5xl my-4 drop-shadow-xl">Rp 75.000</div>
                      <div class="text-orange-400 font-bold text-lg drop-shadow-md">"Semangat terus kontennya, keren banget! 🔥"</div>
                   </div>
                </div>
             </div>
          </div>

          <!-- 2. BROWSER SOURCE URL SECTION -->
          <div class="rounded-[32px] p-8 border border-[#212b42] bg-[#12192a] shadow-xl">
             <label class="flex items-center space-x-2 text-sm font-bold text-gray-400 mb-4">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                <span>Browser Source URL (OBS / Streamlabs / XSPlit)</span>
             </label>
             <div class="flex items-center gap-4">
                <input v-model="browserSourceUrl" readonly class="flex-1 rounded-2xl px-5 py-4 bg-[#0d121e] border border-[#2c3953] outline-none text-sm font-mono text-blue-400/80" />
                <button @click="copyUrl" class="px-8 py-4 rounded-2xl bg-[#252f42] hover:bg-[#1e2738] transition-all font-bold text-[15px] flex items-center gap-2">
                   <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                   Salin
                </button>
             </div>
             <div class="mt-4 p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5 flex items-start gap-4">
                <svg class="w-5 h-5 text-orange-400 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                <p class="text-[13px] text-orange-400/90 leading-relaxed font-medium">
                   <span class="font-bold uppercase tracking-wider">Penting:</span> Jangan berikan tautan ini ke siapapun. Ini adalah akses khusus untuk menampilkan alert di streamingmu. Pelajari cara memasang di OBS dengan mengklik <a href="#" class="underline font-bold">Bantuan pasang di streamingmu</a>.
                </p>
             </div>
          </div>

          <!-- 3. TAMPILAN ALERT CARD (Padding refined to 24px/6) -->
          <div class="rounded-[32px] p-6 border border-[#212b42] bg-[#12192a] shadow-xl">
             <div class="flex items-center space-x-3 mb-8">
                <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                <h3 class="text-xl font-bold">Tampilan Alert</h3>
             </div>

             <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div v-for="(color, label, idx) in { 'Warna Nama': nameColor, 'Warna Teks Template': templateColor, 'Warna Nominal': amountColor, 'Warna Pesan': messageColor }" :key="idx" class="space-y-3">
                   <label class="text-[13px] font-bold text-gray-400">{{ label }}</label>
                   <div class="flex items-center gap-3 bg-[#0d121e] border border-[#2c3953] rounded-xl px-4 py-3">
                      <div class="w-6 h-6 rounded-full border border-white/20" :style="{ backgroundColor: color }"></div>
                      <span class="text-sm font-mono uppercase">{{ color }}</span>
                   </div>
                </div>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                <div class="space-y-3">
                   <label class="text-[13px] font-bold text-gray-400">Template Teks</label>
                   <input v-model="templateText" class="w-full rounded-xl px-4 py-4 bg-[#0d121e] border border-[#2c3953] outline-none text-sm" />
                </div>
                <div class="space-y-3">
                   <label class="text-[13px] font-bold text-gray-400">Font</label>
                   <div class="relative">
                      <select class="w-full rounded-xl px-4 py-4 bg-[#0d121e] border border-[#2c3953] outline-none appearance-none text-sm">
                         <option>Inter</option>
                         <option>Poppins</option>
                         <option>Roboto</option>
                      </select>
                      <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                         <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- 4. ATURAN ALERT CARD -->
          <div class="rounded-[32px] p-6 border border-[#212b42] bg-[#12192a] shadow-xl">
             <div class="flex items-center space-x-3 mb-8">
                <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <h3 class="text-xl font-bold">Aturan Alert</h3>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-2">
                <div class="space-y-3">
                   <label class="text-[13px] font-bold text-gray-400">Durasi Alert (detik)</label>
                   <div class="flex items-center">
                      <input value="8" class="flex-1 rounded-l-xl px-4 py-4 bg-[#0d121e] border border-r-0 border-[#2c3953] outline-none text-sm text-white" />
                      <div class="px-5 py-4 bg-[#1c263e] border border-[#2c3953] rounded-r-xl text-sm font-bold text-gray-500">detik</div>
                   </div>
                   <p class="text-[11px] text-[#7a8ba8] mt-1">Min 4, Maks 60 detik</p>
                </div>
                <div class="space-y-3">
                   <label class="text-[13px] font-bold text-gray-400">Jumlah Minimal per dukungan</label>
                   <div class="flex items-center">
                      <div class="px-5 py-4 bg-[#1c263e] border border-r-0 border-[#2c3953] rounded-l-xl text-sm font-bold text-gray-500">IDR</div>
                      <input value="10000" class="flex-1 rounded-r-xl px-4 py-4 bg-[#0d121e] border border-[#2c3953] outline-none text-sm text-white" />
                   </div>
                </div>
             </div>
          </div>

          <!-- 5. SUARA ALERT CARD -->
          <div class="rounded-[32px] p-6 border border-[#212b42] bg-[#12192a] shadow-xl">
             <div class="flex items-center space-x-3 mb-8">
                <svg class="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828M5 8v8m0-8a2 2 0 00-2 2v4a2 2 0 002 2m0-8l4-4 4 4m-4 4l-4 4"></path></svg>
                <h3 class="text-xl font-bold">Suara Alert</h3>
             </div>

             <div class="space-y-6">
                <!-- Sound Alert Toggle -->
                <div class="flex justify-between items-center p-4 rounded-2xl bg-[#0d121e]/40 border border-[#2c3953]/50">
                   <div class="flex items-center space-x-4">
                      <div @click="soundEnabled = !soundEnabled" :class="['w-12 h-6 rounded-full p-1 cursor-pointer transition-all', soundEnabled ? 'bg-emerald-500' : 'bg-gray-600']">
                         <div :class="['w-4 h-4 bg-white rounded-full transition-all', soundEnabled ? 'translate-x-6' : '']"></div>
                      </div>
                      <div>
                         <div class="text-[15px] font-bold">Sound Alert</div>
                         <div class="text-[12px] text-gray-500">Putar suara saat donasi masuk</div>
                      </div>
                   </div>
                   <div class="flex items-center gap-3">
                      <button class="px-8 py-3 rounded-2xl border border-[#252f42] bg-[#12192a] text-sm font-bold text-emerald-400 hover:bg-[#1a2337] transition-all">Test</button>
                      <button class="px-8 py-3 rounded-2xl border border-[#252f42] bg-[#12192a] text-sm font-bold text-emerald-400 hover:bg-[#1a2337] transition-all flex items-center gap-2">
                         <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                         Pilih Suara
                      </button>
                   </div>
                </div>

                <!-- TTS Toggle -->
                <div class="flex justify-between items-center p-4 rounded-2xl bg-[#0d121e]/40 border border-[#2c3953]/50">
                   <div class="flex items-center space-x-4">
                      <div @click="ttsEnabled = !ttsEnabled" :class="['w-12 h-6 rounded-full p-1 cursor-pointer transition-all', ttsEnabled ? 'bg-emerald-500' : 'bg-gray-600']">
                         <div :class="['w-4 h-4 bg-white rounded-full transition-all', ttsEnabled ? 'translate-x-6' : '']"></div>
                      </div>
                      <div>
                         <div class="text-[15px] font-bold">Text-to-Speech (TTS)</div>
                         <div class="text-[12px] text-gray-500">Baca nama donatur & pesan secara otomatis</div>
                      </div>
                   </div>
                   <button class="px-8 py-3 rounded-2xl border border-[#252f42] bg-[#12192a] text-sm font-bold text-emerald-400 hover:bg-[#1a2337] transition-all flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                      Pilih Suara TTS
                   </button>
                </div>

                <!-- Nested TTS Settings -->
                <div v-if="ttsEnabled" class="ml-12 p-8 rounded-[32px] bg-[#161d2d] border border-blue-500/10 space-y-6">
                   <div class="flex items-center space-x-4">
                      <div class="w-12 h-6 bg-emerald-500 rounded-full p-1 flex justify-end items-center">
                         <div class="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <span class="text-[15px] font-bold text-white">Minimal donasi untuk TTS</span>
                   </div>
                   <div class="flex items-center">
                      <div class="px-6 py-4 bg-[#1c263e] border border-r-0 border-[#2c3953] rounded-l-2xl text-sm font-bold text-gray-500">IDR</div>
                      <input value="10000" class="flex-1 rounded-r-2xl px-6 py-4 bg-[#0d121e] border border-[#2c3953] outline-none text-[15px] text-white" />
                   </div>
                   <p class="text-[12px] text-gray-500">Di bawah nominal ini, donasi dibacakan menggunakan <span class="text-white font-medium">Sound saja</span></p>
                </div>

                <div class="h-[1px] w-full bg-[#1c263e]/50 my-2"></div>

                <!-- Default Notification Sound Section -->
                <div class="flex justify-between items-center px-2 py-4">
                   <div>
                      <div class="text-[15px] font-bold">Suara Notifikasi Default</div>
                      <div class="text-[12px] text-gray-500">Suara yang diputar saat alert muncul</div>
                   </div>
                   <div class="flex items-center gap-3">
                      <button class="px-8 py-3 rounded-2xl border border-[#252f42] bg-[#12192a] text-sm font-bold text-emerald-400 hover:bg-[#1a2337] transition-all">Test</button>
                      <button class="px-8 py-3 rounded-2xl border border-[#252f42] bg-[#12192a] text-sm font-bold text-emerald-400 hover:bg-[#1a2337] transition-all">Ganti Suara</button>
                   </div>
                </div>
             </div>
          </div>

          <!-- 6. FILTER & MODERASI CARD -->
          <div class="rounded-[32px] p-6 border border-[#212b42] bg-[#12192a] shadow-xl">
             <div class="flex items-center space-x-3 mb-8">
                <svg class="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                <h3 class="text-xl font-bold">Filter & Moderasi</h3>
             </div>

             <div class="space-y-8">
                <div class="flex items-start justify-between p-6 rounded-2xl bg-[#161d2d] border border-blue-500/20">
                   <div class="flex flex-col gap-2">
                      <div class="flex items-center space-x-3">
                         <span class="text-sm font-bold">Aktifkan Filter AI</span>
                         <span class="bg-blue-600/20 text-blue-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Artificial Intelligence</span>
                      </div>
                      <p class="text-[12px] text-gray-500 leading-relaxed max-w-2xl">Dengan mengaktifkan filter AI, AI setiap Nama dan Pesan Pendukung akan melalui proses pengecekan untuk memastikan tidak mengandung konten yang melanggar ketentuan. Proses ini memerlukan beberapa detik sebelum tampil di Overlay.</p>
                   </div>
                   <div @click="aiFilterEnabled = !aiFilterEnabled" :class="['w-12 h-6 rounded-full p-1 cursor-pointer transition-all shrink-0', aiFilterEnabled ? 'bg-blue-600' : 'bg-gray-600']">
                      <div :class="['w-4 h-4 bg-white rounded-full transition-all', aiFilterEnabled ? 'translate-x-6' : '']"></div>
                   </div>
                </div>

                <div class="space-y-4 mb-2">
                   <div class="flex flex-col gap-1">
                      <h4 class="text-sm font-bold">Filter Kata Manual</h4>
                      <p class="text-[12px] text-gray-500">Pesan donasi dan nama pendukung tidak akan di tampilkan jika mengandung kata-kata dibawah ini. Pisahkan kata dengan <span class="text-gray-400 italic">koma (,)</span> (Contoh: kasar, bodoh, jelek).</p>
                   </div>
                   <textarea v-model="manualKeywords" rows="5" class="w-full rounded-2xl p-6 bg-[#0d121e] border border-[#2c3953] outline-none text-sm text-white resize-none" placeholder="Ketik kata-kata..."></textarea>
                   <p class="text-[11px] text-gray-600 italic">Kata yang di blockir mencakup keyword filter beserta variasinya.</p>
                </div>
             </div>
          </div>

          <!-- STICKY SAVE BUTTON -->
          <div class="flex justify-end mt-4 mb-12">
             <button class="px-12 py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all font-black text-white shadow-[0_12px_40px_rgba(37,99,235,0.4)]">
                Simpan Pengaturan
             </button>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
input:focus, textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
</style>
