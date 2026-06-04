<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');

        $orders = Transaction::with(['patient', 'details.medicine'])
            ->where('type', 'online')
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => ['status' => $status],
        ]);
    }

    public function update(Request $request, Transaction $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,cancelled'
        ]);

        $order->update(['status' => $validated['status']]);

        // KIRIM NOTIFIKASI KE PASIEN JIKA TRANSAKSI ONLINE DAN PASIEN TERDAFTAR
        if ($order->type === 'online' && $order->patient) {
            $order->patient->notify(new OrderStatusUpdated($order));
        }

        return back()->with('success', 'Status pesanan berhasil diperbarui dan notifikasi email telah dikirim ke pasien.');
    }

    public function verifyPayment(Transaction $order)
    {
        $order->update([
            'payment_status' => 'paid',
        ]);

        return back()->with('success', 'Pembayaran telah diverifikasi. Silakan proses pesanan ini.');
    }
}