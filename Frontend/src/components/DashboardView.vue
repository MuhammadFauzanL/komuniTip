<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
import api from '../services/api'

const router = useRouter()
const { user, logout, fetchMyProfile } = useAuth() 

const donations = ref([])
const stats = ref({
  total_donasi_sukses: 0,
  total_pendapatan: 0,
  total_diblokir_ai: 0,
})
const loading = ref(true)
const activeFeed = ref('all')
const dashboardError = ref('')
const walletSection = ref(null)
const withdrawals = ref([])
const withdrawalLoading = ref(false)
const withdrawalSubmitting = ref(false)
const withdrawalCancelingId = ref('')
const withdrawalError = ref('')
const withdrawalSuccess = ref('')
const withdrawalForm = ref({
  amount: 50000,
  bank_name: '',
  account_name: '',
  account_number: '',
  notes: '',
})
const PENDING_DONATION_REFRESH_INTERVAL_MS = 5000
let pendingDonationRefreshIntervalId = null

onMounted(async () => {
  await fetchMyProfile()
  await Promise.all([fetchDonations(), fetchStats(), fetchWithdrawals()])
  resetWithdrawalForm()
  syncPendingDonationRefresh()
})

const fetchDonations = async () => {
  try {
    loading.value = true
    const response = await api.get('/donation/my')
    donations.value = response.data.data.donations || []
  } catch (error) {
    dashboardError.value = error.message || 'Gagal memuat riwayat dukungan.'
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await api.get('/donation/stats')
    stats.value = response.data.data
  } catch (error) {
    dashboardError.value = error.message || 'Gagal memuat statistik donasi.'
  }
}

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

const handleGoToWallet = () => {
  walletSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const handleGoToOverlay = () => {
  router.push('/overlay')
}

const formatCurrency = (amount) =>
  `Rp${Number(amount || 0).toLocaleString('id-ID')}`

// Format Time Ago
const timeAgo = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} jam lalu`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} hari lalu`
}

// Generate Initial
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

// Get Random Color based on string
const getAvatarColor = (str) => {
  const colors = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#10b981']
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const donationFeedTabs = [
  { id: 'all', label: 'Semua Aktivitas' },
  { id: 'success', label: 'Donasi Sukses' },
  { id: 'blocked', label: 'Moderasi AI' },
  { id: 'pending', label: 'Menunggu Bayar' },
]

const filteredDonations = computed(() => {
  if (activeFeed.value === 'success') {
    return donations.value.filter((donation) => donation.status === 'SUCCESS')
  }

  if (activeFeed.value === 'blocked') {
    return donations.value.filter((donation) => ['BLOCK', 'HOLD'].includes(donation.ai_status))
  }

  if (activeFeed.value === 'pending') {
    return donations.value.filter((donation) => donation.status === 'PENDING')
  }

  return donations.value
})

const blockedDonations = computed(() =>
  donations.value.filter((donation) => ['BLOCK', 'HOLD'].includes(donation.ai_status)),
)

const pendingDonations = computed(() =>
  donations.value.filter((donation) => donation.status === 'PENDING'),
)

const availableBalance = computed(() => Number(user.value?.saldo_aktif || 0))
const heldBalance = computed(() => Number(user.value?.saldo_tertahan || 0))
const canSubmitWithdrawal = computed(
  () =>
    availableBalance.value >= 50000 &&
    withdrawalForm.value.amount >= 50000 &&
    withdrawalForm.value.bank_name.trim().length > 0 &&
    withdrawalForm.value.account_name.trim().length > 0 &&
    withdrawalForm.value.account_number.trim().length > 0 &&
    !withdrawalSubmitting.value,
)

const fetchWithdrawals = async () => {
  try {
    withdrawalLoading.value = true
    const response = await api.get('/withdrawals/my')
    const payload = response.data.data
    withdrawals.value = payload.withdrawals || []
  } catch (error) {
    withdrawalError.value = error.message || 'Gagal memuat data withdraw.'
  } finally {
    withdrawalLoading.value = false
  }
}

const stopPendingDonationRefresh = () => {
  if (pendingDonationRefreshIntervalId) {
    clearInterval(pendingDonationRefreshIntervalId)
    pendingDonationRefreshIntervalId = null
  }
}

const syncPendingDonationRefresh = () => {
  stopPendingDonationRefresh()

  if (pendingDonations.value.length === 0) {
    return
  }

  pendingDonationRefreshIntervalId = window.setInterval(async () => {
    try {
      await Promise.all([fetchDonations(), fetchStats(), fetchMyProfile()])
    } catch {
      // Keep silent here; existing UI error handling in fetchers is sufficient.
    }
  }, PENDING_DONATION_REFRESH_INTERVAL_MS)
}

const resetWithdrawalForm = () => {
  withdrawalForm.value = {
    amount: 50000,
    bank_name: '',
    account_name: user.value?.nama_lengkap || '',
    account_number: '',
    notes: '',
  }
}

const submitWithdrawal = async () => {
  try {
    withdrawalError.value = ''
    withdrawalSuccess.value = ''
    withdrawalSubmitting.value = true

    const response = await api.post('/withdrawals/my', {
      amount: Number(withdrawalForm.value.amount),
      bank_name: withdrawalForm.value.bank_name,
      account_name: withdrawalForm.value.account_name,
      account_number: withdrawalForm.value.account_number,
      notes: withdrawalForm.value.notes || undefined,
    })

    withdrawalSuccess.value = `Request withdraw ${formatCurrency(response.data.data.withdrawal.amount)} berhasil dibuat.`
    resetWithdrawalForm()
    await Promise.all([fetchMyProfile(), fetchWithdrawals()])
  } catch (error) {
    withdrawalError.value = error.message || 'Gagal membuat request withdraw.'
  } finally {
    withdrawalSubmitting.value = false
  }
}

const cancelWithdrawal = async (withdrawalId) => {
  try {
    withdrawalError.value = ''
    withdrawalSuccess.value = ''
    withdrawalCancelingId.value = withdrawalId
    await api.patch(`/withdrawals/my/${withdrawalId}/cancel`)
    withdrawalSuccess.value = 'Request withdraw berhasil dibatalkan dan saldo dikembalikan.'
    await Promise.all([fetchMyProfile(), fetchWithdrawals()])
  } catch (error) {
    withdrawalError.value = error.message || 'Gagal membatalkan request withdraw.'
  } finally {
    withdrawalCancelingId.value = ''
  }
}

const formatWithdrawalStatus = (status) => {
  if (status === 'PENDING') return 'Menunggu Proses'
  if (status === 'PROCESSING') return 'Diproses'
  if (status === 'SUCCESS') return 'Berhasil'
  if (status === 'FAILED') return 'Gagal'
  if (status === 'CANCELLED') return 'Dibatalkan'
  return status
}

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '-'
  if (accountNumber.length <= 4) return accountNumber
  return `••••${accountNumber.slice(-4)}`
}

resetWithdrawalForm()

watch(
  () => pendingDonations.value.length,
  () => {
    syncPendingDonationRefresh()
  },
)

onBeforeUnmount(() => {
  stopPendingDonationRefresh()
})
</script>

<template>
  <div class="min-h-screen w-full relative flex text-white bg-[#0b1121] overflow-hidden">
    <div
      class="fixed inset-0 z-0 pointer-events-none"
      style="
        background:
          radial-gradient(circle at 18% 8%, rgba(28, 57, 142, 0.34), transparent 24%),
          radial-gradient(circle at 86% 34%, rgba(49, 44, 133, 0.24), transparent 22%),
          radial-gradient(circle at 76% 72%, rgba(89, 22, 139, 0.18), transparent 18%),
          #0b1121;
      "
    />

    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-55">
      <div class="absolute top-1/2 left-1/2 h-[56.25vw] min-h-[100vh] w-[100vw] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2">
        <img :src="IconBabi" class="absolute left-[12%] top-[8%] w-[18%] -rotate-[10deg]" alt="" />
        <img :src="IconBurung" class="absolute left-[38%] top-[12%] w-[17%] rotate-[6deg]" alt="" />
        <img :src="IconKucing" class="absolute right-[5%] top-[6%] w-[22%] rotate-[12deg]" alt="" />
        <img :src="IconKotak" class="absolute left-[2%] top-[28%] w-[30%] -rotate-[32deg]" alt="" />
        <img :src="IconDompet" class="absolute left-[42%] top-[38%] w-[19%] rotate-[30deg]" alt="" />
        <img :src="IconAngka1" class="absolute left-[31%] top-[70%] w-[12%] -rotate-[12deg]" alt="" />
        <img :src="IconCoin" class="absolute right-[3%] top-[49%] w-[22%] rotate-[10deg]" alt="" />
      </div>
    </div>

    <aside
      class="relative z-10 m-4 mr-0 hidden w-[232px] flex-col overflow-hidden rounded-[40px] border border-[#314158] bg-[#0f172b] shadow-[6px_6px_0px_0px_#020617] xl:flex"
    >
      <div class="absolute left-[100px] top-0 h-32 w-32 rounded-bl-[100px] bg-[#1c398e4d]" />

      <div class="px-6 pb-6 pt-8">
        <div class="mb-9 flex items-center gap-3">
          <img :src="StandingMascot" alt="KomuniTip" class="h-12 w-12 object-contain -scale-x-100 -rotate-2" />
          <span class="text-xl font-bold tracking-tight text-slate-100">KomuniTip</span>
        </div>

        <div
          class="mb-8 flex cursor-pointer items-center gap-4 rounded-3xl border border-[#314158] bg-[#1d293d] px-4 py-4 shadow-[4px_4px_0px_#020617]"
          @click="handleGoToProfile"
        >
          <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#45556c] bg-[#0f172b]">
            <img :src="ProfileImage" alt="Profile" class="h-10 w-10 object-cover" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-base font-bold text-slate-100">{{ user?.nama_lengkap?.split(' ')[0] || 'Kreator' }}</p>
            <p class="text-xs font-bold text-[#51a2ff]">
              {{ user?.role === 'ADMIN' ? 'Admin' : 'Kreator Pro' }}
            </p>
          </div>
        </div>

        <div class="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#62748e]">Menu Utama</div>

        <nav class="space-y-2">
          <button
            class="flex h-[55px] w-full items-center gap-3 rounded-2xl border border-[#51a2ff] bg-[#155dfc] px-4 text-left text-white shadow-[4px_4px_0px_0px_#1e3a8a]"
            type="button"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span class="text-sm font-bold">Dashboard</span>
          </button>

          <button
            class="flex h-[55px] w-full items-center gap-3 rounded-2xl px-4 text-left text-slate-400 transition hover:bg-[#1a2337] hover:text-white"
            @click="handleGoToOverlay"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
            </svg>
            <span class="text-sm font-bold">Overlay</span>
          </button>

          <button
            class="flex h-[55px] w-full items-center gap-3 rounded-2xl px-4 text-left text-slate-400 transition hover:bg-[#1a2337] hover:text-white"
            @click="handleGoToWallet"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span class="text-sm font-bold">Wallet</span>
          </button>

          <button
            class="flex h-[55px] w-full items-center gap-3 rounded-2xl px-4 text-left text-slate-400 transition hover:bg-[#1a2337] hover:text-white"
            type="button"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-sm font-bold">Settings</span>
          </button>
        </nav>
      </div>

      <div class="mt-auto px-6 pb-6">
        <button
          class="flex h-[51px] w-full items-center gap-3 rounded-2xl px-4 text-left text-slate-400 transition hover:bg-[#1a2337] hover:text-white"
          @click="handleLogout"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-sm font-bold">Keluar</span>
        </button>
      </div>
    </aside>

    <main class="relative z-10 h-screen flex-1 overflow-y-auto scrollbar-hide">
      <div class="mx-auto max-w-[960px] px-5 py-6 sm:px-8 xl:max-w-none xl:px-0">
        <header class="mb-10 flex flex-col gap-5 px-0 xl:px-10 xl:pt-2">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 class="text-[30px] font-bold tracking-[-0.03em] text-slate-100">
                Halo, {{ user?.nama_lengkap?.split(' ')[0] || 'Kreator' }}!
              </h1>
              <p class="mt-1 text-base font-medium text-[#90a1b9]">Siap untuk stream hari ini?</p>
            </div>

            <div class="flex items-center gap-3 self-start">
              <button
                class="flex h-[51px] items-center gap-2 rounded-2xl border border-[#314158] bg-[#0f172b] px-5 text-sm font-bold text-[#cad5e2] shadow-[4px_4px_0px_#020617] transition hover:border-[#45556c]"
                @click="copyLink"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share My Page</span>
              </button>

              <div class="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#314158] bg-[#0f172b] shadow-[2px_2px_0px_#020617]">
                <svg class="h-5 w-5 text-[#cad5e2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span class="absolute right-2 top-2 h-3 w-3 rounded-full border border-[#0f172b] bg-[#ff2056]" />
              </div>
            </div>
          </div>

          <div
            v-if="dashboardError"
            class="rounded-[14px] border border-[rgba(187,77,0,0.5)] bg-[rgba(123,51,6,0.2)] px-4 py-3 text-sm text-[rgba(254,230,133,0.95)]"
          >
            {{ dashboardError }}
          </div>
        </header>

        <div class="space-y-10 px-0 pb-10 xl:px-10">
          <section class="relative overflow-hidden rounded-[40px] border border-[#2b7fff] bg-[linear-gradient(162deg,#1447e6_0%,#1e1a4d_100%)] shadow-[6px_6px_0px_#020617]">
            <div class="absolute left-[-80px] top-[120px] h-[250px] w-[390px] rounded-full bg-[rgba(97,95,255,0.2)] blur-[60px]" />
            <div class="absolute right-[20%] top-[-120px] h-[380px] w-[630px] rounded-full bg-[rgba(43,127,255,0.2)] blur-[80px]" />

            <div class="relative flex flex-col gap-8 px-8 py-8 lg:flex-row lg:items-end lg:justify-between">
              <div class="max-w-[420px]">
                <div class="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#bedbff]">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Total Pendapatan</span>
                </div>

                <div class="mt-4 text-[44px] font-bold leading-none tracking-[-0.04em] text-slate-100 md:text-[64px]">
                  {{ formatCurrency(stats.total_pendapatan || user?.saldo_aktif || 0) }}
                </div>

                <div class="mt-5 flex flex-wrap items-center gap-3">
                  <div class="inline-flex items-center gap-1 rounded-full border border-[rgba(0,212,146,0.3)] bg-[rgba(0,188,125,0.2)] px-3 py-1.5 text-sm font-bold text-[#5ee9b5]">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span>+18.4%</span>
                  </div>
                  <span class="text-sm font-bold text-[#bedbff]">vs bulan lalu</span>
                </div>
              </div>

              <div class="flex items-end justify-between gap-4 lg:w-[300px]">
                <div class="inline-flex rounded-2xl border border-[rgba(49,65,88,0.5)] bg-[rgba(15,23,43,0.4)] p-1 shadow-[4px_4px_0px_#020617]">
                  <button class="rounded-[14px] border border-[#314158] bg-[#1d293d] px-5 py-2 text-base font-bold text-[#51a2ff]">
                    Bulan
                  </button>
                  <button class="px-5 py-2 text-base font-bold text-[#cad5e2]">Tahun</button>
                </div>

                <img
                  :src="WizardMascot"
                  alt="Wizard Mascot"
                  class="h-[200px] w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.4)] md:h-[220px]"
                />
              </div>
            </div>
          </section>

          <section>
            <div class="mb-6 flex items-center gap-3">
              <span class="text-xl text-[#ffb900]">🔥</span>
              <h2 class="text-[24px] font-bold text-slate-100">Fitur Unggulan</h2>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div class="relative overflow-hidden rounded-[32px] border border-[#1c398e] bg-[rgba(28,57,142,0.2)] px-8 py-8 shadow-[6px_6px_0px_#020617]">
                <div class="absolute inset-0 bg-[linear-gradient(145deg,#131f3f,#0f172b)] opacity-90" />
                <div class="absolute inset-0 opacity-[0.03]">
                  <svg viewBox="0 0 100 100" class="h-full w-full text-[#51a2ff] fill-current">
                    <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                  </svg>
                </div>

                <div class="relative">
                  <div class="flex items-start justify-between">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2b7fff] bg-[#155dfc] shadow-[2px_2px_0px_#1e3a8a]">
                      <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div class="rounded-full border border-[rgba(0,153,102,0.5)] bg-[rgba(0,79,59,0.4)] px-4 py-1.5 text-sm font-bold text-[#00d492]">
                      Aktif
                    </div>
                  </div>

                  <h3 class="mt-8 text-[24px] font-bold text-slate-100">My Page</h3>
                  <p class="mt-1 text-base font-bold text-[#51a2ff]">Link in Bio</p>
                  <p class="mt-2 text-sm font-medium text-[#90a1b9]">Halaman profil & terima donasi</p>

                  <div class="mt-8 flex gap-3">
                    <div class="flex min-h-[60px] flex-1 items-center justify-between rounded-2xl border border-[#314158] bg-[#0f172b] px-4 shadow-[2px_2px_0px_#020617]">
                      <span class="truncate text-sm font-bold text-[#cad5e2]">
                        komunitip.id/{{ user?.username || 'username' }}
                      </span>
                      <button class="text-[#62748e] transition hover:text-white" @click="copyLink">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <button class="flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-[#314158] bg-[#0f172b] text-[#cad5e2] shadow-[2px_2px_0px_#020617]">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="relative overflow-hidden rounded-[32px] border border-[#651f9d] bg-[linear-gradient(145deg,#2a1149,#17112b)] px-8 py-8 shadow-[6px_6px_0px_#020617]">
                <div class="absolute inset-0 opacity-[0.06]">
                  <svg viewBox="0 0 100 100" class="h-full w-full text-[#a855f7] fill-current">
                    <text x="42%" y="68%" font-size="80">$</text>
                  </svg>
                </div>

                <div class="relative">
                  <div class="flex items-start justify-between">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(168,85,247,0.5)] bg-[rgba(147,51,234,0.3)] shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                      <svg class="h-6 w-6 text-[#e9d5ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
                      </svg>
                    </div>
                    <div class="rounded-full border border-[#7e22ce] bg-[rgba(126,34,206,0.25)] px-4 py-1.5 text-sm font-bold text-[#d8b4fe]">
                      Baru
                    </div>
                  </div>

                  <h3 class="mt-8 text-[24px] font-bold text-slate-100">Overlay Stream</h3>
                  <p class="mt-1 text-base font-bold text-[#d8b4fe]">Live Interaction</p>
                  <p class="mt-2 text-sm font-medium text-[#90a1b9]">Alert & widget OBS / Streamlabs</p>

                  <button
                    class="mt-8 inline-flex h-[56px] w-full items-center justify-center rounded-2xl border border-[#d8b4fe] bg-[linear-gradient(90deg,#9333ea,#c026d3)] text-lg font-bold text-white shadow-[4px_4px_0px_rgba(88,28,135,0.9)] transition hover:scale-[1.01]"
                    @click="handleGoToOverlay"
                  >
                    Buka Pengaturan
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div class="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 class="text-[24px] font-bold text-slate-100">Riwayat Dukungan</h2>
                <p class="mt-1 text-sm font-medium text-[#90a1b9]">Aktivitas terbaru dari donasi sukses, pending, dan moderasi AI.</p>
              </div>
              <div class="flex flex-wrap gap-2 justify-end">
                <button
                  v-for="tab in donationFeedTabs"
                  :key="tab.id"
                  type="button"
                  @click="activeFeed = tab.id"
                  class="rounded-full border px-4 py-2 text-[12px] font-bold transition-all"
                  :class="activeFeed === tab.id
                    ? 'border-[#51a2ff] bg-[#155dfc]/20 text-white'
                    : 'border-[#314158] bg-[#0f172b] text-[#8ca0c7] hover:text-white'"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <div class="rounded-[32px] border border-[#314158] bg-[#0f172b] p-4 shadow-[6px_6px_0px_#020617]">
              <div v-if="loading" class="space-y-1">
                <div v-for="i in 3" :key="i" class="animate-pulse rounded-3xl px-4 py-5">
                  <div class="flex items-center gap-4">
                    <div class="h-12 w-12 rounded-2xl bg-[#1c263e]"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-4 w-56 rounded bg-[#1c263e]"></div>
                      <div class="h-3 w-72 rounded bg-[#1c263e]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="filteredDonations.length === 0" class="rounded-3xl px-6 py-10 text-center">
                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1c263e] text-[#62748e]">
                  <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4M8 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 class="mt-4 text-lg font-bold text-slate-100">Belum ada data pada filter ini</h3>
                <p class="mt-2 text-sm text-[#7a8ba8]">Coba ganti filter atau lakukan donasi uji untuk memperlihatkan alur yang ingin Anda demokan.</p>
              </div>

              <div v-else class="flex flex-col">
                <template v-for="(donation, index) in filteredDonations" :key="donation.id">
                  <div class="rounded-3xl px-4 py-5 transition hover:bg-[#121a2e]">
                    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div class="flex min-w-0 items-start gap-4">
                        <div
                          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[18px] font-bold text-white shadow-[2px_2px_0px_#0f172a]"
                          :style="{ backgroundColor: getAvatarColor(donation.nama_donatur) }"
                        >
                          {{ getInitials(donation.nama_donatur) }}
                        </div>

                        <div class="min-w-0">
                          <div class="flex flex-wrap items-center gap-2">
                            <span class="text-[18px] font-bold text-slate-100">{{ donation.nama_donatur }}</span>
                            <span class="text-sm font-bold text-[#62748e]">{{ donation.email_donatur || '' }}</span>
                            <span
                              class="rounded-[8px] px-2 py-1 text-[13px] font-bold"
                              :class="['BLOCK', 'HOLD'].includes(donation.ai_status)
                                ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                                : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'"
                            >
                              {{ ['BLOCK', 'HOLD'].includes(donation.ai_status) ? (donation.ai_status === 'HOLD' ? 'Ditahan' : 'Difilter') : `+${formatCurrency(donation.jumlah)}` }}
                            </span>
                          </div>

                          <div class="mt-2 text-base font-bold text-[#90a1b9]">
                            {{ ['BLOCK', 'HOLD'].includes(donation.ai_status) ? (donation.ai_reason || donation.pesan || 'Pesan ditahan oleh AI') : (donation.pesan || 'Tidak ada pesan') }}
                          </div>
                        </div>
                      </div>

                      <div class="flex shrink-0 flex-col items-start gap-2 md:items-end">
                        <span class="text-xs font-bold text-[#62748e]">{{ timeAgo(donation.createdAt) }}</span>

                        <div
                          v-if="donation.status === 'SUCCESS'"
                          class="inline-flex items-center gap-1 rounded-[10px] border border-[rgba(0,153,102,0.5)] bg-[rgba(0,79,59,0.3)] px-3 py-1 text-[12px] font-bold text-[#00d492]"
                        >
                          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Aman</span>
                        </div>

                        <div
                          v-else-if="donation.ai_status === 'BLOCK' || donation.ai_status === 'HOLD'"
                          class="inline-flex items-center gap-1 rounded-[10px] border border-[rgba(236,0,63,0.5)] bg-[rgba(139,8,54,0.3)] px-3 py-1 text-[12px] font-bold text-[#ff637e]"
                        >
                          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
                          </svg>
                          <span>{{ donation.ai_status === 'HOLD' ? 'Ditahan' : 'Difilter' }}</span>
                        </div>

                        <div
                          v-else-if="donation.status === 'PENDING'"
                          class="inline-flex items-center gap-1 rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[12px] font-bold text-amber-300"
                        >
                          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="index !== filteredDonations.length - 1" class="h-px bg-[#1d293d]" />
                </template>
              </div>
            </div>
          </section>

          <section class="space-y-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="text-[22px] font-bold text-slate-100">Alat Operasional</h2>
                <p class="mt-1 text-sm font-medium text-[#90a1b9]">
                  Section ini tetap mempertahankan fitur wallet, withdraw, dan moderasi untuk kebutuhan operasional.
                </p>
              </div>
            </div>

            <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div class="rounded-[32px] border border-[#314158] bg-[#0f172b] p-6 shadow-[6px_6px_0px_#020617]">
                <div class="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-xl font-bold text-slate-100">Ringkasan Moderasi AI</h3>
                    <p class="mt-1 text-sm text-[#90a1b9]">Performa filter AI terhadap pesan donasi yang masuk.</p>
                  </div>
                  <div class="rounded-full border border-[rgba(0,153,102,0.5)] bg-[rgba(0,79,59,0.3)] px-3 py-1 text-[12px] font-bold text-[#00d492]">
                    Aktif
                  </div>
                </div>

                <div class="grid gap-4 md:grid-cols-3">
                  <div class="rounded-2xl border border-[#1f2b45] bg-[#0d1323] p-4">
                    <div class="mb-2 text-[12px] uppercase tracking-[0.18em] text-[#6e83aa]">Donasi Sukses</div>
                    <div class="text-2xl font-black text-white">{{ stats.total_donasi_sukses }}</div>
                    <div class="mt-2 text-[13px] text-emerald-400">Lolos moderasi dan selesai dibayar</div>
                  </div>

                  <div class="rounded-2xl border border-[#3a2614] bg-[#1a1208] p-4">
                    <div class="mb-2 text-[12px] uppercase tracking-[0.18em] text-[#caa97f]">Menunggu Bayar</div>
                    <div class="text-2xl font-black text-white">{{ pendingDonations.length }}</div>
                    <div class="mt-2 text-[13px] text-amber-400">Lolos AI, menunggu pembayaran</div>
                  </div>

                  <div class="rounded-2xl border border-[#3c1624] bg-[#1d0d14] p-4">
                    <div class="mb-2 text-[12px] uppercase tracking-[0.18em] text-[#d8a2b1]">Diblokir AI</div>
                    <div class="text-2xl font-black text-white">{{ stats.total_diblokir_ai }}</div>
                    <div class="mt-2 text-[13px] text-rose-400">Tertahan sebelum masuk payment gateway</div>
                  </div>
                </div>
              </div>

              <div class="rounded-[32px] border border-[#314158] bg-[#0f172b] p-6 shadow-[6px_6px_0px_#020617]">
                <div class="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-xl font-bold text-slate-100">Log Moderasi</h3>
                    <p class="mt-1 text-sm text-[#90a1b9]">Percobaan donasi yang diblokir.</p>
                  </div>
                  <div class="text-[12px] font-bold text-rose-300">{{ blockedDonations.length }} item</div>
                </div>

                <div v-if="blockedDonations.length === 0" class="rounded-2xl border border-[#1f2b45] bg-[#0d1323] p-5 text-sm text-[#7a8ba8]">
                  Belum ada pesan yang diblokir AI. Trigger satu contoh dari form donasi jika ingin mendemokan moderasi.
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="donation in blockedDonations.slice(0, 3)"
                    :key="donation.id"
                    class="rounded-2xl border border-[#3c1624] bg-[#1d0d14] p-4"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div class="font-bold text-white">{{ donation.nama_donatur }}</div>
                      <div class="text-[11px] font-medium text-[#c88ca1]">{{ timeAgo(donation.createdAt) }}</div>
                    </div>
                    <div class="mt-2 text-[13px] text-[#e8d7dd]">{{ donation.pesan || 'Tidak ada pesan' }}</div>
                    <div class="mt-3 inline-flex rounded-full bg-rose-500/10 px-3 py-1 text-[12px] font-semibold text-rose-300">
                      {{ donation.ai_reason || 'Terdeteksi pelanggaran moderasi' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div ref="walletSection" class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div class="rounded-[32px] border border-[#314158] bg-[#0f172b] p-6 shadow-[6px_6px_0px_#020617]">
                <div class="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-xl font-bold text-slate-100">Wallet & Withdraw</h3>
                    <p class="mt-1 text-sm text-[#90a1b9]">Saldo aktif, saldo tertahan, dan request payout.</p>
                  </div>
                  <div class="rounded-full border border-[#1d3d2f] bg-[#0b1f16] px-3 py-1 text-[12px] font-bold text-emerald-300">
                    MVP Siap Demo
                  </div>
                </div>

                <div class="mb-6 grid gap-4 md:grid-cols-2">
                  <div class="rounded-2xl border border-[#1f2b45] bg-[#0d1323] p-5">
                    <div class="mb-2 text-[12px] uppercase tracking-[0.18em] text-[#6e83aa]">Saldo Aktif</div>
                    <div class="text-2xl font-black text-white">{{ formatCurrency(availableBalance) }}</div>
                    <div class="mt-2 text-[13px] text-emerald-400">Siap diajukan untuk withdraw</div>
                  </div>

                  <div class="rounded-2xl border border-[#3a2614] bg-[#1a1208] p-5">
                    <div class="mb-2 text-[12px] uppercase tracking-[0.18em] text-[#caa97f]">Saldo Tertahan</div>
                    <div class="text-2xl font-black text-white">{{ formatCurrency(heldBalance) }}</div>
                    <div class="mt-2 text-[13px] text-amber-400">Sedang menunggu proses payout</div>
                  </div>
                </div>

                <div class="rounded-2xl border border-[#1f2b45] bg-[#0d1323] p-5">
                  <div class="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h4 class="text-lg font-bold text-white">Ajukan Withdraw Baru</h4>
                      <p class="mt-1 text-[13px] text-[#7a8ba8]">Minimum withdraw Rp50.000. Request akan dipindahkan ke saldo tertahan.</p>
                    </div>
                    <div class="rounded-full bg-blue-500/10 px-3 py-1 text-[12px] font-semibold text-blue-300">Manual Review</div>
                  </div>

                  <div v-if="withdrawalError" class="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {{ withdrawalError }}
                  </div>

                  <div v-if="withdrawalSuccess" class="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {{ withdrawalSuccess }}
                  </div>

                  <form class="space-y-4" @submit.prevent="submitWithdrawal">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label class="block">
                        <span class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6e83aa]">Nominal</span>
                        <input
                          v-model.number="withdrawalForm.amount"
                          type="number"
                          min="50000"
                          step="1000"
                          class="w-full rounded-2xl border border-[#24314b] bg-[#111a2b] px-4 py-3 text-white outline-none transition focus:border-blue-400"
                        />
                      </label>

                      <label class="block">
                        <span class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6e83aa]">Bank / E-Wallet</span>
                        <input
                          v-model.trim="withdrawalForm.bank_name"
                          type="text"
                          placeholder="BCA / BNI / OVO"
                          class="w-full rounded-2xl border border-[#24314b] bg-[#111a2b] px-4 py-3 text-white outline-none transition focus:border-blue-400"
                        />
                      </label>
                    </div>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label class="block">
                        <span class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6e83aa]">Nama Pemilik</span>
                        <input
                          v-model.trim="withdrawalForm.account_name"
                          type="text"
                          class="w-full rounded-2xl border border-[#24314b] bg-[#111a2b] px-4 py-3 text-white outline-none transition focus:border-blue-400"
                        />
                      </label>

                      <label class="block">
                        <span class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6e83aa]">Nomor Rekening</span>
                        <input
                          v-model.trim="withdrawalForm.account_number"
                          type="text"
                          class="w-full rounded-2xl border border-[#24314b] bg-[#111a2b] px-4 py-3 text-white outline-none transition focus:border-blue-400"
                        />
                      </label>
                    </div>

                    <label class="block">
                      <span class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6e83aa]">Catatan</span>
                      <textarea
                        v-model.trim="withdrawalForm.notes"
                        rows="3"
                        placeholder="Opsional, misalnya payout mingguan"
                        class="w-full rounded-2xl border border-[#24314b] bg-[#111a2b] px-4 py-3 text-white outline-none transition focus:border-blue-400"
                      ></textarea>
                    </label>

                    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div class="text-[13px] text-[#7a8ba8]">
                        Setelah request dibuat, saldo aktif akan dipindahkan ke saldo tertahan sampai diproses.
                      </div>
                      <button
                        type="submit"
                        :disabled="!canSubmitWithdrawal"
                        class="rounded-2xl px-5 py-3 text-sm font-bold text-white transition"
                        :class="canSubmitWithdrawal ? 'bg-blue-600 hover:bg-blue-500' : 'cursor-not-allowed bg-slate-700 text-slate-300'"
                      >
                        {{ withdrawalSubmitting ? 'Mengirim...' : 'Ajukan Withdraw' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div class="rounded-[32px] border border-[#314158] bg-[#0f172b] p-6 shadow-[6px_6px_0px_#020617]">
                <div class="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-xl font-bold text-slate-100">Riwayat Withdraw</h3>
                    <p class="mt-1 text-sm text-[#90a1b9]">Request payout terbaru beserta status prosesnya.</p>
                  </div>
                  <div class="text-[12px] font-bold text-blue-300">{{ withdrawals.length }} request</div>
                </div>

                <div v-if="withdrawalLoading" class="space-y-3">
                  <div v-for="i in 3" :key="i" class="animate-pulse rounded-2xl border border-[#1f2b45] bg-[#0d1323] p-4">
                    <div class="mb-3 h-4 w-32 rounded bg-[#1c263e]"></div>
                    <div class="h-3 w-full rounded bg-[#1c263e]"></div>
                  </div>
                </div>

                <div v-else-if="withdrawals.length === 0" class="rounded-2xl border border-[#1f2b45] bg-[#0d1323] p-5 text-sm text-[#7a8ba8]">
                  Belum ada request withdraw. Buat satu request agar client bisa melihat alur payout dari sisi streamer.
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="withdrawal in withdrawals"
                    :key="withdrawal.id"
                    class="rounded-2xl border border-[#1f2b45] bg-[#0d1323] p-4"
                  >
                    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div class="flex items-center gap-2">
                          <div class="text-lg font-bold text-white">{{ formatCurrency(withdrawal.amount) }}</div>
                          <div
                            class="rounded-full px-3 py-1 text-[11px] font-bold"
                            :class="withdrawal.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-300'
                              : withdrawal.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : withdrawal.status === 'FAILED'
                                  ? 'bg-rose-500/10 text-rose-300'
                                  : 'bg-slate-500/10 text-slate-300'"
                          >
                            {{ formatWithdrawalStatus(withdrawal.status) }}
                          </div>
                        </div>
                        <div class="mt-2 text-[13px] text-[#c4d0e7]">
                          {{ withdrawal.bank_name }} • {{ maskAccountNumber(withdrawal.account_number) }} • {{ withdrawal.account_name }}
                        </div>
                        <div class="mt-1 text-[12px] text-[#7a8ba8]">Diajukan {{ timeAgo(withdrawal.createdAt) }}</div>
                        <div v-if="withdrawal.notes" class="mt-3 text-[13px] text-[#8fa3c6]">{{ withdrawal.notes }}</div>
                        <div v-if="withdrawal.failure_reason" class="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-200">
                          {{ withdrawal.failure_reason }}
                        </div>
                      </div>

                      <button
                        v-if="withdrawal.status === 'PENDING'"
                        type="button"
                        @click="cancelWithdrawal(withdrawal.id)"
                        :disabled="withdrawalCancelingId === withdrawal.id"
                        class="rounded-2xl border border-[#3a2614] bg-[#1a1208] px-4 py-2 text-[12px] font-bold text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
                      >
                        {{ withdrawalCancelingId === withdrawal.id ? 'Membatalkan...' : 'Batalkan' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
