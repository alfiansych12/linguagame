# 🛠️ Panduan Registrasi & Integrasi Midtrans (Sandbox)

Ikuti langkah-langkah di bawah ini untuk mendapatkan **API Key Midtrans** agar fitur pembayaran **Quantum PRO** bisa langsung berjalan.

---

### 1. Cara Mengisi Form Registrasi
Buka [dashboard.midtrans.com/register](https://dashboard.midtrans.com/register) dan isi datanya seperti ini:

| Field | Cara Isi (Rekomendasi) |
| :--- | :--- |
| **Business name** | Isi dengan nama game Bro, misal: `LinguaGame` atau `Quantum Language` |
| **Business owner full name** | Isi dengan nama lengkap Bro sendiri |
| **Business email** | Gunakan email aktif (Gmail/Yahoo/dll) |
| **Business phone number** | Isi nomor HP yang aktif (+62...) |
| **Business entity** | Pilih: **"I am online/offline business owner, and my business has no business entity."** (Ini untuk perorangan/individu agar lebih cepat) |
| **Password** | Buat password kuat (Contoh: `QuantumGame2026!`) |
| **Password confirmation** | Ketik ulang password yang sama |

---

### 2. Cara Mendapatkan API Key
Setelah verifikasi email dan masuk ke Dashboard:

1.  Pastikan status di pojok kiri atas adalah **"SANDBOX"** (Warna kuning). Jangan "Production" dulu untuk testing.
2.  Pergi ke menu **Settings** > **Access Keys**.
3.  Di sana Bro akan melihat:
    *   **Client Key** (Contoh: `SB-Mid-client-XXXXXXXX`)
    *   **Server Key** (Contoh: `SB-Mid-server-XXXXXXXX`)

---

### 3. Cara Pasang di Project
Buka file `.env.local` di folder project Bro, lalu tambahkan/update baris berikut:

```env
# MIDTRANS API KEYS (SANDBOX)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="MASUKKAN_CLIENT_KEY_DI_SINI"
MIDTRANS_SERVER_KEY="MASUKKAN_SERVER_KEY_DI_SINI"
```

---

### 4. Cara Tes Pembayaran
Setelah dipasang, Bro bisa tes beli paket PRO:
1. Klik tombol **GAS UPGRADE** di halaman `/pro`.
2. Muncul pop-up Midtrans (Snap).
3. Pilih metode **QRIS** (paling gampang).
4. Gunakan simulator pembayaran (Link simulator biasanya ada di Dashboard Midtrans bagian **Technical Settings** > **Simulation**).

---

📡 *System Status: READY TO MONETIZE. Langsung gas registrasi, Bro!* 🚀💸🦾
