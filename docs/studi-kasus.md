# Studi Kasus: Sistem E-Commerce Penjualan Obat Berbasis Web

## Latar Belakang

Klinik Makmur Jaya adalah sebuah klinik kesehatan yang berlokasi di kota besar di Indonesia dan menyediakan layanan konsultasi medis serta penjualan obat-obatan kepada pasien.

Klinik ini melayani rata-rata **150–200 pasien per hari** dengan inventaris lebih dari **2.000 jenis obat** dari berbagai kategori (obat resep, obat bebas, suplemen, dan alat kesehatan).

Saat ini, klinik mengalami beberapa permasalahan serius dalam operasional penjualan obat:

1. Proses penjualan obat masih dilakukan secara manual, yang menyebabkan ketidakteraturan dalam pencatatan transaksi dan berpotensi menimbulkan kesalahan dalam pelayanan kepada pasien.

2. Belum tersedianya platform berbasis web yang memfasilitasi pembelian obat secara daring, sehingga membatasi akses pasien terhadap layanan farmasi, khususnya di luar jam operasional klinik.

3. Ketiadaan sistem yang dapat memantau stok obat secara real-time, menyebabkan potensi keterlambatan restock, kekurangan obat, atau kelebihan persediaan yang tidak efisien.

4. Tidak ada sistem pelaporan penjualan yang terintegrasi, sehingga manajemen kesulitan menganalisis tren penjualan dan membuat keputusan strategis terkait pengadaan obat.

5. Proses verifikasi resep dokter masih dilakukan secara manual, meningkatkan risiko kesalahan dispensing dan memakan waktu yang lama.

Manajemen Klinik Makmur Jaya memutuskan untuk membangun sebuah **Sistem E-Commerce Penjualan Obat Berbasis Web** untuk menyelesaikan permasalahan di atas.

---

# Deskripsi Sistem yang Dibangun

Anda diminta untuk membangun **Sistem E-Commerce Penjualan Obat Berbasis Web** pada Klinik Makmur Jaya yang mencakup seluruh unit kompetensi yang diujikan.

Website harus dapat diakses oleh berbagai peran pengguna (**Admin, Apoteker, Kasir, dan Pasien/Pelanggan**) dan mampu mengelola data obat, transaksi penjualan, serta stok secara real-time.

Sistem juga harus mendukung proses pembelian daring dengan fitur:

* Keranjang belanja (Shopping Cart)
* Checkout
* Konfirmasi pembayaran

---

# Kebutuhan Fungsional

## Modul 1: Autentikasi dan Keamanan

### Fitur

a. Sistem login dengan autentikasi multi-level:

* Admin
* Apoteker
* Kasir
* Pasien/Pelanggan

b. Sistem registrasi pelanggan dengan verifikasi email dan validasi data diri

c. Implementasi password hashing (bcrypt/argon2) dan validasi kekuatan password

d. Proteksi terhadap serangan:

* SQL Injection
* XSS
* CSRF

e. Sistem session management dengan timeout otomatis

f. Audit log untuk mencatat seluruh aktivitas pengguna (siapa, kapan, melakukan apa)

g. Dokumen analisis risiko keamanan informasi beserta langkah mitigasi

---

## Modul 2: Dashboard dan Real-Time Monitoring

### Fitur

a. Dashboard utama dengan grafik dan chart interaktif yang menampilkan:

* Penjualan harian
* Penjualan mingguan
* Penjualan bulanan
* Stok obat
* Pendapatan

b. Katalog obat berbasis web dengan fitur:

* Pencarian
* Filter kategori

  * Obat resep
  * Obat bebas
  * Suplemen
  * Alat kesehatan
* Sorting harga

c. Halaman detail produk dengan informasi:

* Nama obat
* Deskripsi
* Komposisi
* Dosis
* Efek samping
* Harga
* Ketersediaan stok

d. Galeri produk dengan fitur upload dan preview gambar obat (multimedia)

e. Real-time notification ketika ada:

* Perubahan stok kritis
* Pesanan baru masuk

f. Export laporan penjualan dalam format PDF dengan elemen visual:

* Logo klinik
* Grafik
* Tabel berwarna

---

## Modul 3: Manajemen Data dan Transaksi (CRUD + SQL)

### Fitur

a. CRUD lengkap untuk data:

* Obat
* Kategori Obat
* Supplier
* Pelanggan
* Transaksi Penjualan
* Resep

b. Implementasi query SQL untuk:

* Laporan penjualan
* Stok terlaris
* Obat mendekati kadaluarsa
* Rekap transaksi

c. Algoritma pencarian obat dengan fitur:

* Autocomplete
* Fuzzy Search

d. Algoritma perhitungan stok otomatis berbasis FIFO (First In First Out) untuk mengelola obat berdasarkan tanggal kadaluarsa

e. Pagination, sorting, dan filtering data dengan performa optimal

f. Fitur keranjang belanja (cart):

* Tambah item
* Hapus item
* Ubah jumlah
* Hitung total harga

g. Proses checkout dengan pilihan metode pembayaran dan konfirmasi pesanan

h. Sistem verifikasi resep dokter untuk obat-obatan yang memerlukan resep

---

## Modul 4: Sistem Notifikasi dan Alert

### Fitur

a. Alert otomatis ketika stok obat di bawah minimum threshold:

* Email Notification
* In-App Notification

b. Notifikasi otomatis kepada apoteker ketika ada obat mendekati tanggal kadaluarsa:

* 90 hari sebelumnya
* 60 hari sebelumnya
* 30 hari sebelumnya

c. Notifikasi kepada pelanggan terkait status pesanan:

* Dikonfirmasi
* Diproses
* Siap diambil
* Dikirim

d. Notifikasi error/exception pada aplikasi yang dikirim ke admin

e. Dashboard log error dengan kategorisasi severity:

* Critical
* Warning
* Info

---

## Modul 5: Pemrosesan Paralel dan Manajemen Pesanan

### Fitur

a. Pemrosesan pesanan secara paralel sehingga beberapa pesanan dapat diproses bersamaan tanpa bottleneck pada sistem

b. Batch import data obat dari file CSV/Excel dengan proses paralel untuk pembaruan katalog

c. Background job untuk generate laporan penjualan besar tanpa mengganggu respons UI

d. Implementasi job queue untuk:

* Pemrosesan pembayaran
* Update stok otomatis

e. Sinkronisasi stok real-time antara:

* Penjualan offline (counter)
* Penjualan online

---

# Kebutuhan Non-Fungsional

## Arsitektur dan Infrastruktur

a. Menyusun dokumen arsitektur perangkat keras yang menggambarkan:

* Topologi web server
* Database server
* Jaringan yang dibutuhkan

(Dapat berupa diagram)

b. Menentukan spesifikasi minimum server yang direkomendasikan:

* Prosesor
* RAM
* Storage
* Bandwidth

Untuk menangani traffic e-commerce.

---

## Tools dan Framework

a. Menganalisis dan mendokumentasikan pemilihan:

* Tools
* Library
* Komponen
* Framework

Beserta alasan pemilihannya.

b. Analisis skalabilitas:

Bagaimana sistem dapat menangani peningkatan jumlah pengguna dan volume transaksi tanpa degradasi performa yang signifikan.

c. Dokumentasi library atau komponen pihak ketiga yang digunakan:

* Versi
* Lisensi
* Fungsi

---

## Kebutuhan Migrasi dan Pembaharuan

a. Simulasi migrasi dari sistem manual (pencatatan manual/spreadsheet) ke sistem e-commerce, meliputi:

* Strategi migrasi data obat
* Mapping field
* Validasi data pasca migrasi
* Rollback plan

b. Menyusun dokumen cutover plan yang mencakup:

* Timeline
* Checklist pra-cutover
* Langkah cutover
* Verifikasi pasca-cutover

c. Simulasi pembaharuan (update) perangkat lunak:

* Menambahkan fitur baru
* Tidak mengganggu fitur yang sudah berjalan
* Menggunakan Version Control (Git)

d. Menyusun impact analysis terhadap modul lain apabila terjadi perubahan pada salah satu fitur.

---

## Dokumentasi Teknis untuk Pelanggan

a. Menyusun User Guide yang mencakup langkah penggunaan setiap modul, termasuk pembelian obat online.

b. Menyusun FAQ (Frequently Asked Questions) minimal 10 pertanyaan terkait penggunaan sistem e-commerce.

c. Menyediakan dokumentasi API (jika terdapat endpoint API) untuk integrasi dengan sistem lain.

d. Menyusun Troubleshooting Guide untuk masalah umum yang mungkin dialami pengguna saat bertransaksi.
