<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Transaction;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // 1. STATISTIK KARTU ATAS (Pendapatan & Pesanan)
        // Kita hitung transaksi yang valid (selesai/dikirim/diproses)
        $validStatuses = ['completed', 'shipped', 'processing'];

        $revenueToday = Transaction::whereDate('created_at', $today)
            ->whereIn('status', $validStatuses)
            ->sum('total_price');

        $revenueMonth = Transaction::where('created_at', '>=', $thisMonth)
            ->whereIn('status', $validStatuses)
            ->sum('total_price');

        $ordersToday = Transaction::whereDate('created_at', $today)->count();
        $ordersMonth = Transaction::where('created_at', '>=', $thisMonth)->count();

        // 2. GRAFIK PENDAPATAN 7 HARI TERAKHIR
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $total = Transaction::whereDate('created_at', $date)
                ->whereIn('status', $validStatuses)
                ->sum('total_price');
                
            $chartData[] = [
                'name' => $date->format('d M'),
                'Pendapatan' => (float) $total,
            ];
        }

        // 3. MONITORING STOK KRITIS (Alert otomatis)
        // Menghitung jumlah stok saat ini dari relasi batches (Kinerja tinggi pakai withSum)
        $medicines = Medicine::with('category')
            ->withSum('batches', 'quantity_current')
            ->get();

        $criticalStocks = collect();
        foreach ($medicines as $med) {
            $currentStock = $med->batches_sum_quantity_current ?? 0;
            if ($currentStock <= $med->min_stock) {
                $med->calculated_stock = $currentStock; // Simpan untuk ditampilkan
                $criticalStocks->push($med);
            }
        }
        
        // Ambil 10 obat yang paling mendesak (stok paling sedikit)
        $criticalStocks = $criticalStocks->sortBy('calculated_stock')->take(10)->values();

        return Inertia::render('admin/dashboard/index', [
            'stats' => [
                'revenueToday' => $revenueToday,
                'revenueMonth' => $revenueMonth,
                'ordersToday' => $ordersToday,
                'ordersMonth' => $ordersMonth,
            ],
            'chartData' => $chartData,
            'criticalStocks' => $criticalStocks,
        ]);
    }
}