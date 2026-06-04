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

        // Ubah status menjadi processing (Sedang dikerjakan)
        $export->update(['status' => 'processing']);

        try {
            // Ambil data transaksi yang sudah selesai
            $transactions = Transaction::with(['patient', 'details.medicine'])
                ->whereIn('status', ['completed', 'shipped'])
                ->get();

            // Generate PDF
            $pdf = Pdf::loadView('pdf.sales-report', ['transactions' => $transactions]);
            
            // Simpan ke storage
            $fileName = 'reports/sales_report_' . time() . '.pdf';
            Storage::disk('public')->put($fileName, $pdf->output());

            // Sukses: Ubah status menjadi completed
            $export->update([
                'status' => 'completed',
                'file_path' => $fileName
            ]);

        } catch (\Exception $e) {
            // Gagal: Tangkap pesan error dan simpan ke database sesuai ERD
            Log::error('PDF Generate Failed: ' . $e->getMessage());
            $export->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
        }
    }
}