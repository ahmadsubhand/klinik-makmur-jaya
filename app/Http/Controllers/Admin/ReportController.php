<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateSalesReportPdf;
use App\Jobs\ImportMedicineBatch;
use App\Models\ExportDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Bus;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/reports/index', [
            // Ambil data export beserta nama user yang merequest
            'exports' => ExportDocument::with('user')->latest()->get()
        ]);
    }

    public function requestPdf()
    {
        // 1. Catat ke tabel export_documents sesuai ERD
        $export = ExportDocument::create([
            'user_id' => Auth::id(),
            'report_name' => 'Laporan Penjualan ' . now()->format('d M Y H:i'),
            'type' => 'transaction',
            'status' => 'pending',
        ]);

        // 2. Utus Job ke belakang layar
        GenerateSalesReportPdf::dispatch($export->id);

        return back()->with('success', 'Pembuatan PDF sedang diproses. Silakan pantau statusnya di tabel riwayat.');
    }

    // Mengutus banyak pekerja untuk memecah CSV
    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:10240', // Maks 10MB
        ]);

        $file = $request->file('csv_file');
        $csvData = file_get_contents($file->getRealPath());
        $rows = array_map('str_getcsv', explode("\n", $csvData));
        $header = array_shift($rows); // Ambil baris pertama sebagai header

        $records = [];
        foreach ($rows as $row) {
            if (count($row) == count($header)) {
                $records[] = array_combine($header, $row);
            }
        }

        // Pecah data menjadi kelompok-kelompok kecil (misal per 100 baris) agar tidak membebani RAM
        $chunks = array_chunk($records, 100);

        $jobs = [];
        foreach ($chunks as $chunk) {
            $jobs[] = new ImportMedicineBatch($chunk);
        }

        // Jalankan semua chunk secara batching (Paralel)
        Bus::batch($jobs)->name('Import Katalog Obat CSV')->dispatch();

        return back()->with('success', 'Import CSV sedang berjalan di latar belakang. Katalog akan otomatis terupdate.');
    }

    // Method untuk mendownload format template CSV
    public function downloadCsvTemplate()
    {
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=template_import_obat.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // Kolom header sesuai yang dibutuhkan oleh Job ImportMedicineBatch
        $columns = ['name', 'category_id', 'type', 'price', 'min_stock', 'description'];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            // (Opsional) Tambahkan satu baris dummy sebagai contoh cara pengisian bagi user
            fputcsv($file, [
                'Paracetamol 500mg', 
                '1', 
                'over-the-counter', 
                '5000', 
                '10', 
                'Obat penurun panas dan pereda nyeri ringan'
            ]);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}