# 📱 Standard Responsivitas LinguaGame

Dokumen ini mendefinisikan standar resolusi dan breakpoint yang digunakan dalam pengembangan UI/UX LinguaGame untuk memastikan pengalaman "Premium & Tactical" di semua perangkat.

---

## 🛠️ Breakpoint Perangkat

LinguaGame menggunakan pendekatan **Mobile-First** dengan pembagian tier sebagai berikut:

### 1. 📱 Handphone (Ponsel Pintar)
*Layar paling kecil, dioptimalkan untuk penggunaan vertikal.*
- **Lebar:** 360px – 480px
- **Tinggi:** 640px – 850px
- **Breakpoint CSS:** `< 600px` (Tailwind: `default`)
- **Desain Khusus:**
    - Navigasi menggunakan **Bottom Navbar** (Bawah).
    - Grid statistik dipaksa **1 Baris (Extreme Compact)** atau **1 Kolom (Auto-Layout)** tergantung densitas informasi.
    - Padding minimal untuk efisiensi ruang.

---

### 2. 📟 Tablet
*Ukuran menengah untuk penggunaan fleksibel (Potret/Lanskap).*
- **Lebar:** 600px – 1024px
- **Tinggi:** 800px – 1366px
- **Breakpoint CSS:** `600px - 1024px` (Tailwind: `sm` & `md`)
- **Desain Khusus:**
    - Navigasi beralih ke **Sidebar Samping**.
    - Grid statistik menggunakan layout **2 Kolom**.
    - Konten mulai menggunakan struktur multi-kolom yang seimbang.

---

### 3. 🖥️ Desktop
*Layar terbesar dengan resolusi tinggi.*
- **Lebar:** ≥ 1024px (1280, 1440, 1920, dll.)
- **Tinggi:** ≥ 768px
- **Breakpoint CSS:** `1024px+` (Tailwind: `lg`, `xl`, `2xl`)
- **Desain Khusus:**
    - Navigasi **Full Sidebar** permanen.
    - Grid statistik menggunakan layout **4 Kolom**.
    - Dekorasi visual tingkat tinggi (Glassmorphism, Radar Animations, Background Gradients) aktif sepenuhnya.

---

## 📐 Prinsip Dasar Layout
1. **Auto-Layout:** Hindari penggunaan `height` atau `width` fixed pada kontainer utama. Gunakan `flex`, `grid`, dan `aspect-ratio`.
2. **Fluid Typography:** Gunakan utility responsive (e.g., `text-xs md:text-3xl`) untuk memastikan teks proporsional.
3. **Density Management:** Kurangi elemen dekoratif (e.g., background icons) di layar Handphone untuk memprioritaskan data utama.

---

*Terakhir diperbarui: 1 Januari 2026*
