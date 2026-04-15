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
import MascotRegister from '../assets/Image_(Mascot Register).png'
import ProfileImage from '../assets/Image_(Profile).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

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
  <div class="min-h-screen w-full relative overflow-x-hidden font-sans text-white selection:bg-blue-500/30" style="background-color: #0a0f1e;">
    
    <!-- ───────── Background gradient ───────── -->
    <div class="fixed inset-0 z-0 pointer-events-none"
         style="background:
           radial-gradient(ellipse 60% 60% at 10% 20%, #1a3a6e 0%, transparent 70%),
           radial-gradient(ellipse 55% 55% at 85% 50%, #2b174a 0%, transparent 70%),
           radial-gradient(ellipse 40% 40% at 50% 100%, #111830 0%, transparent 80%),
           #0a0f1e;">
    </div>

    <!-- ───────── Floating background icons ───────── -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] min-w-[177.77vh] h-[56.25vw] min-h-[100vh]">
        <img :src="IconBabi"   class="absolute top-[6%]  left-[12%] w-[22%] h-auto object-contain -rotate-[10deg] opacity-40" />
        <img :src="IconBurung" class="absolute top-[16%] left-[38%] w-[18%] h-auto object-contain  rotate-[2deg]  opacity-30" />
        <img :src="IconKucing" class="absolute top-[10%] right-[6%] w-[25%] h-auto object-contain  rotate-[10deg] opacity-35" />
        <img :src="IconKotak"  class="absolute top-[48%] left-[7%]  w-[32%] h-auto object-contain -rotate-[32deg] opacity-25" />
        <img :src="IconDompet" class="absolute top-[44%] left-[44%] w-[22%] h-auto object-contain  rotate-[28deg] opacity-25" />
        <img :src="IconAngka1" class="absolute top-[68%] left-[33%] w-[12%] h-auto object-contain -rotate-[10deg] opacity-30" />
        <img :src="IconAngka1" class="absolute top-[78%] left-[45%] w-[12%] h-auto object-contain  rotate-[15deg] opacity-25" />
        <img :src="IconCoin"   class="absolute top-[56%] right-[7%] w-[25%] h-auto object-contain -rotate-[5deg]  opacity-35" />
      </div>
    </div>

    <!-- ───────── NAVBAR ───────── -->
    <div class="fixed left-0 w-full z-50 px-4 transition-all duration-500" :class="isScrolled ? 'top-6' : 'top-10'">
      <nav class="mx-auto backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-between shadow-2xl transition-all duration-500 overflow-visible"
           :class="isScrolled ? 'max-w-3xl px-5 py-2 bg-[#0d121f]/90' : 'max-w-5xl px-7 py-3.5 bg-[#0d121f]/70'">
        <!-- Logo -->
        <div class="relative flex items-center" style="padding-left: 60px;">
          <img :src="StandingMascot" alt="Logo" class="absolute -bottom-3 -left-4 w-[90px] max-w-none h-auto object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)] z-20 pointer-events-none" />
          <span class="font-black tracking-tight text-[18px]">KomuniTip</span>
        </div>

        <!-- Center Menu -->
        <div class="hidden md:flex items-center gap-8 text-[13px] font-semibold text-gray-400">
          <a href="#" class="hover:text-white transition-colors">Home</a>
          <a href="#" class="hover:text-white transition-colors">Kreator</a>
          <a href="#" class="hover:text-white transition-colors">FAQ</a>
        </div>

        <!-- Auth Buttons -->
        <!--TONG DIHAPUSSSS IEU NU PENTINGGGGGGGG-->
        <div class="flex items-center gap-3">
          <button @click="goToLogin"
                  class="px-5 py-2 text-[14px] font-bold text-gray-200 rounded-[12px] transition-all hover:translate-y-[2px] active:translate-y-[4px]"
                  style="
                    background: #212936;
                    border: 2px solid #435166;
                    box-shadow: 3px 4px 0 #080c14;
                  ">
            Masuk
          </button>
          <button @click="goToRegister"
                  class="px-5 py-2 text-[14px] font-bold text-white rounded-[12px] transition-all hover:translate-y-[2px] active:translate-y-[4px]"
                  style="
                    background: #2563eb;
                    border: 2px solid #60a5fa;
                    box-shadow: 3px 4px 0 #132a75;
                  ">
            Daftar
          </button>
        </div>
      </nav>
    </div>

    <!-- ───────── HERO SECTION ───────── -->
    <header class="relative z-10 pt-36 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 overflow-visible">

      <!-- Left Content -->
      <div class="flex-1 text-left z-10 max-w-[520px]">

        <!-- Badge -->
        <div class="inline-flex items-center pl-12 pr-4 py-1.5 rounded-[20px] mb-8 relative -rotate-[4deg]"
             style="background: #1e3a8a; border: 2.5px solid #3b82f6; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <!-- Cowbow Mascot overflowing slightly to the right -->
          <img :src="SittingMascot" class="absolute -left-2 -bottom-1 w-[65px] max-w-none h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] z-10 pointer-events-none" />
          <span class="text-[14px] md:text-[17px] font-black text-blue-50 tracking-wide">Platformnya Kreator Indo</span>
        </div>

        <!-- Headline – mirroring bold italic style from reference -->
        <h1 class="font-black tracking-tight leading-[1.0] mb-7"
            style="font-size: clamp(3.2rem, 6.5vw, 5rem); font-style: italic;">
          Dukung<br/>
          <span style="color:#3b82f6; text-decoration: underline; text-decoration-thickness: 4px; text-underline-offset: 6px; text-decoration-color:#2563eb;">Kreativitas</span><br/>
          Jadi Nyata.
        </h1>

        <!-- Subtitle -->
        <p class="text-gray-400 text-[15px] leading-relaxed mb-10 max-w-[400px] font-medium">
          Terima donasi, dan bangun komunitasmu dengan cara yang lebih menyenangkan dan interaktif.
        </p>

        <!-- CTA -->
        <button @click="goToRegister"
                class="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-[15px] transition-all border-2 border-[#60a5fa]"
                style="background: #2563eb; box-shadow: 0 4px 22px rgba(37,99,235,0.5);"
                @mouseover="$event.target.style.filter='brightness(1.15)'"
                @mouseleave="$event.target.style.filter='brightness(1)'">
          Mulai Sekarang
          <span class="text-lg ml-0.5 group-hover:translate-x-1 transition-transform inline-block">→</span>
        </button>

        <!-- Social Proof -->
        <div class="mt-10 flex items-center gap-4">
          <div class="flex -space-x-2.5">
            <div class="w-9 h-9 rounded-full border-2 overflow-hidden flex items-center justify-center"
                 style="border-color:#0a0f1e; background:#0f1a2e;">
              <img :src="TopHatMascot" class="w-8 h-8 object-contain" />
            </div>
            <div class="w-9 h-9 rounded-full border-2 overflow-hidden flex items-center justify-center"
                 style="border-color:#0a0f1e; background:#0e1f18;">
              <img :src="WizardMascot" class="w-8 h-8 object-contain" />
            </div>
            <div class="w-9 h-9 rounded-full border-2 overflow-hidden flex items-center justify-center"
                 style="border-color:#0a0f1e; background:#170f24;">
              <img :src="SittingMascot" class="w-8 h-8 object-contain" />
            </div>
            <div class="w-9 h-9 rounded-full border-2 overflow-hidden"
                 style="border-color:#0a0f1e; background:#1a2130;">
              <img :src="ProfileImage" class="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <div class="text-[13px] font-black text-white">50,000+ Kreator</div>
            <div class="text-[11px] text-gray-500 font-semibold tracking-wide">Telah bergabung</div>
          </div>
        </div>
      </div>

      <!-- Right Visual -->
      <div class="flex-1 relative w-full max-w-[560px]" style="min-height: 420px;">

        <!-- Decoration tilted card – orange (upper-left offset) -->
        <div class="absolute top-0 bottom-8 left-0 right-0 rounded-[28px]"
             style="transform: rotate(-2deg) translate(-16px, -6px); background: transparent; border: 1.5px solid rgba(217,119,6,0.5); z-index:0;"></div>
        
        <!-- Decoration tilted card – blue (lower-right offset) -->
        <div class="absolute top-0 bottom-8 left-0 right-0 rounded-[28px]"
             style="transform: rotate(2deg) translate(16px, 16px); background: transparent; border: 1.5px solid rgba(37,99,235,0.5); z-index:1;"></div>

        <!-- Main Card -->
        <div class="relative rounded-[28px] px-9 pt-9 pb-10"
             style="background: #131b29; border: 1px solid rgba(255,255,255,0.06); z-index:2; box-shadow: 0 30px 70px rgba(0,0,0,0.7);">

          <!-- Profile row -->
          <div class="flex items-center gap-4 mb-8">
            <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                 style="background: #0d1520; border: 1.5px solid rgba(255,255,255,0.08);">
              <img :src="ProfileImage" class="w-7 h-7 object-contain" />
            </div>
            <div>
              <div class="text-[18px] font-black text-white tracking-wide leading-tight">Brosan</div>
              <div class="text-[13px] text-gray-400 font-semibold mt-1">Gamer &amp; Streamer</div>
            </div>
          </div>

          <!-- Donation card inner -->
          <div class="rounded-[20px] px-6 py-6 mb-6"
               style="background: transparent; border: 1px solid rgba(255,255,255,0.07);">
            <div class="text-[11px] font-bold tracking-wide mb-3" style="color: #64748b;">Donasi Terakhir</div>
            <div class="flex items-center justify-between">
              <div class="text-[36px] font-black text-white tracking-tight leading-none">Rp 50.000</div>
              <div class="text-[13px] font-bold" style="color: #60a5fa;">Dari: Anonim</div>
            </div>
          </div>
          
          <p class="text-[14px] text-gray-300 leading-relaxed font-medium">
            "Semangat terus bang streamnya! Ditunggu konten dota ya ntar malem 🙌"
          </p>
        </div>

        <!-- Group Penguins – tilted with blue card backdrop -->
        <div class="absolute pointer-events-none rotate-[10deg]"
             style="top:-120px; right:-70px; z-index:10; width:310px; display:flex; align-items:center; justify-content:center;">
          
          <!-- Blue background card -->
          <div class="absolute rounded-[24px]"
               style="
                 width: 260px; 
                 height: 145px;
                 top: 64%;
                 left: 50%;
                 transform: translate(-50%, -50%);
                 background: linear-gradient(145deg, #163fa8, #0e2d80);
                 border: 2.5px solid #4d8bfc;
                 box-shadow: 5px 7px 0 #050c1e;
                 z-index: 0;
               "></div>
          
          <img :src="GroupPenguins"
               class="relative w-[320px] h-auto"
               style="filter: drop-shadow(0 10px 18px rgba(0,0,0,0.6)); z-index: 1;" />
        </div>

        <!-- Sitting Mascot badge -->
        <div class="absolute" style="bottom:-50px; left:-55px; z-index:10; width:145px; height:145px;">
          <!-- Circle ring – thick dark brown with orange border -->
          <div class="absolute inset-0 rounded-full"
               style="background: #3a1a08; border: 5px solid #b8520b; box-shadow: 0 10px 25px rgba(0,0,0,0.7);"></div>
          <!-- Mascot – overflowing the circle generously -->
          <img :src="SittingMascot"
               class="absolute object-contain max-w-none"
               style="width:230px; bottom:-15px; left:50%; transform:translateX(-46%) rotate(12deg); filter:drop-shadow(0 8px 14px rgba(0,0,0,0.7));" />
        </div>

      </div>
    </header>

    <!-- ───────── STEPS SECTION ───────── -->
    <section class="max-w-7xl mx-auto px-6 pt-16 pb-32 text-center relative overflow-visible z-10">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] -z-10"></div>
      
      
      <div class="relative inline-block mb-4">
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter text-white text-center">
          Mulai dalam <span class="text-blue-500 font-black">3 Langkah</span>
        </h2>
        <!-- Wizard Mascot with Purple Backdrop -->
        <div class="absolute -left-20 md:-left-[270px] top-1/2 -translate-y-1/2 pointer-events-none -rotate-12"
             style="z-index: 10; width: 280px; display: flex; align-items: center; justify-content: center;">
             
          <!-- Purple background card -->
          <div class="absolute rounded-[28px]"
               style="width: 150px; height: 140px; background: #1e103c; border: 4px solid #9333ea; box-shadow: inset 0 0 20px rgba(147,51,234,0.3), 0 10px 24px rgba(0,0,0,0.6); transform: translate(-15px, 30px);">
          </div>
          
          <!-- Image spilling out -->
          <img :src="WizardMascot" class="relative z-10 w-[200px] md:w-[280px] max-w-none h-auto object-contain" 
               style="transform: translateX(10px); filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));" />
        </div>
      </div>
      <p class="text-gray-400 text-[16px] font-semibold max-w-xl mx-auto mb-24 leading-relaxed">
        Sangat mudah, tidak sampai 5 menit akunmu sudah siap menerima dukungan.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
        <!-- Step 1 -->
        <div class="group relative isolate p-12 h-full rounded-[48px] border border-blue-500/10 bg-[#0d121f] backdrop-blur-xl hover:bg-[#111827] hover:scale-[1.02] hover:border-blue-500/40 transition-all duration-500 flex flex-col items-center shadow-2xl">
            <img :src="StandingMascot" class="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-auto z-[-1] opacity-0 translate-y-20 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none" />
            <div class="w-20 h-20 rounded-3xl border-2 border-blue-500/50 bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-3xl mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform">1</div>
            <h3 class="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">Buat Akun</h3>
            <p class="text-gray-400 text-[15px] leading-relaxed font-bold">Daftar gratis dan atur profil page kreatormu semenarik mungkin.</p>
        </div>

        <!-- Step 2 -->
        <div class="group relative isolate p-12 h-full rounded-[48px] border border-orange-500/10 bg-[#0d121f] backdrop-blur-xl hover:bg-[#111827] hover:scale-[1.02] hover:border-orange-500/40 transition-all duration-500 flex flex-col items-center shadow-2xl">
            <img :src="TopHatMascot" class="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-auto z-[-1] opacity-0 translate-y-20 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none" />
            <div class="w-20 h-20 rounded-3xl border-2 border-orange-500/50 bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-3xl mb-8 shadow-[0_0_20px_rgba(249,115,22,0.2)] group-hover:scale-110 transition-transform">2</div>
            <h3 class="text-2xl font-black mb-4 group-hover:text-orange-400 transition-colors uppercase italic tracking-tighter">Bagikan Link</h3>
            <p class="text-gray-400 text-[15px] leading-relaxed font-bold">Taruh link KomuniTip di bio sosmed atau sematkan di overlay live stream.</p>
        </div>

        <!-- Step 3 -->
        <div class="group relative isolate p-12 h-full rounded-[48px] border border-emerald-500/10 bg-[#0d121f] backdrop-blur-xl hover:bg-[#111827] hover:scale-[1.02] hover:border-emerald-500/40 transition-all duration-500 flex flex-col items-center shadow-2xl">
            <img :src="SittingMascot" class="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-auto z-[-1] opacity-0 translate-y-20 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none" />
            <div class="w-20 h-20 rounded-3xl border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-3xl mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">3</div>
            <h3 class="text-2xl font-black mb-4 group-hover:text-emerald-400 transition-colors uppercase italic tracking-tighter">Terima Dukungan</h3>
            <p class="text-gray-400 text-[15px] leading-relaxed font-bold">Penggemar bisa berdonasi dengan mudah via QRIS, E-Wallet, atau Transfer Bank.</p>
        </div>
      </div>
    </section>

    <!-- ───────── KREATOR TERPOPULER SECTION ───────── -->
    <section class="max-w-5xl mx-auto px-6 pb-32 relative z-10">
      <div class="relative rounded-[36px] px-10 pt-14 pb-12 overflow-visible"
           style="background: #0d121f; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
        
        <!-- Top Hat Mascot – decoration top-right -->
        <div class="absolute -top-20 right-6 z-20 pointer-events-none">
          <div class="relative">
            <!-- Orange circle base -->
            <div class="w-36 h-36 rounded-full flex items-center justify-center"
                 style="background: #c4590c; border: 3px solid #eab308; box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
            </div>
            <img :src="TopHatMascot" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] rotate-12 w-[260px] max-w-none h-auto object-contain"
                 style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));" />
          </div>
        </div>

        <!-- Section Title -->
        <div class="text-center mb-10">
          <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
            Kreator <span class="text-amber-400 italic">Terpopuler</span>
          </h2>
          <p class="text-gray-500 text-[14px] font-semibold max-w-md mx-auto">
            Bergabunglah bersama mereka yang telah sukses membangun komunitas.
          </p>
        </div>

        <!-- Creator Cards Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <!-- Creator 1 -->
          <div class="flex flex-col items-center gap-3 py-6 px-4 rounded-[20px] transition-all hover:scale-105"
               style="background: #111827; border: 1px solid rgba(59,130,246,0.2);">
            <div class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                 style="background: #1e3a8a; border: 3px solid #3b82f6; box-shadow: 0 0 16px rgba(59,130,246,0.3);">
              <img :src="StandingMascot" class="w-12 h-12 object-contain" />
            </div>
            <div class="text-center">
              <div class="text-[14px] font-black text-white">Windah B</div>
              <div class="text-[11px] text-gray-500 font-semibold">Gamer</div>
            </div>
          </div>
          <!-- Creator 2 -->
          <div class="flex flex-col items-center gap-3 py-6 px-4 rounded-[20px] transition-all hover:scale-105"
               style="background: #111827; border: 1px solid rgba(239,68,68,0.2);">
            <div class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                 style="background: #7f1d1d; border: 3px solid #ef4444; box-shadow: 0 0 16px rgba(239,68,68,0.3);">
              <img :src="WizardMascot" class="w-12 h-12 object-contain" />
            </div>
            <div class="text-center">
              <div class="text-[14px] font-black text-white">Sarah V</div>
              <div class="text-[11px] text-gray-500 font-semibold">VTuber</div>
            </div>
          </div>
          <!-- Creator 3 -->
          <div class="flex flex-col items-center gap-3 py-6 px-4 rounded-[20px] transition-all hover:scale-105"
               style="background: #111827; border: 1px solid rgba(16,185,129,0.2);">
            <div class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                 style="background: #064e3b; border: 3px solid #10b981; box-shadow: 0 0 16px rgba(16,185,129,0.3);">
              <img :src="MascotRegister" class="w-12 h-12 object-contain" />
            </div>
            <div class="text-center">
              <div class="text-[14px] font-black text-white">Reza A</div>
              <div class="text-[11px] text-gray-500 font-semibold">Podcaster</div>
            </div>
          </div>
          <!-- Creator 4 -->
          <div class="flex flex-col items-center gap-3 py-6 px-4 rounded-[20px] transition-all hover:scale-105"
               style="background: #111827; border: 1px solid rgba(245,158,11,0.2);">
            <div class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                 style="background: #78350f; border: 3px solid #f59e0b; box-shadow: 0 0 16px rgba(245,158,11,0.3);">
              <img :src="SittingMascot" class="w-12 h-12 object-contain" />
            </div>
            <div class="text-center">
              <div class="text-[14px] font-black text-white">Dyland P</div>
              <div class="text-[11px] text-gray-500 font-semibold">Gamer</div>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <div class="text-center">
          <button class="px-7 py-3 text-[14px] font-bold text-white rounded-[14px] transition-all hover:translate-y-[2px] active:translate-y-[4px]"
                  style="background: #2563eb; border: 2px solid #60a5fa; box-shadow: 3px 4px 0 #132a75;">
            Lihat Semua Kreator
          </button>
        </div>
      </div>
    </section>

    <!-- ───────── FOOTER ───────── -->
    <footer class="relative z-10 overflow-visible" style="background: #080c18; border-top: 1px solid rgba(255,255,255,0.04);">
      
      <!-- Group Penguins background watermark inside a clipping wrapper -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute -bottom-16 opacity-[0.2]" style="left: 50%; transform: translateX(-30%);">
          <img :src="GroupPenguins" class="w-[650px] max-w-none h-auto" style="filter: brightness(0.6);" />
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-8 pt-16 pb-8 relative">
        <div class="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-12">
          
          <!-- Left Column – Branding -->
          <div class="lg:max-w-[300px] relative">
            <!-- Mascot Register decoration -->
            <div class="absolute -top-16 -left-4 pointer-events-none">
              <div class="relative w-32 h-32">
                <div class="w-full h-full rounded-full"
                     style="background: #6b21a8; border: 3px solid #a855f7; box-shadow: 0 6px 18px rgba(0,0,0,0.5);"></div>
                <img :src="MascotRegister" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[240px] max-w-none h-auto object-contain"
                     style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));" />
              </div>
            </div>
            
            <div class="pt-28">
              <div class="flex items-center gap-2 mb-4">
                <img :src="StandingMascot" class="w-8 h-8 object-contain" />
                <span class="text-[18px] font-black text-white tracking-tight">KomuniTip</span>
              </div>
              <p class="text-[13px] text-gray-500 leading-relaxed font-medium mb-6">
                Platform dukungan kreator di Indonesia. Wujudkan mimpimu, bangun komunitas yang solid.
              </p>
              <!-- Social Icons -->
              <div class="flex items-center gap-3">
                <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                   style="border: 1px solid rgba(255,255,255,0.1);">
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                   style="border: 1px solid rgba(255,255,255,0.1);">
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                   style="border: 1px solid rgba(255,255,255,0.1);">
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Right Columns – Links -->
          <div class="flex-1 grid grid-cols-2 md:grid-cols-2 gap-8 lg:gap-16 lg:justify-items-center">
            <!-- Perusahaan -->
            <div>
              <h4 class="text-[14px] font-black text-white mb-5 tracking-wide">Perusahaan</h4>
              <ul class="space-y-3">
                <li><a href="#" class="text-[13px] text-gray-500 font-medium hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" class="text-[13px] text-gray-500 font-medium hover:text-white transition-colors">Karir</a></li>
                <li><a href="#" class="text-[13px] text-gray-500 font-medium hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" class="text-[13px] text-gray-500 font-medium hover:text-white transition-colors">Kontak</a></li>
              </ul>
            </div>
            <!-- Bantuan -->
            <div>
              <h4 class="text-[14px] font-black text-white mb-5 tracking-wide">Bantuan</h4>
              <ul class="space-y-3">
                <li><a href="#" class="text-[13px] text-gray-500 font-medium hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" class="text-[13px] text-gray-500 font-medium hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" class="text-[13px] text-gray-500 font-medium hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" class="text-[13px] text-gray-500 font-medium hover:text-white transition-colors">Panduan Kreator</a></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-full h-px mb-6" style="background: rgba(255,255,255,0.06);"></div>

        <!-- Copyright -->
        <p class="text-[12px] text-gray-600 font-semibold">
          © 2026 KomuniTip. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>

  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-28px) rotate(2deg); }
}
.animate-float {
  animation: float 8s ease-in-out infinite;
}
</style>
