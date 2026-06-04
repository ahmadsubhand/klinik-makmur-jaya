<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Prescription;
use Carbon\Carbon;
use Faker\Factory as Faker;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('4/4: Membangun Ratusan Riwayat Transaksi Historis (Mohon Tunggu)...');
        
        $faker = Faker::create('id_ID');

        // Ambil User berdasarkan Role kustom Anda
        $patientRole = Role::where('name', 'patient')->first();
        $patients = User::whereHas('roles', function($q) use ($patientRole) {
            $q->where('role_id', $patientRole->id);
        })->get();

        $pharmacistRole = Role::where('name', 'pharmacist')->first();
        $pharmacist = User::whereHas('roles', function($q) use ($pharmacistRole) {
            $q->where('role_id', $pharmacistRole->id);
        })->first();

        $cashierRole = Role::where('name', 'cashier')->first();
        $cashier = User::whereHas('roles', function($q) use ($cashierRole) {
            $q->where('role_id', $cashierRole->id);
        })->first();

        $medicines = Medicine::all();
        if ($medicines->isEmpty() || $patients->isEmpty()) {
            $this->command->error('Data Obat atau Pasien kosong. Pastikan MasterDataSeeder dan UserSeeder dijalankan lebih dulu.');
            return;
        }

        // GENERATE 200 TRANSAKSI HISTORIS (Dalam 90 Hari Terakhir)
        for ($i = 0; $i < 200; $i++) {
            $txDate = Carbon::today()->subDays(rand(0, 90))->subMinutes(rand(10, 1400));
            $isOnline = rand(1, 10) > 4; // 60% Online, 40% Offline (POS)

            $patient = $isOnline ? $patients->random() : null;
            $itemsCount = rand(1, 4);
            $selectedMeds = $medicines->random($itemsCount);

            // 1. Cek apakah di keranjang ini ada Obat Keras (Prescription)
            $needsPrescription = $selectedMeds->contains('type', 'prescription');
            $prescriptionId = null;

            if ($isOnline && $needsPrescription) {
                // Skenario Resep Dokter: Sebagian di-approve, sebagian pending/rejected
                $presStatus = $faker->randomElement(['approved', 'approved', 'approved', 'pending', 'rejected']);
                
                $prescription = Prescription::create([
                    'patient_id' => $patient->id,
                    'pharmacist_id' => ($presStatus !== 'pending') ? $pharmacist->id : null,
                    // Buat file dummy di storage (anggap saja gambar resep)
                    'prescription_path' => 'prescriptions/dummy_resep_' . rand(1000,9999) . '.jpg',
                    'status' => $presStatus,
                    'notes' => ($presStatus === 'rejected') ? 'Resep sudah melewati batas waktu/kadaluarsa' : null,
                    'created_at' => $txDate,
                    'updated_at' => $txDate,
                ]);
                $prescriptionId = $prescription->id;
            }

            // 2. Set Status Transaksi dan Pembayaran
            if ($isOnline) {
                // Jika resep rejected, transaksi otomatis cancelled
                if ($needsPrescription && $prescriptionId && Prescription::find($prescriptionId)->status === 'rejected') {
                    $status = 'cancelled';
                    $payStatus = 'unpaid';
                } else {
                    $status = $faker->randomElement(['completed', 'shipped', 'processing', 'pending', 'cancelled']);
                    $payStatus = match($status) {
                        'completed', 'shipped', 'processing' => 'paid',
                        'pending' => $faker->randomElement(['unpaid', 'pending_verification']),
                        'cancelled' => 'unpaid',
                        default => 'unpaid'
                    };
                }
                
                $payMethod = $faker->randomElement(['transfer_bank', 'qris', 'ewallet']);
                // Generate Bukti Bayar palsu jika sudah upload
                $payProof = in_array($payStatus, ['pending_verification', 'paid']) ? 'payments/dummy_struk_' . rand(1000,9999) . '.jpg' : null;
            } else {
                // Offline POS
                $status = 'completed';
                $payStatus = 'paid';
                $payMethod = $faker->randomElement(['cash', 'qris', 'debit']);
                $payProof = null;
            }

            // 3. Buat Header Transaksi
            $transaction = Transaction::create([
                'patient_id' => $patient?->id,
                'cashier_id' => !$isOnline ? $cashier->id : null,
                'prescription_id' => $prescriptionId,
                'type' => $isOnline ? 'online' : 'offline',
                'status' => $status,
                'payment_method' => $payMethod,
                'payment_status' => $payStatus,
                'payment_proof' => $payProof,
                'total_price' => 0, // Akan dihitung setelah item dimasukkan
                'created_at' => $txDate,
                'updated_at' => $txDate,
            ]);

            // 4. Masukkan Detail Transaksi (Loop Obat)
            $totalPrice = 0;
            foreach ($selectedMeds as $med) {
                $qty = rand(1, 4);
                // Cari Batch yang stoknya masih ada
                $batch = MedicineBatch::where('medicine_id', $med->id)->where('quantity_current', '>', 0)->first();
                
                if ($batch) {
                    $subtotal = $med->price * $qty;
                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'medicine_id' => $med->id,
                        'medicine_batch_id' => $batch->id,
                        'quantity' => $qty,
                        'price_per_unit' => $med->price,
                        'subtotal' => $subtotal,
                        'created_at' => $txDate,
                        'updated_at' => $txDate,
                    ]);
                    $totalPrice += $subtotal;
                }
            }

            // Update Grand Total
            $transaction->update(['total_price' => $totalPrice]);
        }

        $this->command->info('✅ 200 Transaksi (Online, Kasir, Lengkap dgn Resep & Bukti Bayar) berhasil dibuat!');
    }
}