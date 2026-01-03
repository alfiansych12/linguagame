# 📔 Panduan Teknis & Fitur LinguaGame

Dokumen ini disusun untuk memberikan pemahaman mendalam bagi programmer selanjutnya mengenai sistem dan fitur yang ada di dalam LinguaGame.

---

## ⚠️ PENTING: Sinkronisasi Database
**Setiap programmer atau AI yang melakukan perubahan struktur database (migration) lewat Supabase Dashboard atau RPC, WAJIB memperbarui file `docs/SUPABASE.sql`.**
- Pastikan file `docs/SUPABASE.sql` selalu mencerminkan kondisi real 100% dari database produksi/staging.
- Jika menambahkan kolom baru, tabel baru, atau fungsi (RPC) baru, segera catat di file tersebut agar tidak terjadi inkonsistensi saat analisis sistem di masa depan.

---

## 🚀 Teknologi Inti (Tech Stack)
- **Framework:** Next.js 15+ (App Router)
- **Database:** Supabase (PostgreSQL + RLS)
- **Autentikasi:** NextAuth.js (Google Provider)
- **Styling:** Tailwind CSS 4.0 (Aesthetic: Tactical/Futuristic)
- **State Management:** Zustand (User Progress, Sound System, UI State)
- **Animasi:** Framer Motion
- **Payment Gateway:** Midtrans (Snap)
- **Security:** Upstash Redis (Rate Limiting) & Google AdSense

---

## 🛠️ Ringkasan Fitur Utama

### 1. Sistem Autentikasi & Sesi
- Login menggunakan Google OAuth.
- Middleware otomatis memproteksi rute `/profile` dan rute `/admin`.
- Sesi menyimpan data real-time (XP, Gems, Streak) yang di-sync setiap kali user aktif.

### 2. profil & Progres Node (User)
- **XP System:** Akumulasi pengalaman dari bermain game. Membuka rank baru (e.g., Node -> Core -> Sepuh).
- **Gems System:** Mata uang virtual untuk membeli item di Shop dan bantuan dalam game.
- **Streak System:** Menghitung hari berturut-turut user aktif.
- **Heartbeat (User Pulse):** Sistem background yang memperbarui `last_login_at` setiap 5 menit untuk pelacakan admin secara real-time.

### 3. Sistem Game (Mainframe Games)
- **Vocabulary Game:** Game menebak kata dengan kategori yang dinamis.
- **Speed Blitz:** Game kecepatan respons untuk menguji fokus.
- Setiap skor yang dikirim diverifikasi melalui Server Actions untuk mencegah manipulasi data client-side.

### 4. HQ Control Center (Admin Dashboard)
Akses: `/admin` (Hanya untuk user dengan `is_admin: true`)
- **Intelijen Quantum:** Visualisasi data menggunakan Chart.js (Engagement, Growth, Wealth, Distribution). Data ditarik real-time dari database.
- **Radar Node:** Pemantauan user aktif dengan status visual (Live, Recent, Offline). Dilengkapi fitur filtering berdasarkan waktu aktif.
- **Payment Gateway:** Integrasi Midtrans (library `midtrans-client`) untuk transaksi PRO membership.
- **Promo & Broadcast Hub:**
    - Manajemen kode promo (Redeem Code) untuk XP/Gems.
    - Pengiriman pengumuman global ke seluruh user.

### 5. Sistem Kustomisasi (Unlocks)
- **Border Unlocks:** Frame profil yang terbuka berdasarkan pencapaian atau XP tertentu.
- **Title System:** Gelar unik yang muncul di profil berdasarkan rank.

---

## 🗄️ Struktur Database Utama (Supabase)
- `users`: Data inti user (ID, Email, XP, Gems, Last Login, Admin status).
- `redeem_codes`: Database kode promo dan status penggunaannya.
- `announcements`: Riwayat pesan broadcast global.
- `user_achievements`: Pivot table untuk melacak pencapaian setiap node.

---

## 📡 Integritas Data & Keamanan
- **Server Actions:** Semua mutasi data (update score, redeem code, admin action) WAJIB melalui server actions di folder `@/app/actions`.
- **Zod Validation:** Setiap input dari user divalidasi menggunakan Zod schema sebelum diproses oleh server.
- **Auth Guard:** Middleware mengecek status admin menggunakan flag `isAdmin` dari sesi token JWT.

---

## 🎨 Standar Design UI
- Mengacu pada `docs/RESPONSIVE_STANDARDS.md`.
- Palette: Dark Mode (#06060a) dengan aksen Primary (#00b7ff) dan Success (#10b981).
- Font: Inter/Outfit dengan gaya typography **Heavy/Black** untuk elemen taktis.

---

*Selamat mengoding, Node selanjutnya! Tetap jaga frekuensi bro.* 📡🛡️⚡

---

## 👑 RIWAYAT PENGEMBANGAN SISTEM (VERSION HISTORY)

### 🟢 v1.0: Foundation & Auth
**Fokus: Infrastruktur Dasar & Autentikasi**
- **Branding Migration:** Migrasi terminologi "Sirkel" menjadi "bro".
- **Server-Side Authority:** Memindahkan logika sensitif ke Server Actions.
- **Fix 401 Unauthorized:** Menggunakan `supabaseAdmin` di server untuk operasi aman.
- **Suspense Boundaries & Dynamic Rendering:** Stabilitas build Vercel.
- **Admin Hub:** Command Hub untuk promo code & broadcast sistem.

### 🟢 v1.1: Mainframe Redesign
**Fokus: UI/UX Tactical & Responsivitas**
- **Vocab Mode Redesign:** "Tactical Glass" UI, indikator Signal Strength, animasi Data Flow.
- **Responsivitas:** Layout satu kolom untuk mobile, dynamic font scaling 60px.
- **UI Refinement:** Decluttering, borderless layout, dan button overhaul ("LAUNCH MISSION").
- **Holographic Background:** Integrasi Quantum Grid wallpaper.

### 🟢 v1.2: Game Skills & Economy
**Fokus: Fitur Bantuan & Rebalancing Ekonomi**
- **New Skills:** Eraser (Penghapus Sesat), Time Warp (Putar Waktu), Oracle (Mata Batin).
- **Streak System:** Auto-save streak dengan Phoenix Crystal protection.
- **Economy Rebalancing:** Penyesuaian harga item shop & reward duel (+100%).
- **UI Inventory:** Grid layout 6-kolom di profil user.

### 🟢 v1.3: Titanium Fortress
**Fokus: Keamanan Enterprise & DDoS Protection**
- **Distributed Rate Limiting:** Integrasi Upstash Redis (Limit score submission 10/min).
- **IP Blacklist:** Sistem pemblokiran IP real-time via Admin Dashboard.
- **Bot Detection:** Analisis pola repetitif (>5 actions/10s).
- **Admin Logging:** Tabel `admin_logs` untuk audit trail keamanan.

### 🟢 v1.4: Duel Arena 2.0
**Fokus: Real-time PvP & Kompetisi**
- **Supabase Realtime:** Sinkronisasi instan state lobby & progres game.
- **Dynamic Question Engine:** Soal acak diambil dari database materi.
- **Tactical UI:** Compact HUD & Fluid Layout untuk densitas informasi tinggi.
- **Duel Rewards:** Pemenang mendapat 100 Crystals & pencatatan `duel_wins`.

### 🟢 v1.5: Social Expansion
**Fokus: Retensi & Viralitas**
- **Bro Invite (Referral System):** Kode unik user dengan milestones reward (1 & 3 teman).
- **Interactive Claiming:** Notifikasi visual saat target referral tercapai.
- **Social Persistence:** Optimasi friend list & kehadiran online (presence heartbeat).
- **Premium Feedback:** Efek suara & animasi saat klaim reward.

### 🟢 v1.6: Quantum AI
**Fokus: Edukasi Pintar (AI Tutor)**
- **Tactical AI Tutor:** Integrasi Google Gemini 1.5 Flash.
- **Mistake Analysis:** Analisis konteks kesalahan user & feedback taktis real-time.
- **Prompt Engineering:** Persona "Quantum Mentor" yang memotivasi.
- **Secure Architecture:** API Key server-side handling via `aiActions.ts`.

### 🟢 v1.7: Monetization (Pro)
**Fokus: Revenue Stream & Sustainability**
- **PRO Membership (DuoPlus):** Gated access untuk AI Tutor & Unlimited Energy.
- **Payment Gateway:** Integrasi Midtrans Snap (QRIS/E-Wallet).
- **Micro-Subscriptions:** Paket mingguan (Rp 3k) & bulanan (Rp 10k).
- **Pro Dashboard:** Status kepemilikan lencana & manfaat di profil.

### 🟢 v1.8: AdSense Compliance & Dashboard Overhaul (Currently Live)
**Fokus: Persiapan Monetisasi Iklan & UX Pemula**
- **Content Enrichment:** Menambah konten deskriptif ("Low Value Content" fix).
- **Legal Pages:** Halaman `/privacy`, `/terms`, `/about`, `/contact` wajib.
- **SEO Optimization:** `sitemap.ts` & `robots.txt` otomatis.
- **Hero Landing (Guest):** Halaman depan khusus tamu dengan background `kamar.jpg`.
- **Tactical Command Center (User):** Dashboard login yang bersih fokus pada "Active Mission".
- **Localization:** Penerjemahan deskripsi misi ke Bahasa Indonesia.

---

*Terakhir diperbarui: 3 Januari 2026*
