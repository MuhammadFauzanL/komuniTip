<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import SittingMascot from '../assets/Image_(Sitting Cowboy Mascot).png'
import ProfileImage from '../assets/Image_(Profile).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const router = useRouter()
const { user, logout, updateMyProfile } = useAuth()

const handleLogout = () => {
  logout()
  router.push('/login')
}

const handleGoToDashboard = () => {
  router.push('/dashboard')
}

const handleGoToOverlay = () => {
  router.push('/overlay')
}

// Form state
const displayName = ref(user.value?.nama_lengkap || user.value?.nama || '')
const username = ref(user.value?.username || '')
const email = ref(user.value?.email || '')
const isSaving = ref(false)
// Fungsi untuk dipanggil saat tombol simpan diklik
const handleSaveProfile = async () => {
  isSaving.value = true
  try {
    await updateMyProfile({
      nama: displayName.value,
      username: username.value,
      kategori: contentCategory.value,
      bio: bio.value,
      instagram: instagram.value,
      youtube: youtube.value,
      twitter: twitter.value
    })
    user.value.nama = displayName.value 
    alert("Profil Kreator berhasil diperbarui!")
  } catch (err) {
    alert(err.message || 'Gagal menyimpan profil')
  } finally {
    isSaving.value = false
  }
}
const contentCategory = ref(user.value?.kategori || '')
const bio = ref(user.value?.bio || '')
const instagram = ref(user.value?.instagram || '')
const youtube = ref(user.value?.youtube || '')
const twitter = ref(user.value?.twitter || '')
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

      <!-- User Profile (Active Link behavior) -->
      <div class="flex items-center space-x-4 px-4 py-3 mx-2 mb-8 rounded-2xl cursor-pointer transition-all border border-blue-500/30" 
           style="background-color: #161e31; box-shadow: 0 0 15px rgba(59,130,246,0.15);">
        <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-blue-500/50">
          <img :src="ProfileImage" class="w-full h-full object-cover" />
        </div>
        <div>
          <div class="text-[15px] font-semibold text-white">{{ user?.nama_lengkap || 'Kreator' }}</div>
          <div class="text-[12px] font-medium" style="color: #4c82f6;">Kreator </div>
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
      <button @click="handleSaveProfile" :disabled="isSaving" class="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_8px_25px_rgba(37,99,235,0.3)] disabled:opacity-50">
        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
        <span class="text-sm font-bold">{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
      </button>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="relative z-10 flex-1 h-screen overflow-y-auto px-10 py-8 scrollbar-hide">
      
      <!-- Top header -->
      <div class="flex justify-between items-start mb-10 w-full">
        <div>
          <h1 class="text-3xl font-bold mb-2">Halo, {{ user?.nama_lengkap?.split(' ')[0] || 'Kreator' }}!</h1>
          <div class="flex items-center space-x-2 text-[#7a8ba8]">
             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
             <h2 class="text-xl font-bold text-white">Profil Kreator</h2>
          </div>
          <p class="text-[14px] text-[#7a8ba8] mt-1 ml-7">Atur informasi publik dan detail akunmu di sini.</p>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="handleSaveProfile" :disabled="isSaving" class="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_8px_25px_rgba(37,99,235,0.3)] disabled:opacity-50">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            <span class="text-sm font-bold">{{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- LEFT COLUMN -->
        <div class="w-full lg:w-[320px] flex flex-col gap-8">
          <!-- Profile Card -->
          <div class="rounded-[32px] p-8 flex flex-col items-center border border-[#212b42] shadow-2xl relative overflow-hidden" 
               style="background-color: #12192a;">
            
            <div class="relative mb-6">
              <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1c263e] shadow-2xl">
                <img :src="ProfileImage" class="w-full h-full object-cover" />
              </div>
              <div class="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-blue-600 border-4 border-[#12192a] flex items-center justify-center">
                 <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              </div>
            </div>

            <h3 class="text-2xl font-bold mb-1 text-white">{{ displayName || 'Kreator' }}</h3>
            <p class="text-blue-400 font-semibold text-sm mb-6">@{{ username || 'username' }}</p>
            <div v-if="contentCategory" class="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <span class="text-[11px] font-bold text-blue-400 uppercase tracking-wider">{{ contentCategory }}</span>
            </div>
            <div v-else class="mb-6">
              <span class="text-[11px] font-medium text-gray-500 italic">Kategori belum dipilih</span>
            </div>

            <p class="text-[13px] text-gray-400 text-center mb-6 line-clamp-2 px-2 italic">
               "{{ bio || 'Belum ada bio...' }}"
            </p>

            <div class="w-full py-3 px-4 rounded-2xl border border-[#2c3953] bg-[#0d121e] flex justify-between items-center">
               <span class="text-[13px] text-gray-400 font-medium">Status Akun</span>
               <div class="flex items-center space-x-2">
                 <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span class="text-emerald-500 text-[13px] font-bold">Aktif</span>
               </div>
            </div>
          </div>

          <!-- Decorative Sitting Mascot with backdrop -->
          <div class="rounded-[32px] bg-transparent p-8 flex flex-col items-center relative min-h-[220px]">
            <!-- Blue tilted backdrop (border only, transparent bg) -->
            <div class="absolute w-[180px] h-[180px] rounded-[36px] rotate-[10deg] border-2 -z-10 -translate-x-4"
                 style="background: rgba(34,85,212,0.06); border-color: rgba(80,150,255,0.7); box-shadow: 0 0 18px rgba(60,120,255,0.4), inset 0 0 12px rgba(60,100,255,0.12); top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(10deg);"></div>
            <!-- Mascot image rotated to match reference -->
            <img
              :src="SittingMascot"
              alt="Mascot"
              class="relative z-15 w-[300px] h-[300px] object-contain rotate-[10deg] -translate-x-2"
              style="filter: drop-shadow(0 16px 24px rgba(0,0,0,0.75));"
            />
        </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="flex-1 flex flex-col gap-6">
          <!-- Informasi Dasar -->
          <div class="rounded-[32px] p-8 border border-[#212b42] bg-[#12192a] shadow-xl">
             <h3 class="text-lg font-bold mb-8">Informasi Dasar</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- Nama Tampilan -->
                <div class="space-y-2">
                   <label class="text-[13px] font-bold text-gray-400">Nama Tampilan</label>
                   <input v-model="displayName" class="w-full rounded-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
                <!-- Kategori Konten -->
                <div class="space-y-2">
                   <label class="text-[13px] font-bold text-gray-400">Kategori Konten</label>
                   <div class="relative">
                     <select v-model="contentCategory" class="w-full rounded-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none appearance-none text-sm">
                       <option value="">Pilih Kategori</option>
                       <option>Gaming</option>
                       <option>Education</option>
                       <option>Art</option>
                     </select>
                     <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                       <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                   </div>
                </div>
             </div>
             
             <!-- URL -->
             <div class="space-y-2 mb-6">
                <label class="text-[13px] font-bold text-gray-400">Username (URL My Page)</label>
                <div class="flex items-center">
                   <div class="px-4 py-3 bg-[#1c263e] border border-r-0 border-[#2c3953] rounded-l-xl text-sm text-gray-400">komunitip.id/</div>
                   <input v-model="username" class="flex-1 rounded-r-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm" />
                </div>
             </div>

             <!-- Bio -->
             <div class="space-y-2">
                <label class="text-[13px] font-bold text-gray-400">Bio Singkat</label>
                <textarea v-model="bio" rows="4" class="w-full rounded-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm resize-none" placeholder="Tulis bio singkatmu di sini..."></textarea>
             </div>
          </div>

          <!-- Social Media & Link -->
          <div class="rounded-[32px] p-8 border border-[#212b42] bg-[#12192a] shadow-xl">
             <h3 class="text-lg font-bold mb-8">Social Media & Link</h3>
             <div class="space-y-6">
                <!-- Instagram -->
                <div class="space-y-2">
                   <div class="flex items-center space-x-2">
                      <div class="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                         <svg class="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.475 1.382.897.422.422.68 1.057.897 1.382.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.475 1.17-.897 1.382-.422.422-1.057.68-1.382.897-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.475-1.382-.897-.422-.422-.68-1.057-.897-1.382-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.475-.96.897-1.382.422-.422 1.057-.68 1.382-.897.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.741 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126s1.384 1.155 2.126 1.461c.766.303 1.636.504 2.913.56 1.28.058 1.689.072 4.948.072s3.667-.014 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384s1.155-1.384 1.461-2.126c.303-.765.504-1.636.56-2.913.058-1.28.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.06-1.277-.262-2.148-.558-2.913-.306-.789-.718-1.459-1.384-2.126s-1.384-1.155-2.126-1.461c-.765-.303-1.636-.504-2.913-.56C15.667.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </div>
                      <label class="text-[13px] font-bold text-gray-400">Username Instagram</label>
                   </div>
                   <div class="flex items-center">
                     <div class="px-4 py-3 bg-[#1c263e] border border-r-0 border-[#2c3953] rounded-l-xl text-sm text-gray-400">@</div>
                     <input v-model="instagram" class="flex-1 rounded-r-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm" />
                   </div>
                </div>

                <!-- YouTube -->
                <div class="space-y-2">
                   <div class="flex items-center space-x-2">
                      <div class="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                         <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </div>
                      <label class="text-[13px] font-bold text-gray-400">Channel YouTube</label>
                   </div>
                   <input v-model="youtube" class="w-full rounded-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm" />
                </div>

                <!-- Twitter -->
                <div class="space-y-2">
                   <div class="flex items-center space-x-2">
                      <div class="w-6 h-6 rounded-lg bg-blue-400/20 flex items-center justify-center border border-blue-400/30">
                         <svg class="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                      </div>
                      <label class="text-[13px] font-bold text-gray-400">Username X / Twitter</label>
                   </div>
                   <div class="flex items-center">
                     <div class="px-4 py-3 bg-[#1c263e] border border-r-0 border-[#2c3953] rounded-l-xl text-sm text-gray-400">@</div>
                     <input v-model="twitter" class="flex-1 rounded-r-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm" />
                   </div>
                </div>
             </div>
          </div>

          <!-- Akun & Keamanan -->
          <div class="rounded-[32px] p-8 border border-[#212b42] bg-[#12192a] shadow-xl">
             <h3 class="text-lg font-bold mb-8">Akun & Keamanan</h3>
             <div class="space-y-6">
                <!-- Email -->
                <div class="space-y-2">
                   <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <label class="text-[13px] font-bold text-gray-400">Alamat Email Terdaftar</label>
                   </div>
                   <input v-model="email" disabled class="w-full rounded-xl px-4 py-3 bg-[#0d121e]/50 border border-[#2c3953] text-sm text-gray-500 cursor-not-allowed" />
                   <p class="text-[11px] text-orange-400">*Email tidak dapat diubah sendiri. Hubungi support jika perlu.</p>
                </div>

                <div class="h-[1px] w-full bg-[#1c263e] my-4"></div>

                <h4 class="text-sm font-bold text-white mb-4">Ganti Password</h4>
                <div class="space-y-4">
                   <input type="password" placeholder="Password Saat Ini" class="w-full rounded-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm" />
                   <input type="password" placeholder="Password Baru" class="w-full rounded-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm" />
                   <input type="password" placeholder="Ulangi Password Baru" class="w-full rounded-xl px-4 py-3 bg-[#0d121e] border border-[#2c3953] outline-none focus:border-blue-500 transition-all text-sm" />
                </div>

                <button class="w-full py-3.5 rounded-xl border border-blue-600/50 bg-blue-600/10 text-blue-400 font-bold text-sm hover:bg-blue-600/20 transition-all mt-4">
                   Simpan Password Baru
                </button>
             </div>
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

input:focus, select:focus, textarea:focus {
    box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
}
</style>
