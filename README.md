# 🐧 KomuniTip - AI-Secured Streamer Donation Platform

KomuniTip adalah platform donasi pintar berbasis AI yang dirancang khusus untuk para *streamer* atau kreator konten *live-streaming*. Platform ini memastikan lingkungan siaran tetap aman dengan moderasi pesan donasi real-time menggunakan AI.

---

## 🏗️ Architecture & Tech Stack

Proyek ini menggunakan struktur **Monorepo** yang sepenuhnya berjalan di dalam **Docker**.

- **Frontend**: [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- **Email**: [Resend](https://resend.com/) (Transactional Email)
- **Auth**: [Google OAuth 2.0](https://console.cloud.google.com/) + JWT

---

## 🚀 Quick Start

Ikuti langkah-langkah di bawah ini untuk menjalankan project di mesin lokal Anda.

### 1. Prerequisites
Pastikan Anda sudah menginstal:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose

> [!NOTE]
> Anda tidak perlu menginstal Node.js, PostgreSQL, atau tools lain di host machine Anda. Semuanya sudah dibungkus di dalam Docker.

### 2. Clone Repository
```bash
git clone <repo-url>
cd komunitip
```

### 3. Environment Configuration
Salin file contoh konfigurasi dan isi nilai-nilainya.

```bash
cp .env.example .env
```

> [!IMPORTANT]
> Buka file `.env` dan lengkapi bagian **Google OAuth** dan **Resend SMTP (Mail)**. Tanpa ini, fitur Login Google dan Lupa Password tidak akan berfungsi.

### 4. Build & Run
Gunakan Docker Compose untuk membangun dan menjalankan semua kontainer sekaligus.

```bash
docker compose up --build -d
```

### 5. Database Migration
Setelah kontainer berjalan, jalankan migrasi Prisma untuk membuat tabel di database.

```bash
docker exec -it komunitip-backend npx prisma migrate dev --name init
```

---

## 🔗 Access Links

Setelah berhasil running, Anda dapat mengakses layanan berikut:

| Service | Host URL | Description |
|---|---|---|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | Web Application (User/Admin) |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | REST API Gateway |
| **API Docs** | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) | Swagger Documentation |
| **Adminer** | [http://localhost:8080](http://localhost:8080) | Database GUI (Login: Postgres) |

---

## 🛠️ Development Commands

### Mengelola Kontainer
- **Melihat Logs**: `docker compose logs -f backend-api`
- **Mematikan Sistem**: `docker compose down`

### Prisma & Database
- **Sinkronisasi Schema**: `docker exec -it komunitip-backend npx prisma generate`
- **Prisma Studio (GUI)**: `docker exec -it komunitip-backend npx prisma studio`

### Menambah Package (Dependencies)
Jika ingin menambah library baru, jalankan via Docker agar tersinkronisasi:
```bash
# Contoh menambah axios di backend
docker exec -it komunitip-backend npm install axios

# Lalu build ulang agar perubahan menetap di image
docker compose up --build -d
```

---

## 👨‍💻 Kontributor
- **Muhammad Irsyad Mustaqim** (Project Manager)
- [Tim Developer KomuniTip]

---
*© 2026 KomuniTip. All rights reserved.*
