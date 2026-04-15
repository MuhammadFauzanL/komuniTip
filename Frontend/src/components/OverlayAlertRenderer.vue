<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'

const route = useRoute()
const username = route.params.username

// State & Queue
const socket = ref(null)
const overlayQueue = ref([])
const currentAlert = ref(null)
const isPlaying = ref(false)

// Pengaturan Overlay (Nanti bisa di-fetch dari API OverlaySettings, 
// sementara kita hardcode untuk demo mengikuti UI dari dashboard)
const soundUrl = '/notification.mp3' // pastikan punya aset ini, atau abaikan
const displayDuration = 8000 // 8 detik
const minTTS = 10000

onMounted(() => {
  // Connect to generic backend URL. Vite proxy will NOT proxy WebSockets automatically
  // unless configured. It's safer to connect directly to the backend URL on port 3000
  // Note: For localhost demo, backend is at port 3000. 
  socket.value = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : '/')

  socket.value.on('connect', () => {
    console.log('🔗 WebSocket Connected to alert server')
    // Join the specific streamer's room
    socket.value.emit('joinRoom', username)
  })

  socket.value.on('new_donation', (data) => {
    console.log('🎉 New Donation Received:', data)
    overlayQueue.value.push(data)
    processQueue()
  })

  socket.value.on('disconnect', () => {
    console.log('❌ WebSocket Disconnected')
  })
})

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

  // Putar Suara (bisa gagal jika browser memblokir auto-play tanpa interaksi, 
  // tapi biasanya lolos jika dari OBS browser source)
  try {
    const audio = new Audio(soundUrl)
    audio.play().catch(e => console.log('Audio autoplay prevented by browser'))
  } catch (e) {}

  // TTS
  if (alertData.jumlah >= minTTS && 'speechSynthesis' in window) {
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
  }, displayDuration)
}

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka)
}
</script>

<template>
  <div class="overlay-container">
    <Transition name="bounce">
      <div v-if="currentAlert" class="alert-box">
        <!-- Menggunakan animasi mascot dan template yang mirip dari Dashboard -->
        <div class="alert-content">
          <div class="header">
            <span class="donator-name">{{ currentAlert.nama_donatur }}</span> 
            <span class="static-text">baru saja memberikan</span>
          </div>
          
          <div class="amount">
            {{ formatRupiah(currentAlert.jumlah) }}
          </div>
          
          <div v-if="currentAlert.pesan" class="message">
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
  background-image: url('../assets/Icon_kotak.png'); /* Placeholder, sesuaikan dengan aset jika ada */
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
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: 24px;
  text-shadow: 0 4px 8px rgba(0,0,0,0.5);
  margin-bottom: 8px;
}

.donator-name {
  color: #FFFFFF;
}

.static-text {
  color: #10B981; /* Emerald 400 */
}

.amount {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 48px;
  color: #3BA2FF;
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
  margin: 12px 0;
}

.message {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #FF914D; /* Orange 400 */
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
