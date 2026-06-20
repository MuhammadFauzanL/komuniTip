<script setup>
import { computed, onMounted, ref } from 'vue'
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
import api from '../services/api'

const router = useRouter()
const { user, logout, fetchMyProfile } = useAuth()

const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const notice = ref('')
const errorMessage = ref('')

const settings = ref({
  min_donasi_alert: 10000,
  durasi_alert: 8,
  template_text: '{name} baru saja memberikan',
  font_family: 'Outfit',
  nama_color: '#FFFFFF',
  template_color: '#2BBBA0',
  amount_color: '#51A2FF',
  message_color: '#FFB900',
  sound_enabled: true,
  sound_min_donasi: 200000,
  tts_enabled: false,
  ai_filter_enabled: false,
  banned_words: '',
})

const browserSourceUrl = computed(() => {
  const username = user.value?.username || 'username'
  return `${window.location.origin}/alert/${username}`
})

const previewData = computed(() => ({
  name: user.value?.nama_lengkap?.split(' ')[0] || 'Lubada',
  amount: new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(75000),
  message: 'Semangat terus kontennya, keren banget!',
}))

const creatorName = computed(() => user.value?.nama_lengkap?.split(' ')[0] || user.value?.username || 'Kreator')
const creatorTier = computed(() => user.value?.kategori || user.value?.role || 'Kreator')
const pageLink = computed(() => `${window.location.origin}/${user.value?.username || 'username'}`)

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const previewTemplateHtml = computed(() =>
  escapeHtml(settings.value.template_text)
    .replace(
      '{name}',
      `<span style="color:${settings.value.nama_color}">${escapeHtml(previewData.value.name)}</span>`,
    )
    .replace(
      '{amount}',
      `<span style="color:${settings.value.amount_color}">${escapeHtml(previewData.value.amount)}</span>`,
    ),
)

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

const copyText = async (value, successMessage) => {
  await navigator.clipboard.writeText(value)
  notice.value = successMessage
}

const copyUrl = async () => {
  notice.value = ''
  errorMessage.value = ''

  try {
    await copyText(browserSourceUrl.value, 'URL overlay berhasil disalin.')
  } catch (error) {
    errorMessage.value = error.message || 'Gagal menyalin URL overlay.'
  }
}

const copyPageLink = async () => {
  notice.value = ''
  errorMessage.value = ''

  try {
    await copyText(pageLink.value, 'Link halaman kreator berhasil disalin.')
  } catch (error) {
    errorMessage.value = error.message || 'Gagal menyalin link halaman kreator.'
  }
}

const loadSettings = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await fetchMyProfile()
    const { data } = await api.get('/overlay/settings')
    settings.value = {
      ...settings.value,
      ...data.data,
      min_donasi_alert: Number(data.data.min_donasi_alert ?? settings.value.min_donasi_alert),
      durasi_alert: Number(data.data.durasi_alert ?? settings.value.durasi_alert),
      sound_min_donasi: Number(data.data.sound_min_donasi ?? settings.value.sound_min_donasi),
      ai_filter_enabled: Boolean(data.data.ai_filter_enabled ?? settings.value.ai_filter_enabled),
      banned_words: data.data.banned_words ?? settings.value.banned_words,
    }
  } catch (error) {
    errorMessage.value = error.message || 'Gagal memuat pengaturan overlay.'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    const payload = {
      template_text: settings.value.template_text,
      font_family: settings.value.font_family,
      nama_color: settings.value.nama_color,
      template_color: settings.value.template_color,
      amount_color: settings.value.amount_color,
      message_color: settings.value.message_color,
      sound_enabled: settings.value.sound_enabled,
      tts_enabled: settings.value.tts_enabled,
      min_donasi_alert: Number(settings.value.min_donasi_alert),
      durasi_alert: Number(settings.value.durasi_alert),
      sound_min_donasi: Number(settings.value.sound_min_donasi),
      ai_filter_enabled: Boolean(settings.value.ai_filter_enabled),
      banned_words: settings.value.banned_words,
    }
    const { data } = await api.patch('/overlay/settings', payload)
    settings.value = {
      ...settings.value,
      ...data.data,
      min_donasi_alert: Number(data.data.min_donasi_alert),
      durasi_alert: Number(data.data.durasi_alert),
      sound_min_donasi: Number(data.data.sound_min_donasi),
      ai_filter_enabled: Boolean(data.data.ai_filter_enabled),
      banned_words: data.data.banned_words,
    }
    notice.value = 'Pengaturan overlay berhasil disimpan.'
  } catch (error) {
    errorMessage.value = error.message || 'Gagal menyimpan pengaturan overlay.'
  } finally {
    saving.value = false
  }
}

const sendTestAlert = async () => {
  testing.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await api.post('/overlay/test-alert')
    notice.value = 'Test alert berhasil dikirim. Cek browser source OBS atau halaman /alert.'
  } catch (error) {
    errorMessage.value = error.message || 'Gagal mengirim test alert.'
  } finally {
    testing.value = false
  }
}

onMounted(loadSettings)
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
    <aside class="relative z-10 w-[280px] m-4 mr-0 rounded-[30px] flex flex-col pt-8 pb-6 px-4 hidden xl:flex"
           style="background-color: #12192a; box-shadow: 0 4px 40px rgba(0,0,0,0.3);">
      
      <!-- Logo -->
      <div class="flex items-center space-x-3 px-4 mb-10">
        <img :src="StandingMascot" alt="KomuniTip" class="w-10 h-10 object-contain drop-shadow-md -scale-x-100 -rotate-2" />
        <span class="text-xl font-bold tracking-wide">KomuniTip</span>
      </div>

      <!-- Profile -->
      <div class="flex items-center space-x-4 px-4 py-3 mx-2 mb-8 rounded-2xl border border-[#212b42]" 
           style="background-color: #161e31;">
        <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-[#1c263e]">
          <img :src="ProfileImage" class="w-full h-full object-cover" />
        </div>
        <div>
          <div class="text-[15px] font-semibold text-white">
            {{ creatorName }}
          </div>
          <div class="text-[12px] text-blue-400 font-bold mt-0.5">
            {{ creatorTier }}
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto scrollbar-hide px-2">
        <nav class="space-y-2">
          <button @click="handleGoToDashboard" class="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-[#1a2337] transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span class="font-medium text-[14px]">Dashboard</span>
          </button>
          
          <button @click="handleGoToOverlay" class="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl bg-blue-600 text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
            </svg>
            <span class="font-medium text-[14px]">Overlay</span>
          </button>
          
          <button type="button" class="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-[#1a2337] transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            <span class="font-medium text-[14px]">Wallet</span>
          </button>
          
          <button type="button" class="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-[#1a2337] transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span class="font-medium text-[14px]">Settings</span>
          </button>
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
    <main class="relative z-10 flex-1 h-screen overflow-y-auto px-6 py-8 scrollbar-hide lg:px-10">
      
      <!-- Top header -->
      <div class="flex justify-between items-start mb-12 w-full relative z-30">
        <div>
          <h1 class="text-3xl font-bold mb-2">Halo, {{ creatorName }}!</h1>
          <p class="text-[15px] text-[#7a8ba8]">Siap untuk stream hari ini?</p>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="copyPageLink" class="flex items-center space-x-2 px-5 py-2.5 rounded-full border border-[#2c3953] bg-[#12192a] hover:bg-[#1a2337] transition-all">
            <svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span class="text-sm font-medium">Share My Page</span>
          </button>
          <button class="w-10 h-10 rounded-full border border-[#2c3953] bg-[#12192a] hover:bg-[#1a2337] flex items-center justify-center relative transition-all text-gray-300">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span class="absolute top-[10px] right-[10px] w-2 h-2 bg-pink-500 rounded-full box-content border-2 border-[#12192a]"></span>
          </button>
        </div>
      </div>

      <div class="mb-8 flex items-center gap-3">
        <svg class="h-8 w-8 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
        </svg>
        <div>
          <h2 class="text-3xl font-bold">Overlay Alert</h2>
          <p class="text-sm text-[#7a8ba8] mt-1">Konfigurasi notifikasi donasi untuk live streaming kamu.</p>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-6 rounded-[14px] border border-[rgba(187,77,0,0.5)] bg-[rgba(123,51,6,0.2)] px-4 py-3 text-sm text-[rgba(254,230,133,0.95)]">
        {{ errorMessage }}
      </div>
      <div v-if="notice" class="mb-6 rounded-[14px] border border-[rgba(0,188,125,0.35)] bg-[rgba(0,79,59,0.18)] px-4 py-3 text-sm text-[#b8ffe0]">
        {{ notice }}
      </div>

      <div v-if="loading" class="rounded-[28px] border border-[#212b42] bg-[#101623] p-8 text-sm text-[#7a8ba8]">
        Memuat konfigurasi overlay...
      </div>

      <div v-else class="space-y-6 pb-12">
        <!-- Preview & Browser Source -->
        <section class="rounded-[28px] border border-[#212b42] bg-[#101623] overflow-hidden">
          <div class="border-b border-[#212b42]">
            <div class="w-full border-b-[3px] border-blue-500 bg-blue-500/10 px-6 py-4 text-center text-sm font-bold text-blue-400">
              Default
            </div>
          </div>

          <div class="relative overflow-hidden bg-[#050b14] px-5 py-10 sm:px-10">
            <div class="absolute inset-0 opacity-20" style="background: radial-gradient(circle at center, rgba(255,255,255,0.12), rgba(0,0,0,0) 42%);" />
            <div class="absolute right-8 top-0 h-64 w-64 rounded-full bg-[rgba(28,57,142,0.18)] blur-[80px]" />

            <div class="relative mx-auto max-w-[402px] rounded-2xl border border-[rgba(28,57,142,0.5)] bg-[#0a1628] px-8 py-8 text-center shadow-[0_0_15px_rgba(30,58,138,0.3)]">
              <div
                class="text-[17px] font-bold leading-7"
                :style="{ color: settings.template_color, fontFamily: settings.font_family }"
                v-html="previewTemplateHtml"
              />
              <div
                class="mt-3 text-[38px] font-extrabold tracking-[-0.02em]"
                :style="{ color: settings.amount_color, fontFamily: settings.font_family }"
              >
                {{ previewData.amount }}
              </div>
              <div
                class="mt-3 text-[15px] font-medium"
                :style="{ color: settings.message_color, fontFamily: settings.font_family }"
              >
                "{{ previewData.message }}"
              </div>
            </div>
          </div>

          <div class="space-y-4 border-t border-[#1d293d] bg-[#0f172b] px-6 py-6 sm:px-8">
            <div class="flex items-start gap-3">
              <svg class="mt-0.5 h-5 w-5 text-[#cad5e2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 4v12m0 0l-3-3m3 3l3-3" />
              </svg>
              <div>
                <h3 class="text-[15px] font-bold text-slate-100">Browser Source URL (OBS / Streamlabs / XSplit)</h3>
              </div>
            </div>

            <div class="flex flex-col gap-3 lg:flex-row">
              <div class="flex min-h-[48px] flex-1 items-center rounded-[14px] border border-[#314158] bg-[#1d293d] px-5 text-[14px] font-medium text-[#51a2ff]">
                {{ browserSourceUrl }}
              </div>
              <button
                class="flex h-[48px] shrink-0 items-center justify-center gap-2 rounded-[14px] border border-[#314158] bg-[#1d293d] px-6 text-[14px] font-bold text-slate-100 transition hover:bg-[#28374f]"
                @click="copyUrl"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Salin
              </button>
            </div>

            <div class="flex flex-wrap gap-3 pt-2">
              <a
                :href="browserSourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex rounded-[14px] border border-[#314158] bg-transparent px-5 py-2.5 text-[13px] font-bold text-slate-300 transition hover:bg-[#1d293d]"
              >
                Buka Overlay
              </a>
              <button
                class="rounded-[14px] border border-[#314158] bg-transparent px-5 py-2.5 text-[13px] font-bold text-slate-300 transition hover:bg-[#1d293d]"
                @click="sendTestAlert"
                :disabled="testing"
              >
                {{ testing ? 'Mengirim...' : 'Kirim Test Alert' }}
              </button>
            </div>

            <div class="mt-4 flex items-start gap-3 rounded-[14px] border border-[rgba(255,185,0,0.3)] bg-[rgba(255,185,0,0.05)] px-4 py-3">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#ffb900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-[13px] leading-relaxed text-[#cad5e2]">
                <strong class="text-white">Peringatan:</strong> Jangan biarkan siapapun melihat atau mengetahui link overlay ini. Setelah mengubah tampilan, klik kanan Browser Source di OBS dan pilih "Refresh cache of current page".
              </p>
            </div>
          </div>
        </section>

        <!-- Tampilan Alert -->
        <section class="rounded-[28px] border border-[#212b42] bg-[#101623] p-6 sm:p-8">
          <div class="mb-8 flex items-center gap-3 border-b border-[#212b42] pb-4">
            <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <h3 class="text-[17px] font-bold">Tampilan Alert</h3>
          </div>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <!-- Warna Nama -->
            <div class="rounded-[16px] border border-[#2c3953] bg-[#161e31] p-4 focus-within:border-blue-400 transition">
              <h4 class="text-[13px] font-bold text-[#7a8ba8] mb-3">Warna Nama</h4>
              <div class="flex items-center gap-3">
                <div class="relative w-8 h-8 rounded border border-white/20 overflow-hidden shrink-0">
                  <input v-model="settings.nama_color" type="color" class="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                </div>
                <input v-model="settings.nama_color" type="text" class="w-full bg-transparent text-[14px] font-bold text-white outline-none uppercase" />
              </div>
            </div>

            <!-- Warna Teks Template -->
            <div class="rounded-[16px] border border-[#2c3953] bg-[#161e31] p-4 focus-within:border-blue-400 transition">
              <h4 class="text-[13px] font-bold text-[#7a8ba8] mb-3">Warna Teks Template</h4>
              <div class="flex items-center gap-3">
                <div class="relative w-8 h-8 rounded border border-white/20 overflow-hidden shrink-0">
                  <input v-model="settings.template_color" type="color" class="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                </div>
                <input v-model="settings.template_color" type="text" class="w-full bg-transparent text-[14px] font-bold text-white outline-none uppercase" />
              </div>
            </div>

            <!-- Warna Nominal -->
            <div class="rounded-[16px] border border-[#2c3953] bg-[#161e31] p-4 focus-within:border-blue-400 transition">
              <h4 class="text-[13px] font-bold text-[#7a8ba8] mb-3">Warna Nominal</h4>
              <div class="flex items-center gap-3">
                <div class="relative w-8 h-8 rounded border border-white/20 overflow-hidden shrink-0">
                  <input v-model="settings.amount_color" type="color" class="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                </div>
                <input v-model="settings.amount_color" type="text" class="w-full bg-transparent text-[14px] font-bold text-white outline-none uppercase" />
              </div>
            </div>

            <!-- Warna Pesan -->
            <div class="rounded-[16px] border border-[#2c3953] bg-[#161e31] p-4 focus-within:border-blue-400 transition">
              <h4 class="text-[13px] font-bold text-[#7a8ba8] mb-3">Warna Pesan</h4>
              <div class="flex items-center gap-3">
                <div class="relative w-8 h-8 rounded border border-white/20 overflow-hidden shrink-0">
                  <input v-model="settings.message_color" type="color" class="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                </div>
                <input v-model="settings.message_color" type="text" class="w-full bg-transparent text-[14px] font-bold text-white outline-none uppercase" />
              </div>
            </div>
          </div>

          <div class="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h4 class="text-[14px] font-bold text-white mb-2">Template Teks</h4>
              <p class="text-[13px] text-[#7a8ba8] mb-3">Teks yang muncul sebelum nominal donasi.</p>
              <input v-model="settings.template_text" type="text" class="w-full rounded-[16px] border border-[#2c3953] bg-[#161e31] px-4 py-3.5 text-[14px] text-white outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <h4 class="text-[14px] font-bold text-white mb-2">Font</h4>
              <p class="text-[13px] text-[#7a8ba8] mb-3">Pilih gaya tulisan untuk notifikasi overlay.</p>
              <select v-model="settings.font_family" class="w-full rounded-[16px] border border-[#2c3953] bg-[#161e31] px-4 py-3.5 text-[14px] text-white outline-none focus:border-blue-400 transition appearance-none">
                <option value="Inter">Inter</option>
                <option value="Outfit">Outfit</option>
                <option value="Poppins">Poppins</option>
                <option value="Roboto">Roboto</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Aturan Alert -->
        <section class="rounded-[28px] border border-[#212b42] bg-[#101623] p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-6 border-b border-[#212b42] pb-4">
            <svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 class="text-[17px] font-bold">Aturan Alert</h3>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <h4 class="text-[14px] font-bold text-white mb-2">Durasi Tampil</h4>
              <p class="text-[13px] text-[#7a8ba8] mb-3">Lama waktu alert muncul di layar (detik).</p>
              <div class="flex max-w-[240px] rounded-xl overflow-hidden border border-[#2c3953] bg-[#0d121e] focus-within:border-blue-400 transition">
                <input v-model.number="settings.durasi_alert" type="number" min="4" max="60" class="w-full bg-transparent px-4 py-2.5 text-[14px] text-white outline-none" />
                <div class="flex items-center justify-center bg-[#1e293b] px-4 border-l border-[#2c3953] text-[13px] font-bold text-gray-400">detik</div>
              </div>
            </div>

            <div>
              <h4 class="text-[14px] font-bold text-white mb-2">Minimal Donasi</h4>
              <p class="text-[13px] text-[#7a8ba8] mb-3">Batas minimal donasi agar alert muncul.</p>
              <div class="flex max-w-[240px] rounded-xl overflow-hidden border border-[#2c3953] bg-[#0d121e] focus-within:border-blue-400 transition">
                <div class="flex items-center justify-center bg-[#1e293b] px-4 border-r border-[#2c3953] text-[13px] font-bold text-gray-400">IDR</div>
                <input v-model.number="settings.min_donasi_alert" type="number" min="1000" class="w-full bg-transparent px-4 py-2.5 text-[14px] text-white outline-none" />
              </div>
            </div>
          </div>
        </section>

        <!-- Suara Alert -->
        <section class="rounded-[28px] border border-[#212b42] bg-[#101623] p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-6 border-b border-[#212b42] pb-4">
            <svg class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <h3 class="text-[17px] font-bold">Suara Alert</h3>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-[15px] font-bold text-white">Sound Alert</h4>
                <p class="text-[13px] text-[#7a8ba8] mt-1">Putar suara unik saat donasi masuk.</p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input v-model="settings.sound_enabled" type="checkbox" class="peer sr-only" />
                <div class="h-6 w-11 rounded-full bg-[#314158] transition peer-checked:bg-emerald-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
              </label>
            </div>

            <div class="rounded-2xl border border-[#212b42] bg-[#0d121e] p-5">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="text-[14px] font-bold text-white">Text-to-Speech (Membaca Pesan)</h4>
                  <p class="text-[13px] text-[#7a8ba8]">Bacakan pesan dukungan dengan suara robot.</p>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input v-model="settings.tts_enabled" type="checkbox" class="peer sr-only" />
                  <div class="h-5 w-9 rounded-full bg-[#314158] transition peer-checked:bg-emerald-500 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
                </label>
              </div>
              
              <div class="mb-2">
                <span class="text-[13px] font-bold text-white">Minimal donasi untuk TTS</span>
              </div>
              <div class="flex max-w-[300px] rounded-xl overflow-hidden border border-[#2c3953] bg-[#161e31] focus-within:border-blue-400 transition">
                <div class="flex items-center justify-center bg-[#1e293b] px-4 border-r border-[#2c3953] text-[13px] font-bold text-gray-400">IDR</div>
                <input v-model.number="settings.sound_min_donasi" type="number" min="1000" class="w-full bg-transparent px-4 py-2.5 text-[14px] text-white outline-none" />
              </div>
              <p class="text-[12px] text-[#7a8ba8] mt-2">Di bawah nominal ini, donasi dibacakan menggunakan Sound saja</p>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#1a2337]">
              <div>
                <h4 class="text-[15px] font-bold text-white">Suara Notifikasi Default</h4>
                <p class="text-[13px] text-[#7a8ba8]">Suara yang diputar saat alert muncul</p>
              </div>
              <div class="flex gap-2">
                <button @click="sendTestAlert" class="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[13px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition">Test</button>
                <button class="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[13px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition">Ganti Suara</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Filter & Moderasi -->
        <section class="rounded-[28px] border border-[#212b42] bg-[#101623] p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-6 border-b border-[#212b42] pb-4">
            <svg class="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.567-3 3.5S10.343 15 12 15s3-1.567 3-3.5S13.657 8 12 8zm0 0V5m0 10v4m7-7h-4M9 12H5" />
            </svg>
            <h3 class="text-[17px] font-bold">Filter & Moderasi</h3>
          </div>

          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <label class="relative inline-flex cursor-pointer items-center mt-0.5">
                <input v-model="settings.ai_filter_enabled" type="checkbox" class="peer sr-only" />
                <div class="h-6 w-11 rounded-full bg-[#314158] transition peer-checked:bg-blue-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
              </label>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-[15px] font-bold text-white">Aktifkan Filter AI</h4>
                  <span class="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">AI</span>
                </div>
                <p class="text-[13px] text-[#7a8ba8] mt-1 leading-relaxed max-w-3xl">
                  Dengan mengaktifkan filter AI, setiap Nama dan Pesan Pendukung akan melalui proses pengecekan untuk memastikan tidak mengandung konten yang melanggar ketentuan. 
                  <span class="text-white font-medium">(Catatan MVP: UI filter AI ini sudah dihubungkan dengan logic database).</span>
                </p>
              </div>
            </div>

            <div class="pt-2 border-t border-[#1a2337]">
              <h4 class="text-[14px] font-bold text-white mb-2">Filter Kata Manual</h4>
              <p class="text-[13px] text-[#7a8ba8] mb-4">
                Pesan donasi dan nama pendukung tidak akan ditampilkan jika mengandung kata-kata di bawah ini. Pisahkan kata dengan <strong>koma</strong>. (Contoh: kasar, bodoh, jelek)
              </p>
              <textarea
                v-model="settings.banned_words"
                rows="4"
                placeholder="Ketik kata atau..."
                class="w-full rounded-[16px] border border-[#2c3953] bg-[#161e31] p-4 text-[13px] text-white outline-none resize-y focus:border-blue-400 transition"
              ></textarea>
              <p class="text-[12px] text-[#5b6a8a] mt-2">Kata yang diblokir mencakup keyword filter beserta variasinya.</p>
            </div>
          </div>
        </section>

        <!-- Save button -->
        <div class="flex justify-end pt-2">
          <button
            class="rounded-[16px] bg-blue-600 px-8 py-3.5 text-[15px] font-bold text-white hover:bg-blue-500 transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="saving"
            @click="saveSettings"
          >
            {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
