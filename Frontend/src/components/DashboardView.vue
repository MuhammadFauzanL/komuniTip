<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import WizardMascot from '../assets/Image_(Wizard Mascot).png'
import ProfileImage from '../assets/Image_(Profile).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'
import { onMounted } from 'vue'

const emit = defineEmits([]) 
const router = useRouter()
const { user, logout, fetchMyProfile } = useAuth() 
onMounted(async () => {
  await fetchMyProfile()
})


const handleLogout = () => {
  logout()
  router.push('/login')
}

const copyLink = () => {
  const link = `komunitip.id/${user.value?.username || 'username'}`
  navigator.clipboard.writeText(link)
  alert('Link tersalin: ' + link)
}


const handleGoToProfile = () => {
  router.push('/profile')
}

const handleGoToDashboard = () => {
  router.push('/dashboard')
}

const handleGoToOverlay = () => {
  router.push('/overlay')
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
        <!-- Piggy bank top-left -->
        <img :src="IconBabi" class="absolute top-[6%] left-[12%] w-[22%] h-auto object-contain -rotate-[10deg] opacity-60" />
        <!-- Bird center-top -->
        <img :src="IconBurung" class="absolute top-[16%] left-[38%] w-[18%] h-auto object-contain rotate-[2deg] opacity-60" />
        <!-- Cat top-right -->
        <img :src="IconKucing" class="absolute top-[10%] right-[6%] w-[25%] h-auto object-contain rotate-[10deg] opacity-60" />
        <!-- Money-box lower-left -->
        <img :src="IconKotak" class="absolute top-[48%] left-[7%] w-[32%] h-auto object-contain -rotate-[32deg] opacity-60" />
        <!-- Wallet center -->
        <img :src="IconDompet" class="absolute top-[44%] left-[44%] w-[22%] h-auto object-contain rotate-[28deg] opacity-60" />
        <!-- Coin stacks lower-center -->
        <img :src="IconAngka1" class="absolute top-[68%] left-[33%] w-[12%] h-auto object-contain -rotate-[10deg] opacity-60" />
        <img :src="IconAngka1" class="absolute top-[78%] left-[45%] w-[12%] h-auto object-contain rotate-[15deg] opacity-60" />
        <!-- Dollar coin lower-right -->
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

      <div @click="handleGoToProfile" 
           class="flex items-center space-x-4 px-4 py-3 mx-2 mb-8 rounded-2xl cursor-pointer hover:bg-[#1a2337] transition-all border border-transparent hover:border-blue-500/30 shadow-sm" 
           style="background-color: #161e31;">
        <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-[#1c263e]">
          <!-- Profile image -->
          <img :src="ProfileImage" class="w-full h-full object-cover" />
        </div>
        <div>
          <div class="text-[15px] font-semibold text-white">
            {{ user?.nama_lengkap || 'Kreator' }}
          </div>
          <div class="text-[12px] text-gray-400 mt-0.5">
  {{ user?.role === 'ADMIN' ? 'Admin' : 'Kreator' }}
</div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="px-2 mb-4">
        <div class="text-[11px] font-semibold tracking-wider text-gray-500 mb-3 px-4 uppercase">Menu Utama</div>
        <nav class="space-y-2">
          <a href="#" class="flex items-center space-x-3 px-4 py-3.5 rounded-2xl bg-blue-600 text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span class="font-medium text-[14px]">Dashboard</span>
          </a>
          <button @click="handleGoToOverlay" 
                  class="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-purple-600/20 transition-all border border-transparent hover:border-purple-500/30">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
            </svg>
            <span class="font-medium text-[14px]">Overlay</span>
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
    <main class="relative z-10 flex-1 h-screen overflow-y-auto px-10 py-8 scrollbar-hide">
      
      <!-- Top header -->
      <div class="flex justify-between items-start mb-16 w-full relative z-30">
        <div>
          <h1 class="text-3xl font-bold mb-2">
            Halo, {{ user?.nama_lengkap?.split(' ')[0] || 'Kreator' }}!
          </h1>
          <p class="text-[15px] text-[#7a8ba8]">Siap untuk stream hari ini?</p>
        </div>
        <div class="flex items-center space-x-4">
          <button class="flex items-center space-x-2 px-5 py-2.5 rounded-full border border-[#2c3953] bg-[#12192a] hover:bg-[#1a2337] transition-all">
            <svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span class="text-sm font-medium">Share My Page</span>
          </button>
          <button class="w-10 h-10 rounded-full border border-[#2c3953] bg-[#12192a] hover:bg-[#1a2337] flex items-center justify-center relative transition-all text-gray-300">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span class="absolute top-[10px] right-[10px] w-2 h-2 bg-pink-500 rounded-full box-content border-2 border-[#12192a]"></span>
          </button>
        </div>
      </div>

      <!-- Stats Card -->
      <div class="relative w-full rounded-[32px] p-8 mb-12 shadow-[0_20px_40px_rgba(20,50,200,0.15)]"
           style="background: linear-gradient(135deg, #1742c3 0%, #0d268f 100%);">
        <!-- Decoration swirls -->
        <div class="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" class="w-full h-full" preserveAspectRatio="none">
             <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="white" stroke-width="0.5" />
             <path d="M0,70 Q25,40 50,70 T100,70" fill="none" stroke="white" stroke-width="0.5" opacity="0.5" />
          </svg>
        </div>

        <div class="relative z-10 w-3/5">
          <div class="flex items-center space-x-2 text-blue-200/80 mb-3 text-sm font-semibold tracking-wider">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            <span>TOTAL PENDAPATAN</span>
          </div>
          <div class="text-[28px] font-bold text-white mb-2">
            Rp{{ Number(user?.saldo_aktif || 0).toLocaleString('id-ID') }}
          </div>
          <div class="flex items-center space-x-3 text-sm">
            <div class="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
              <span>+18.4%</span>
            </div>
            <span class="text-blue-200/60 font-medium">vs bulan lalu</span>
          </div>
        </div>

        <!-- Mascot & Toggles -->
        <div class="absolute right-0 bottom-0 top-0 w-2/5 pointer-events-none flex items-end justify-center">
          <img :src="WizardMascot" alt="Wizard Mascot" class="absolute bottom-6 right-8 w-auto h-[230px] md:h-[260px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 pointer-events-auto translate-x-5" />
          
          <div class="absolute bottom-8 right-12 z-0 bg-[#0d152e] rounded-full p-1 flex border border-[#1e2a4a] pointer-events-auto">
            <button class="px-5 py-1.5 rounded-full bg-[#1b2b52] text-sm text-white font-medium shadow-sm">Bulan</button>
            <button class="px-5 py-1.5 rounded-full text-sm text-[#7a8ba8] hover:text-white font-medium transition-colors">Tahun</button>
          </div>
        </div>
      </div>

      <!-- Feature Highlight Section -->
      <div class="w-full mb-12">
        <div class="flex items-center space-x-2 text-lg font-bold mb-6">
          <span class="text-orange-500">🔥</span>
          <span>Fitur Unggulan</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- My Page Card -->
          <div class="rounded-[28px] p-6 border border-[#212b42] relative overflow-hidden"
               style="background: linear-gradient(145deg, #12192a, #0d1323); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
              <!-- background glyph for card 1 -->
              <svg viewBox="0 0 100 100" class="w-[150%] h-auto text-blue-500 fill-current"><path d="M50 0 L100 50 L50 100 L0 50 Z"/></svg>
            </div>
            <div class="relative z-10 flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-2xl bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.4)] flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              </div>
              <div class="px-3 py-1 rounded-full text-[12px] font-bold tracking-wide border border-[#043324] text-emerald-400 bg-[#071d16]">Aktif</div>
            </div>
            <div class="relative z-10">
              <h3 class="text-[20px] font-bold text-white mb-1">My Page</h3>
              <p class="text-blue-400 text-[13px] font-medium mb-3">Link in Bio</p>
              <p class="text-[#7a8ba8] text-[13px] mb-8">Halaman profil & terima donasi</p>
              
              <div class="flex space-x-2">
                <div class="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#212b42] bg-[#0d121e]">
                   <span class="text-[13px] text-gray-400 truncate">
                    komunitip.id/{{ user?.username || 'username' }}
                   </span>
                   <button @click="copyLink" class="text-gray-400 hover:text-white p-1 transition-colors">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                   </button>
                </div>
                <button class="w-11 h-11 rounded-xl flex items-center justify-center bg-[#1c263e] border border-[#2c3953] hover:bg-[#253252] transition-colors">
                  <svg class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Overlay Stream Card -->
          <div class="rounded-[28px] p-6 border relative overflow-hidden"
               style="background: linear-gradient(145deg, #17112b, #110d21); border-color: #3b1e52; box-shadow: 0 10px 40px rgba(100,20,150,0.15), inset 0 0 0 1px rgba(168,85,247,0.2);">
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
               <svg viewBox="0 0 100 100" class="w-[150%] h-auto text-purple-500 fill-current font-bold text-[80px] text-center" style="transform: rotate(-15deg)"><text x="10%" y="80%">$</text></svg>
            </div>
            
            <div class="relative z-10 flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <svg class="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
                </svg>
              </div>
              <div class="px-3 py-1 rounded-full text-[12px] font-bold tracking-wide border border-[#3b1e52] text-purple-300 bg-[#25103d]">Baru</div>
            </div>
            <div class="relative z-10">
              <h3 class="text-[20px] font-bold text-white mb-1">Overlay Stream</h3>
              <p class="text-purple-300 text-[13px] font-medium mb-3">Live Interaction</p>
              <p class="text-[#7a8ba8] text-[13px] mb-8">Alert & widget OBS / Streamlabs</p>
              
              <button class="w-full py-3.5 rounded-xl font-bold text-[14px] text-white shadow-[0_4px_15px_rgba(168,85,247,0.4)] transition-transform hover:scale-[1.02]"
                      style="background: linear-gradient(90deg, #9333ea, #c026d3);">
                Buka Pengaturan
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Support History -->
      <div class="w-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">Riwayat Dukungan</h2>
          <a href="#" class="text-[13px] font-bold text-blue-400 hover:text-blue-300 transition-colors">Lihat Semua</a>
        </div>

        <div class="rounded-[28px] border border-[#212b42] p-2" style="background-color: #101623;">
          <div class="flex flex-col space-y-1">
            
            <!-- Item 1 -->
            <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-[#161d2d] transition-colors">
              <div class="flex items-center space-x-4">
                <div class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[15px]" style="background-color: #3b82f6;">AF</div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-[15px] text-white">hahahahahaqi</span>
                    <span class="text-[#516382] text-[12px]">haqi@gmail.com</span>
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold text-emerald-400 bg-emerald-500/10">+Rp 50k</span>
                  </div>
                  <div class="text-[14px] text-[#94a3b8] mt-1 line-clamp-1">Kontennya selalu keren banget! Keep it up ya kak! 🔥</div>
                </div>
              </div>
              <div class="flex flex-col items-end hidden sm:flex">
                <span class="text-[11px] text-[#516382] mb-2 font-medium">2 menit lalu</span>
                <div class="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-[#043324] text-emerald-400 bg-[#071d16] text-[11px] font-bold">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Aman</span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-[1px] w-full bg-[#1c263e]"></div>

            <!-- Item 2 -->
            <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-[#161d2d] transition-colors bg-[#1a111a]">
              <div class="flex items-center space-x-4">
                <div class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[15px]" style="background-color: #f59e0b;">LP</div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-[15px] text-white">fauzan lubada</span>
                    <span class="text-[#516382] text-[12px]">lubada@gmail.com</span>
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold text-emerald-400 bg-emerald-500/10">+Rp 25k</span>
                  </div>
                  <div class="text-[14px] text-[#94a3b8] mt-1 line-clamp-1">Dijamin gacor www.maxwinnn.com</div>
                </div>
              </div>
              <div class="flex flex-col items-end hidden sm:flex">
                <span class="text-[11px] text-[#516382] mb-2 font-medium">15 menit lalu</span>
                <div class="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-[#4c1d2e] text-red-400 bg-[#2d121c] text-[11px] font-bold">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>Difilter</span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-[1px] w-full bg-[#1c263e]"></div>

            <!-- Item Requested 1: daffa@gmail.com -->
            <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-[#161d2d] transition-colors bg-[#1a111a]">
              <div class="flex items-center space-x-4">
                <div class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[15px]" style="background-color: #ef4444;">DF</div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-[15px] text-white">daapp</span>
                    <span class="text-[#516382] text-[12px]">daffa@gmail.com</span>
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold text-emerald-400 bg-emerald-500/10">+Rp 500k</span>
                  </div>
                  <div class="text-[14px] text-[#94a3b8] mt-1 line-clamp-1">kantorbola gacorr!</div>
                </div>
              </div>
              <div class="flex flex-col items-end hidden sm:flex">
                <span class="text-[11px] text-[#516382] mb-2 font-medium">30 menit lalu</span>
                <div class="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-[#4c1d2e] text-red-400 bg-[#2d121c] text-[11px] font-bold">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>Difilter</span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-[1px] w-full bg-[#1c263e]"></div>

            <!-- Item Requested 2: irsyad@gmail.com -->
            <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-[#161d2d] transition-colors">
              <div class="flex items-center space-x-4">
                <div class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[15px]" style="background-color: #8b5cf6;">IR</div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-[15px] text-white">irsyadd</span>
                    <span class="text-[#516382] text-[12px]">irsyad@gmail.com</span>
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold text-emerald-400 bg-emerald-500/10">+Rp 100k</span>
                  </div>
                  <div class="text-[14px] text-[#94a3b8] mt-1 line-clamp-1">kerenn banget konten nya bangg!</div>
                </div>
              </div>
              <div class="flex flex-col items-end hidden sm:flex">
                <span class="text-[11px] text-[#516382] mb-2 font-medium">1 jam lalu</span>
                <div class="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-[#043324] text-emerald-400 bg-[#071d16] text-[11px] font-bold">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Aman</span>
                </div>
              </div>
            </div>

             <!-- Divider -->
            <div class="h-[1px] w-full bg-[#1c263e]"></div>

            <!-- Item 3 -->
            <div class="flex items-center justify-between p-4 rounded-2xl hover:bg-[#161d2d] transition-colors">
              <div class="flex items-center space-x-4">
                <div class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-[15px]" style="background-color: #0ea5e9;">NZ</div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-[15px] text-white">Si Nitip</span>
                    <span class="text-[#516382] text-[12px]">san@gmail.com</span>
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold text-emerald-400 bg-emerald-500/10">+Rp 30k</span>
                  </div>
                  <div class="text-[14px] text-[#94a3b8] mt-1 line-clamp-1">Konten terbaik di Indonesia! Semangat terus kak ✨</div>
                </div>
              </div>
              <div class="flex flex-col items-end hidden sm:flex">
                <span class="text-[11px] text-[#516382] mb-2 font-medium">1 jam lalu</span>
                <div class="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-[#043324] text-emerald-400 bg-[#071d16] text-[11px] font-bold">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Aman</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </main>
  </div>
</template>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
</style>
