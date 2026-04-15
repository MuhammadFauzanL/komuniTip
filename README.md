# 🐧 KomuniTip - Panduan Lengkap Instalasi & Setup Lokal

Selamat datang di repositori KomuniTip! Platform donasi pintar berbasis AI yang dirancang khusus untuk para kreator konten *live-streaming*. 

Panduan ini ditulis (step-by-step) menargetkan developer baru yang baru saja me-clone repositori ini dari GitHub. Pastikan kamu membaca setiap langkah dengan teliti agar aplikasi berjalan 100% sempurna tanpa *bug*.

---

## 🛠️ Persyaratan Sistem (Prerequisites)
Sebelum mulai, pastikan spesifikasi komputermu sudah terpasang program berikut:
- **Git** (Untuk mengambil kodenya).
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Wajib ter-install dan berjalan di latar belakang/running). Serius, kamu tidak butuh nginstall NodeJS, NPM, atau PostgreSQL secara manual. Serahkan semuanya pada Docker!

---

## 🚀 Instalasi Langkah demi Langkah (Step by Step)

### Langkah 1: Clone Repositori
Buka terminal dan unduh kodenya.
```bash
git clone https://github.com/MuhammadFauzanL/komuniTip.git
cd komunitip
```

### Langkah 2: Buat File `.env` (PENTING!)
Sistem tidak akan bisa menyala jika kamu belum mengisi kunci rahasia *(Secret Keys)*-nya.

1. Di dalam *folder* utama aplikasi, salin file contoh *environment* (agar terbaca oleh Docker):
   ```bash
   cp .env.example .env
   ```
2. Buka file `.env` kamu menggunakan *Code Editor* kesayanganmu (VSCode).
3. **Isi Nilai-Nilainya**:
   - **Database**: Ubah `DB_USER` dan `DB_PASSWORD` sesuka hatimu (contoh: ubah jadi `root` dan `komunitipDB`). Jangan ubah `DB_NAME`.
   - **Google OAuth**: Masukkan API *Client ID* & *Secret*-mu dari [Google Cloud Platform](https://console.cloud.google.com/). Ini wajib, tanpa ini siapapun tidak bisa daftar!
   - **AI Moderation (Gemini)**: Masukkan API Key gratis dari [Google AI Studio](https://aistudio.google.com/app/apikey).
   - **Xendit (Payment Gateway)**: Daftar [Xendit Dashboard](https://dashboard.xendit.co/) → *Developers* → *API Keys*. Buat *Secret Key* baru (TEST/Sandbox) dan taruh di sini. Begitu juga dengan *Webhook Token*-nya untuk pengujian saldo masuk.

### Langkah 3: Bangun dan Jalankan Kontainer (Docker Compose)
Setelah `.env` diisi, biarkan Docker bekerja mengunduh *image* Linux, Node.JS, Vue, dan Postgres. 
Jalankan perintah ini di *password* utama terminal:
```bash
docker compose up --build -d
```
> *(Catatan: Tambahan flag `-d` itu artinya `detached`. Docker akan berjalan diam-diam di balik layar tanpa mengunci terminal-mu). Pembangunan ini akan memakan waktu 3-5 menit bergantung pada kecepatan internet internetmu.*

### Langkah 4: Migrasi Skema Database & Sinkronisasi
Database PostgreSQL milikmu saat ini "masih kosong", belum berbentuk. Kamu harus "mengirim" rancangan desain database (Schema Prisma) ke dalam server tersebut.
```bash
docker exec -it komunitip-backend npx prisma migrate dev --name init
```
*Tunggu hingga terminal mengatakan: **"migration ran successfully"***. Maka saldo, user, dan donasi sudah memiliki tempatnya!

---

## 🔥 Aplikasi Berhasil Running!
Buka aplikasimu melalui *link* yang telah difasilitasi! Seluruh komponen otomatis tersambung:

- 🎨 **Website Tampilan (Frontend)**: [http://localhost:5173](http://localhost:5173) *(Vue HMR siap edit)*
- ⚙️ **Data Pusat (Backend URL)**: [http://localhost:3000](http://localhost:3000)
- 🗄️ **GUI Database Prisma**: [http://localhost:5555](http://localhost:5555) 
  *(Jalankan perintah `docker exec -it komunitip-backend npx prisma studio` jika URL 5555 ini mau dihidupkan).*

---

## 🛑 Skenario Error & Solusinya (Troubleshooting)

Buat berjaga-jaga jika teman/layanmu mengalami masalah saat nge-*clone*:

1. **Error: "Role does not exist" atau Database Kosong:**
   - **Penyebab**: Terjadi perombakan variabel `DB_USER` namun sisa data *image* Postgres lama di Docker masih menggunakan username yang lama. 
   - **Solusi Tuntas**: Hapus paksa memori Docker dengan perintah:
     ```bash
     docker compose down -v
     docker compose up --build -d
     ```
2. **Saldo Donasi Nggak Masuk? Webhook Stuck!**
   - **Alasan**: Server Xendit dari luar angkasa/internet gak bisa nembak domain `http://localhost` di komputermu!
   - **Penyelesaian**: Pastikan saat testing pembayaran, kamu pakai aplikasi *Tunel* **[Ngrok](https://ngrok.com/)**. Jalankan perintah `ngrok http 3000` di terminal lain, lalu paste link Ngrok-nya di *Webhooks > Invoices Paid* pada Dashboard Xenditmu.
3. **Pesan Donasi Gagal Karena Error 400 (Bad Request)**
   - Periksa konsol backend: `docker compose logs -f backend-api`.
   - Kemungkinan **Gemini API Key**-mu limit / sudah habis kuota harian *(429 Too Many Requests)*. Ganti dengan *API Key* Google Cloud AI Google-mu yang baru.

---
*© 2026 KomuniTip Build - Dioptimasi bersama AI.*
