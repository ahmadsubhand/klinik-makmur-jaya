<?php

namespace App\Jobs;

use App\Models\ExportDocument;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GenerateSalesReportPdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $exportId;

    public function __construct(int $exportId)
    {
        $this->exportId = $exportId;
    }

    public function handle(): void
    {
        /** @var ExportDocument|null $export */
        $export = ExportDocument::find($this->exportId);
        if (!$export) return;

        $export->update(['status' => 'processing']);

        try {
            $startOfMonth = now()->startOfMonth();
            $endOfMonth = now()->endOfMonth();

            // 1. Data Detail Transaksi (Hanya Bulan Ini)
            // Asumsi model Transaction memiliki relasi belongsTo('patient')
            $transactions = Transaction::with(['patient'])
                ->whereIn('status', ['shipped', 'completed']) // Status yang dianggap berhasil
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->get();

            // 2. Rekap Transaksi (Agregat)
            $totalTransactions = $transactions->count();
            $totalRevenue = $transactions->sum('total_price'); 

            // 3. Stok Terlaris Bulan Ini (Top 5)
            $bestSellers = DB::table('transaction_details')
                ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
                ->join('medicines', 'medicines.id', '=', 'transaction_details.medicine_id')
                ->whereIn('transactions.status', ['shipped', 'completed'])
                ->whereBetween('transactions.created_at', [$startOfMonth, $endOfMonth])
                ->select('medicines.name', DB::raw('SUM(transaction_details.quantity) as total_sold'))
                ->groupBy('medicines.id', 'medicines.name')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get();

            // 4. Obat Mendekati Kadaluarsa (Dari tabel medicine_batches)
            // Mengambil data obat dari batch yang stok saat ini (quantity_current) > 0
            $expiringBatches = DB::table('medicine_batches')
                ->join('medicines', 'medicines.id', '=', 'medicine_batches.medicine_id')
                ->where('medicine_batches.quantity_current', '>', 0)
                ->where('medicine_batches.expired_at', '<=', now()->addDays(90))
                ->where('medicine_batches.expired_at', '>=', now())
                ->select(
                    'medicines.name', 
                    'medicine_batches.batch_number', 
                    'medicine_batches.quantity_current', 
                    'medicine_batches.expired_at'
                )
                ->orderBy('medicine_batches.expired_at', 'asc')
                ->limit(10)
                ->get();

            // 5. Generate Grafik Gambar (Menggunakan QuickChart)
            $chartUrl = $this->generateChartUrl($bestSellers);

            // 6. Generate PDF (isRemoteEnabled = true agar gambar luar/grafik bisa di-load)
            $pdf = Pdf::setOption(['isRemoteEnabled' => true])
                ->loadView('pdf.sales-report', [
                    'transactions' => $transactions,
                    'totalTransactions' => $totalTransactions,
                    'totalRevenue' => $totalRevenue,
                    'bestSellers' => $bestSellers,
                    'expiringBatches' => $expiringBatches,
                    'chartUrl' => $chartUrl,
                    'monthYear' => now()->translatedFormat('F Y')
                ]);
            
            // Simpan ke storage
            $fileName = 'reports/sales_report_' . time() . '.pdf';
            Storage::disk('public')->put($fileName, $pdf->output());

            $export->update([
                'status' => 'completed',
                'file_path' => $fileName
            ]);

        } catch (\Exception $e) {
            Log::error('PDF Generate Failed: ' . $e->getMessage());
            $export->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
        }
    }

    /**
     * @param \Illuminate\Support\Collection<int, \stdClass> $bestSellers
     */
    private function generateChartUrl($bestSellers): string
    {
        if ($bestSellers->isEmpty()) return '';

        $labels = $bestSellers->pluck('name')->toArray();
        $data = $bestSellers->pluck('total_sold')->toArray();

        $chartConfig = [
            'type' => 'bar',
            'data' => [
                'labels' => $labels,
                'datasets' => [[
                    'label' => 'Jumlah Terjual',
                    'data' => $data,
                    'backgroundColor' => '#059669'
                ]]
            ],
            'options' => [
                'plugins' => ['title' => ['display' => true, 'text' => 'Top 5 Obat Terlaris']]
            ]
        ];

        return 'https://quickchart.io/chart?c=' . urlencode(json_encode($chartConfig)) . '&w=600&h=300';
    }
}