# Epic: Pengembangan Sistem Manajemen Apotek

## Deskripsi

Issue ini mencakup seluruh pekerjaan pengembangan sistem manajemen apotek berbasis Laravel, React, Inertia.js, PostgreSQL, Redis, dan Laravel Reverb sesuai Software Design Document (SDD).

---

## Phase 1 - Infrastructure & Environment Setup

### Objective

Menyiapkan fondasi aplikasi dan seluruh dependency infrastruktur.

### Tasks

* [ ] Konfigurasi koneksi PostgreSQL pada file `.env`
* [ ] Konfigurasi Redis sebagai cache driver
* [ ] Konfigurasi Redis sebagai session driver
* [ ] Konfigurasi Redis sebagai queue driver
* [ ] Verifikasi koneksi PostgreSQL dan Redis
* [ ] Instalasi Laravel Reverb melalui `php artisan install:broadcasting`
* [ ] Konfigurasi environment Reverb
* [ ] Menjalankan `php artisan storage:link`
* [ ] Verifikasi akses file storage publik

### Acceptance Criteria

* PostgreSQL dapat digunakan oleh aplikasi
* Redis dapat digunakan untuk cache, session, dan queue
* Reverb berhasil berjalan
* Storage publik dapat diakses

---

## Phase 2 - Third-Party Package Installation

### Objective

Menginstal package yang dibutuhkan sesuai desain sistem.

### Tasks

* [ ] Instalasi `spatie/laravel-permission`
* [ ] Publish migration dan konfigurasi permission package
* [ ] Instalasi `spatie/laravel-activitylog`
* [ ] Publish migration dan konfigurasi activity log
* [ ] Instalasi `maatwebsite/excel`
* [ ] Instalasi `barryvdh/laravel-dompdf`
* [ ] Verifikasi seluruh package dapat digunakan

### Acceptance Criteria

* Seluruh package berhasil terinstal
* Migration package dapat dijalankan tanpa error

---

## Phase 3 - Database Modeling & Migration

### Objective

Mengimplementasikan struktur database berdasarkan DBML.

### Tasks

#### Database Migration

* [ ] Membuat migration tabel `categories`
* [ ] Membuat migration tabel `suppliers`
* [ ] Membuat migration tabel `medicines`
* [ ] Membuat migration tabel `medicine_batches`
* [ ] Membuat migration tabel `prescriptions`
* [ ] Membuat migration tabel `transactions`
* [ ] Membuat migration tabel `transaction_details`

#### Eloquent Models

* [ ] Membuat model Category
* [ ] Membuat model Supplier
* [ ] Membuat model Medicine
* [ ] Membuat model MedicineBatch
* [ ] Membuat model Prescription
* [ ] Membuat model Transaction
* [ ] Membuat model TransactionDetail

#### Relationship Definition

* [ ] Implementasi relasi antar model
* [ ] Implementasi foreign key constraint
* [ ] Implementasi trait `LogsActivity` pada model yang memerlukan audit trail

#### Seeder

* [ ] Membuat role Admin
* [ ] Membuat role Apoteker
* [ ] Membuat role Kasir
* [ ] Membuat role Pasien
* [ ] Membuat akun dummy untuk masing-masing role

### Acceptance Criteria

* Seluruh migration berhasil dijalankan
* Relasi model berjalan sesuai desain
* Data awal berhasil di-seed

---

## Phase 4 - Authentication & Authorization

### Objective

Mengimplementasikan autentikasi dan otorisasi berbasis role.

### Tasks

* [ ] Konfigurasi middleware permission
* [ ] Konfigurasi middleware role
* [ ] Proteksi route berdasarkan role
* [ ] Integrasi role dengan Inertia shared props
* [ ] Mengirim data role ke frontend secara global
* [ ] Implementasi conditional rendering menu berdasarkan role

### Acceptance Criteria

* Pengguna hanya dapat mengakses fitur sesuai role
* Informasi role tersedia di seluruh halaman frontend

---

## Phase 5 - Master Data Module & FIFO Stock Logic

### Objective

Mengembangkan modul master data dan logika pengelolaan stok.

### Tasks

#### Master Data

* [ ] CRUD kategori
* [ ] CRUD supplier
* [ ] CRUD obat
* [ ] CRUD batch obat

#### FIFO Inventory

* [ ] Implementasi algoritma FIFO
* [ ] Pengurangan stok berdasarkan batch dengan tanggal kedaluwarsa terdekat
* [ ] Implementasi database transaction saat update stok
* [ ] Implementasi `lockForUpdate()`
* [ ] Pengujian concurrent transaction

### Acceptance Criteria

* Stok tidak dapat bernilai negatif
* FIFO berjalan sesuai urutan batch
* Tidak terjadi race condition saat transaksi bersamaan

---

## Phase 6 - Transaction & Prescription Verification Module

### Objective

Mengembangkan proses pembelian dan validasi resep.

### Tasks

#### Shopping Cart

* [ ] Implementasi keranjang belanja
* [ ] Menyimpan item keranjang pengguna
* [ ] Sinkronisasi jumlah item dan subtotal

#### Checkout Process

* [ ] Membuat service checkout
* [ ] Menyimpan transaksi
* [ ] Menyimpan detail transaksi
* [ ] Mengurangi stok berdasarkan FIFO
* [ ] Menggunakan database transaction untuk menjaga konsistensi data

#### Prescription Verification

* [ ] Modul daftar resep menunggu verifikasi
* [ ] Fitur approve resep
* [ ] Fitur reject resep
* [ ] Audit log proses verifikasi

### Acceptance Criteria

* Checkout berhasil membuat transaksi lengkap
* Stok berkurang sesuai FIFO
* Obat keras memerlukan verifikasi apoteker

---

## Phase 7 - Real-Time Features & Background Jobs

### Objective

Mengimplementasikan fitur real-time dan asynchronous processing.

### Tasks

#### Real-Time Notification

* [ ] Membuat event `OrderStatusUpdated`
* [ ] Broadcast event menggunakan Reverb
* [ ] Integrasi Laravel Echo pada frontend
* [ ] Menampilkan status pesanan secara real-time

#### Queue & Background Processing

* [ ] Konfigurasi queue worker
* [ ] Job generate PDF laporan
* [ ] Job import Excel
* [ ] Job notifikasi stok minimum
* [ ] Job notifikasi obat mendekati kedaluwarsa (30/60/90 hari)

### Acceptance Criteria

* Perubahan status pesanan diterima tanpa refresh halaman
* Seluruh proses berat berjalan melalui queue

---

## Phase 8 - UI/UX Finalization

### Objective

Menyempurnakan pengalaman pengguna dan performa frontend.

### Tasks

* [ ] Implementasi katalog obat
* [ ] Implementasi pencarian obat
* [ ] Implementasi fuzzy search
* [ ] Dashboard analitik
* [ ] Grafik penjualan
* [ ] Grafik stok obat
* [ ] Optimasi rendering komponen React
* [ ] Optimasi loading data
* [ ] Responsive layout desktop dan mobile

### Acceptance Criteria

* Antarmuka responsif
* Pencarian obat berjalan cepat
* Dashboard dapat menampilkan data analitik secara interaktif
* Tidak terdapat penurunan performa yang signifikan saat penggunaan normal

---

## Definition of Done

* [ ] Seluruh fitur pada SDD telah diimplementasikan
* [ ] Migration dan seeder berjalan tanpa error
* [ ] Unit test dan integration test lulus
* [ ] Audit log berjalan dengan baik
* [ ] Queue worker berjalan stabil
* [ ] Real-time notification berfungsi
* [ ] Dokumentasi instalasi diperbarui
* [ ] Sistem siap untuk proses UAT
