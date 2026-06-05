<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateSalesReportPdf;
use App\Models\ExportDocument;
use App\Models\Medicine;
use App\Models\Transaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        
        // 4. Ambil 10 obat yang paling mendesak (stok paling sedikit)
        $criticalStocks = $criticalStocks->sortBy('calculated_stock')->take(10)->values();

        // 5. OBAT TERLARIS BULAN INI
        $bestSellers = DB::table('transaction_details')
            ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->join('medicines', 'medicines.id', '=', 'transaction_details.medicine_id')
            ->whereIn('transactions.status', $validStatuses)
            ->where('transactions.created_at', '>=', $thisMonth)
            ->select('medicines.id', 'medicines.name', DB::raw('SUM(transaction_details.quantity) as total_sold'))
            ->groupBy('medicines.id', 'medicines.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard/index', [
            'stats' => [
                'revenueToday' => $revenueToday,
                'revenueMonth' => $revenueMonth,
                'ordersToday' => $ordersToday,
                'ordersMonth' => $ordersMonth,
            ],
            'chartData' => $chartData,
            'criticalStocks' => $criticalStocks,
            'exports' => ExportDocument::with('user')->latest()->get(),
            'bestSellers' => $bestSellers,
        ]);
    }

    public function requestPdf()
    {
        $currentMonth = now()->translatedFormat('F Y'); // Contoh: Juni 2026

        // 1. Catat ke tabel export_documents
        $export = ExportDocument::create([
            'user_id' => Auth::id(),
            'report_name' => 'Laporan Penjualan - ' . $currentMonth,
            'type' => 'transaction',
            'status' => 'pending',
        ]);

        // 2. Utus Job ke belakang layar
        GenerateSalesReportPdf::dispatch($export->id);

        return back()->with('success', 'Pembuatan PDF laporan bulan ' . $currentMonth . ' sedang diproses. Silakan pantau statusnya di tabel riwayat.');
    }
}