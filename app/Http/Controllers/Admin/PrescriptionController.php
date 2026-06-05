<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status', 'pending');

        $prescriptions = Prescription::with(['patient', 'transaction.details.medicine'])
            ->where('status', $status)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/prescriptions/index', [
            'prescriptions' => $prescriptions,
            'filters' => ['status' => $status],
        ]);
    }

    public function update(Request $request, Prescription $prescription)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'required_if:status,rejected|nullable|string',
        ], [
            'notes.required_if' => 'Alasan penolakan wajib diisi jika resep ditolak.',
        ]);

        try {
            DB::transaction(function () use ($validated, $prescription) {
                // 1. Update status resep
                $prescription->update([
                    'status' => $validated['status'],
                    'notes' => $validated['notes'],
                    'pharmacist_id' => Auth::id(), // Catat siapa apoteker yang memverifikasi
                ]);

                $transaction = $prescription->transaction;

                // 2. Logika Penyesuaian Transaksi & Stok
                if ($validated['status'] === 'approved') {
                    // Jika disetujui, transaksi berlanjut untuk diproses/dikemas
                    $transaction->update(['status' => 'processing']);
                    
                } elseif ($validated['status'] === 'rejected') {
                    // Jika ditolak, transaksi dibatalkan
                    $transaction->update(['status' => 'cancelled']);

                    // KEMBALIKAN STOK (Rollback FIFO) ke batch masing-masing
                    foreach ($transaction->details as $detail) {
                        $batch = $detail->medicineBatch;
                        if ($batch) {
                            $batch->increment('quantity_current', $detail->quantity);
                        }
                    }
                }
            });

            return back()->with('success', 'Verifikasi resep berhasil diproses.');

        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }
}