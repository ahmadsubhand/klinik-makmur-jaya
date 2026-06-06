<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use Faker\Factory as Faker;
use Carbon\Carbon;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // 1. DATA SUPPLIER PABRIK FARMASI (Sesuai ERD)
        $suppliers = [];
        $supplierNames = [
            'PT Kalbe Farma Tbk', 
            'PT Kimia Farma Tbk', 
            'PT Sanbe Farma', 
            'PT Dexa Medica', 
            'PT Pharos Indonesia'
        ];
        foreach ($supplierNames as $name) {
            $suppliers[] = Supplier::create([
                'name' => $name,
                'contact' => $faker->phoneNumber,
                'address' => $faker->address,
            ]);
        }
        $this->command->info('--- 5 Supplier berhasil dibuat.');

        // 2. DATA KATEGORI
        $categories = [
            Category::create(['name' => 'Obat Bebas', 'description' => 'Bisa dibeli tanpa resep dokter']),
            Category::create(['name' => 'Obat Keras', 'description' => 'Wajib menggunakan resep dokter']),
            Category::create(['name' => 'Suplemen & Vitamin', 'description' => 'Nutrisi dan daya tahan tubuh']),
            Category::create(['name' => 'Alat Kesehatan', 'description' => 'Perlengkapan medis non-konsumsi']),
            Category::create(['name' => 'Obat Sirup', 'description' => 'Obat cair khusus anak & dewasa']),
        ];

        // 3. DATA OBAT (Katalog Lengkap)
        $medicineList = [
            ['name' => 'Amoxicillin 500mg', 'type' => 'prescription', 'price' => 15000, 'min' => 20, 'cat' => 1],
            ['name' => 'Omeprazole 20mg', 'type' => 'prescription', 'price' => 25000, 'min' => 15, 'cat' => 1],
            ['name' => 'Metformin 500mg', 'type' => 'prescription', 'price' => 18000, 'min' => 30, 'cat' => 1],
            ['name' => 'Paracetamol 500mg', 'type' => 'over-the-counter', 'price' => 5000, 'min' => 50, 'cat' => 0],
            ['name' => 'Ibuprofen 400mg', 'type' => 'over-the-counter', 'price' => 8000, 'min' => 40, 'cat' => 0],
            ['name' => 'Promag Tablet', 'type' => 'over-the-counter', 'price' => 9000, 'min' => 30, 'cat' => 0],
            ['name' => 'Tolak Angin Cair', 'type' => 'over-the-counter', 'price' => 35000, 'min' => 25, 'cat' => 4],
            ['name' => 'Sanmol Sirup Anak', 'type' => 'over-the-counter', 'price' => 22000, 'min' => 15, 'cat' => 4],
            ['name' => 'Neurobion Forte', 'type' => 'supplement', 'price' => 38000, 'min' => 20, 'cat' => 2],
            ['name' => 'Vitamin C 1000mg', 'type' => 'supplement', 'price' => 45000, 'min' => 30, 'cat' => 2],
            ['name' => 'Imboost Force', 'type' => 'supplement', 'price' => 65000, 'min' => 15, 'cat' => 2],
            ['name' => 'Masker Medis Sensi 3-Ply', 'type' => 'medical_device', 'price' => 120000, 'min' => 10, 'cat' => 3],
            ['name' => 'Termometer Digital Omron', 'type' => 'medical_device', 'price' => 75000, 'min' => 5, 'cat' => 3],
            ['name' => 'Oksigen Kaleng Oxycan', 'type' => 'medical_device', 'price' => 55000, 'min' => 10, 'cat' => 3],
            ['name' => 'Perban Elastis 5cm', 'type' => 'medical_device', 'price' => 15000, 'min' => 20, 'cat' => 3],
        ];

        $medicines = [];
        foreach ($medicineList as $medData) {
            $medicines[] = Medicine::create([
                'category_id' => $categories[$medData['cat']]->id,
                'name' => $medData['name'],
                'description' => $faker->paragraph(2),
                'type' => $medData['type'],
                'price' => $medData['price'],
                'min_stock' => $medData['min'],
                'image_path' => 'medicines/obat.png'
            ]);
        }
        $this->command->info('--- 15 Jenis Obat beragam berhasil dibuat.');

        // 4. DATA BATCH (STOK & KADALUARSA)
        // Kita racik agar Cron Job peringatan Anda bekerja!
        foreach ($medicines as $med) {
            // Skenario 1: Batch Aman (Kadaluarsa 2 tahun lagi)
            MedicineBatch::create([
                'medicine_id' => $med->id,
                'supplier_id' => $faker->randomElement($suppliers)->id, // ERD Compliance
                'batch_number' => 'SAF-' . strtoupper(Str::random(5)),
                'quantity_incoming' => 100,
                'quantity_current' => rand(50, 100),
                'received_at' => Carbon::now()->subMonths(2),
                'expired_at' => Carbon::now()->addMonths(24),
            ]);

            // Skenario 2: Batch Menipis & Mendekati Expired (Alert Trigger 30/60/90 hari)
            MedicineBatch::create([
                'medicine_id' => $med->id,
                'supplier_id' => $faker->randomElement($suppliers)->id,
                'batch_number' => 'WRN-' . strtoupper(Str::random(5)),
                'quantity_incoming' => 50,
                'quantity_current' => rand(2, 10), // Celengan Stok Kritis!
                'received_at' => Carbon::now()->subMonths(10),
                'expired_at' => Carbon::now()->addDays($faker->randomElement([25, 55, 85])), // Trigger expired alert!
            ]);

            // Skenario 3: Beberapa obat ada yang SUDAH Expired
            if (rand(1, 3) === 2) {
                MedicineBatch::create([
                    'medicine_id' => $med->id,
                    'supplier_id' => $faker->randomElement($suppliers)->id,
                    'batch_number' => 'EXP-' . strtoupper(Str::random(5)),
                    'quantity_incoming' => 20,
                    'quantity_current' => rand(5, 20), // Masih ada sisa tapi expired
                    'received_at' => Carbon::now()->subYears(2),
                    'expired_at' => Carbon::now()->subDays(rand(5, 30)), 
                ]);
            }
        }
        $this->command->info('--- Data Batch (Stok FIFO & Skenario Kadaluarsa) berhasil diracik.');
    }
}