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

Berikut adalah panduan detail untuk menjalankan KomuniTip di komputer Anda dari nol:

### Langkah 1: Clone Repositori
Buka terminal/CMD Anda, lalu unduh source code dari GitHub menggunakan perintah berikut:
```bash
git clone https://github.com/MuhammadFauzanL/komuniTip.git
cd komunitip
```

### Langkah 2: Konfigurasi File Environment (.env)
Aplikasi membutuhkan konfigurasi rahasia seperti akses database, kunci API Google, dan Xendit. Anda harus membuat file `.env` sebelum menjalankan aplikasi.

1. Salin file contoh konfigurasi yang sudah disediakan:
   ```bash
   cp .env.example .env
   ```
   *(Catatan untuk Windows: Jika `cp` tidak berfungsi, copy file `.env.example` secara manual di File Explorer, lalu *paste* dan ganti namanya menjadi `.env`)*
2. Buka file `.env` yang baru saja dibuat menggunakan *Code Editor* Anda (misal: VSCode).
3. **Lengkapi variabel-variabel penting berikut:**
   - **Database (`DB_USER`, `DB_PASSWORD`)**: Biarkan default, atau ubah *password*-nya jika Anda ingin. Docker akan otomatis membaca ini untuk membangkitkan server PostgreSQL.
   - **Google OAuth**: Isi `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` (Dapatkan dari Google Cloud Console). Tanpa ini, fitur Login/Register tidak akan berfungsi.
   - **Xendit (Payment)**: Isi `XENDIT_SECRET_KEY` dan `XENDIT_WEBHOOK_TOKEN`. Anda bisa mendapatkannya secara gratis dengan mendaftar di Dashboard Xendit (mode Test).
   - **AI Risk Engine**: Pastikan `AI_MODERATION_API_KEY` terisi dengan sembarang *password* rahasia (contoh: `my_super_secret_ai_key`). Kunci ini digunakan untuk mengamankan koneksi antara Backend dan Microservice AI.

### Langkah 3: Menjalankan Aplikasi (Docker Compose)
Pastikan aplikasi **Docker Desktop** Anda sudah terbuka dan berjalan *(running)*. Kemudian, jalankan perintah sakti ini di terminal Anda:
```bash
docker compose up --build -d
```
> **Catatan:** Perintah ini akan otomatis mengunduh PostgreSQL, Node.js (Frontend & Backend), Python (AI Risk Engine), beserta seluruh *dependencies*-nya (`npm install` & `pip install`). Anda cukup santai menunggu 3-10 menit tergantung kecepatan internet. Flag `-d` (*detached*) membuat aplikasi berjalan mulus di latar belakang.

### Langkah 4: Migrasi Struktur Database (Prisma)
Setelah semua *container* Docker menyala, database PostgreSQL Anda sebenarnya masih kosong tanpa tabel satupun. Anda wajib melakukan migrasi untuk membentuk tabel User, Donasi, dll:
```bash
docker exec -it komunitip-backend npx prisma migrate dev --name init
```
Tunggu beberapa saat. Jika terminal menampilkan pesan **"migration ran successfully"**, selamat! Aplikasi KomuniTip kini sudah siap digunakan secara utuh.

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
3. **Pesan Donasi Gagal Karena Error 400 / 503**
   - Periksa konsol backend: `docker compose logs -f backend-api`.
   - Periksa juga service AI: `docker compose logs -f ai-risk-engine`.
   - Pastikan `AI_MODERATION_API_KEY` sama di backend dan FastAPI, serta health check `http://localhost:8000/` mengembalikan `{"status":"ok","ai_loaded":true}`.

---
*© 2026 KomuniTip Build - Dioptimasi bersama AI.*
