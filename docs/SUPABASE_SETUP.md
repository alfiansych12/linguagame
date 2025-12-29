# 🗄️ Supabase Setup Guide - LinguaGame

## Step 1: Create Supabase Project

1. **Go to** [https://supabase.com](https://supabase.com)
2. **Sign in** with GitHub/Google
3. **Click "New Project"**
4. **Fill in details**:
   - Project Name: `linguagame` (atau nama lain)
   - Database Password: (Generate strong password, **SAVE IT!**)
   - Region: Pilih yang terdekat (e.g., Southeast Asia - Singapore)
   - Plan: Free tier (cukup untuk development)
5. **Wait ~2 minutes** untuk project setup

---

## Step 2: Get Connection String

1. Di dashboard Supabase, klik **Settings** (⚙️) di sidebar
2. Klik **Database**
3. Scroll ke **Connection string** section
4. Pilih tab **"URI"**
5. Copy connection string, contoh:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** dengan password yang Anda set tadi

---

## Step 3: Update `.env.local`

Update file `.env.local` di root project:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres"

# Direct connection for Prisma migrations (optional, untuk faster migrations)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-command-below"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Generate NEXTAUTH_SECRET

Run di terminal:
```bash
openssl rand -base64 32
```

Atau (Windows PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## Step 4: Run Prisma Migrations

Sekarang jalankan commands ini **secara berurutan**:

### 4.1. Generate Prisma Client
```bash
npx prisma generate
```

### 4.2. Create & Run Migration
```bash
npx prisma migrate dev --name init
```

Ini akan:
- ✅ Create migration file di `prisma/migrations/`
- ✅ Execute migration ke Supabase database
- ✅ Create semua tables (User, Level, Word, UserProgress, etc.)

### 4.3. Verify Tables (Optional)
Di Supabase Dashboard:
1. Klik **Table Editor** (📊) di sidebar
2. Anda seharusnya melihat tables:
   - `users`
   - `accounts`
   - `sessions`
   - `levels`
   - `words`
   - `user_progress`
   - `game_sessions`
   - `verification_tokens`

---

## Step 5: Seed Database (Optional - Recommended)

Create seed data untuk testing. File sudah ada di `prisma/seed.ts`.

### Run Seed:
```bash
npx prisma db seed
```

Ini akan populate database dengan:
- ✅ 4 Levels (Basics, Greetings, Food & Drinks, Daily Activities)
- ✅ ~40 Words across all levels
- ✅ Sample test data

---

## Step 6: Test Connection

Run di terminal:
```bash
npx prisma studio
```

Ini akan open Prisma Studio di browser (`http://localhost:5555`) dimana Anda bisa:
- ✅ View all tables
- ✅ Edit data manually
- ✅ Verify connection ke Supabase

---

## Troubleshooting

### Error: "Can't reach database server"
- ✅ Check internet connection
- ✅ Verify DATABASE_URL is correct
- ✅ Ensure Supabase project is still running
- ✅ Check if IP whitelisting required (usually not for Supabase)

### Error: "Invalid connection string"
- ✅ Make sure you replaced `[YOUR-PASSWORD]` with actual password
- ✅ Password harus di-encode jika ada special characters:
  - Contoh: `p@ssw0rd!` → `p%40ssw0rd%21`
  - Tool: https://www.urlencoder.org/

### Migration fails
```bash
# Reset database (WARNING: deletes all data!)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev --name init
```

---

## Google OAuth Setup (For NextAuth)

### 1. Go to Google Cloud Console
https://console.cloud.google.com/

### 2. Create New Project
- Project name: "LinguaGame"

### 3. Enable Google+ API
- APIs & Services → Library
- Search "Google+ API"
- Click Enable

### 4. Create OAuth Credentials
- APIs & Services → Credentials
- Click "Create Credentials" → "OAuth 2.0 Client ID"
- Application type: **Web application**
- Name: "LinguaGame Web"
- **Authorized JavaScript origins**:
  ```
  http://localhost:3000
  ```
- **Authorized redirect URIs**:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Click "Create"

### 5. Copy Client ID & Secret
- Copy **Client ID** → Paste ke `GOOGLE_CLIENT_ID` di `.env.local`
- Copy **Client secret** → Paste ke `GOOGLE_CLIENT_SECRET` di `.env.local`

---

## Verification Checklist

After setup, verify these:

- [ ] `npx prisma generate` runs without errors
- [ ] `npx prisma migrate dev` creates tables successfully
- [ ] `npx prisma studio` opens and shows tables
- [ ] Tables visible di Supabase Dashboard
- [ ] `.env.local` has all required variables
- [ ] Google OAuth credentials created

---

## Next: Query Database

Once setup complete, you can query dari Server Components atau Server Actions:

```typescript
import { prisma } from '@/lib/db/prisma';

// Get all levels
const levels = await prisma.level.findMany({
  where: { isPublished: true },
  orderBy: { orderIndex: 'asc' },
  include: { words: true }
});

// Get user with progress
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    progress: {
      include: { level: true }
    }
  }
});
```

---

**Setup Time**: ~10-15 minutes
**Status**: Ready for production-grade development! 🚀
