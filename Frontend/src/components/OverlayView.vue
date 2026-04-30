<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
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
  template_text: '{name} baru saja memberikan {amount}',
  font_family: 'Inter',
  nama_color: '#FFFFFF',
  template_color: '#2BBBA0',
  amount_color: '#3BA2FF',
  message_color: '#FF914D',
  sound_enabled: true,
  sound_min_donasi: 200000,
  tts_enabled: false,
})

const browserSourceUrl = computed(() => {
  const username = user.value?.username || 'username'
  return `${window.location.origin}/alert/${username}`
})

const previewData = computed(() => ({
  name: 'KomuniTip Test',
  amount: new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(50000),
  message: 'Terima kasih sudah mendukung livestream ini.',
}))

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

const copyUrl = async () => {
  await navigator.clipboard.writeText(browserSourceUrl.value)
  notice.value = 'URL overlay berhasil disalin.'
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
      ...settings.value,
      min_donasi_alert: Number(settings.value.min_donasi_alert),
      durasi_alert: Number(settings.value.durasi_alert),
      sound_min_donasi: Number(settings.value.sound_min_donasi),
    }
    const { data } = await api.patch('/overlay/settings', payload)
    settings.value = {
      ...settings.value,
      ...data.data,
      min_donasi_alert: Number(data.data.min_donasi_alert),
      durasi_alert: Number(data.data.durasi_alert),
      sound_min_donasi: Number(data.data.sound_min_donasi),
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
  <div class="min-h-screen bg-[#09111f] text-white">
    <div class="mx-auto max-w-7xl px-6 py-8">
      <div class="mb-8 flex items-start justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Overlay MVP</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight">OBS Browser Source</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-300/80">
            URL ini cukup dipasang ke OBS. Setelah pembayaran sukses atau tombol test alert ditekan,
            alert akan muncul otomatis di scene streamer.
          </p>
        </div>

        <button
          class="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
          @click="handleLogout"
        >
          Keluar
        </button>
      </div>

      <div v-if="errorMessage" class="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {{ errorMessage }}
      </div>

      <div v-if="notice" class="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        {{ notice }}
      </div>

      <div v-if="loading" class="rounded-[28px] border border-slate-800 bg-slate-900/70 p-8 text-sm text-slate-300">
        Memuat konfigurasi overlay...
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section class="space-y-6">
          <div class="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
            <div class="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-bold">Browser Source URL</h2>
                <p class="mt-1 text-sm text-slate-400">
                  Tempel URL ini ke OBS, Streamlabs, atau browser biasa untuk testing.
                </p>
              </div>

              <button
                class="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                @click="copyUrl"
              >
                Salin URL
              </button>
            </div>

            <div class="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-4 font-mono text-sm text-cyan-300">
              {{ browserSourceUrl }}
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <a
                :href="browserSourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-2xl border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:bg-slate-800"
              >
                Buka Halaman Overlay
              </a>

              <button
                class="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="testing"
                @click="sendTestAlert"
              >
                {{ testing ? 'Mengirim Test...' : 'Kirim Test Alert' }}
              </button>
            </div>
          </div>

          <div class="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
            <div class="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-bold">Pengaturan Alert</h2>
                <p class="mt-1 text-sm text-slate-400">
                  Simpan konfigurasi minimum yang dibutuhkan untuk MVP overlay.
                </p>
              </div>

              <button
                class="rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="saving"
                @click="saveSettings"
              >
                {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
              </button>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Template Text</span>
                <input
                  v-model="settings.template_text"
                  class="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Font</span>
                <input
                  v-model="settings.font_family"
                  class="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Durasi Alert (detik)</span>
                <input
                  v-model.number="settings.durasi_alert"
                  type="number"
                  min="4"
                  max="60"
                  class="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Minimum Donasi Alert</span>
                <input
                  v-model.number="settings.min_donasi_alert"
                  type="number"
                  min="1000"
                  class="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Minimum Donasi Sound Alert</span>
                <input
                  v-model.number="settings.sound_min_donasi"
                  type="number"
                  min="1000"
                  class="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Warna Nama</span>
                <input v-model="settings.nama_color" type="color" class="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-2 py-2" />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Warna Template</span>
                <input v-model="settings.template_color" type="color" class="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-2 py-2" />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Warna Nominal</span>
                <input v-model="settings.amount_color" type="color" class="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-2 py-2" />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-300">Warna Pesan</span>
                <input v-model="settings.message_color" type="color" class="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-2 py-2" />
              </label>
            </div>

            <div class="mt-6 grid gap-3 md:grid-cols-2">
              <label class="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                <span class="text-sm font-semibold text-slate-200">Sound Alert</span>
                <input v-model="settings.sound_enabled" type="checkbox" class="h-5 w-5 accent-emerald-400" />
              </label>

              <label class="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                <span class="text-sm font-semibold text-slate-200">Text To Speech</span>
                <input v-model="settings.tts_enabled" type="checkbox" class="h-5 w-5 accent-emerald-400" />
              </label>
            </div>
          </div>
        </section>

        <aside class="space-y-6">
          <div class="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
            <h2 class="text-xl font-bold">Preview Alert</h2>
            <p class="mt-1 text-sm text-slate-400">
              Preview ini meniru tampilan halaman overlay yang akan dipakai OBS.
            </p>

            <div class="mt-5 rounded-[28px] border border-slate-700 bg-[#050810] p-6 shadow-inner">
              <div class="rounded-[24px] border border-black bg-[radial-gradient(circle_at_top,#17304d,#050810_70%)] p-8 text-center">
                <div
                  class="text-2xl font-black"
                  :style="{ color: settings.template_color, fontFamily: settings.font_family }"
                  v-html="previewTemplateHtml"
                >
                </div>
                <div class="mt-4 text-5xl font-black tracking-tight" :style="{ color: settings.amount_color, fontFamily: settings.font_family }">
                  {{ previewData.amount }}
                </div>
                <div class="mt-4 text-lg font-bold" :style="{ color: settings.message_color, fontFamily: settings.font_family }">
                  "{{ previewData.message }}"
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
            <h2 class="text-xl font-bold">Langkah OBS</h2>
            <ol class="mt-4 space-y-3 text-sm text-slate-300">
              <li>1. Tambahkan source baru: <strong>Browser Source</strong>.</li>
              <li>2. Tempel URL overlay di atas.</li>
              <li>3. Gunakan ukuran awal <strong>1280 x 720</strong>.</li>
              <li>4. Klik <strong>Kirim Test Alert</strong> untuk cek tampilan tanpa pembayaran real.</li>
              <li>5. Sound alert hanya diputar jika nominal mencapai <strong>Rp{{ Number(settings.sound_min_donasi).toLocaleString('id-ID') }}</strong> atau lebih.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
