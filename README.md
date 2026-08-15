# FinCorp — Dashboard Keuangan Pribadi Premium & Profesional

**FinCorp** adalah aplikasi web manajemen keuangan pribadi berstandar korporat yang dirancang untuk mengelola arus kas, rekening bank, dompet digital, tabungan, anggaran belanja, dan laporan keuangan secara lengkap, cepat, aman, dan responsif.

---

## ✨ Fitur Utama

- **Otentikasi & Keamanan Tingkat Tinggi**:
  - Hashing kata sandi SHA-256 + Salt (tidak menyimpan plaintext di database).
  - Session token terenkripsi dengan masa berlaku otomatis dan verifikasi tanda tangan digital.
  - Audit log komprehensif mencatat setiap login, transaksi, transfer, dan perubahan konfigurasi.
  - Protected routes (akses `/dashboard` otomatis diarahkan ke `/login` jika sesi tidak valid).
- **Format Rupiah Standar Indonesia (IDR)**:
  - Tampilan konsisten: `Rp 1.250.000`.
  - Input otomatis memformat angka dengan pemisah ribuan titik (`.`), namun database tetap menyimpan nilai numerik murni.
- **Dashboard Eksekutif**:
  - Ringkasan KPI: Total Saldo Bersih, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Tabungan Terkumpul, Sisa Budget.
  - Analisis Finansial Otomatis (*Automated Financial Insights*).
  - Grafik Interaktif: Income vs Expense, Distribusi Pengeluaran per Kategori (Donut Chart), Arus Kas Harian (Cash Flow Area Chart).
  - Filter rentang tanggal fleksibel: Hari ini, Minggu ini, Bulan ini, Bulan lalu, Tahun ini, Kustom.
- **Pemasukan & Pengeluaran**:
  - Form pencatatan lengkap: Tanggal, Kategori, Subkategori, Rekening Sumber/Tujuan, Nominal, Catatan.
  - Pencarian dengan debounce, filter multi-kriteria, pagination (25, 50, 100).
  - Edit & Hapus dengan modal konfirmasi keamanan.
- **Manajemen Rekening & Saldo Real-Time**:
  - Dukungan multi-akun: Bank (BCA, Mandiri, BRI, dll.), Uang Tunai (Cash), E-Wallet (GoPay, OVO, DANA, dll.).
  - Saldo dihitung otomatis berdasarkan mutasi transaksi dan transfer.
- **Transfer Antar Rekening**:
  - Pindahkan dana antar rekening tanpa memengaruhi total kekayaan dan tanpa terhitung sebagai pengeluaran/pemasukan baru.
- **Target Tabungan (Savings Goals)**:
  - Tracking progres tabungan visual dengan persentase dan target tanggal.
  - Status target: Aktif, Tercapai, Dibatalkan.
- **Budget Bulanan (Anggaran)**:
  - Batas pengeluaran per kategori per bulan.
  - Indikator status cerdas: **Normal**, **Hampir Habis (≥80%)**, **Melewati Budget (≥100%)**.
- **Laporan & Analitik Finansial**:
  - Laporan komprehensif per kategori, per rekening, dan mutasi detail.
  - Ekspor data ke **CSV** dan cetak **PDF**.
  - Metrik mendalam: *Saving Rate (%)*, Rata-rata pengeluaran harian/bulanan, Kategori pengeluaran terbesar, Pertumbuhan MoM.
- **Tampilan Modern & Responsif**:
  - Desain *Corporate Clean*: Palette Navy, Slate, Emerald, Rose, Blue Accent.
  - Mode Gelap (Dark Mode) & Mode Terang.
  - Sidebar di desktop, bottom navigation + drawer di mobile.

---

## 🛠️ Arsitektur Teknologi

```
[ Frontend: React + Vite + Tailwind CSS ]
                  │
                  ▼  (HTTPS JSON API Request)
[ Backend: Google Apps Script Web App (Code.gs) ]
                  │
                  ▼  (Google Apps Script Spreadsheet API)
[ Database: Google Sheets (8 Tab Relasional) ]
```

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Recharts, Lucide React Icons.
- **Backend**: Google Apps Script (REST Web App).
- **Database**: Google Sheets (Tabel: `Users`, `Transactions`, `Accounts`, `Categories`, `Transfers`, `Savings`, `Budgets`, `Audit_Log`).

---

## 📁 Struktur Direktori

```text
finance-dashboard/
├── google-apps-script/
│   ├── Code.gs             # Backend API (Auth, CRUD, Audit Log, Agregasi)
│   └── Setup.gs            # Skrip inisialisasi sheet & data awal otomatis
├── public/
│   └── favicon.svg         # Icon aplikasi
├── src/
│   ├── assets/             # Logo & SVG assets
│   ├── charts/             # Recharts visualizers (Donut, Bar, Area, Line)
│   ├── components/
│   │   ├── common/         # Button, Card, Modal, Input, CurrencyInput, Toast, dll.
│   │   ├── dashboard/      # StatCard, InsightBanner, RecentTransactions
│   │   ├── forms/          # TransactionModal, TransferModal, AccountModal, dll.
│   │   ├── layout/         # Sidebar, Header, MobileNav, MainLayout
│   │   └── ui/             # ProgressBar
│   ├── context/            # AuthContext, FinanceContext, ThemeContext, ToastContext
│   ├── hooks/              # Custom React hooks (useAuth, useFinance, useToast, dll.)
│   ├── pages/              # Login, Dashboard, Income, Expense, Transactions, dll.
│   ├── services/           # api.js & mockData.js (Fallback otomatis)
│   ├── utils/              # formatters.js (Rupiah & Date ID), exportUtils.js
│   ├── App.jsx             # Main router & state coordinator
│   ├── main.jsx            # React root mount
│   └── index.css           # Tailwind directives & theme styles
├── .env.example            # Template variabel lingkungan
├── package.json            # Daftar dependensi
├── vite.config.js          # Konfigurasi Vite
└── tailwind.config.js      # Konfigurasi Tailwind CSS
```

---

## 🚀 Panduan Instalasi & Setup

### Langkah 1: Setup Database Google Sheets & Backend Apps Script

1. Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru (misal diberi nama: `FinCorp_Database`).
2. Pada menu atas, klik **Extensions (Ekstensi)** > **Apps Script**.
3. Di dalam editor Apps Script:
   - Buat file `Code.gs` dan salin seluruh isi dari `google-apps-script/Code.gs`.
   - Buat file `Setup.gs` dan salin seluruh isi dari `google-apps-script/Setup.gs`.
4. Pada dropdown fungsi di bagian atas editor Apps Script, pilih fungsi **`initialSetup`**, lalu klik **Run (Jalankan)**.
   - Berikan izin akses (*Review Permissions*) saat pertama kali dijalankan.
   - Skrip ini akan secara otomatis membuat 8 Sheet lengkap dengan header kolom, format warna rapi, kategori default, dan akun demo pertama.
5. Deploy Apps Script sebagai Web App:
   - Klik tombol biru **Deploy** (di kanan atas) > **New deployment**.
   - Pilih jenis: **Web app**.
   - Isi Deskripsi: `FinCorp API v1`.
   - **Execute as**: `Me (email Anda)`.
   - **Who has access**: `Anyone` (Siapa saja).
   - Klik **Deploy**.
   - Salin **Web App URL** yang dihasilkan (format: `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Langkah 2: Setup Frontend React

1. Clone repositori ke komputer Anda:
   ```bash
   git clone https://github.com/username/finance-dashboard.git
   cd finance-dashboard
   ```

2. Pasang dependensi Node.js:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variable:
   - Duplikasi `.env.example` menjadi `.env`:
     ```bash
     cp .env.example .env
     ```
   - Masukkan Web App URL dari Langkah 1 ke dalam `.env`:
     ```env
     VITE_API_URL=https://script.google.com/macros/s/AKfycbxYOUR_DEPLOYMENT_ID/exec
     VITE_USE_MOCK=false
     ```

4. Jalankan aplikasi dalam mode development:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

5. Login ke aplikasi menggunakan akun demo:
   - **Email**: `demo@fincorp.id`
   - **Password**: `password123`

---

## 🌐 Panduan Deployment Produksi

### Build untuk Produksi
```bash
npm run build
```
File hasil build statis akan tersimpan di folder `dist/`.

### Opsi 1: Deploy ke Vercel
1. Hubungkan repository GitHub Anda ke [Vercel](https://vercel.com).
2. Tambahkan Environment Variable di Vercel Dashboard:
   - `VITE_API_URL`: URL Web App Google Apps Script Anda.
3. Klik **Deploy**.

### Opsi 2: Deploy ke GitHub Pages / Cloudflare Pages
- Upload folder `dist` atau hubungkan repository ke Cloudflare Pages dengan build command `npm run build` dan output folder `dist`.

---

## 🔒 Keamanan & Praktik Terbaik

1. **Tanpa Plaintext Password**: Seluruh kata sandi di-hash menggunakan algoritma SHA-256 dengan cryptographic salt sebelum disimpan di Google Sheets.
2. **Kerahasiaan Database**: Frontend tidak pernah mengakses Google Sheets ID secara langsung. Seluruh query divalidasi dan dijalankan oleh Google Apps Script.
3. **Session Timeout & Invalidation**: Token sesi memiliki masa kadaluarsa dan tanda tangan digital unik per user ID.
4. **Audit Trail**: Seluruh tindakan penambahan, pengubahan, atau penghapusan data tercatat secara permanen di sheet `Audit_Log`.

---

## 📄 Lisensi

Aplikasi ini dikembangkan untuk kebutuhan manajemen keuangan pribadi premium dan profesional.
