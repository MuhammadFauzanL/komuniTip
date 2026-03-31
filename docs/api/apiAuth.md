# Spesifikasi API KomuniTip - Autentikasi

**Base URL:** `https://api.komunitip.id/v1`  
**Content-Type:** `application/json`

---

## 1. Registrasi Akun Baru (Register)
Endpoint ini digunakan untuk mendaftarkan kreator baru menggunakan email dan password.

- **URL:** `/auth/register`
- **Method:** `POST`

### Request Body
```json
{
  "full_name": "Ihsan",
  "username": "ihsan_kreator",
  "email": "nama@email.com",
  "password": "SecretPassword123!",
  "password_confirmation": "SecretPassword123!",
  "terms_accepted": true
}
```

### Response
#### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Akun berhasil dibuat.",
  "data": {
    "user": {
      "id": "usr_12345abcde",
      "full_name": "Ihsan",
      "username": "ihsan_kreator",
      "email": "nama@email.com"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```

#### Error Response (400 Bad Request - Validasi Gagal)
```json
{
  "status": "error",
  "message": "Validasi gagal.",
  "errors": {
    "email": ["Email sudah terdaftar."],
    "password": ["Password minimal 8 karakter."]
  }
}
```

---

## 2. Login Reguler
Endpoint ini digunakan untuk masuk ke dashboard menggunakan email dan password.

- **URL:** `/auth/login`
- **Method:** `POST`

### Request Body
```json
{
  "email": "nama@email.com",
  "password": "SecretPassword123!",
  "remember_me": true 
}
```
> **Catatan:** `remember_me` opsional, digunakan untuk mengatur durasi kedaluwarsa token.

### Response
#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": "usr_12345abcde",
      "full_name": "Ihsan",
      "username": "ihsan_kreator",
      "email": "nama@email.com"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```

#### Error Response (401 Unauthorized)
```json
{
  "status": "error",
  "message": "Email atau password salah."
}
```

---

## 3. Login / Register dengan Google (OAuth)
Endpoint ini digunakan untuk memproses autentikasi melalui Google. Biasanya, frontend akan mengirimkan Google Access Token atau ID Token yang didapat dari Google SDK ke backend untuk divalidasi.

- **URL:** `/auth/google`
- **Method:** `POST`

### Request Body
```json
{
  "google_token": "ya29.a0AfH6SMD..." 
}
```

### Response
#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Autentikasi Google berhasil.",
  "data": {
    "user": {
      "id": "usr_98765vwxyz",
      "full_name": "Ihsan Google",
      "username": "ihsan_g",
      "email": "ihsan@gmail.com"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "is_new_user": false 
  }
}
```
> **Catatan:** Flag `is_new_user` bisa ditambahkan agar frontend tahu apakah harus mengarahkan user ke halaman onboarding/pengaturan username setelah login Google.

---

## 4. Lupa Password (Forgot Password)
Endpoint ini digunakan untuk mengirimkan link reset password ke email pengguna.

- **URL:** `/auth/forgot-password`
- **Method:** `POST`

### Request Body
```json
{
  "email": "nama@email.com"
}
```

### Response
#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Jika email terdaftar, link reset password telah dikirimkan."
}
```
> **Catatan Keamanan:** Gunakan pesan sukses yang ambigu meskipun email tidak ditemukan di database untuk mencegah serangan enumerasi email.

#### Error Response (400 Bad Request)
```json
{
  "status": "error",
  "message": "Format email tidak valid."
}
```
