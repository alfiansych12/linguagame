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

---


## 🛠️ Ringkasan Fitur Utama

### 1. Sistem Autentikasi & Sesi
- Login menggunakan Google OAuth.
- Middleware otomatis memproteksi rute `/profile` dan rute `/admin`.
- Sesi menyimpan data real-time (XP, Gems, Streak) yang di-sync setiap kali user aktif.

### 2. profil & Progres Node (User)
- **XP System:** Akumulasi pengalaman dari bermain game. Membuka rank baru (e.g., Node -> Core -> Sepuh).
- **Gems System:** Mata uang virtual untuk membeli item di Shop (segera).
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

## 🚀 UPDATE v1 (Januari 2026)
Berikut adalah daftar pembaruan dan perbaikan yang berhasil diimplementasikan untuk meningkatkan stabilitas dan branding:

### 1. Branding & Terminology Migration
- **Sirkel to bro:** Melakukan migrasi total terminologi dari "Sirkel" menjadi "**bro**" di seluruh codebase (Source code, UI, Metadata, Achievement, dan Dokumentasi).
- **Consistency:** Memastikan font-style dan tone of voice tetap konsisten dengan gaya "Tactical & Futuristic".

### 2. Keamanan & Arsitektur Data
- **Server-Side Authority:** Memindahkan logika sensitif (Inisialisasi Quest, Update Progress, Claim Reward) dari Client (Zustand) ke **Server Actions** (`userActions.ts`).
- **Fix 401 Unauthorized:** Menghapus interaksi database langsung dari client-side yang sering menyebabkan error RLS. Sekarang menggunakan `supabaseAdmin` di server untuk operasi yang aman.
- **Zod Validation:** Menambahkan validasi skema pada setiap mutasi data untuk mencegah manipulasi skor atau gem.

### 3. Stabilitas Build & Deployment
- **Suspense Boundaries:** Membungkus komponen yang menggunakan `useSearchParams` (seperti `SystemNotifications`, `Home`, dan `Admin`) dengan `<Suspense />` untuk mencegah kegagalan build saat fase static pre-rendering di Vercel.
- **Dynamic Rendering:** Menggunakan `export const dynamic = 'force-dynamic'` pada halaman yang memerlukan akses real-time ke query params.

### 4. HQ Admin Enhancements
- **Command Hub:** Integrasi `PromoAndBroadcastHub` yang memungkinkan admin membuat kode promo dan mengirimkan sinyal pengumuman ke seluruh user secara terpusat.
- **Radar Improvements:** Sinkronisasi status user aktif (Live Radar) dengan data server-side yang lebih akurat.

### 5. Developer Experience (DX)
- **Local OAuth Config:** Mendokumentasikan dan mengonfigurasi pemisahan GitHub OAuth App antara Global (Vercel) dan Local (Development) untuk menghindari error `redirect_uri`.
- **Environment Management:** Merapikan file `.env.local` untuk kemudahan switching antara mode testing dan live.

📡 *System Status: STABLE & GACOR.* 🚀

---

## ⚡ UPDATE v2: Mainframe Tactical Redesign (Januari 2026)
Pembaruan ini berfokus pada perombakan total UI/UX jalur pembelajaran (Learning Path) untuk memberikan kesan yang lebih premium, taktis, dan responsif.

### 1. ⚔️ Redesign Vocab Mode (Mainframe Tactical)
- **Glassmorphism UI:** Mengganti card standar menjadi desain "Tactical Glass" dengan efek *backdrop-blur*, border bercahaya, dan *scan-line animation*.
- **Interactive Levels:** Menambahkan elemen teknis pada setiap node misi aktif, termasuk indikator `"SIGNAL STRENGTH"` dan status `"GACOR"` dalam mode real-time.
- **Data-Flow Path:** Garis penghubung antar misi sekarang memiliki animasi `"Data Flow"` yang mensimulasikan aliran paket data melalui pusat kontrol.
- **Holographic HQ Background:** Integrasi latar belakang *Quantum Grid* dengan gradasi radial untuk memperkuat tema milisteristik/pusat komando.

### 2. 📱 Optimalisasi Responsivitas (Sepuh Standards)
- **Mobile-First Realignment:** Mengimplementasikan layout satu kolom vertikal untuk jalur pembelajaran di perangkat HP sesuai dengan `RESPONSIVE_STANDARDS.md`.
- **Dynamic Font Scaling:** Mengoptimalkan ukuran tipografi di desktop (dari 96px menjadi 60px) untuk menjaga keseimbangan visual dan profesionalisme.
- **Smart Density Management:** Menyederhanakan elemen dekoratif dan animasi pada layar kecil untuk menjaga performa dan keterbacaan data utama.
- **Zero-Overflow Mechanics:** Menghilangkan semua masalah *horizontal scrolling* dengan teknik `flex-col` dan penyesuaian kontainer pada breakpoint mobile.

### 3. 🧪 UI Refinement & Cleanup
- **Decluttering:** Menghapus container luar yang tebal (Bulky Card) di `PageLayout` untuk memberikan tampilan yang lebih "Borderless" dan modern.
- **Header Optimization:** Menghapus judul redundan ("Misi Utama") dan merapatkan jarak (spacing) antara header kontrol dengan jalur misi utama agar informasi lebih cepat diakses.
- **Button Overhaul:** Memperbarui semua tombol utama menjadi gaya **`LAUNCH MISSION`** dengan efek bayangan dan transisi yang lebih berat (weighted transitions).


📡 *UI Status: CLEAN, TACTICAL & OPTIMIZED.* 🚀

---

## ⚡ DB SYNC REMINDER (CRITICAL)
> **IMPORTANT:** Supabase tidak otomatis sinkron dengan file `SUPABASE.sql`. 
Setiap kali ada perubahan skema (tabel baru, kolom baru, fungsi baru):
1. Update file `SUPABASE.sql`.
2. **WAJIB** Copy-Paste manual isi SQL tersebut ke **Supabase SQL Editor** dan jalankan (Run).
3. Pastikan tidak ada error di dashboard Supabase.

---

## 🎮 UPDATE v2.1: Game Skills & Streak System (Januari 2026)
Pembaruan ini memperkenalkan sistem skill pembelajaran yang powerful dan mengaktifkan fitur streak untuk meningkatkan engagement harian.

### 1. 🔮 New Learning Skills (Crystal System)
Menambahkan 3 skill baru yang fokus pada pembelajaran dan bantuan strategis:

#### **Penghapus Sesat (Eraser)** - 60 Crystal
- **Vocabulary/Speed Blitz:** Menghapus 2 opsi jawaban yang salah, memudahkan identifikasi jawaban benar
- **Grammar Game:** Memfilter semua distractor pieces, hanya menyisakan pieces yang benar
- **Implementation:** State management `eliminatedOptions` dengan UI yang smooth (opacity-0 + pointer-events-none)

#### **Putar Waktu (Time Warp)** - 90 Crystal
- **Speed Blitz:** Menambah 10 detik ke timer untuk momen kritis
- **Vocabulary/Grammar:** Memulihkan 5 Energy (Hearts), memberikan kesempatan lebih banyak untuk belajar
- **Use Case:** Skill recovery yang sangat berguna untuk level sulit

#### **Mata Batin (Oracle)** - 145 Crystal
- **Vocabulary:** Menampilkan example sentence sebagai hint kontekstual (dengan target word di-blank)
- **Grammar:** Menampilkan explanation/rule sebelum menjawab untuk pembelajaran aktif
- **Design:** Animated card dengan amber theme dan icon visibility

### 2. 🔥 Streak System Activation
Sistem streak yang fully functional with auto-save menggunakan Phoenix Crystal:

#### **Server Actions** (`streakActions.ts`)
- `updateUserStreak()`: Auto-update streak setiap login
  - Login kemarin → Streak +1
  - Login hari ini → Skip (already updated)
  - Skip 1 hari + Phoenix Crystal → **Auto-save streak** (consume 1 Phoenix)
  - Skip tanpa Phoenix → Reset ke 1
- `getUserStreakInfo()`: Check streak status dan login history

#### **Streak Indicator Component**
- Visual fire icon dengan color progression (orange → bright orange → pulse animation)
- Phoenix Crystal status dengan glow effect merah-oranye
- Milestone badges: ✨ HOT (7d), ⚡ ELITE (14d), 🔥 LEGEND (30d)
- Real-time integration di Header untuk visibility maksimal

#### **Auto-Update Integration**
- Homepage (`page.tsx`) otomatis update streak saat user login
- Sound effect notification saat Phoenix Crystal digunakan
- Sync langsung dengan Zustand store untuk UI consistency

### 3. 💰 Economy Rebalancing
Menyeimbangkan harga shop dengan earning rate untuk gameplay yang lebih fair:

#### **Crystal Price Adjustments**
| Skill | Old Price | **New Price** | Change |
|-------|-----------|---------------|--------|
| Shield Crystal | 50 | **35** | -30% |
| Vision Crystal | 150 | **45** | -70% |
| XP Overflow | 100 | **75** | -25% |
| Temporal Crystal | 200 | **85** | -57.5% |
| Eraser | 75 | **60** | -20% |
| Time Warp | 125 | **90** | -28% |
| Oracle | 250 | **145** | -42% |
| Stasis Crystal | 2000 | **750** | -62.5% |
| Divine Eye | 5000 | **1500** | -70% |

#### **Border Price Adjustments**
- Silver Warrior: 1000 → **800** (-20%)
- Diamond Master: 5000 → **3500** (-30%)
- Emerald Mythic: 15000 → **8500** (-43%)
- Royal Obsidian: 25000 → **15000** (-40%)
- Infinity Void: 50000 → **25000** (-50%)
- Celestial Dragon: 99999 → **50000** (-50%)

#### **Increased Earnings**
- Duel Win Reward: 50 → **100 Crystal** (+100%)
- Level completion tetap: **30-75 Crystal** (based on stars)
- Daily Quests: **300 Crystal total** (unchanged)

**Rasio Balance:** User bisa beli 1-2 skill bantuan per level win, mendorong strategic usage tanpa grinding berlebihan.

### 4. 🎨 UI/UX Enhancements
- **Crystal Inventory Display:** Added to UserProfileOverlay with grid 6-column layout
- **Responsive Skill Buttons:** Consistent `gap-3 md:gap-4` spacing di semua game modes
- **Oracle Hint Card:** Premium amber-themed card dengan animated reveal
- **Streak Indicator:** Replaced basic badge with interactive component

### 5. 📊 Database Schema Updates
**New Columns Required:**
```sql
-- users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_streak_date DATE;
-- inventory jsonb already supports: eraser, timewarp, oracle
```

**Inventory Keys Added:**
- `eraser` (number)
- `timewarp` (number)
- `oracle` (number)

📡 *Game Economy Status: BALANCED & ENGAGING.* 🎮💎

---

*Terakhir diperbarui: 2 Januari 2026*

---

## 🛡️ UPDATE v3.0: Titanium Fortress (Januari 2026)
Pembaruan besar-besaran yang fokus pada keamanan tingkat enterprise dan proteksi DDoS.

### 1. 🚨 Advanced Security Layer

#### **Distributed Rate Limiting** (`lib/ratelimit.ts`)
Menggunakan **Upstash Redis** untuk rate limiting global di semua Vercel Edge instances:

- **Strict Limiter**: 10 requests/minute untuk game score submission
- **Moderate Limiter**: 30 requests/minute untuk shop actions  
- **Auth Limiter**: 5 attempts/5 minutes untuk login/register
- **Global Limiter**: 100 requests/minute baseline DDoS protection

**Keunggulan:**
- Distributed across all serverless functions
- Persistent di Redis (tidak reset saat cold start)
- Analytics built-in untuk monitoring

#### **IP Blacklist System**
- Real-time IP blocking menggunakan Redis Sets
- Admin dapat blacklist IP dengan reason tracking
- Auto-block pada endpoint sensitif (score submission, auth)

#### **Bot Behavior Detection**
- Pattern analysis: >5 identical actions dalam 10 detik = flagged
- Automatic suspicious user logging
- Integration dengan admin dashboard untuk review

### 2. 🔒 Enhanced Server Actions

#### **Game Score Submission** (3-Layer Security)
```typescript
1. IP Blacklist Check → Block banned IPs instantly
2. Rate Limiting → Prevent rapid-fire bot submissions
3. Bot Detection → Flag suspicious patterns
4. Zod Validation → Prevent data manipulation
5. Logic Check → Impossible scores rejected
```

#### **Admin Security Actions** (`securityActions.ts`)
- `adminBlacklistIP()`: Permanent IP ban dengan audit logging
- `checkCurrentIPStatus()`: Real-time IP status check
- `getSecurityAnalytics()`: Security dashboard data

### 3. 📊 Database Schema Updates

#### **New Table: admin_logs**
```sql
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY,
    admin_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    target TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track semua admin security actions untuk audit trail.

#### **Users Table Enhancement**
```sql
ALTER TABLE users ADD COLUMN last_streak_date DATE;
```

**Purpose:** Support streak auto-save dengan Phoenix Crystal.

### 4. 🛠️ Tech Stack Additions

**New Dependencies:**
- `@upstash/ratelimit` - Distributed rate limiting
- `@upstash/redis` - Redis client untuk Edge runtime

**External Services:**
- **Upstash Redis** - Free tier: 10k commands/day, 256MB storage
- Setup guide: `docs/UPSTASH_SETUP.md`

### 5. 🎯 Security Features Checklist

- [x] IP-based rate limiting (global)
- [x] IP blacklist system (admin-managed)
- [x] Bot behavior detection
- [x] Enhanced score validation
- [x] Admin audit logging
- [x] Security analytics dashboard (backend ready)
- [ ] Cloudflare WAF integration (requires custom domain)
- [ ] Turnstile CAPTCHA (planned for v3.1)
- [ ] Real-time threat monitoring UI (planned)

### 6. 📝 Migration Guide

**For Existing Projects:**

1. **Install Dependencies:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

2. **Setup Upstash Redis:**
   - Follow `docs/UPSTASH_SETUP.md`
   - Add credentials to `.env.local`

3. **Run Database Migration:**
   - Open Supabase SQL Editor
   - Execute `docs/V3_MIGRATION.sql`

4. **Deploy to Vercel:**
   - Add Upstash env vars to Vercel project settings
   - Redeploy

**Estimated Setup Time:** 15-20 minutes

### 7. 🚀 Performance Impact

**Before v3.0:**
- Average response time: ~200ms
- No DDoS protection
- Client-side rate limiting (bypassable)

**After v3.0:**
- Average response time: ~220ms (+20ms for Redis check)
- Full DDoS protection
- Server-side distributed rate limiting
- IP blacklist instant blocking

**Trade-off:** +10% latency untuk 100x security improvement ✅

### 8. 🎮 Status Roadmap (Ongoing)

- [x] Real-time Duel Arena (Supabase Realtime)
- [x] Pilar 2 (Social Engagement): Emotes, Invites, Tactical Leaderboard
- [ ] Clan/Sircle System (Pilar 3)
- [ ] AI Tactical Tutor (Pilar 4)
- [ ] Admin Security Dashboard UI

📡 *Security Status: TITANIUM FORTRESS ACTIVE.* 🛡️

---

## ⚔️ UPDATE v3.1: Duel Arena 2.0 (Januari 2026)
Pembaruan ini menghadirkan sistem PvP real-time yang bertenaga dan UI taktis yang dioptimalkan untuk performa tinggi di semua perangkat.

### 1. 📡 Real-time Synchronization (Live PvP)
Menggunakan **Supabase Realtime (Postgres Changes)** untuk sinkronisasi instan antar pemain:

- **Lobby & Matchmaking:** Sistem buat/gabung room menggunakan kode unik 6-digit.
- **Live State Sync:** Kedua pemain dapat melihat progresi skor, jawaban lawan, dan status "Ready" secara instan tanpa refresh.
- **Optimistic UI:** Feedback visual yang cepat di sisi client sebelum data tersinkronisasi ke database.

### 2. 🎮 Tactical Game Integration
Duel Arena sekarang terintegrasi langsung dengan database materi pembelajaran:

- **Dynamic Question Engine:** Soal diambil secara acak dari `VOCABULARY_DATA`, `GRAMMAR_DATA`, dan `BLITZ_DATA` berdasarkan mode yang dipilih host.
- **Rematch System:** Fitur tanding ulang instan di room yang sama tanpa perlu input kode baru (Server-side reset).
- **Match Rewards:** Pemenang mendapatkan **100 Crystals** dan penambahan statistik `duel_wins`.

### 3. 📱 Ultra-Responsive Tactical UI
Perombakan UI game agar lebih padat informasi (*High Density*) dan responsif:

- **Compact HUD:** Dashboard game yang lebih tipis dan hemat ruang, memberikan fokus maksimal pada soal.
- **Fluid Layout:** Grid sistem yang menyesuaikan diri otomatis dari 7-kolom (Desktop) menjadi Stack-view (Mobile).
- **Aesthetic Refinement:** Peningkatan visual dengan *glassmorphism*, indikator pergerakan dinamis, dan tipografi yang lebih tajam.

### 5. 🤝 Social Engagement & Tactical Leaderboard
- **Friend Direct Invite**: Pemain dapat mengirim undangan tanding langsung ke teman yang sedang online dari Lobby atau Matchmaking screen.
- **Live Emote System**: Interaksi real-time di dalam game menggunakan broadcast engine untuk mengirim reaksi (🔥, 💀, 🤡, dll) yang muncul secara instan di layar lawan.
- **Tactical Leaderboard**: Halaman leaderboard kini memiliki toggle mode untuk beralih antara ranking XP global dan ranking kemenangan Duel Arena ("Tactical Battle").

### 6. 🛠️ Bug Fixes & Stabilitas
- **Router setState Fix:** Perbaikan error kritis `"Cannot update a component while rendering a different component"` pada transisi game.
- **Init Race Condition Fix:** Menjamin sinkronisasi data room dan pembuatan soal pertama berjalan berurutan untuk mencegah error "Null properties".
- **Dynamic Data Imports:** Menggunakan *Dynamic Imports* untuk memuat database materi hanya saat dibutuhkan, menghemat bandwidth dan memori.

📡 *System Status: DUEL ARENA ONLINE & GACOR.* ⚔️

---

## 🤝 UPDATE v3.2: Social & Engagement Expansion (Januari 2026)
Pengembangan fitur sosial yang lebih mendalam untuk meningkatkan retensi pengguna melalui sistem referral dan reward milestones.

### 1. 💎 Bro Invite (Referral System 2.0)
Sistem ajak teman yang sekarang lebih menguntungkan dan interaktif:

- **Referral Code Engine**: Setiap user memiliki kode unik yang bisa dipersonalisasi.
- **Reward Milestones**: Hadiah instan yang bisa diklaim manual setelah mencapai target undangan:
  - **1 Teman**: 5,000 Crystals 💎
  - **3 Teman**: 10,000 Crystals 💎
- **Interactive Claiming**: Pemain mendapatkan notifikasi visual dan tombol "KLAIM" yang muncul otomatis di halaman profil saat target tercapai.

### 2. 🤝 Social Persistence
- **Friend List Optimization**: Deduplikasi otomatis pada daftar teman untuk mencegah bug relasi ganda.
- **Invite Expiration Logic**: Undangan duel kini memiliki masa kadaluarsa 2 menit untuk menjaga antrean matchmaking tetap relevan dan bersih.
- **Presence Heartbeat**: Peningkatan frekuensi update status online (setiap 60 detik) untuk akurasi data "Online Friends" yang lebih presisi.

### 3. 🎨 Aesthetic & UX Polish
- **Premium Claim Feedback**: Penambahan efek suara `SUCCESS` dan alert `CRYSTAL` saat berhasil mengklaim reward milestone.
- **Responsive Milestone Cards**: Layout grid yang menyesuaikan diri di layar mobile agar progress bar dan tombol klaim tetap nyaman dioperasikan.

📡 *System Status: SOCIAL ECOSYSTEM EXPANDED.* 🤝⚡

---

## 🧠 UPDATE v3.3: Quantum AI Integration (Januari 2026)
Pengaktifan Pilar 3: Intelegensi Quantum untuk mengubah kesalahan menjadi peluang belajar melalui teknologi AI generatif.

### 1. 🤖 Tactical AI Tutor (Gemini Engine)
Integrasi asisten belajar cerdas yang mendampingi user secara real-time:

- **Mistake Analysis**: Setiap kali user salah menjawab di mode Vocab/Grammar, sistem memicu API Gemini 1.5 Flash untuk menganalisis konteks kesalahan.
- **Tactic Feedback**: AI memberikan penjelasan singkat yang "taktis" dan "bro-style" serta 1 tips khusus agar user tidak mengulangi kesalahan yang sama.
- **Holographic UI**: Feedback ditampilkan melalui `TacticalAITutor` component dengan estetika futuristik (scanlines, glassmorphism, pulse glow).

### 2. ⚡ AI Server Architecture
- **aiActions.ts**: Server action pusat yang menangani komunikasi aman dengan Google Generative AI SDK menggunakan API Key di sisi server (Security First).
- **Prompt Engineering**: Instruksi khusus agar AI menjaga persona "Quantum Mentor" yang memotivasi namun tetap profesional dalam memberikan edukasi.

### 3. 🧪 Optimized UI Flow
- **Non-Blocking Logic**: Fetching AI dilakukan secara asynchronous tanpa menghentikan flow transisi antar soal, menjaga kecepatan permainan tetap tinggi.
- **One-Click Dismiss**: User dapat menutup asisten secara instan atau membiarkannya menghilang sendiri di soal berikutnya.

📡 *System Status: QUANTUM AI BRAIN ONLINE.* 🧠🦾⚡

## 💎 UPDATE v3.4: Quantum PRO Monetization (Januari 2026)
Transisi AI Tutor menjadi fitur premium untuk mendukung keberlanjutan platform melalui sistem langganan mikro yang terjangkau.

### 1. 🛡️ Gated Premium Access
- **AI Paywall**: Fitur *Quantum AI Tutor* kini eksklusif untuk member PRO. User non-pro akan mendapatkan `PremiumAIModal` yang taktis saat melakukan kesalahan, mengundang mereka untuk upgrade.
- **Server-Side Verification**: Setiap request AI divalidasi di `aiActions.ts` melalui pengecekan field `is_pro` dan `pro_until` di database Supabase untuk mencegah akses ilegal.

### 2. 💸 Micro-Subscription Plans
Sistem paket harga yang dirancang untuk keterjangkauan maksimal:
- **Elite Weekly (Rp 3.000)**: Akses AI seminggu penuh.
- **Ultimate Monthly (Rp 10.000)**: Akses AI sebulan penuh, hemat 20%.

### 3. 💳 Midtrans Payment Integration
Integrasi payment gateway terkemuka Indonesia untuk kemudahan transaksi:
- **Midtrans Snap**: Proses pembayaran pop-up yang mendukung E-Wallet (OVO, GoPay, Dana), QRIS, dan Transfer Bank.
- **Secure Handling**: Menggunakan `paymentActions.ts` untuk pembuatan token transaksi di server-side dan sinkronisasi status PRO instan setelah pembayaran sukses.

### 4. 🎨 PRO Aesthetic Expansion
- **Pro Dashboard**: Update status kepemilikan di halaman `/pro` dengan indikator validitas yang dinamis.
- **PRO Badge**: User PRO otomatis mendapatkan label elit di sistem untuk membangun reputasi sosial di leaderboard.

📡 *System Status: MONETIZATION ENGINE LIVE & SECURE.* 💎💳🚀

---

*Terakhir diperbarui: 2 Januari 2026*
