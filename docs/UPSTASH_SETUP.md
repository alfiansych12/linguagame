# 🛡️ Upstash Redis Setup Guide - LinguaGame v3.0

Panduan lengkap untuk setup Upstash Redis sebagai layer keamanan DDoS protection.

---

## 📋 Step 1: Create Upstash Account

1. **Buka Browser** dan kunjungi: https://console.upstash.com
2. **Sign Up** menggunakan:
   - GitHub (Recommended - fastest)
   - Google
   - Email

3. **Verify Email** jika menggunakan email registration

---

## 🗄️ Step 2: Create Redis Database

### 2.1 Di Upstash Console Dashboard

1. Klik tombol **"Create Database"** (warna hijau/biru)

2. **Configure Database:**
   ```
   Name: linguagame-security
   Type: Regional (pilih region terdekat dengan Vercel deployment)
   Region: 
     - Asia Pacific (Singapore) - untuk Indonesia
     - US East (Virginia) - untuk global
   
   Eviction: No Eviction (default)
   TLS: Enabled (default - WAJIB untuk security)
   ```

3. Klik **"Create"**

### 2.2 Free Tier Limits (Cukup untuk Production!)
```
✅ 10,000 commands per day
✅ 256 MB storage
✅ TLS encryption
✅ Global replication (optional)
```

---

## 🔑 Step 3: Copy Credentials

### 3.1 Di Database Details Page

Setelah database dibuat, kamu akan melihat halaman detail. Cari section **"REST API"**:

```
REST API
├── UPSTASH_REDIS_REST_URL
│   └── https://your-db-xxxxx.upstash.io
└── UPSTASH_REDIS_REST_TOKEN
    └── AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
```

### 3.2 Copy ke `.env.local`

Buka file `.env.local` di root project dan tambahkan:

```env
# ============================================
# V3.0 SECURITY - UPSTASH REDIS (DDoS Protection)
# ============================================
UPSTASH_REDIS_REST_URL=https://your-actual-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYourActualTokenHere

# IMPORTANT: Jangan commit file ini ke GitHub!
# Pastikan .env.local ada di .gitignore
```

**⚠️ CRITICAL:** Ganti `your-actual-url` dan `AYourActualTokenHere` dengan nilai asli dari Upstash Console!

---

## 🧪 Step 4: Test Connection

### 4.1 Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Start ulang
npm run dev
```

### 4.2 Test di Browser Console

Buka halaman game dan submit score. Check terminal untuk log:

```
✅ GOOD: Tidak ada error "Redis connection failed"
❌ BAD: Error "ECONNREFUSED" atau "Invalid token"
```

---

## 🔒 Step 5: Vercel Deployment Setup

### 5.1 Add Environment Variables di Vercel

1. Buka **Vercel Dashboard** → Project Settings
2. Klik **"Environment Variables"**
3. Tambahkan 2 variables:

```
Name: UPSTASH_REDIS_REST_URL
Value: https://your-actual-url.upstash.io
Environment: Production, Preview, Development (centang semua)

Name: UPSTASH_REDIS_REST_TOKEN
Value: AYourActualTokenHere
Environment: Production, Preview, Development (centang semua)
```

4. Klik **"Save"**
5. **Redeploy** project untuk apply changes

---

## 📊 Step 6: Monitor Usage (Optional)

### Di Upstash Console → Database → Metrics

Kamu bisa lihat:
- **Commands per second** (traffic real-time)
- **Storage usage**
- **Latency** (response time)

Jika mendekati limit 10k/day, upgrade ke paid plan ($0.20/100k commands).

---

## 🚨 Troubleshooting

### Error: "Redis connection failed"
**Solusi:**
1. Check apakah URL dan Token sudah benar di `.env.local`
2. Pastikan tidak ada spasi atau quote (`"`) di sekitar value
3. Restart dev server

### Error: "TLS handshake failed"
**Solusi:**
1. Pastikan URL menggunakan `https://` (bukan `http://`)
2. Check firewall/antivirus tidak memblokir koneksi ke Upstash

### Error: "Rate limit exceeded"
**Solusi:**
1. Kamu sudah melebihi 10k commands/day
2. Tunggu 24 jam atau upgrade plan
3. Check apakah ada infinite loop di code yang memanggil Redis

---

## ✅ Verification Checklist

- [ ] Account Upstash sudah dibuat
- [ ] Database Redis sudah dibuat (region: Singapore/US East)
- [ ] Credentials sudah di-copy ke `.env.local`
- [ ] Dev server sudah di-restart
- [ ] Test submit score berhasil tanpa error
- [ ] Environment variables sudah ditambahkan di Vercel (jika deploy)

---

**Status:** READY FOR PRODUCTION 🚀

*Panduan ini dibuat untuk LinguaGame v3.0 - Titanium Fortress*
