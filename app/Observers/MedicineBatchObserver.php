<?php

namespace App\Observers;

use App\Models\MedicineBatch;
use App\Models\Medicine;
use App\Models\User;
use App\Notifications\SystemAlertNotification;

class MedicineBatchObserver
{
    /**
     * Dijalankan setiap kali batch baru dibuat.
     */
    public function created(MedicineBatch $batch)
    {
        $this->evaluateStockStatus($batch->medicine);
    }

    /**
     * Dijalankan setiap kali  batch lama diupdate.
     */
    public function updated(MedicineBatch $batch)
    {
        $this->evaluateStockStatus($batch->medicine);
    }

    /**
     * Dijalankan jika ada batch yang dihapus dari sistem.
     */
    public function deleted(MedicineBatch $batch)
    {
        $this->evaluateStockStatus($batch->medicine);
    }

    /**
     * Fungsi utama untuk mengevaluasi total stok dan mengirim notifikasi jika perlu.
     */
    private function evaluateStockStatus(Medicine $medicine)
    {
        // Hitung ulang total stok dari semua batch
        $totalStock = $medicine->batches()->sum('quantity_current');

        // KONDISI 1: Stok Kritis (di bawah atau sama dengan minimum)
        if ($totalStock <= $medicine->min_stock) {
            // Cek apakah belum pernah dinotifikasi
            if (!$medicine->is_low_stock_notified) {
                // 1. Kirim Notifikasi
                $admins = User::role(['admin', 'pharmacist'])->get();
                $msg = "Stok {$medicine->name} tersisa {$totalStock} (Batas minimum: {$medicine->min_stock}). Segera lakukan restok!";
                
                foreach ($admins as $admin) {
                    $admin->notify(new SystemAlertNotification('Stok Kritis', $msg, 'critical'));
                }

                // 2. Ubah flag menjadi true agar tidak spam
                $medicine->update(['is_low_stock_notified' => true]);
            }
        } 
        // KONDISI 2: Stok Aman (di atas minimum)
        else {
            // Cek apakah sebelumnya dalam status "kurang"
            if ($medicine->is_low_stock_notified) {
                
                // Kembalikan flag menjadi false karena stok sudah direstok/kembali normal
                $medicine->update(['is_low_stock_notified' => false]);
            }
        }
    }
}