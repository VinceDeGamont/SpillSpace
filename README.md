# SpillSpace

Platform prototipe kesehatan mental dan *work-life balance* untuk karyawan Gen-Z berbasis **Psikologi Industri & Organisasi (Job Demands–Resources / JD-R Model)** — dikembangkan sebagai proyek UAS mata kuliah Psikologi Kerja.

## Fitur Utama

1. **Smart Clickwrap Informed Consent**
   Persetujuan privasi yang transparan dan ramah pengguna sebelum masuk ke ruang kerja, menegaskan enkripsi data, akses terbatas hanya untuk psikolog mitra berlisensi, serta penggunaan data yang bebas dari penilaian kinerja (*performance review*).

2. **10-Second Daily Vibe Check**
   Simulasi check-in harian interaktif yang mencakup:
   - Pemilih suasana hati & energi (*Mood & Energy Selector*).
   - Slider beban tugas vs. waktu pribadi (*Task Load vs. Personal Time*, skala 1–10).
   - *Context Tags* berbasis JD-R (*Job Demands* vs. *Job Resources*).
   - Catatan refleksi singkat opsional.
   - **Live Status Indicator** (Green, Yellow, Red) yang menghitung *Brain Capacity Used* secara real-time, lengkap dengan tombol **Book Priority Session** saat terdeteksi risiko burnout.

3. **Monthly Stress Record & Work-Life Balance Dashboard**
   Dasbor analitik bulanan dengan tata letak bento-grid yang menampilkan:
   - Grafik tren stres mingguan (Week 1–Week 4) dengan *zone bands*.
   - Rasio *Task Demands vs. Personal Recovery Time*.
   - Kartu diagnosis status bulanan & rekomendasi psikologis otomatis (dapat dipratinjau pada state Green, Yellow, dan Red).

4. **Partner Psychologist Connect & Pre-Counseling Summary**
   Direktori psikolog mitra dengan simulasi **1-Click Anonymous Booking** dan pratinjau **Pre-Counseling Summary** (ringkasan grafik bulanan anonim yang otomatis dikirim ke psikolog saat sesi dipesan).

## Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animasi & Ikon:** Framer Motion, Lucide React

## Cara Menjalankan Secara Lokal

1. Pastikan Node.js (v20.9 atau lebih baru) sudah terpasang.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
4. Buka [http://localhost:3000](http://localhost:3000) di browser.

## Struktur Direktori

```text
├── app/
│   ├── globals.css          # Token desain & gaya dasar
│   ├── layout.tsx           # Root layout, font, dan metadata
│   └── page.tsx             # Halaman utama aplikasi
├── components/
│   └── SpillSpace/          # Komponen UI & logika interaktif SpillSpace
│       ├── ConsentModal.tsx
│       ├── Footer.tsx
│       ├── Hero.tsx
│       ├── MonthlyDashboard.tsx
│       ├── Navbar.tsx
│       ├── PsychologistConnect.tsx
│       ├── Science.tsx
│       ├── SpillSpaceApp.tsx
│       ├── VibeCheck.tsx
│       ├── data.ts
│       └── ui.tsx
└── public/                  # Aset statis
```
