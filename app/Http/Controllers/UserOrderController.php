<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserOrderController extends Controller
{
    public function index()
    {
        // Ambil riwayat pesanan milik user yang sedang login
        $orders = Transaction::with(['details.medicine'])
            ->where('patient_id', Auth::id())
            ->where('type', 'online')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('orders/index', [
            'orders' => $orders
        ]);
    }

    // Aksi ketika pelanggan mengklik "Pesanan Diterima"
    public function complete(Transaction $order)
    {
        // Keamanan: Pastikan ini benar-benar pesanan miliknya
        if ($order->patient_id !== Auth::id()) {
            abort(403);
        }

        if ($order->status === 'shipped') {
            $order->update(['status' => 'completed']);
            return back()->with('success', 'Pesanan berhasil diselesaikan. Terima kasih telah berbelanja!');
        }

        return back()->with('error', 'Status pesanan tidak dapat diubah.');
    }

    public function uploadPaymentProof(Request $request, Transaction $order)
    {
        if ($order->patient_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'payment_proof.required' => 'Silakan pilih foto bukti pembayaran terlebih dahulu.',
            'payment_proof.image' => 'File harus berupa gambar (JPG/PNG).',
        ]);

        $path = $request->file('payment_proof')->store('payments', 'public');

        $order->update([
            'payment_proof' => $path,
            'payment_status' => 'pending_verification', // Menunggu dicek Admin
        ]);

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Kami akan segera memverifikasinya.');
    }
}