<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'
import AlertBackground from '../assets/Icon_kotak.png'
import api from '../services/api'

const route = useRoute()
const username = route.params.username

// State & Queue
const socket = ref(null)
const overlayQueue = ref([])
const currentAlert = ref(null)
const isPlaying = ref(false)
const overlaySettings = ref({
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

// Pengaturan Overlay (Nanti bisa di-fetch dari API OverlaySettings, 
// sementara kita hardcode untuk demo mengikuti UI dari dashboard)
const alertBoxStyle = {
  backgroundImage: `url(${AlertBackground})`,
}
const socketServerUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:3000' : undefined)

onMounted(() => {
  loadOverlaySettings()
  socket.value = socketServerUrl ? io(socketServerUrl) : io()

  socket.value.on('connect', () => {
    console.log('🔗 WebSocket Connected to alert server')
    // Join the specific streamer's room
    socket.value.emit('joinRoom', username)
  })

  socket.value.on('new_donation', (data) => {
    console.log('🎉 New Donation Received:', data)
    if (Number(data.jumlah) < Number(overlaySettings.value.min_donasi_alert)) {
      return
    }
    overlayQueue.value.push(data)
    processQueue()
  })

  socket.value.on('disconnect', () => {
    console.log('❌ WebSocket Disconnected')
  })
})

const loadOverlaySettings = async () => {
  try {
    const { data } = await api.get(`/overlay/public/${username}`)
    overlaySettings.value = {
      ...overlaySettings.value,
      ...data.data.settings,
      min_donasi_alert: Number(data.data.settings.min_donasi_alert),
      durasi_alert: Number(data.data.settings.durasi_alert),
      sound_min_donasi: Number(data.data.settings.sound_min_donasi),
    }
  } catch (error) {
    console.error('Gagal memuat overlay settings:', error)
  }
}

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})

// Queue Processing
const processQueue = () => {
  // Jika sedang memainkan alert, biarkan selesai dulu
  if (isPlaying.value || overlayQueue.value.length === 0) return

  // Ambil donasi pertama dari antrian
  const nextAlert = overlayQueue.value.shift()
  playAlert(nextAlert)
}

const playAlert = (alertData) => {
  isPlaying.value = true
  currentAlert.value = alertData

  playSoundIfEligible(alertData.jumlah)

  // TTS
  if (overlaySettings.value.tts_enabled && 'speechSynthesis' in window) {
    const textToSpeech = `Terima kasih ${alertData.nama_donatur} atas dukungannya sebesar ${alertData.jumlah} rupiah. ${alertData.pesan || ''}`
    const utterance = new SpeechSynthesisUtterance(textToSpeech)
    utterance.lang = 'id-ID' // Bahasa Indonesia
    utterance.volume = 1
    utterance.rate = 0.9 // sedikit pelan
    window.speechSynthesis.speak(utterance)
  }

  // Sembunyikan alert setelah durasi yang ditentukan
  setTimeout(() => {
    currentAlert.value = null
    isPlaying.value = false
    
    // Beri jeda 1 detik sebelum memainkan alert berikutnya
    setTimeout(processQueue, 1000)
  }, overlaySettings.value.durasi_alert * 1000)
}

const playSoundIfEligible = (amount) => {
  const meetsThreshold =
    overlaySettings.value.sound_enabled &&
    Number(amount) >= Number(overlaySettings.value.sound_min_donasi)

  if (!meetsThreshold) {
    return
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      return
    }

    const context = new AudioContextClass()
    const masterGain = context.createGain()
    masterGain.gain.setValueAtTime(0.0001, context.currentTime)
    masterGain.connect(context.destination)

    const melody = [
      { frequency: 659.25, duration: 0.12, delay: 0.0 },
      { frequency: 783.99, duration: 0.14, delay: 0.14 },
      { frequency: 987.77, duration: 0.24, delay: 0.30 },
    ]

    melody.forEach((note) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const startAt = context.currentTime + note.delay
      const endAt = startAt + note.duration

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(note.frequency, startAt)
      gain.gain.setValueAtTime(0.0001, startAt)
      gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt)

      oscillator.connect(gain)
      gain.connect(masterGain)
      oscillator.start(startAt)
      oscillator.stop(endAt + 0.02)
    })

    const totalDuration = melody.at(-1).delay + melody.at(-1).duration + 0.1
    setTimeout(() => {
      context.close().catch(() => {})
    }, totalDuration * 1000)
  } catch (error) {
    console.log('Generated sound alert failed:', error)
  }
}

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka)
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const formattedHeader = computed(() => {
  if (!currentAlert.value) return ''

  return escapeHtml(overlaySettings.value.template_text)
    .replace(
      '{name}',
      `<span style="color:${overlaySettings.value.nama_color}">${escapeHtml(currentAlert.value.nama_donatur)}</span>`,
    )
    .replace(
      '{amount}',
      `<span style="color:${overlaySettings.value.amount_color}">${escapeHtml(formatRupiah(currentAlert.value.jumlah))}</span>`,
    )
})
</script>

<template>
  <div class="overlay-container">
    <Transition name="bounce">
      <div v-if="currentAlert" class="alert-box" :style="alertBoxStyle">
        <!-- Menggunakan animasi mascot dan template yang mirip dari Dashboard -->
        <div class="alert-content">
          <div
            class="header template-text"
            :style="{ color: overlaySettings.template_color, fontFamily: overlaySettings.font_family }"
            v-html="formattedHeader"
          >
          </div>
          
          <div class="amount" :style="{ color: overlaySettings.amount_color, fontFamily: overlaySettings.font_family }">
            {{ formatRupiah(currentAlert.jumlah) }}
          </div>
          
          <div
            v-if="currentAlert.pesan"
            class="message"
            :style="{ color: overlaySettings.message_color, fontFamily: overlaySettings.font_family }"
          >
            "{{ currentAlert.pesan }}"
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Transparan agar bisa di-capture OBS */
.overlay-container {
  width: 100vw;
  height: 100vh;
  background-color: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Alert Box Styling - Mirip dengan preview di komponen OverlayView */
.alert-box {
  width: 600px;
  aspect-ratio: 2.8 / 1;
  background-size: cover;
  background-position: center;
  background-color: #050810;
  border: 4px solid #000;
  border-radius: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-align: center;
}

.alert-box::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5); /* Dimmer */
}

.alert-content {
  position: relative;
  z-index: 10;
  padding: 20px;
  transform: scale(1.1); /* Perbesar sedikit untuk OBS */
}

.header {
  font-weight: 900;
  font-size: 24px;
  text-shadow: 0 4px 8px rgba(0,0,0,0.5);
  margin-bottom: 8px;
}

.amount {
  font-weight: 800;
  font-size: 48px;
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
  margin: 12px 0;
}

.message {
  font-weight: 700;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

/* Vue Transition Animations */
.bounce-enter-active {
  animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse ease-in;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.3) translateY(200px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  70% {
    transform: scale(1.05) translateY(-10px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Sembunyikan background default Vue untuk halaman ini */
:global(body) {
  background: transparent !important;
}
:global(#app) {
  background: transparent !important;
}
</style>
