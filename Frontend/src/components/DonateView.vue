<script setup>
import { ref, onBeforeUnmount, onMounted, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '../services/api'
import StandingMascot from '../assets/Image_(Cowboy Mascot).png'
import SittingMascot from '../assets/Image_(Sitting Cowboy Mascot).png'
import TopHatMascot from '../assets/Image_(Top Hat Mascot).png'
import GroupPenguins from '../assets/Image_(Group of Penguins).png'
import IconBabi from '../assets/Icon_babi.png'
import IconKucing from '../assets/Icon_kucing.png'
import IconDompet from '../assets/Icon_dompet.png'
import IconCoin from '../assets/Icon_coin.png'
import IconKotak from '../assets/Icon_kotak.png'
import IconAngka1 from '../assets/Icon_angka1.png'
import IconBurung from '../assets/Icon_burung.png'

const route = useRoute()
const username = route.params.username

const streamer = ref(null)
const loading = ref(true)
const notFound = ref(false)
const submitting = ref(false)
const aiBlocked = ref(false)
const blockReason = ref('')
const success = ref(false)
const errorMessage = ref('')
const paymentNotice = ref('')
const paymentSummary = ref(null)
const paymentStatus = ref(null)

const storageKey = `komunitip:last-donation:${username}`
const PAYMENT_POLL_INTERVAL_MS = 3000
const PAYMENT_POLL_TIMEOUT_MS = 60000
let paymentPollingIntervalId = null
let paymentPollingTimeoutId = null

const form = ref({
  nama_donatur: '',
  email_donatur: '',
  pesan: '',
  jumlah: 25000,
})

const formUi = ref({
  anonymous: false,
  hideEmail: false,
  ageConfirmed: false,
  termsConfirmed: false,
})

const presets = [5000, 10000, 25000, 50000, 100000, 200000]

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatCompactRupiah = (amount) => {
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k`
  }
  return `${amount}`
}

const fetchPaymentStatus = async (donationId) => {
  const { data } = await api.get(`/payment/status/${donationId}`)
  paymentStatus.value = data.data
  paymentSummary.value = {
    nama_donatur: data.data.donor_name,
    jumlah: data.data.amount,
  }
  sessionStorage.setItem(storageKey, JSON.stringify(paymentSummary.value))
}

const stopPaymentStatusPolling = () => {
  if (paymentPollingIntervalId) {
    clearInterval(paymentPollingIntervalId)
    paymentPollingIntervalId = null
  }

  if (paymentPollingTimeoutId) {
    clearTimeout(paymentPollingTimeoutId)
    paymentPollingTimeoutId = null
  }
}

const syncPaymentNotice = () => {
  if (paymentStatus.value?.status === 'SUCCESS') {
    paymentNotice.value = 'Pembayaran berhasil diverifikasi. Alert akan dikirim ke overlay streamer.'
    success.value = true
    errorMessage.value = ''
    stopPaymentStatusPolling()
    return
  }

  if (paymentStatus.value?.status === 'PENDING') {
    paymentNotice.value = 'Pembayaran sudah diterima. Sistem sedang menunggu konfirmasi webhook dari payment gateway.'
    success.value = true
    errorMessage.value = ''
    return
  }

  if (paymentStatus.value?.status === 'FAILED') {
    success.value = false
    paymentNotice.value = ''
    errorMessage.value = 'Pembayaran gagal, mismatch, atau sudah kedaluwarsa. Silakan coba lagi.'
    stopPaymentStatusPolling()
  }
}

const startPaymentStatusPolling = (donationId) => {
  stopPaymentStatusPolling()

  paymentPollingIntervalId = window.setInterval(async () => {
    try {
      await fetchPaymentStatus(donationId)
      syncPaymentNotice()
    } catch (error) {
      errorMessage.value = error.message || 'Gagal memeriksa status pembayaran.'
    }
  }, PAYMENT_POLL_INTERVAL_MS)

  paymentPollingTimeoutId = window.setTimeout(() => {
    stopPaymentStatusPolling()

    if (paymentStatus.value?.status === 'PENDING') {
      paymentNotice.value = 'Pembayaran sudah diterima, tetapi verifikasi webhook masih tertunda. Halaman ini bisa di-refresh lagi beberapa saat.'
      success.value = true
    }
  }, PAYMENT_POLL_TIMEOUT_MS)
}

onMounted(async () => {
  try {
    const storedSummary = sessionStorage.getItem(storageKey)
    paymentSummary.value = storedSummary ? JSON.parse(storedSummary) : null
  } catch {
    paymentSummary.value = null
  }

  const donationId = route.query.donation_id

  if (route.query.success === 'true') {
    paymentNotice.value = 'Pembayaran berhasil diterima. Donasi kamu sedang diverifikasi oleh sistem.'
    success.value = true
  } else if (route.query.failed === 'true') {
    errorMessage.value = 'Pembayaran dibatalkan atau gagal diproses. Silakan coba lagi.'
  }

  if (donationId) {
    try {
      await fetchPaymentStatus(donationId)
      syncPaymentNotice()

      if (paymentStatus.value?.status === 'PENDING') {
        startPaymentStatusPolling(donationId)
      }
    } catch (error) {
      errorMessage.value = error.message || 'Gagal memeriksa status pembayaran.'
    }
  }

  try {
    const { data } = await api.get(`/donate/${username}`)
    streamer.value = data.data
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

const submitDonation = async () => {
  submitting.value = true
  aiBlocked.value = false
  errorMessage.value = ''
  success.value = false

  try {
    const { data } = await api.post(`/donate/${username}`, {
      nama_donatur: form.value.nama_donatur,
      email_donatur: form.value.email_donatur || undefined,
      pesan: form.value.pesan || undefined,
      jumlah: form.value.jumlah,
    })

    const checkoutUrl = data.data?.payment?.invoice_url
    if (!checkoutUrl) {
      throw new Error('Checkout pembayaran belum tersedia. Silakan coba lagi.')
    }

    paymentSummary.value = {
      nama_donatur: form.value.nama_donatur,
      jumlah: form.value.jumlah,
    }
    sessionStorage.setItem(storageKey, JSON.stringify(paymentSummary.value))
    window.location.href = checkoutUrl
  } catch (err) {
    if (err.details?.blocked) {
      aiBlocked.value = true
      blockReason.value = err.details.reason || 'Pesan mengandung konten yang tidak diizinkan.'
      return
    }

    errorMessage.value = err.message || 'Gagal menghubungi server. Silakan coba lagi.'
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  stopPaymentStatusPolling()
  form.value = { nama_donatur: '', email_donatur: '', pesan: '', jumlah: 25000 }
  formUi.value = {
    anonymous: false,
    hideEmail: false,
    ageConfirmed: false,
    termsConfirmed: false,
  }
  aiBlocked.value = false
  success.value = false
  errorMessage.value = ''
  paymentNotice.value = ''
  paymentSummary.value = null
  paymentStatus.value = null
  sessionStorage.removeItem(storageKey)
}

const isFormValid = computed(() => {
  return form.value.nama_donatur.trim().length > 0 && form.value.jumlah >= 10000
})

const messageLength = computed(() => form.value.pesan?.length || 0)
const displayName = computed(() => streamer.value?.nama_lengkap || 'Streamer')
const publicUsername = computed(() => streamer.value?.username || username)
const creatorCategory = computed(() => streamer.value?.kategori || 'Gaming & Streaming')
const creatorBio = computed(
  () =>
    streamer.value?.bio ||
    'Halo semua! Welcome to the stream! Dukungan kalian sangat berarti untuk upgrade setup dan bikin konten yang lebih seru lagi.'
)

const creatorSocials = computed(() => {
  const links = []

  if (streamer.value?.instagram) {
    links.push({
      key: 'instagram',
      url: `https://instagram.com/${streamer.value.instagram}`,
      label: 'Instagram',
      icon: 'instagram',
    })
  }

  if (streamer.value?.youtube) {
    links.push({
      key: 'youtube',
      url: streamer.value.youtube,
      label: 'YouTube',
      icon: 'youtube',
    })
  }

  if (streamer.value?.twitter) {
    links.push({
      key: 'twitter',
      url: `https://twitter.com/${streamer.value.twitter}`,
      label: 'Twitter',
      icon: 'twitter',
    })
  }

  return links
})

const presetClass = (preset) =>
  form.value.jumlah === preset
    ? 'border-[#51a2ff] bg-[#155dfc] text-white shadow-[2px_2px_0px_0px_#1e3a8a]'
    : 'border-[#314158] bg-[#1d293d] text-[#cad5e2] shadow-[2px_2px_0px_#020617] hover:border-[#45556c]'

onBeforeUnmount(() => {
  stopPaymentStatusPolling()
})
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-[#0b1121] text-white">
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

    <div class="relative z-10">
      <header class="mx-auto flex max-w-[1152px] items-center justify-between px-6 py-5">
        <RouterLink to="/" class="flex items-center gap-3">
          <img :src="StandingMascot" alt="KomuniTip" class="h-12 w-12 object-contain -scale-x-100 -rotate-2" />
          <span class="text-xl font-bold tracking-tight text-slate-100">KomuniTip</span>
        </RouterLink>

        <div class="flex items-center gap-4">
          <span class="hidden text-sm font-bold text-[#90a1b9] sm:inline">Punya akun?</span>
          <RouterLink
            to="/login"
            class="inline-flex h-[43px] items-center justify-center rounded-2xl border border-[#51a2ff] bg-[#155dfc] px-6 text-base font-bold text-white shadow-[3px_3px_0px_#1e3a8a] transition hover:bg-[#1b64ff]"
          >
            Masuk
          </RouterLink>
        </div>
      </header>

      <main class="mx-auto max-w-[1152px] px-6 pb-14 pt-2">
        <div v-if="loading" class="flex min-h-[60vh] items-center justify-center">
          <div class="rounded-[32px] border border-[#314158] bg-[rgba(15,23,43,0.75)] px-10 py-10 text-center shadow-[8px_8px_0px_0px_#020617]">
            <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#314158] border-t-[#51a2ff]" />
            <p class="mt-4 text-sm font-medium text-[#90a1b9]">Memuat halaman...</p>
          </div>
        </div>

        <div v-else-if="notFound" class="flex min-h-[60vh] items-center justify-center">
          <div class="max-w-xl rounded-[32px] border border-[#314158] bg-[rgba(15,23,43,0.75)] px-10 py-10 text-center shadow-[8px_8px_0px_0px_#020617]">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(255,32,86,0.1)] text-4xl">😔</div>
            <h2 class="mt-6 text-3xl font-bold text-slate-100">Kreator Tidak Ditemukan</h2>
            <p class="mt-3 text-base text-[#90a1b9]">
              Username <strong class="text-slate-100">{{ username }}</strong> tidak terdaftar di KomuniTip.
            </p>
          </div>
        </div>

        <div v-else>
          <section class="grid gap-6 xl:grid-cols-[350px_minmax(0,738px)]">
            <aside class="space-y-6">
              <div class="relative overflow-hidden rounded-[32px] border border-[#314158] bg-[rgba(15,23,43,0.6)] shadow-[8px_8px_0px_0px_#020617]">
                <div class="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-[rgba(28,57,142,0.2)] to-transparent" />

                <div class="relative px-6 pb-6 pt-6 text-center">
                  <div class="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-[#314158] bg-[#1c398e] shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <img :src="TopHatMascot" alt="Streamer mascot" class="absolute inset-0 h-full w-full object-contain p-2 rotate-[5deg]" />
                  </div>

                  <div class="mt-7 flex items-center justify-center gap-2">
                    <h1 class="text-[32px] font-bold leading-none text-slate-100">{{ displayName }}</h1>
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#51a2ff]">
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <p class="mt-2 text-sm font-bold text-[#51a2ff]">@{{ publicUsername }}</p>

                  <div class="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1d293d] px-3 py-1.5 text-xs font-bold text-[#cad5e2]">
                    <svg class="h-3.5 w-3.5 text-[#51a2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.567-3 3.5S10.343 15 12 15s3-1.567 3-3.5S13.657 8 12 8zm0 0V5m0 10v4m7-7h-4M9 12H5" />
                    </svg>
                    <span>{{ creatorCategory }}</span>
                  </div>

                  <div class="mt-6 rounded-2xl border border-[rgba(49,65,88,0.5)] bg-[rgba(29,41,61,0.5)] px-5 py-4">
                    <p class="text-sm font-medium leading-[1.65] text-[#cad5e2]">{{ creatorBio }}</p>
                  </div>

                  <div class="mt-6 flex justify-center gap-3">
                    <a
                      v-for="social in creatorSocials"
                      :key="social.key"
                      :href="social.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      :title="social.label"
                      class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#314158] bg-[#1d293d] text-[#90a1b9] shadow-[2px_2px_0px_#020617] transition hover:border-[#45556c] hover:text-white"
                    >
                      <svg v-if="social.icon === 'instagram'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="17.5" cy="6.5" r="1.5" />
                      </svg>
                      <svg v-else-if="social.icon === 'youtube'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                      </svg>
                      <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                      </svg>
                    </a>

                    <div v-if="creatorSocials.length === 0" class="flex gap-3">
                      <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#314158] bg-[#1d293d] text-[#90a1b9] shadow-[2px_2px_0px_#020617]">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="2" y="2" width="20" height="20" rx="5" />
                          <circle cx="12" cy="12" r="5" />
                          <circle cx="17.5" cy="6.5" r="1.5" />
                        </svg>
                      </span>
                      <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#314158] bg-[#1d293d] text-[#90a1b9] shadow-[2px_2px_0px_#020617]">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                        </svg>
                      </span>
                      <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#314158] bg-[#1d293d] text-[#90a1b9] shadow-[2px_2px_0px_#020617]">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-center">
                <div class="inline-flex rounded-full border border-[rgba(0,188,125,0.3)] bg-[rgba(0,79,59,0.18)] px-5 py-2 text-sm font-bold text-[#00d492] shadow-[3px_3px_0px_#073b2b]">
                  Dukung kreator favorit mu!
                </div>
              </div>

              <div class="relative mx-auto h-[220px] w-[192px] rounded-[48px] border border-[rgba(97,95,255,0.3)] bg-[rgba(49,44,133,0.3)] shadow-[4px_4px_0px_0px_#020617]">
                <img :src="SittingMascot" alt="Mascot" class="absolute inset-0 h-full w-full object-contain p-3 rotate-[8deg]" />
              </div>
            </aside>

            <section>
              <div class="rounded-[32px] border border-[#314158] bg-[rgba(15,23,43,0.75)] px-8 py-10 shadow-[8px_8px_0px_0px_#020617]">
                <div v-if="success" class="space-y-6">
                  <div class="text-center">
                    <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(0,188,125,0.12)] text-4xl">🎉</div>
                    <h2 class="mt-5 text-4xl font-bold text-slate-100">Pembayaran Diterima!</h2>
                    <p v-if="paymentSummary?.nama_donatur" class="mt-3 text-lg text-[#cad5e2]">
                      Terima kasih <strong class="text-white">{{ paymentSummary.nama_donatur }}</strong>!
                    </p>
                    <p v-if="paymentSummary?.jumlah" class="mt-1 text-base text-[#90a1b9]">
                      Donasi sebesar <strong class="text-white">{{ formatRupiah(paymentSummary.jumlah) }}</strong> sedang diproses.
                    </p>
                    <p v-else class="mt-1 text-base text-[#90a1b9]">Donasi kamu sedang diproses.</p>
                  </div>

                  <div class="rounded-2xl border border-[rgba(0,188,125,0.3)] bg-[rgba(0,79,59,0.1)] px-5 py-4 text-sm text-[#b8ffe0]">
                    {{ paymentNotice || 'Donasi kamu sedang diverifikasi oleh sistem.' }}
                  </div>

                  <div v-if="paymentStatus?.payment_method" class="text-sm text-[#90a1b9]">
                    Metode pembayaran: <strong class="text-slate-100">{{ paymentStatus.payment_method }}</strong>
                  </div>

                  <button
                    class="inline-flex h-[56px] w-full items-center justify-center rounded-2xl border border-[#51a2ff] bg-[#155dfc] px-6 text-lg font-bold text-white shadow-[4px_4px_0px_#1e3a8a] transition hover:bg-[#1a64ff]"
                    @click="resetForm"
                  >
                    Kirim Donasi Lagi
                  </button>
                </div>

                <form v-else class="space-y-6" @submit.prevent="submitDonation">
                  <h2 class="text-[32px] font-bold text-slate-100">Kirim Dukungan</h2>

                  <div
                    v-if="aiBlocked"
                    class="flex gap-3 rounded-2xl border border-[rgba(255,32,86,0.35)] bg-[rgba(255,32,86,0.08)] px-4 py-4 text-sm"
                  >
                    <div class="text-xl">🚫</div>
                    <div>
                      <p class="font-bold text-slate-100">Pesan Ditolak</p>
                      <p class="mt-1 text-[#ffb7c8]">{{ blockReason }}</p>
                    </div>
                  </div>

                  <div
                    v-if="errorMessage"
                    class="flex gap-3 rounded-2xl border border-[rgba(187,77,0,0.5)] bg-[rgba(123,51,6,0.2)] px-4 py-4 text-sm"
                  >
                    <div class="text-xl">⚠️</div>
                    <p class="text-[rgba(254,230,133,0.95)]">{{ errorMessage }}</p>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <div class="space-y-3">
                      <label for="nama_donatur" class="text-sm font-bold text-[#cad5e2]">
                        Dari <span class="text-[#ff2056]">*</span>
                      </label>
                      <input
                        id="nama_donatur"
                        v-model="form.nama_donatur"
                        type="text"
                        placeholder="Nama"
                        maxlength="100"
                        required
                        class="h-12 w-full rounded-2xl border border-[#314158] bg-[#1d293d] px-5 text-base font-medium text-white shadow-[4px_4px_0px_0px_#020617] outline-none transition placeholder:text-[#62748e] focus:border-[#51a2ff]"
                      />
                      <label class="flex items-center gap-3 text-sm font-bold text-[#90a1b9]">
                        <input v-model="formUi.anonymous" type="checkbox" class="h-5 w-5 rounded border-[#45556c] bg-[#1d293d] text-[#155dfc] accent-[#155dfc]" />
                        <span>Kirim sebagai Anonim</span>
                      </label>
                    </div>

                    <div class="space-y-3">
                      <label for="email_donatur" class="text-sm font-bold text-[#cad5e2]">
                        Email <span class="text-[#ff2056]">*</span>
                      </label>
                      <input
                        id="email_donatur"
                        v-model="form.email_donatur"
                        type="email"
                        placeholder="email@kamu.com"
                        class="h-12 w-full rounded-2xl border border-[#314158] bg-[#1d293d] px-5 text-base font-medium text-white shadow-[4px_4px_0px_0px_#020617] outline-none transition placeholder:text-[#62748e] focus:border-[#51a2ff]"
                      />
                      <label class="flex items-center gap-3 text-sm font-bold text-[#90a1b9]">
                        <input v-model="formUi.hideEmail" type="checkbox" class="h-5 w-5 rounded border-[#45556c] bg-[#1d293d] text-[#155dfc] accent-[#155dfc]" />
                        <span>Sembunyikan dari kreator</span>
                      </label>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <label class="text-sm font-bold text-[#cad5e2]">
                      Nominal <span class="text-[#ff2056]">*</span>
                    </label>

                    <div class="flex">
                      <div class="flex h-14 items-center rounded-l-2xl border border-r-0 border-[#314158] bg-[#1d293d] px-6 text-lg font-bold text-[#90a1b9]">
                        Rp
                      </div>
                      <input
                        v-model.number="form.jumlah"
                        type="number"
                        min="10000"
                        placeholder="Masukan Nominal"
                        class="h-14 flex-1 rounded-r-2xl border border-[#314158] bg-[#1d293d] px-5 text-lg font-bold text-white shadow-[4px_4px_0px_0px_#020617] outline-none transition placeholder:text-[#62748e] focus:border-[#51a2ff]"
                      />
                    </div>

                    <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                      <button
                        v-for="preset in presets"
                        :key="preset"
                        type="button"
                        :class="['h-[47px] rounded-[14px] border text-sm font-bold transition', presetClass(preset)]"
                        @click="form.jumlah = preset"
                      >
                        {{ formatCompactRupiah(preset) }}
                      </button>
                    </div>

                    <p v-if="form.jumlah < 10000" class="text-xs font-bold text-[#ff8aa8]">
                      Minimum donasi Rp 10.000
                    </p>
                  </div>

                  <div class="space-y-3">
                    <label for="pesan" class="text-sm font-bold text-[#cad5e2]">Pesan</label>
                    <textarea
                      id="pesan"
                      v-model="form.pesan"
                      placeholder="Kirim pesan untuk brosan..."
                      maxlength="500"
                      rows="4"
                      class="min-h-28 w-full rounded-2xl border border-[#314158] bg-[#0f172b] px-5 py-4 text-base font-medium text-white shadow-[4px_4px_0px_0px_#020617] outline-none transition placeholder:text-[#62748e] focus:border-[#51a2ff]"
                    />
                    <p class="text-right text-xs font-bold text-[#62748e]">{{ messageLength }}/500</p>
                  </div>

                  <div class="space-y-4 border-t border-[#1d293d] pt-5">
                    <label class="flex items-start gap-3 text-sm font-bold text-[#90a1b9]">
                      <input v-model="formUi.ageConfirmed" type="checkbox" class="mt-0.5 h-5 w-5 rounded border-[#45556c] bg-[#1d293d] text-[#155dfc] accent-[#155dfc]" />
                      <span>Saya berusia 17 tahun atau lebih</span>
                    </label>

                    <label class="flex items-start gap-3 text-sm font-bold text-[#90a1b9]">
                      <input v-model="formUi.termsConfirmed" type="checkbox" class="mt-0.5 h-5 w-5 rounded border-[#45556c] bg-[#1d293d] text-[#155dfc] accent-[#155dfc]" />
                      <span>
                        Saya memahami dan menyetujui bahwa dukungan ini saya berikan secara sukarela, tidak dapat dikembalikan, serta sesuai dengan
                        <a href="#" class="text-[#00d492]"> syarat dan ketentuan </a>
                        KomuniTip.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    class="inline-flex h-[56px] w-full items-center justify-center rounded-2xl border border-[#8ea3bc] bg-[#b7c5d8] text-lg font-bold text-white shadow-[4px_4px_0px_0px_#62748e] transition enabled:border-[#51a2ff] enabled:bg-[#155dfc] enabled:shadow-[4px_4px_0px_0px_#1e3a8a] enabled:hover:bg-[#1a64ff] disabled:cursor-not-allowed disabled:opacity-80"
                    :disabled="!isFormValid || submitting"
                  >
                    <span v-if="submitting" class="flex items-center gap-3">
                      <span class="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span>Memproses...</span>
                    </span>
                    <span v-else>Kirim</span>
                  </button>
                </form>
              </div>

              <div class="mt-6 flex justify-center">
                <div class="inline-flex items-center gap-2 rounded-full border border-[#1d293d] bg-[rgba(15,23,43,0.8)] px-4 py-2 text-sm font-medium text-[#62748e]">
                  <svg class="h-4 w-4 text-[#00d492]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 .92-.75 1.667-1.667 1.667S8.667 11.92 8.667 11 9.413 9.333 10.333 9.333 12 10.08 12 11zm0 0V8.5a3.5 3.5 0 117 0V11m-14 0v5.833C5 18.03 5.97 19 7.167 19h9.666C18.03 19 19 18.03 19 16.833V11m-14 0h14" />
                  </svg>
                  <span>Transaksi diproses aman & terenkripsi</span>
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>

      <footer class="relative mt-10 border-t border-[#1d293d] bg-[rgba(15,23,43,0.5)]">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-[449px] overflow-hidden">
          <img :src="GroupPenguins" alt="" class="absolute bottom-0 right-10 h-[260px] object-contain opacity-10" />
        </div>

        <div class="relative mx-auto max-w-[1152px] px-6 py-10">
          <div class="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_236px_236px]">
            <div>
              <RouterLink to="/" class="flex items-center gap-3">
                <img :src="StandingMascot" alt="KomuniTip" class="h-12 w-12 object-contain -scale-x-100 -rotate-2" />
                <span class="text-xl font-bold tracking-tight text-slate-100">KomuniTip</span>
              </RouterLink>

              <p class="mt-5 max-w-[360px] text-base font-medium leading-[1.6] text-[#90a1b9]">
                Platform dukungan kreator di Indonesia. Wujudkan mimpimu, bangun komunitas yang solid.
              </p>

              <div class="mt-6 flex gap-4">
                <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#314158] bg-[#1d293d] text-[#90a1b9] shadow-[2px_2px_0px_#020617]">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                  </svg>
                </span>
                <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#314158] bg-[#1d293d] text-[#90a1b9] shadow-[2px_2px_0px_#020617]">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" />
                  </svg>
                </span>
                <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#314158] bg-[#1d293d] text-[#90a1b9] shadow-[2px_2px_0px_#020617]">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-bold text-slate-100">Perusahaan</h3>
              <ul class="mt-4 space-y-3 text-base font-medium text-[#90a1b9]">
                <li>Tentang Kami</li>
                <li>Karir</li>
                <li>Blog</li>
                <li>Kontak</li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-bold text-slate-100">Bantuan</h3>
              <ul class="mt-4 space-y-3 text-base font-medium text-[#90a1b9]">
                <li>Pusat Bantuan</li>
                <li>Syarat & Ketentuan</li>
                <li>Kebijakan Privasi</li>
                <li>Panduan Kreator</li>
              </ul>
            </div>
          </div>

          <div class="mt-10 border-t border-[#1d293d] pt-5 text-sm font-medium text-[#62748e]">
            © 2026 KomuniTip. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
