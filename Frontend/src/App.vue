<script setup>
// App.vue sekarang hanya sebagai container utama (Root Component)
// Navigasi ditangani oleh Vue Router di src/router/index.js
</script>

<template>
  <!-- RouterView akan merender komponen sesuai dengan URL saat ini -->
  <router-view />
</template>

<style>
* {
  box-sizing: border-box;
}

html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

input::placeholder {
  color: #4a5568;
}

input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
}

/* Transisi Fade untuk perpindahan rute yang halus */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
