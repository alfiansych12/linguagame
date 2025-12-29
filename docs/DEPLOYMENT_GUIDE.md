# 🚀 Tutorial Deploy LinguaGame ke Vercel

Tutorial lengkap deploy aplikasi LinguaGame ke production (Vercel + Supabase + Google OAuth).

---

## 📋 Prerequisites

Yang harus kamu punya sebelum mulai:
- ✅ Akun GitHub (gratis)
- ✅ Akun Vercel (gratis, sign up pakai GitHub)
- ✅ Akun Supabase (gratis)
- ✅ Akun Google Cloud Console (gratis)
- ✅ Code LinguaGame sudah ready di local

---

## 🔥 STEP 1: Push Code ke GitHub

### 1.1 Buat Repository Baru di GitHub
1. Buka https://github.com/new
2. Isi nama repository: `linguagame` (atau terserah kamu)
3. Set visibility: **Public** atau **Private** (terserah)
4. **JANGAN** centang "Add README" atau .gitignore
5. Klik **"Create repository"**

### 1.2 Push Code dari Local
Buka terminal di folder project (`c:\antigravity\learning-web`), lalu jalankan:

```bash
# Initialize git (kalau belum)
git init

# Add semua files
git add .

# Commit
git commit -m "Initial commit - LinguaGame ready for deployment"

# Add remote (ganti URL dengan repository kamu)
git remote add origin https://github.com/USERNAME/linguagame.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

✅ **Verify**: Buka repository di GitHub, pastikan semua code sudah ke-upload.

---

## 🗄️ STEP 2: Setup Supabase Production

### 2.1 Create New Supabase Project
1. Login ke https://supabase.com/dashboard
2. Klik **"New Project"**
3. Isi detail:
   - **Name**: `linguagame-prod` (atau terserah)
   - **Database Password**: [Bikin password kuat, SIMPAN di notepad]
   - **Region**: Pilih terdekat (contoh: `Southeast Asia (Singapore)`)
4. Klik **"Create new project"**
5. **Tunggu 2-3 menit** sampai project ready

### 2.2 Get Supabase Credentials
1. Di dashboard project, klik **Settings** → **API**
2. Copy dan simpan:
   - ✅ **Project URL** (contoh: `https://abcdefgh.supabase.co`)
   - ✅ **anon/public key** (mulai dengan `eyJ...`)

### 2.3 Run SQL Schema
1. Di dashboard Supabase, klik **SQL Editor** (icon `</>` di sidebar)
2. Klik **"New Query"**
3. Buka file `docs/SUPABASE_SCHEMA.sql` dari project kamu
4. **Copy semua isinya** dan paste ke SQL Editor
5. Klik **"Run"** (atau tekan `Ctrl+Enter`)
6. ✅ Verify: Klik **Database** → **Tables**, pastikan ada tabel:
   - `users`
   - `duel_rooms`
   - `duel_players`
   - `user_progress`
   - `referrals`
   - `user_quests`

---

## 🔐 STEP 3: Setup Google OAuth (Production)

### 3.1 Buat OAuth Credentials
1. Buka https://console.cloud.google.com/
2. Buat project baru atau pilih existing project
3. Di sidebar, klik **APIs & Services** → **Credentials**
4. Klik **"Create Credentials"** → **"OAuth client ID"**
5. Pilih **Application type**: **Web application**
6. Isi:
   - **Name**: `LinguaGame Production`
   - **Authorized JavaScript origins**: 
     ```
     https://linguagame.vercel.app
     ```
     (Ganti `linguagame` dengan nama app Vercel kamu nanti)
   - **Authorized redirect URIs**:
     ```
     https://linguagame.vercel.app/api/auth/callback/google
     ```
7. Klik **"Create"**
8. **SIMPAN**:
   - ✅ **Client ID** (mulai dengan `123456...apps.googleusercontent.com`)
   - ✅ **Client Secret** (string random)

> ⚠️ **PENTING**: Kamu bisa update redirect URIs nanti setelah tau URL Vercel yang sebenarnya!

---

## 🚀 STEP 4: Deploy ke Vercel

### 4.1 Import Project ke Vercel
1. Login ke https://vercel.com (sign in pakai GitHub kamu)
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository **linguagame** (atau nama repo kamu)
4. Klik **"Import"**

### 4.2 Configure Build Settings
Vercel auto-detect Next.js, tapi pastikan:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### 4.3 Add Environment Variables
**JANGAN klik Deploy dulu!** Scroll ke bawah ke section **Environment Variables**.

Tambahkan satu per satu (klik **"Add another"** untuk tambah baris):

| **Key** | **Value** | **Notes** |
|---------|-----------|-----------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres` | Ganti `[PASSWORD]` dan `[PROJECT-REF]` dari Supabase |
| `DIRECT_URL` | (sama dengan `DATABASE_URL`) | |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` | Dari Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Dari Supabase Settings → API |
| `NEXTAUTH_URL` | `https://linguagame.vercel.app` | URL app kamu (dapat setelah deploy) |
| `NEXTAUTH_SECRET` | (generate random string) | Buat pakai: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | `123456...apps.googleusercontent.com` | Dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Dari Google Cloud Console |

> 💡 **Untuk `NEXTAUTH_SECRET`**: Buka terminal dan run:
> ```bash
> openssl rand -base64 32
> ```
> Copy output-nya (contoh: `abcd1234efgh5678...`)

### 4.4 Deploy!
1. Pastikan semua env variables sudah benar
2. Klik **"Deploy"**
3. **Tunggu 2-5 menit** (Vercel akan build app kamu)
4. ✅ Success! Kamu akan dapat URL deployment (contoh: `https://linguagame-abc123.vercel.app`)

---

## 🔧 STEP 5: Update Redirect URIs

### 5.1 Update Google OAuth
Setelah deploy, kamu dapat URL resmi dari Vercel (contoh: `https://linguagame-abc123.vercel.app`)

1. Balik ke **Google Cloud Console** → **Credentials**
2. Klik OAuth Client ID yang tadi kamu buat
3. Update **Authorized JavaScript origins** dan **Authorized redirect URIs** dengan URL Vercel yang SEBENARNYA:
   ```
   https://linguagame-abc123.vercel.app
   https://linguagame-abc123.vercel.app/api/auth/callback/google
   ```
4. Klik **"Save"**

### 5.2 Update Vercel Environment Variable
1. Di Vercel dashboard, buka project kamu
2. Klik **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL` → Update dengan URL Vercel yang sebenarnya
4. Klik **"Save"**
5. ⚠️ **PENTING**: Klik **"Redeploy"** agar perubahan env variable berlaku

---

## ✅ STEP 6: Testing

### 6.1 Test Basic Functionality
1. Buka URL production app kamu
2. Test:
   - ✅ Homepage load dengan baik
   - ✅ Navigation bekerja (Misi, Arena, Forge, Profile, Sirkel Board)
   - ✅ Login Google bekerja
   - ✅ Data user tersimpan di Supabase
   - ✅ Leaderboard menampilkan anonymous names

### 6.2 Test Arena Realtime
1. Buka app di 2 browser/tab berbeda
2. Buat duel room di satu tab
3. Join dari tab lain
4. Verify realtime sync bekerja

### 6.3 Test Shop & Crystal System
1. Login
2. Buka Crystal Forge
3. Test purchase skill crystal
4. Verify inventory tersimpan

---

## 🔄 STEP 7: Future Updates

Setiap kali kamu update code:

1. **Commit & Push ke GitHub**:
   ```bash
   git add .
   git commit -m "Update feature XYZ"
   git push
   ```

2. **Auto Deploy**: Vercel akan otomatis detect push baru dan deploy ulang! ✨

3. **Monitoring**: Cek deployment di Vercel dashboard → **Deployments**

---

## 🆘 Troubleshooting

### Error: "Invalid redirect URI"
- ✅ Pastikan redirect URIs di Google Cloud Console cocok PERSIS dengan URL Vercel (termasuk https://)

### Error: "Database connection failed"
- ✅ Cek `DATABASE_URL` di Vercel env variables
- ✅ Pastikan password Supabase benar
- ✅ Cek Supabase project masih aktif

### Error: "NEXTAUTH_SECRET is not set"
- ✅ Generate ulang pakai `openssl rand -base64 32`
- ✅ Add ke Vercel env variables
- ✅ Redeploy

### Arena Realtime tidak jalan
- ✅ Pastikan sudah run SQL schema (`alter publication supabase_realtime add table...`)
- ✅ Cek Supabase Realtime enabled (biasanya auto-enabled)

---

## 🎉 Selesai!

App kamu sekarang **LIVE** dan bisa diakses siapa aja! 🚀

**Next Steps:**
- 🔗 Share link app ke teman-teman
- 📊 Monitor analytics di Vercel
- 🐛 Fix bugs yang muncul di production
- ✨ Add more features!

**Literally deployed!** 💅🔥

---

## 📞 Need Help?

Kalau ada error atau stuck di step manapun, tanya aja! Include:
- Step mana yang error
- Screenshot error message
- Environment yang kamu pakai (Windows/Mac/Linux)

Good luck! 🍀
