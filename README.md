# KomuniTip - AI-Secured Streamer Donation Platform

KomuniTip adalah platform donasi pintar berbasis AI yang dirancang khusus untuk para *streamer* atau kreator konten *live-streaming*. 

## 🎯 Latar Belakang & Solusi

Saat ini, platform donasi untuk *streamer* sering kali dimanfaatkan oleh pihak tidak bertanggung jawab untuk mengirimkan pesan promosi ilegal (seperti judi online) atau kata-kata tidak pantas yang muncul secara bebas di layar siaran langsung.

Untuk mengatasi hal tersebut, KomuniTip mengintegrasikan **sistem moderasi AI real-time**. Setiap pesan donasi dari audiens akan divalidasi secara otomatis. Jika AI mendeteksi konten yang melanggar (judol/spam/kata kotor), transaksi donasi akan dihentikan sebelum uang terpotong, memastikan lingkungan *live-streaming* tetap aman, bersih, dan mematuhi pedoman komunitas.

## ✨ Fitur Utama

- **Sistem Validasi Pesan AI (*AI Moderation Core*):** Menganalisa dan memblokir teks pesanan dalam waktu kurang dari 1.5 detik (*low latency*).
- **Notifikasi & Overlay OBS Real-Time:** Integrasi langsung melalui Browser Source (WebSockets) untuk memunculkan notifikasi donasi instan di layar siaran.
- **Dashboard Pengelolaan Streamer:** Pusat kontrol sederhana untuk memantau ringkasan pendapatan, riwayat donasi sukses, dan daftar pesan spam yang berhasil diblokir.
- **Beragam Metode Pembayaran:** Memudahkan donatur untuk mendukung *streamer* favorit menggunakan QRIS, E-Wallet, atau Transfer Bank.
- **Penarikan Dana Cepat (*Withdrawal*):** *Streamer* dapat mencairkan saldo donasi ke rekening bank atau dompet digital pribadi.

## 📚 Dokumentasi Lebih Lanjut

Untuk mengetahui perancangan produk dan struktur API, silakan merujuk pada dokumentasi berikut:
- [Product Requirements Document (PRD)](docs/PRD.md)
- [Spesifikasi API - Autentikasi](docs/api/apiAuth.md)

---

## 👨‍💻 Tim Developer

<table>
  <tr>
    <td>
      <h3>Muhammad Irsyad Mustaqim</h3>
      <p><strong>Project Manager</strong></p>
      <a href="https://github.com/IrsyadmTqM"><img src="https://img.shields.io/badge/GitHub-IrsyadmTqM-181717?logo=github&style=flat-square" alt="GitHub"/></a>
    </td>
    <td>
      <h3>[Nama Developer 1]</h3>
      <p><strong>UI/UX</strong></p>
      <a href="https://github.com/[username]"><img src="https://img.shields.io/badge/GitHub-[username]-181717?logo=github&style=flat-square" alt="GitHub"/></a>
    </td>
    <td>
      <h3>[Nama Developer 2]</h3>
      <p><strong>Frontend</strong></p>
      <a href="https://github.com/[username]"><img src="https://img.shields.io/badge/GitHub-[username]-181717?logo=github&style=flat-square" alt="GitHub"/></a>
    </td>
  </tr>
  <tr>
    <td>
      <h3>[Nama Developer 3]</h3>
      <p><strong>Backend</strong></p>
      <a href="https://github.com/[username]"><img src="https://img.shields.io/badge/GitHub-[username]-181717?logo=github&style=flat-square" alt="GitHub"/></a>
    </td>
    <td>
      <h3>[Nama Developer 4]</h3>
      <p><strong>AI Engineer</strong></p>
      <a href="https://github.com/[username]"><img src="https://img.shields.io/badge/GitHub-[username]-181717?logo=github&style=flat-square" alt="GitHub"/></a>
    </td>
    <td>
      <h3>[Nama Developer 5]</h3>
      <p><strong>DevOps, QA</strong></p>
      <a href="https://github.com/[username]"><img src="https://img.shields.io/badge/GitHub-[username]-181717?logo=github&style=flat-square" alt="GitHub"/></a>
    </td>
  </tr>
</table>


# Komunitip

Donation & streaming platform — monorepo containing backend API and frontend web app.

## Architecture

```
komunitip/
├── backend/       → NestJS API (TypeScript + Prisma + PostgreSQL)
├── frontend/      → Vue.js Web App (coming soon)
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- That's it! No Node.js required locally.

### 1. Clone & Configure
```bash
git clone <repo-url>
cd komunitip
cp .env.example .env
# Edit .env with your actual credentials
```

### 2. Start All Services
```bash
docker compose up --build -d
```

### 3. Access
| Service | URL |
|---|---|
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |
| Adminer (DB GUI) | http://localhost:8080 |

### Adding Dependencies
```bash
# Install new package (via Docker)
docker exec -it komunitip-backend npm install --save <package-name>

# Then rebuild to bake into image
docker compose up --build -d
```

### Prisma Commands
```bash
# Run migrations
docker exec -it komunitip-backend npx prisma migrate dev --name <migration_name>

# Generate client
docker exec -it komunitip-backend npx prisma generate

# Open Prisma Studio
docker exec -it komunitip-backend npx prisma studio
```

### Dev Container (Recommended)
Open this project in VS Code/Cursor → Command Palette → **"Reopen in Container"** for full IntelliSense inside Docker.
