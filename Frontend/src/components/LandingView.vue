<script setup>
//TONG DIHAPUSSSS IEU NU PENTINGGGGGGGG
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// BEBAS IEUMA
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import TopHatMascot from '../assets/Image_(Top Hat Mascot).png'
import GroupPenguins from '../assets/Image_(Group of Penguins).png'
import SittingMascot from '../assets/Image_(Sitting Cowboy Mascot).png'
import WizardMascot from '../assets/Image_(Wizard Mascot).png'
import ProfileImage from '../assets/Image_(Profile).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'

const router = useRouter()
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
//TONG DIHAPUSSSS IEU NU PENTING
const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')
</script>

<template>
  <div class="min-h-screen w-full bg-[#0a0f1e] text-white font-sans selection:bg-blue-500/30">
    
    <!-- ───────── NAVBAR (Capsule Style) ───────── -->
    <div class="fixed left-0 w-full z-50 px-4 transition-all duration-500" :class="isScrolled ? 'top-3' : 'top-6'">
      <nav class="mx-auto bg-[#0d121f]/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-between shadow-2xl transition-all duration-500 overflow-hidden"
           :class="isScrolled ? 'max-w-3xl px-5 py-2' : 'max-w-5xl px-8 py-4'">
        <!-- Logo -->
        <div class="flex items-center gap-2 transition-all duration-500">
          <img :src="StandingMascot" alt="Logo" class="w-8 h-8 object-contain" />
          <span class="font-black tracking-tight text-lg">KomuniTip</span>
        </div>

        <!-- Center Menu -->
        <div class="hidden md:flex items-center font-bold text-gray-400 transition-all duration-500"
             :class="isScrolled ? 'gap-6' : 'gap-10'">
          <a href="#" class="hover:text-white transition-colors">Home</a>
          <a href="#" class="hover:text-white transition-colors">Kreator</a>
          <a href="#" class="hover:text-white transition-colors">FAQ</a>
        </div>

        <!-- Auth Buttons -->
        <!--TONG DIHAPUSSSS IEU NU PENTINGGGGGGGG-->
        <div class="flex items-center transition-all duration-500" :class="isScrolled ? 'gap-2' : 'gap-4'">
          <button @click="goToLogin" class="px-4 py-2 text-[13px] font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-all text-gray-300">
            Masuk
          </button>
          <button @click="goToRegister" class="px-5 py-2 text-[13px] font-bold bg-[#2563eb] rounded-xl hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
            Daftar
          </button>
        </div>
      </nav>
    </div>

    <!-- ───────── HERO SECTION ───────── -->
    <header class="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 overflow-visible">
      
      <!-- BG Glows -->
      <div class="absolute top-20 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] -z-10"></div>
      
      <!-- Left Content -->
      <div class="flex-1 text-center lg:text-left z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 backdrop-blur-md">
          <img :src="StandingMascot" class="w-4 h-4" />
          <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Platformnya Kreator Indo</span>
        </div>

        <h1 class="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6 italic">
          Dukung <br/>
          <span class="text-blue-500 underline underline-offset-8 decoration-blue-500/20">Kreativitas</span><br/>
          Jadi Nyata.
        </h1>

        <p class="text-gray-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed mx-auto lg:mx-0">
          Terima donasi, dan bangun komunitasmu dengan cara yang lebih menyenangkan dan interaktif.
        </p>

        <button @click="goToRegister" 
                class="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:-translate-y-1">
          Mulai Sekarang
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>

        <!-- Social Proof -->
        <div class="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <div class="flex -space-x-3 items-center">
            <div class="w-10 h-10 rounded-full border-2 border-[#0a0f1e] overflow-hidden"><img src="https://i.pravatar.cc/100?u=a" /></div>
            <div class="w-10 h-10 rounded-full border-2 border-[#0a0f1e] overflow-hidden"><img src="https://i.pravatar.cc/100?u=b" /></div>
            <div class="w-10 h-10 rounded-full border-2 border-[#0a0f1e] overflow-hidden"><img src="https://i.pravatar.cc/100?u=c" /></div>
            <div class="w-10 h-10 rounded-full border-2 border-[#0a0f1e] overflow-hidden"><img src="https://i.pravatar.cc/100?u=d" /></div>
          </div>
          <div class="text-center sm:text-left">
            <div class="text-sm font-black text-white">50,000+ Kreator</div>
            <div class="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Telah bergabung</div>
          </div>
        </div>
      </div>

      <!-- Right Visual -->
      <div class="flex-1 relative w-full max-w-[600px]">
        <!-- Main Mockup Card -->
        <div class="relative z-10 bg-[#161b28]/80 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl scale-95 md:scale-100">
          <!-- Card Profile Header -->
          <div class="flex items-center gap-4 mb-10">
            <div class="w-12 h-12 rounded-full border border-blue-500/30 p-1 bg-blue-500/5">
              <img :src="ProfileImage" class="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <div class="text-sm font-black text-white">Brosan</div>
              <div class="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Gamer & Streamer</div>
            </div>
          </div>

          <!-- Donation Info Card -->
          <div class="bg-[#1c2333] rounded-3xl p-6 border border-white/5 shadow-inner">
            <div class="text-[10px] text-gray-500 font-black uppercase mb-3 tracking-widest">Donasi Terakhir</div>
            <div class="flex items-center justify-between mb-6">
              <div class="text-3xl font-black text-white">Rp 50.000</div>
              <div class="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full uppercase">Dari: Anonim</div>
            </div>
            <p class="text-[13px] text-gray-400 leading-relaxed italic border-l-2 border-blue-500/30 pl-4">
              "Semangat terus bang streamnya! Ditunggu konten dota ya ntar malem 🙌"
            </p>
          </div>
        </div>

        <!-- Floating Elements -->
        <img :src="GroupPenguins" class="absolute -top-16 -right-10 w-64 h-auto z-20 animate-float drop-shadow-2xl" />
        
        <!-- Rotating Badge Mascot -->
        <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30 lg:-translate-x-0 lg:left-[5%]">
            <div class="relative group">
                <div class="absolute inset-0 bg-gradient-to-tr from-orange-500 to-yellow-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div class="relative w-40 h-40 bg-[#c2410c] rounded-full border-8 border-[#9a3412] flex items-center justify-center shadow-[0_15px_40px_rgba(194,65,12,0.5)]">
                    <img :src="SittingMascot" class="w-32 h-32 object-contain group-hover:scale-110 transition-transform" />
                </div>
            </div>
        </div>
      </div>
    </header>

    <!-- ───────── STEPS SECTION ───────── -->
    <section class="max-w-7xl mx-auto px-6 py-32 text-center relative overflow-visible">
      <!-- Section Decoration -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] -z-10"></div>
      
      <img :src="WizardMascot" class="absolute left-[-50px] bottom-0 w-64 h-auto opacity-40 -rotate-12 pointer-events-none" />

      <h2 class="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">
        Mulai dalam <span class="text-blue-500 italic font-black">3 Langkah</span>
      </h2>
      <p class="text-gray-500 text-sm font-black max-w-lg mx-auto mb-24 uppercase tracking-[0.2em] leading-relaxed">
        Sangat mudah, tidak sampai 5 menit akunmu sudah siap menerima dukungan.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
        <!-- Step 1 -->
        <div class="group relative isolate p-12 h-full rounded-[48px] border border-blue-500/10 bg-[#0d121f] backdrop-blur-xl hover:bg-[#111827] hover:scale-[1.02] hover:border-blue-500/40 transition-all duration-500 flex flex-col items-center shadow-2xl">
            <!-- Large Peeking Mascot -->
            <img :src="StandingMascot" class="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-auto z-[-1] opacity-0 translate-y-20 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none" />
            
            <div class="w-20 h-20 rounded-3xl border-2 border-blue-500/50 bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-3xl mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">1</div>
            <h3 class="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">Buat Akun</h3>
            <p class="text-gray-400 text-[15px] leading-relaxed font-bold">Daftar gratis dan atur profil page kreatormu semenarik mungkin.</p>
        </div>

        <!-- Step 2 -->
        <div class="group relative isolate p-12 h-full rounded-[48px] border border-orange-500/10 bg-[#0d121f] backdrop-blur-xl hover:bg-[#111827] hover:scale-[1.02] hover:border-orange-500/40 transition-all duration-500 flex flex-col items-center shadow-2xl">
            <!-- Large Peeking Mascot -->
            <img :src="TopHatMascot" class="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-auto z-[-1] opacity-0 translate-y-20 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none" />
            
            <div class="w-20 h-20 rounded-3xl border-2 border-orange-500/50 bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-3xl mb-8 shadow-[0_0_20px_rgba(249,115,22,0.2)] group-hover:scale-110 transition-transform">2</div>
            <h3 class="text-2xl font-black mb-4 group-hover:text-orange-400 transition-colors uppercase italic tracking-tighter">Bagikan Link</h3>
            <p class="text-gray-400 text-[15px] leading-relaxed font-bold">Taruh link KomuniTip di bio sosmed atau sematkan di overlay live stream.</p>
        </div>

        <!-- Step 3 -->
        <div class="group relative isolate p-12 h-full rounded-[48px] border border-emerald-500/10 bg-[#0d121f] backdrop-blur-xl hover:bg-[#111827] hover:scale-[1.02] hover:border-emerald-500/40 transition-all duration-500 flex flex-col items-center shadow-2xl">
            <!-- Large Peeking Mascot -->
            <img :src="SittingMascot" class="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-auto z-[-1] opacity-0 translate-y-20 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none" />
            
            <div class="w-20 h-20 rounded-3xl border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-3xl mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">3</div>
            <h3 class="text-2xl font-black mb-4 group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">Terima Dukungan</h3>
            <p class="text-gray-400 text-[15px] leading-relaxed font-bold">Penggemar bisa berdonasi dengan mudah via QRIS, E-Wallet, atau Transfer Bank.</p>
        </div>
      </div>
    </section>

    <!-- ───────── BG DECOR ───────── -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-5">
      <img :src="IconBabi" class="absolute top-[20%] left-[-10%] w-[500px] h-auto -rotate-[35deg]" />
      <img :src="IconKucing" class="absolute bottom-[-5%] right-[-10%] w-[550px] h-auto rotate-[25deg]" />
    </div>

  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-30px) rotate(2deg); }
}
.animate-float {
  animation: float 8s ease-in-out infinite;
}
</style>
