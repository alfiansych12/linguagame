# 📔 Panduan Teknis & Fitur LinguaGame

Dokumen ini disusun untuk memberikan pemahaman mendalam bagi programmer selanjutnya mengenai sistem dan fitur yang ada di dalam LinguaGame.

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

*Selamat mengoding, Node selanjutnya! Tetap jaga frekuensi sirkel.* 📡🛡️⚡
