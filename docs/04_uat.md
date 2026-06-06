# 4. UAT (User Acceptance Testing)

## 1. Skenario Pengujian Pasien / Pelanggan

Fokus pengujian ini adalah untuk memastikan alur registrasi, pencarian obat, dan transaksi pembelian secara daring berjalan dengan lancar.

| ID Test | Skenario Pengujian | Langkah-Langkah | Ekspektasi Hasil | Status (Pass/Fail) |
|----------|-------------------|----------------|------------------|-------------------|
| UAT-P01 | Registrasi Akun Baru | 1. Akses halaman beranda dan klik "Daftar Sekarang".<br>2. Masukkan nama, email, nomor telepon, dan kata sandi.<br>3. Klik "Buat Akun Pasien". | Akun berhasil dibuat dan sistem mengirimkan verifikasi email ke pengguna. | [ ] |
| UAT-P02 | Pencarian Katalog Obat | 1. Ketik nama obat pada bilah pencarian.<br>2. Gunakan filter kategori (contoh: Suplemen & Vitamin). | Sistem menampilkan hasil pencarian dengan fitur autocomplete dan fuzzy search secara responsif. | [ ] |
| UAT-P03 | Checkout Obat Bebas | 1. Klik "Tambah ke Keranjang" pada obat bebas.<br>2. Buka keranjang dan klik "Lanjut ke Checkout".<br>3. Pilih metode pembayaran dan selesaikan pesanan. | Pesanan terbuat tanpa meminta unggahan resep, dan status pesanan menunggu pembayaran. | [ ] |
| UAT-P04 | Checkout Obat Resep | 1. Tambahkan obat dengan label "Wajib Resep" ke keranjang.<br>2. Lakukan checkout pesanan. | Sistem secara ketat menahan proses checkout dan mewajibkan pengguna mengunggah dokumen resep dokter (JPG/PNG). | [ ] |
| UAT-P05 | Pembatalan Pesanan Otomatis | 1. Buat pesanan baru.<br>2. Biarkan pesanan tanpa pembayaran selama lebih dari 24 jam. | Sistem membatalkan pesanan secara otomatis setelah melewati batas waktu pembayaran 24 jam. | [ ] |

## 2. Skenario Pengujian Apoteker

Fokus pengujian ini adalah manajemen inventaris, pengaturan katalog, dan kepatuhan dispensing obat dengan resep.

| ID Test | Skenario Pengujian | Langkah-Langkah | Ekspektasi Hasil | Status (Pass/Fail) |
|----------|-------------------|----------------|------------------|-------------------|
| UAT-A01 | Mengelola Master Obat | 1. Login sebagai Apoteker.<br>2. Tambah data obat baru beserta harga, komposisi, efek samping, dan batas minimum stok.<br>3. Unggah gambar obat. | Data obat, termasuk gambar dan rincian medis, berhasil tersimpan melalui fungsi CRUD dan tampil di katalog publik. | [ ] |
| UAT-A02 | Verifikasi Resep Dokter | 1. Buka daftar pesanan berstatus "Pending" yang membutuhkan resep.<br>2. Buka dan evaluasi keabsahan dokumen resep yang diunggah pasien.<br>3. Setujui (Approve) pesanan. | Status pesanan berubah dan siap diproses ke tahap selanjutnya, serta stok siap dipotong. | [ ] |
| UAT-A03 | Notifikasi Stok Minimum | 1. Lakukan transaksi hingga stok obat A berada di bawah minimum threshold.<br>2. Cek dashboard atau email notifikasi. | Sistem mengirimkan peringatan otomatis (in-app atau email) kepada Apoteker bahwa stok mencapai batas minimum. | [ ] |
| UAT-A04 | Peringatan Kadaluarsa | 1. Tambahkan data batch obat dengan expired date dalam 30, 60, atau 90 hari ke depan.<br>2. Cek notifikasi sistem. | Sistem memancarkan siaran alert peringatan sisa waktu kadaluarsa secara otomatis. | [ ] |

## 3. Skenario Pengujian Kasir

Pengujian ini memastikan bahwa sistem kasir offline terintegrasi penuh dengan persediaan online.

| ID Test | Skenario Pengujian | Langkah-Langkah | Ekspektasi Hasil | Status (Pass/Fail) |
|----------|-------------------|----------------|------------------|-------------------|
| UAT-K01 | Transaksi Offline Counter | 1. Login sebagai Kasir.<br>2. Input pesanan pasien walk-in di konter.<br>3. Proses pembayaran dan selesaikan transaksi. | Transaksi berhasil dicatat dan memotong stok global secara real-time dengan algoritma FIFO. | [ ] |
| UAT-K02 | Sinkronisasi Stok | 1. Buka halaman produk A di perangkat Pasien.<br>2. Lakukan penjualan produk A via Kasir (offline).<br>3. Refresh halaman produk A di perangkat Pasien. | Ketersediaan stok produk A di aplikasi Pasien langsung berkurang dan tersinkronisasi tepat setelah transaksi Kasir selesai. | [ ] |

## 4. Skenario Pengujian Admin

Pengujian ini berfokus pada manajemen infrastruktur sistem, pelaporan berskala besar, dan keamanan.

| ID Test | Skenario Pengujian | Langkah-Langkah | Ekspektasi Hasil | Status (Pass/Fail) |
|----------|-------------------|----------------|------------------|-------------------|
| UAT-AD01 | Keamanan Login Multi-Level | 1. Coba login menggunakan password yang salah.<br>2. Coba akses rute (URL) Apoteker menggunakan akun Pasien. | Sistem menolak login yang salah dan sistem RBAC memblokir akses yang tidak sesuai dengan peran pengguna. | [ ] |
| UAT-AD02 | Export Laporan Penjualan (PDF) | 1. Akses dashboard pelaporan.<br>2. Pilih rentang waktu data penjualan (bulanan).<br>3. Klik Export PDF. | Proses generate PDF berlogo klinik berjalan di latar belakang (background job) tanpa membekukan halaman (no UI freeze). | [ ] |
| UAT-AD03 | Import Katalog CSV (Paralel) | 1. Siapkan file CSV berisi ribuan data obat sesuai template.<br>2. Unggah file melalui fitur Batch Import. | Sistem menyerap ribuan baris data secara paralel tanpa hambatan dan status import dapat dipantau. | [ ] |
| UAT-AD04 | Pemantauan Audit Log | 1. Akses menu Monitor Audit Log & Error.<br>2. Cari aktivitas penambahan obat atau transaksi yang baru saja dilakukan. | Sistem mencatat histori aktivitas pengguna dengan detail siapa yang melakukan, waktu kejadian, dan apa yang diubah. | [ ] |