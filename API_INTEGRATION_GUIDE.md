# 🔌 Panduan Integrasi API Anti-Judol (Untuk Tim Backend / NestJS)

Dokumen ini adalah panduan singkat bagi developer Backend (NestJS) untuk mengonsumsi *Microservice* AI Anti-Judol berbasis FastAPI.

> [!IMPORTANT]
> Sistem AI ini dirancang dengan prinsip **Stateless**. Artinya, AI tidak menyimpan data donasi ke dalam database. Tugas AI hanyalah menerima teks, memprosesnya, dan mengembalikan vonis (CLEAR/HOLD/BLOCK). Penyimpanan riwayat donasi tetap menjadi tugas NestJS.

---

## 1. Spesifikasi Endpoint Utama

Digunakan untuk memvalidasi teks pesan donasi sebelum ditampilkan ke layar *Live Streaming*.

- **URL:** `POST http://<IP_PYTHON_SERVER>:8000/v1/evaluate`
- **Headers Wajib:**
  - `Content-Type: application/json`
  - `X-API-Key: rahasia-komunitip-123` *(Pastikan key ini sama dengan environment variable di server Python)*

### Payload Request (JSON)

| Field | Tipe | Wajib? | Keterangan |
|-------|------|--------|------------|
| `donation_id` | `string` | ✅ Ya | ID Unik donasi dari database NestJS (untuk *tracking*). |
| `raw_text` | `string` | ✅ Ya | Teks mentah dari donatur (maksimal 500 karakter). |
| `amount` | `integer` | ❌ Opsional | Nominal donasi dalam Rupiah (contoh: 10000). |
| `is_round_amount`| `boolean`| ❌ Opsional | `true` jika nominal bulat (contoh: 10k, 50k). Judol sering pakai nominal aneh seperti 12.345. |
| `donor_messages_last_10min` | `integer` | ❌ Opsional | Jumlah pesan donatur yang sama dalam 10 menit terakhir (Deteksi Spam). |

> [!TIP]
> Meskipun field seperti `amount` dan `is_round_amount` bersifat opsional, **sangat disarankan** agar NestJS mengirimkannya. Data ini membantu Layer-0 (Anomali Detektor) untuk mendeteksi spammer yang menyamarkan kata sandi dengan lebih akurat!

**Contoh Payload:**
```json
{
  "donation_id": "don_98765",
  "raw_text": "semoga sukses selalu ya kak! mampir pluto88",
  "amount": 10000,
  "is_round_amount": true,
  "donor_messages_last_10min": 1
}
```

### Payload Response (JSON)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `decision` | `string` | Keputusan akhir: **CLEAR** (Aman), **HOLD** (Tahan/Review), **BLOCK** (Pasti Judol). |
| `risk_score` | `integer` | Skor risiko 0-100. |
| `matched_keywords` | `array` | Daftar kata sandi judol yang terdeteksi (berguna untuk log admin). |
| `ai_confidence` | `float` | Tingkat keyakinan AI (hanya ada jika Layer-1 AI dipanggil). |

**Contoh Response:**
```json
{
  "donation_id": "don_98765",
  "decision": "BLOCK",
  "risk_score": 99,
  "matched_keywords": ["brand_pluto88"],
  "ai_confidence": 0.998,
  "execution_path": "Layer-1-AI"
}
```

---

## 2. Hal Kritis yang Harus Diperhatikan Tim NestJS

Tolong perhatikan skenario kegagalan (*Failure Scenarios*) berikut saat mengimplementasikan pemanggilan HTTP di NestJS:

### ⚠️ A. Implementasikan Timeout
Server Python memproses AI secara *real-time*. Meski sangat cepat (di bawah 100 milidetik), usahakan NestJS memberikan batas *timeout* HTTP sebesar **1.5 hingga 2 detik** untuk endpoint ini. Jangan sampai request yang menggantung membuat antrean event loop NestJS penuh.

### ⚠️ B. Strategi "Fail-Open" atau "Fail-Closed"
Apa yang terjadi jika server Python mati, *timeout*, atau membalas dengan status `500 Internal Server Error`?
NestJS harus memiliki penanganan *catch/try*. 
- **Saran Kami (Fail-Closed):** Jika AI tidak bisa dihubungi, otomatis set donasi tersebut menjadi status **HOLD** di database NestJS agar Admin bisa mereviewnya secara manual. Jangan langsung menampilkannya di layar (takutnya itu *spammer* yang sedang melakukan serangan *DDoS* berbarengan dengan spam donasi).

### ⚠️ C. Endpoint Health Check
Jika Anda menggunakan Docker Compose atau Kubernetes, NestJS bisa melakukan PING secara berkala ke:
- **URL:** `GET http://<IP_PYTHON_SERVER>:8000/`
- **Response:** `{"status": "ok", "ai_loaded": true}`
Ini berguna agar NestJS tahu kapan AI sudah siap melayani request (mengingat load model ONNX ke RAM butuh waktu sekitar 1-2 detik saat server Python baru dinyalakan).
