<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const username = route.params.username

// ─── State ───
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

// ─── Form ───
const form = ref({
  nama_donatur: '',
  email_donatur: '',
  pesan: '',
  jumlah: 25000,
})

// Preset nominal
const presets = [10000, 25000, 50000, 100000, 250000, 500000]

// ─── Format Rupiah ───
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
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

// ─── Fetch Streamer Profile ───
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
      if (paymentStatus.value?.status === 'SUCCESS') {
        paymentNotice.value = 'Pembayaran berhasil diverifikasi. Alert akan dikirim ke overlay streamer.'
        success.value = true
      } else if (paymentStatus.value?.status === 'PENDING') {
        paymentNotice.value = 'Pembayaran sudah diterima, menunggu verifikasi webhook.'
        success.value = true
      } else if (paymentStatus.value?.status === 'FAILED') {
        success.value = false
        errorMessage.value = 'Pembayaran gagal atau sudah kedaluwarsa. Silakan coba lagi.'
      }
    } catch (error) {
      errorMessage.value = error.message || 'Gagal memeriksa status pembayaran.'
    }
  }

  try {
    const { data } = await api.get(`/donate/${username}`)
    streamer.value = data.data
  } catch (err) {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

// ─── Submit Donation ───
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

// ─── Reset form ───
const resetForm = () => {
  form.value = { nama_donatur: '', email_donatur: '', pesan: '', jumlah: 25000 }
  aiBlocked.value = false
  success.value = false
  errorMessage.value = ''
  paymentNotice.value = ''
  paymentSummary.value = null
  paymentStatus.value = null
  sessionStorage.removeItem(storageKey)
}

// ─── Computed ───
const isFormValid = computed(() => {
  return form.value.nama_donatur.trim().length > 0 && form.value.jumlah >= 10000
})
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="donate-page">
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Memuat halaman...</p>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else-if="notFound" class="donate-page">
    <div class="not-found">
      <div class="not-found-icon">😔</div>
      <h2>Kreator Tidak Ditemukan</h2>
      <p>Username <strong>{{ username }}</strong> tidak terdaftar di KomuniTip.</p>
    </div>
  </div>

  <!-- Donate Form -->
  <div v-else class="donate-page">
    <div class="donate-container">

      <!-- Streamer Header -->
      <div class="streamer-header">
        <div class="streamer-avatar">
          {{ streamer.nama_lengkap?.charAt(0)?.toUpperCase() }}
        </div>
        <h1 class="streamer-name">{{ streamer.nama_lengkap }}</h1>
        <p v-if="streamer.kategori" class="streamer-category">{{ streamer.kategori }}</p>
        <p v-if="streamer.bio" class="streamer-bio">{{ streamer.bio }}</p>

        <!-- Social Links -->
        <div class="social-links" v-if="streamer.instagram || streamer.youtube || streamer.twitter">
          <a v-if="streamer.instagram" :href="`https://instagram.com/${streamer.instagram}`" target="_blank" class="social-link" title="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
          </a>
          <a v-if="streamer.youtube" :href="streamer.youtube" target="_blank" class="social-link" title="YouTube">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
          </a>
          <a v-if="streamer.twitter" :href="`https://twitter.com/${streamer.twitter}`" target="_blank" class="social-link" title="Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
          </a>
        </div>
      </div>

      <!-- Success State -->
      <div v-if="success" class="success-card">
        <div class="success-icon">🎉</div>
        <h2>Pembayaran Diterima!</h2>
        <p v-if="paymentSummary?.nama_donatur">Terima kasih <strong>{{ paymentSummary.nama_donatur }}</strong>!</p>
        <p v-if="paymentSummary?.jumlah">Donasi sebesar <strong>{{ formatRupiah(paymentSummary.jumlah) }}</strong> sedang diproses.</p>
        <p v-else>Donasi kamu sedang diproses.</p>
        <p class="success-note">{{ paymentNotice || 'Donasi kamu sedang diverifikasi oleh sistem.' }}</p>
        <p v-if="paymentStatus?.payment_method" class="success-note">
          Metode pembayaran: <strong>{{ paymentStatus.payment_method }}</strong>
        </p>
        <button @click="resetForm" class="btn-primary">Kirim Donasi Lagi</button>
      </div>

      <!-- Donation Form -->
      <form v-else @submit.prevent="submitDonation" class="donate-form">
        <!-- AI Blocked Alert -->
        <div v-if="aiBlocked" class="alert alert-blocked">
          <div class="alert-icon">🚫</div>
          <div>
            <strong>Pesan Ditolak</strong>
            <p>{{ blockReason }}</p>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="alert alert-error">
          <div class="alert-icon">⚠️</div>
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Nama Donatur -->
        <div class="form-group">
          <label for="nama_donatur">Nama Kamu <span class="required">*</span></label>
          <input
            id="nama_donatur"
            v-model="form.nama_donatur"
            type="text"
            placeholder="Nama yang akan tampil di stream"
            maxlength="100"
            required
          />
        </div>

        <!-- Email (Optional) -->
        <div class="form-group">
          <label for="email_donatur">Email <span class="optional">(opsional)</span></label>
          <input
            id="email_donatur"
            v-model="form.email_donatur"
            type="email"
            placeholder="email@contoh.com"
          />
        </div>

        <!-- Nominal -->
        <div class="form-group">
          <label>Nominal Donasi <span class="required">*</span></label>
          <div class="preset-grid">
            <button
              v-for="preset in presets"
              :key="preset"
              type="button"
              :class="['preset-btn', { active: form.jumlah === preset }]"
              @click="form.jumlah = preset"
            >
              {{ formatRupiah(preset) }}
            </button>
          </div>
          <div class="custom-amount">
            <span class="currency-label">Rp</span>
            <input
              v-model.number="form.jumlah"
              type="number"
              min="10000"
              placeholder="Nominal lainnya"
            />
          </div>
          <small v-if="form.jumlah < 10000" class="field-error">Minimum donasi Rp 10.000</small>
        </div>

        <!-- Pesan -->
        <div class="form-group">
          <label for="pesan">Pesan <span class="optional">(opsional)</span></label>
          <textarea
            id="pesan"
            v-model="form.pesan"
            placeholder="Tulis pesan kamu di sini..."
            maxlength="500"
            rows="3"
          ></textarea>
          <small class="char-count">{{ form.pesan?.length || 0 }}/500</small>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn-donate"
          :disabled="!isFormValid || submitting"
        >
          <span v-if="submitting" class="spinner-small"></span>
          <span v-else>💰 Kirim {{ formatRupiah(form.jumlah) }}</span>
        </button>

        <p class="powered-by">
          Powered by <strong>KomuniTip</strong> — Platform donasi streaming Indonesia 🇮🇩
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* ─── Base ─── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.donate-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  font-family: 'Inter', sans-serif;
  padding: 20px;
}

/* ─── Container ─── */
.donate-container {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

/* ─── Loading ─── */
.loading-container {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #2BBBA0;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Not Found ─── */
.not-found {
  text-align: center;
  color: white;
}

.not-found-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.not-found h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.not-found p {
  color: rgba(255, 255, 255, 0.6);
}

/* ─── Streamer Header ─── */
.streamer-header {
  text-align: center;
  margin-bottom: 32px;
}

.streamer-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2BBBA0, #3BA2FF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(43, 187, 160, 0.3);
}

.streamer-name {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px;
}

.streamer-category {
  color: #2BBBA0;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px;
}

.streamer-bio {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.social-links {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
}

.social-link {
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s, transform 0.2s;
}

.social-link:hover {
  color: #2BBBA0;
  transform: scale(1.15);
}

/* ─── Form ─── */
.donate-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
}

.required {
  color: #ff6b6b;
}

.optional {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
  font-size: 12px;
}

.form-group input,
.form-group textarea {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #2BBBA0;
  box-shadow: 0 0 0 3px rgba(43, 187, 160, 0.15);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.char-count {
  text-align: right;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}

.field-error {
  color: #ff6b6b;
  font-size: 12px;
}

/* ─── Preset Grid ─── */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preset-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  border-color: rgba(43, 187, 160, 0.4);
  color: white;
}

.preset-btn.active {
  background: rgba(43, 187, 160, 0.15);
  border-color: #2BBBA0;
  color: #2BBBA0;
}

/* ─── Custom Amount ─── */
.custom-amount {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.currency-label {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  font-size: 15px;
}

.custom-amount input {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 15px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}

.custom-amount input:focus {
  border-color: #2BBBA0;
  box-shadow: 0 0 0 3px rgba(43, 187, 160, 0.15);
}

/* ─── Alerts ─── */
.alert {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  animation: slideIn 0.3s ease-out;
}

.alert-blocked {
  background: rgba(255, 59, 48, 0.12);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff6b6b;
}

.alert-error {
  background: rgba(255, 149, 0, 0.12);
  border: 1px solid rgba(255, 149, 0, 0.3);
  color: #ffb347;
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert strong {
  display: block;
  margin-bottom: 4px;
}

.alert p {
  margin: 0;
  line-height: 1.4;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── Submit Button ─── */
.btn-donate {
  background: linear-gradient(135deg, #2BBBA0, #22a08a);
  border: none;
  border-radius: 14px;
  padding: 16px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(43, 187, 160, 0.3);
}

.btn-donate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(43, 187, 160, 0.4);
}

.btn-donate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ─── Success Card ─── */
.success-card {
  text-align: center;
  color: white;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounceIn 0.5s ease-out;
}

.success-card h2 {
  font-size: 22px;
  color: #2BBBA0;
  margin: 0 0 12px;
}

.success-card p {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 15px;
}

.success-note {
  margin-top: 16px !important;
  font-size: 13px !important;
  color: rgba(255, 255, 255, 0.4) !important;
  font-style: italic;
}

.btn-primary {
  margin-top: 24px;
  background: linear-gradient(135deg, #2BBBA0, #22a08a);
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(43, 187, 160, 0.3);
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}

/* ─── Powered By ─── */
.powered-by {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  margin-top: 8px;
}

/* ─── Responsive ─── */
@media (max-width: 520px) {
  .donate-container {
    padding: 28px 20px;
    border-radius: 20px;
  }

  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
