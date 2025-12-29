# 🔑 Environment Variables Guide - LinguaGame

Panduan lengkap cara dapetin VALUE untuk setiap environment variable yang dibutuhkan di Vercel.

---

## 📝 Daftar Environment Variables yang Dibutuhkan

Total: **8 variables**

---

## 1️⃣ `DATABASE_URL`

### **Key Name:**
```
DATABASE_URL
```

### **Cara Dapetin Value:**

1. Login ke https://supabase.com/dashboard
2. Pilih project **linguagame-prod** (yang kamu buat di Step 2)
3. Klik **Settings** (icon ⚙️ di sidebar kiri bawah)
4. Klik **Database**
5. Scroll ke **Connection string** section
6. Pilih **"Direct connection"** (BUKAN Session pooling)
7. Copy string yang ada
8. **IMPORTANT**: Ganti `[YOUR-PASSWORD]` dengan password database yang kamu bikin pas create project

### **Format Value:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### **Contoh:**
```
postgresql://postgres:mySecurePass123@db.jubjjawlzwlpisybuzze.supabase.co:5432/postgres
```

**❗ Pastikan:**
- ✅ Pilih **"Direct connection"** (port 5432)
- ✅ Ganti `[YOUR-PASSWORD]` dengan password asli kamu
- ✅ Jangan pakai Session pooling (port 6543)

---

## 2️⃣ `DIRECT_URL`

### **Key Name:**
```
DIRECT_URL
```

### **Cara Dapetin Value:**

**SAMA PERSIS dengan `DATABASE_URL`!** Copy-paste value yang sama.

### **Value:**
```
(sama dengan DATABASE_URL)
```

---

## 3️⃣ `NEXT_PUBLIC_SUPABASE_URL`

### **Key Name:**
```
NEXT_PUBLIC_SUPABASE_URL
```

### **Cara Dapetin Value:**

1. Di Supabase dashboard → Project linguagame-prod
2. Klik **Settings** → **API**
3. Di section **Project URL**, copy URL-nya

### **Format Value:**
```
https://abcdefgh.supabase.co
```

### **Contoh:**
```
https://xyzabc123.supabase.co
```

---

## 4️⃣ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Key Name:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Cara Dapetin Value:**

1. Di Supabase dashboard → Project linguagame-prod
2. Klik **Settings** → **API**
3. Di section **Project API keys**
4. Copy key yang ada label **`anon` `public`**
5. Key ini **PANJANG BANGET** (mulai dengan `eyJ...`)

### **Format Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk5NjM2MDAsImV4cCI6MjAwNTUzOTYwMH0.ABC123xyz...
```

### **Contoh:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAzOTAwMDAwLCJleHAiOjIwMTk0NzYwMDB9.verylongstringhere...
```

**❗ Ini string SANGAT panjang (300+ karakter), copy sampai habis!**

---

## 5️⃣ `NEXTAUTH_URL`

### **Key Name:**
```
NEXTAUTH_URL
```

### **Cara Dapetin Value:**

**Kamu belum bisa dapetin ini sekarang!** URL ini baru ada **SETELAH** deploy pertama kali ke Vercel.

### **Untuk Sekarang (Deploy Pertama):**

Isi dengan **PLACEHOLDER** dulu (nanti update setelah deploy):

```
https://linguagame.vercel.app
```

### **Setelah Deploy:**

1. Vercel akan kasih URL deployment (contoh: `https://linguagame-abc123.vercel.app`)
2. **Update** variable ini dengan URL yang sebenarnya
3. Klik **Redeploy** di Vercel

### **Format Value:**
```
https://[YOUR-APP-NAME].vercel.app
```

**❗ WAJIB pakai `https://`, bukan `http://`**

---

## 6️⃣ `NEXTAUTH_SECRET`

### **Key Name:**
```
NEXTAUTH_SECRET
```

### **Cara Dapetin Value:**

**Generate random string pakai command:**

### **Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### **Mac/Linux:**
```bash
openssl rand -base64 32
```

### **Atau pakai Online Generator:**
1. Buka: https://generate-secret.vercel.app/32
2. Copy string yang muncul

### **Format Value:**
```
RandomString123ABC456DEF789GHI012JKL345MNO=
```

### **Contoh:**
```
a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2=
```

**❗ Harus random dan unik! Jangan pakai contoh di atas!**

---

## 7️⃣ `GOOGLE_CLIENT_ID`

### **Key Name:**
```
GOOGLE_CLIENT_ID
```

### **Cara Dapetin Value:**

1. Buka https://console.cloud.google.com/
2. Pilih project (atau buat baru)
3. Di sidebar kiri, klik **APIs & Services** → **Credentials**
4. Klik **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Name: `LinguaGame Production`
7. **Authorized JavaScript origins**:
   ```
   https://linguagame.vercel.app
   ```
   (Update nanti setelah tau URL Vercel yang sebenarnya)

8. **Authorized redirect URIs**:
   ```
   https://linguagame.vercel.app/api/auth/callback/google
   ```
   (Update nanti setelah tau URL Vercel yang sebenarnya)

9. Klik **Create**
10. **Copy Client ID** yang muncul

### **Format Value:**
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

### **Contoh:**
```
987654321098-xyzabcdefghijklmnop123456789012.apps.googleusercontent.com
```

---

## 8️⃣ `GOOGLE_CLIENT_SECRET`

### **Key Name:**
```
GOOGLE_CLIENT_SECRET
```

### **Cara Dapetin Value:**

**Saat yang sama dengan dapetin Client ID di atas:**

1. Setelah klik **Create** di Google Cloud Console
2. Modal popup akan muncul
3. Ada 2 value:
   - **Client ID** (yang tadi)
   - **Client Secret** ← Copy yang ini!

### **Format Value:**
```
GOCSPX-ABCdefGHIjklMNOpqrSTUvwxYZ123
```

### **Contoh:**
```
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Qr
```

**❗ Kalau modal udah ketutup:**
1. Klik nama OAuth client yang baru kamu buat
2. Client Secret ada di section **Additional information**

---

## ✅ Checklist Lengkap

Sebelum deploy, pastikan sudah punya semua value ini:

- [ ] `DATABASE_URL` - Connection string Supabase
- [ ] `DIRECT_URL` - Sama dengan DATABASE_URL
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase project
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key Supabase (long string)
- [ ] `NEXTAUTH_URL` - Placeholder dulu (update setelah deploy)
- [ ] `NEXTAUTH_SECRET` - Random generated string
- [ ] `GOOGLE_CLIENT_ID` - OAuth Client ID
- [ ] `GOOGLE_CLIENT_SECRET` - OAuth Client Secret

---

## 📋 Template Copy-Paste untuk Vercel

Copy template ini, lalu ganti VALUE-nya dengan nilai yang kamu dapetin:

```
Key: DATABASE_URL
Value: postgresql://postgres:[YOUR-PASSWORD]@db.jubjjawlzwlpisybuzze.supabase.co:5432/postgres

Key: DIRECT_URL
Value: (sama dengan DATABASE_URL)

Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://jubjjawlzwlpisybuzze.supabase.co

Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Key: NEXTAUTH_URL
Value: https://linguagame.vercel.app

Key: NEXTAUTH_SECRET
Value: [generated-random-string]

Key: GOOGLE_CLIENT_ID
Value: 123456789012-abc...apps.googleusercontent.com

Key: GOOGLE_CLIENT_SECRET
Value: GOCSPX-...
```

---

## 🆘 Troubleshooting

### **"Database password incorrect"**
- Cek lagi password yang kamu input pas create Supabase project
- Password case-sensitive!

### **"Supabase connection failed"**
- Pastikan copy connection string yang **URI** bukan **Session**
- Pastikan ganti `[YOUR-PASSWORD]` dengan password asli

### **"Invalid NEXTAUTH_SECRET"**
- Generate ulang pakai command
- Pastikan ga ada spasi di awal/akhir

### **"Google OAuth redirect_uri_mismatch"**
- Update Authorized redirect URIs di Google Cloud Console
- Pastikan URL-nya PERSIS sama dengan URL Vercel (termasuk https://)

---

## 🎯 Next Step

Setelah semua value sudah ready:
1. Buka Vercel dashboard
2. Import project GitHub
3. Scroll ke **Environment Variables**
4. Copy-paste KEY dan VALUE satu per satu
5. Klik **Deploy**!

**Literally ready to deploy!** 🚀
