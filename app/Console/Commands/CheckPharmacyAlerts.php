<?php

namespace App\Console\Commands;

use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\User;
use App\Notifications\SystemAlertNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;

#[Signature('pharmacy:check-alerts')]
#[Description('Command description')]
class CheckPharmacyAlerts extends Command
{
    public function handle()
    {
        $this->info('Memulai pengecekan alert apotek...');

        // Ambil semua user dengan role admin/apoteker untuk dikirim notifikasi
        $admins = User::role(['admin', 'pharmacist'])->get();

        // 1. CEK STOK KRITIS
        $medicines = Medicine::withSum('batches', 'quantity_current')->get();
        foreach ($medicines as $med) {
            $stock = $med->batches_sum_quantity_current ?? 0;
            if ($stock <= $med->min_stock) {
                $msg = "Stok {$med->name} tersisa {$stock} (Batas minimum: {$med->min_stock}). Segera lakukan restok!";
                
                foreach ($admins as $admin) {
                    $admin->notify(new SystemAlertNotification('Stok Kritis', $msg, 'critical'));
                }
            }
        }

        // 2. CEK OBAT MENDEKATI EXPIRED DATE (90, 60, 30 HARI)
        // Kita hitung hari menggunakan Carbon
        $today = Carbon::today();
        
        $batches = MedicineBatch::where('quantity_current', '>', 0)
                    ->whereNotNull('expired_at')
                    ->get();

        foreach ($batches as $batch) {
            $expiredDate = Carbon::parse($batch->expired_at);
            $daysLeft = $today->diffInDays($expiredDate, false); // false agar bisa minus jika sudah lewat

            $triggerAlert = false;
            $alertMsg = "";

            if ($daysLeft == 90) {
                $triggerAlert = true;
                $alertMsg = "Batch {$batch->batch_number} ({$batch->medicine->name}) akan kadaluarsa dalam 90 hari.";
            } elseif ($daysLeft == 60) {
                $triggerAlert = true;
                $alertMsg = "Batch {$batch->batch_number} ({$batch->medicine->name}) akan kadaluarsa dalam 60 hari.";
            } elseif ($daysLeft == 30) {
                $triggerAlert = true;
                $alertMsg = "PERHATIAN! Batch {$batch->batch_number} ({$batch->medicine->name}) akan kadaluarsa dalam 30 hari!";
            } elseif ($daysLeft <= 0 && $daysLeft >= -1) { 
                // Alert tepat saat hari H kedaluwarsa
                $triggerAlert = true;
                $alertMsg = "OBAT KADALUARSA! Batch {$batch->batch_number} ({$batch->medicine->name}) telah kedaluwarsa hari ini. Segera tarik dari gudang.";
            }

            if ($triggerAlert) {
                $level = $daysLeft <= 30 ? 'critical' : 'warning';
                foreach ($admins as $admin) {
                    $admin->notify(new SystemAlertNotification('Peringatan Kedaluwarsa', $alertMsg, $level));
                }
            }
        }

        $this->info('Pengecekan selesai dan notifikasi telah dikirim.');
    }
}
