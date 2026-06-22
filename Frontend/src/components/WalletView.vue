<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import api from '../services/api'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import WalletMascot from '../assets/Image_(Mascot Register).png'
import ProfileImage from '../assets/Image_(Profile).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const router = useRouter()
const { user, logout, fetchMyProfile } = useAuth()

const loading = ref(true)
const donations = ref([])
const withdrawals = ref([])
const walletError = ref('')
const walletNotice = ref('')
const withdrawalSubmitting = ref(false)
const showWithdrawalForm = ref(false)
const transactionFilter = ref('all')
const balance = ref({
  saldo_aktif: 0,
  saldo_tertahan: 0,
})
const withdrawalForm = ref({
  amount: 50000,
  bank_name: '',
  account_name: '',
  account_number: '',
  notes: '',
})

const creatorName = computed(() => user.value?.nama_lengkap?.split(' ')[0] || user.value?.username || 'Kreator')
const creatorTier = computed(() => user.value?.role === 'ADMIN' ? 'Admin' : 'Kreator')
const availableBalance = computed(() => Number(balance.value.saldo_aktif || user.value?.saldo_aktif || 0))
const heldBalance = computed(() => Number(balance.value.saldo_tertahan || user.value?.saldo_tertahan || 0))
const pageLink = computed(() => (user.value?.username ? `${window.location.origin}/${user.value.username}` : window.location.origin))
const currentMonthLabel = computed(() =>
  new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date()),
)

const formatCurrency = (amount) =>
  `Rp ${Number(amount || 0).toLocaleString('id-ID')}`

const formatDate = (dateValue) => {
  if (!dateValue) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}

const formatDonationStatus = (status) => {
  if (status === 'SUCCESS') return 'Selesai'
  if (status === 'PENDING') return 'Pending'
  if (status === 'FAILED') return 'Gagal'
  return status || '-'
}

const formatWithdrawalStatus = (status) => {
  if (status === 'PENDING') return 'Proses'
  if (status === 'PROCESSING') return 'Proses'
  if (status === 'SUCCESS') return 'Selesai'
  if (status === 'FAILED') return 'Gagal'
  if (status === 'CANCELLED') return 'Batal'
  return status || '-'
}

const transactionItems = computed(() => {
  const donationItems = donations.value
    .map((donation) => ({
      id: `donation-${donation.id}`,
      type: 'donation',
      title: `Tip dari ${donation.nama_donatur || 'Supporter'}`,
      date: donation.paid_at || donation.createdAt,
      amount: Number(donation.jumlah || 0),
      status: formatDonationStatus(donation.status),
      rawStatus: donation.status,
      direction: 'in',
    }))

  const withdrawalItems = withdrawals.value.map((withdrawal) => ({
    id: `withdrawal-${withdrawal.id}`,
    type: 'withdrawal',
    title: `Penarikan ke ${withdrawal.bank_name}`,
    date: withdrawal.processed_at || withdrawal.cancelled_at || withdrawal.createdAt,
    amount: Number(withdrawal.amount || 0),
    status: formatWithdrawalStatus(withdrawal.status),
    rawStatus: withdrawal.status,
    direction: 'out',
  }))

  return [...donationItems, ...withdrawalItems]
    .filter((item) => transactionFilter.value === 'all' || item.type === transactionFilter.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)
})

const canSubmitWithdrawal = computed(
  () =>
    availableBalance.value >= 50000 &&
    withdrawalForm.value.amount >= 50000 &&
    withdrawalForm.value.bank_name.trim().length > 0 &&
    withdrawalForm.value.account_name.trim().length > 0 &&
    withdrawalForm.value.account_number.trim().length > 0 &&
    !withdrawalSubmitting.value,
)

const resetWithdrawalForm = () => {
  withdrawalForm.value = {
    amount: 50000,
    bank_name: '',
    account_name: user.value?.nama_lengkap || '',
    account_number: '',
    notes: '',
  }
}

const fetchDonations = async () => {
  const { data } = await api.get('/donation/my')
  donations.value = data.data.donations || []
}

const fetchWithdrawals = async () => {
  const { data } = await api.get('/withdrawals/my')
  const payload = data.data
  withdrawals.value = payload.withdrawals || []
  balance.value = payload.balance || balance.value
}

const loadWallet = async () => {
  loading.value = true
  walletError.value = ''

  try {
    await fetchMyProfile()
    await Promise.all([fetchDonations(), fetchWithdrawals()])
    resetWithdrawalForm()
  } catch (error) {
    walletError.value = error.message || 'Gagal memuat data wallet.'
  } finally {
    loading.value = false
  }
}

const submitWithdrawal = async () => {
  walletError.value = ''
  walletNotice.value = ''
  withdrawalSubmitting.value = true

  try {
    const { data } = await api.post('/withdrawals/my', {
      amount: Number(withdrawalForm.value.amount),
      bank_name: withdrawalForm.value.bank_name,
      account_name: withdrawalForm.value.account_name,
      account_number: withdrawalForm.value.account_number,
      notes: withdrawalForm.value.notes || undefined,
    })

    walletNotice.value = `Request penarikan ${formatCurrency(data.data.withdrawal.amount)} berhasil dibuat.`
    showWithdrawalForm.value = false
    await Promise.all([fetchMyProfile(), fetchWithdrawals()])
    resetWithdrawalForm()
  } catch (error) {
    walletError.value = error.message || 'Gagal membuat request penarikan.'
  } finally {
    withdrawalSubmitting.value = false
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(pageLink.value)
    walletNotice.value = 'Link halaman kreator berhasil disalin.'
  } catch (error) {
    walletError.value = error.message || 'Gagal menyalin link halaman kreator.'
  }
}

const handleLogout = () => {
  logout()
  router.push('/login')
}

onMounted(loadWallet)
</script>

<template>
  <div class="relative flex min-h-screen w-full overflow-hidden bg-[#0b1121] text-white">
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

    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-45">
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

        <button
          class="mb-8 flex w-full items-center gap-4 rounded-3xl border border-[#314158] bg-[#1d293d] px-4 py-4 text-left shadow-[4px_4px_0px_#020617]"
          type="button"
          @click="router.push('/settings')"
        >
          <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#45556c] bg-[#0f172b]">
            <img :src="ProfileImage" alt="Profile" class="h-10 w-10 object-cover" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-base font-bold text-slate-100">{{ creatorName }}</p>
            <p class="text-xs font-bold text-[#51a2ff]">{{ creatorTier }}</p>
          </div>
        </button>

        <div class="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#62748e]">Menu Utama</div>

        <nav class="space-y-2">
          <button
            class="flex h-[55px] w-full items-center gap-3 rounded-2xl px-4 text-left text-slate-400 transition hover:bg-[#1a2337] hover:text-white"
            type="button"
            @click="router.push('/dashboard')"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span class="text-sm font-bold">Dashboard</span>
          </button>

          <button
            class="flex h-[55px] w-full items-center gap-3 rounded-2xl px-4 text-left text-slate-400 transition hover:bg-[#1a2337] hover:text-white"
            type="button"
            @click="router.push('/overlay')"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.24 7.76a6 6 0 0 1 0 8.49m2.83-11.32a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49m-2.83 11.32a10 10 0 0 1 0-14.14" />
            </svg>
            <span class="text-sm font-bold">Overlay</span>
          </button>

          <button
            class="flex h-[55px] w-full items-center gap-3 rounded-2xl border border-[#51a2ff] bg-[#155dfc] px-4 text-left text-white shadow-[4px_4px_0px_0px_#1e3a8a]"
            type="button"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span class="text-sm font-bold">Wallet</span>
          </button>

          <button
            class="flex h-[55px] w-full items-center gap-3 rounded-2xl px-4 text-left text-slate-400 transition hover:bg-[#1a2337] hover:text-white"
            type="button"
            @click="router.push('/settings')"
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
          type="button"
          @click="handleLogout"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7m0 0a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-sm font-bold">Keluar</span>
        </button>
      </div>
    </aside>

    <main class="relative z-10 h-screen flex-1 overflow-y-auto scrollbar-hide">
      <div class="mx-auto max-w-[960px] px-5 py-6 sm:px-8 xl:max-w-none xl:px-0">
        <header class="mb-7 flex flex-col gap-5 xl:px-10 xl:pt-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 class="text-[30px] font-bold tracking-[-0.03em] text-slate-100">Halo, {{ creatorName }}!</h1>
            <p class="mt-1 text-base font-medium text-[#90a1b9]">Siap untuk stream hari ini?</p>
          </div>

          <div class="flex items-center gap-3 self-start">
            <button
              class="flex h-[51px] items-center gap-2 rounded-2xl border border-[#314158] bg-[#0f172b] px-5 text-sm font-bold text-[#cad5e2] shadow-[4px_4px_0px_#020617] transition hover:border-[#45556c]"
              type="button"
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
        </header>

        <section class="xl:px-10">
          <div class="mb-8">
            <div class="mb-2 flex items-center gap-3">
              <svg class="h-8 w-8 text-[#51a2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7H5a2 2 0 00-2 2v7a3 3 0 003 3h14a1 1 0 001-1V8a1 1 0 00-1-1zM16 12h.01M5 7V6a2 2 0 012-2h11" />
              </svg>
              <h2 class="text-4xl font-bold leading-10 text-slate-100">Dompetku</h2>
            </div>
            <p class="text-base font-medium text-[#90a1b9]">Kelola saldo, penarikan, dan pantau riwayat transaksimu.</p>
          </div>

          <div v-if="walletError" class="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {{ walletError }}
          </div>

          <div v-if="walletNotice" class="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
            {{ walletNotice }}
          </div>

          <div v-if="loading" class="rounded-[40px] border border-[#314158] bg-[#0f172b] p-10 text-center shadow-[6px_6px_0px_#020617]">
            <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#314158] border-t-[#51a2ff]" />
            <p class="mt-4 text-sm font-medium text-[#90a1b9]">Memuat wallet...</p>
          </div>

          <template v-else>
            <div class="relative mb-7 overflow-hidden rounded-[40px] border border-[#2b7fff] bg-gradient-to-br from-[#1447e6] to-[#312c85] p-8 shadow-[6px_6px_0px_#020617] md:p-10">
              <div class="absolute -right-10 -top-24 h-72 w-72 rounded-full bg-[#2b7fff33] blur-[60px]" />
              <img :src="WalletMascot" alt="" class="pointer-events-none absolute -right-4 -top-14 hidden h-64 w-64 object-contain md:block" />

              <div class="relative grid gap-8 md:grid-cols-[1fr_190px] md:items-center">
                <div>
                  <div class="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.08em] text-[#bedbff]">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7H5a2 2 0 00-2 2v7a3 3 0 003 3h14a1 1 0 001-1V8a1 1 0 00-1-1zM16 12h.01M5 7V6a2 2 0 012-2h11" />
                    </svg>
                    <span>Saldo Tersedia</span>
                  </div>
                  <div class="mt-4 text-[42px] font-bold leading-none tracking-[-0.05em] text-slate-100 drop-shadow sm:text-[60px]">
                    {{ formatCurrency(availableBalance) }}
                  </div>
                  <div class="mt-4 text-sm font-bold text-[#bedbffcc]">Saldo tertahan: {{ formatCurrency(heldBalance) }}</div>
                </div>

                <div class="flex flex-col items-start md:items-end">
                  <button
                    type="button"
                    class="inline-flex h-16 items-center gap-3 rounded-2xl border border-[#5ee9b5] bg-[#00bc7d] px-8 text-lg font-bold text-white shadow-[4px_4px_0px_#064e3b] transition hover:bg-[#00a66f]"
                    @click="showWithdrawalForm = !showWithdrawalForm"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17 17 7m0 0H8m9 0v9" />
                    </svg>
                    <span>Tarik Dana</span>
                  </button>
                  <p class="mt-3 text-sm font-bold text-[#bedbffcc]">Min. penarikan Rp 50.000</p>
                </div>
              </div>
            </div>

            <div v-if="showWithdrawalForm" class="mb-7 rounded-[32px] border border-[#314158] bg-[#0f172b] p-6 shadow-[6px_6px_0px_#020617]">
              <div class="mb-5">
                <h3 class="text-2xl font-bold text-slate-100">Ajukan Penarikan</h3>
                <p class="mt-1 text-sm text-[#90a1b9]">Request akan dipindahkan ke saldo tertahan sampai diproses.</p>
              </div>

              <form class="grid gap-4" @submit.prevent="submitWithdrawal">
                <div class="grid gap-4 md:grid-cols-2">
                  <label class="block">
                    <span class="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#62748e]">Nominal</span>
                    <input
                      v-model.number="withdrawalForm.amount"
                      type="number"
                      min="50000"
                      step="1000"
                      class="h-12 w-full rounded-2xl border border-[#314158] bg-[#1d293d] px-4 text-white outline-none transition focus:border-[#51a2ff]"
                    />
                  </label>

                  <label class="block">
                    <span class="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#62748e]">Bank / E-Wallet</span>
                    <input
                      v-model.trim="withdrawalForm.bank_name"
                      type="text"
                      placeholder="BCA / BNI / OVO / GoPay"
                      class="h-12 w-full rounded-2xl border border-[#314158] bg-[#1d293d] px-4 text-white outline-none transition placeholder:text-[#62748e] focus:border-[#51a2ff]"
                    />
                  </label>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="block">
                    <span class="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#62748e]">Nama Pemilik</span>
                    <input
                      v-model.trim="withdrawalForm.account_name"
                      type="text"
                      class="h-12 w-full rounded-2xl border border-[#314158] bg-[#1d293d] px-4 text-white outline-none transition focus:border-[#51a2ff]"
                    />
                  </label>

                  <label class="block">
                    <span class="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#62748e]">Nomor Rekening / E-Wallet</span>
                    <input
                      v-model.trim="withdrawalForm.account_number"
                      type="text"
                      class="h-12 w-full rounded-2xl border border-[#314158] bg-[#1d293d] px-4 text-white outline-none transition focus:border-[#51a2ff]"
                    />
                  </label>
                </div>

                <label class="block">
                  <span class="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#62748e]">Catatan</span>
                  <textarea
                    v-model.trim="withdrawalForm.notes"
                    rows="3"
                    placeholder="Opsional"
                    class="w-full rounded-2xl border border-[#314158] bg-[#1d293d] px-4 py-3 text-white outline-none transition placeholder:text-[#62748e] focus:border-[#51a2ff]"
                  />
                </label>

                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p class="text-sm text-[#90a1b9]">Saldo aktif harus cukup dan nominal minimal Rp 50.000.</p>
                  <button
                    type="submit"
                    :disabled="!canSubmitWithdrawal"
                    class="inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-bold text-white transition"
                    :class="canSubmitWithdrawal ? 'border border-[#5ee9b5] bg-[#00bc7d] shadow-[3px_3px_0px_#064e3b] hover:bg-[#00a66f]' : 'cursor-not-allowed bg-slate-700 text-slate-300'"
                  >
                    {{ withdrawalSubmitting ? 'Mengirim...' : 'Ajukan Penarikan' }}
                  </button>
                </div>
              </form>
            </div>

            <div class="rounded-[32px] border border-[#314158] bg-[#0f172b] p-6 shadow-[6px_6px_0px_#020617] md:p-8">
              <div class="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="flex items-center gap-3">
                  <svg class="h-6 w-6 text-[#51a2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 class="text-2xl font-bold text-slate-100">Riwayat Transaksi</h3>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    v-model="transactionFilter"
                    class="h-12 rounded-2xl border border-[#314158] bg-[#1d293d] px-4 text-sm font-bold text-[#bedbffcc] shadow-[2px_2px_0px_#020617] outline-none transition focus:border-[#51a2ff]"
                  >
                    <option value="all">Semua Transaksi</option>
                    <option value="donation">Riwayat Dukungan</option>
                    <option value="withdrawal">Penarikan Dana</option>
                  </select>

                  <button
                    class="inline-flex h-12 items-center justify-center rounded-2xl border border-[#314158] bg-[#1d293d] px-5 text-sm font-bold text-[#bedbffcc] shadow-[2px_2px_0px_#020617]"
                    type="button"
                  >
                    {{ currentMonthLabel }}
                  </button>
                </div>
              </div>

              <div v-if="transactionItems.length === 0" class="rounded-2xl border border-[#1d293d] bg-[rgba(29,41,61,0.5)] p-5 text-sm text-[#90a1b9]">
                Belum ada transaksi untuk filter ini.
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="item in transactionItems"
                  :key="item.id"
                  class="flex items-center justify-between gap-4 rounded-2xl border border-[#1d293d] bg-[rgba(29,41,61,0.5)] px-4 py-4"
                >
                  <div class="flex min-w-0 items-center gap-4">
                    <div
                      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                      :class="item.direction === 'out'
                        ? 'bg-[rgba(139,8,54,0.3)] text-[#ff637e]'
                        : item.rawStatus === 'FAILED'
                          ? 'bg-[rgba(139,8,54,0.3)] text-[#ff637e]'
                          : item.rawStatus === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-[rgba(0,79,59,0.3)] text-[#00d492]'"
                    >
                      <svg v-if="item.direction === 'out'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17 17 7m0 0H8m9 0v9" />
                      </svg>
                      <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 7 7 17m0 0h9M7 17V8" />
                      </svg>
                    </div>

                    <div class="min-w-0">
                      <p class="truncate text-base font-bold text-[#e2e8f0]">{{ item.title }}</p>
                      <p class="mt-1 text-sm font-medium text-[#62748e]">{{ formatDate(item.date) }}</p>
                    </div>
                  </div>

                  <div class="shrink-0 text-right">
                    <p
                      class="text-lg font-bold"
                      :class="item.direction === 'out' || item.rawStatus === 'FAILED' ? 'text-[#ff637e]' : item.rawStatus === 'PENDING' ? 'text-amber-300' : 'text-[#00d492]'"
                    >
                      {{ item.direction === 'out' ? '-' : '+' }}{{ formatCurrency(item.amount) }}
                    </p>
                    <div
                      class="mt-1 inline-flex rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em]"
                      :class="item.rawStatus === 'PENDING' || item.rawStatus === 'PROCESSING'
                        ? 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                        : item.rawStatus === 'FAILED' || item.rawStatus === 'CANCELLED'
                          ? 'border-rose-500/30 bg-rose-500/15 text-rose-300'
                          : 'border-[rgba(0,96,69,0.5)] bg-[rgba(0,79,59,0.3)] text-[#00d492]'"
                    >
                      {{ item.status }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </section>
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
</style>
