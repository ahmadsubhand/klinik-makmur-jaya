<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use App\Notifications\NewOrderNotification;
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

        if ($order->status === 'pending' || $order->status === 'canceled') {
            return back()->with('error', 'Pembayaran hanya boleh dilakukan setelah apoteker menyetujui resep');
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

        // Ambil semua apoteker
        $pharmacists = User::role('pharmacist')->get();

        // Bedakan pesan berdasarkan kebutuhan resep
        $title = "Pesanan Online Baru Masuk";
        $message = "Pesanan #TRX-{$order->id} telah dibayar. Mohon segera konfirmasi pembayaran.";
        $level = "critical";

        foreach ($pharmacists as $pharmacist) {
            $pharmacist->notify(new NewOrderNotification($order->id, $title, $message, $level));
        }

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Kami akan segera memverifikasinya.');
    }
}