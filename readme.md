# E-Commerce Klinik Makmur Jaya 📦

Sistem yang dirancang untuk mendigitalkan seluruh proses pelayanan farmasi dan penjualan pada Klinik Makmur Jaya. Platform ini dibangun untuk memfasilitasi transaksi harian yang mencapai 150–200 pasien serta mengelola inventaris dalam skala besar yang mencakup lebih dari 2.000 jenis obat.

Aplikasi ini mendukung pemrosesan data secara paralel, sistem manajemen basis data yang mengutamakan integritas dengan perlindungan terhadap serangan siber (SQL Injection, XSS, CSRF), serta kemampuan sinkronisasi real-time antara transaksi di klinik secara fisik dengan transaksi online.

---

## 🚀 Teknologi yang Digunakan

- **Backend:** Laravel 13 (PHP 8.3+)
- **Frontend:** React 19, Inertia.js, TailwindCSS, Shadcn UI
- **Database:** PostgreSQL (Relational)

---

## 📋 Persyaratan Sistem (*Prerequisites*)

Sebelum menginstal aplikasi ini, pastikan sistem Anda (Lokal/Server) sudah terinstal:

1. **PHP** (Minimal versi 8.5) beserta ekstensi:
   - `pdo_pgsql`
   - `mbstring`
   - `xml`
   - `curl`
   - `bcmath`
   - `gd`
   - `zip`

2. **Composer** (*PHP Package Manager*)

3. **Node.js** (Minimal versi 22.x) & **NPM/Yarn**

4. **PostgreSQL** (Minimal versi 16)

5. **Git**

---

# 🛠️ Panduan Instalasi (Development Lokal)

Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan aplikasi di mesin lokal Anda.

---

## 1. Kloning Repositori

```bash
git clone https://github.com/ahmadsubhand/klinik-makmur-jaya.git

cd klinik-makmur-jaya
```

---

## 2. Instalasi Dependensi (Backend & Frontend)

### Instal Library PHP

```bash
composer install
```

### Instal Library JavaScript / React

```bash
npm install
```

---

## 3. Konfigurasi Environment (`.env`)

Salin template konfigurasi bawaan:

```bash
cp .env.example .env
```

Buka file `.env`, lalu sesuaikan konfigurasi database dan mailer. Berikut parameter yang perlu disesuaikan:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=smartstock_pro
DB_USERNAME=postgres
DB_PASSWORD=password_db_anda

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME="yourmail@mail.com"
MAIL_PASSWORD="your app password"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="yourmail@mail.com"
MAIL_FROM_NAME="${APP_NAME}"
```

---

## 4. Generate App Key

Generate encryption key Laravel:

```bash
php artisan key:generate
```

---

## 5. Migrasi Database dan Seeder

Membuat struktur tabel PostgreSQL serta data awal:

- Roles & Permissions
- Super Admin
- Data master awal

```bash
php artisan migrate --seed
```

---

## 6. Link Folder Storage

Membuat symbolic link agar file upload dan dokumen dapat diakses browser:

```bash
php artisan storage:link
```

---

## 7. Jalankan Server Backend & Frontend

Terminal


```bash
composer run dev
```

Aplikasi sekarang dapat diakses melalui:

```txt
http://localhost:8000
```

---

# 🔐 Akun

Anda dapat menggunakan akun bawaan yang dibuat oleh seeder berikut:

| Role     | Email                 | Password   |
| -------- | --------------------- | ---------- |
| Admin    | `admin@klinik.com`    | `12341234` |
| Apoteker | `apoteker@klinik.com` | `12341234` |
| Kasir    | `kasir@klinik.com`    | `12341234` |

### Akun Pasien

Seeder juga membuat **30 akun pasien** dengan format email berikut:

| Email                 | Password   |
| --------------------- | ---------- |
| `pasien1@klinik.com`  | `12341234` |
| `pasien2@klinik.com`  | `12341234` |
| `...`                 | `12341234` |
| `pasien30@klinik.com` | `12341234` |

> Seluruh akun yang dibuat oleh seeder menggunakan password default: `12341234`.

---

# 📚 Perintah Umum (*Troubleshooting*)

Jika terjadi:
- perubahan UI tidak muncul
- cache bermasalah
- konfigurasi tidak sinkron

jalankan:

```bash
php artisan optimize:clear
```

Untuk build asset production:

```bash
npm run build
```

Untuk testing alert stock secara langsung:
```bash
php artisan pharmacy:check-alerts
```