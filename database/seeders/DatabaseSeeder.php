<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Memulai Seeding Database E-Commerce Apotek...');

        // Nonaktifkan foreign key checks sementara agar tidak error saat truncate
        Schema::disableForeignKeyConstraints();

        $this->call([
            // AdminUserSeeder::class,
            RoleSeeder::class,           // 1. Setup Role & Permission (Spatie)
            UserSeeder::class,           // 2. Akun Pegawai & Pasien
            MasterDataSeeder::class,     // 3. Kategori, Supplier, Obat, & Batch (Stok)
            TransactionSeeder::class,    // 4. Transaksi, Resep, Detail Transaksi (Pembayaran)
        ]);

        Schema::enableForeignKeyConstraints();

        $this->command->info('✅ Seluruh proses seeding telah selesai dengan sukses!');
    }
}
