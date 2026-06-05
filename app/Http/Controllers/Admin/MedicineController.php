<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ImportMedicineBatch;
use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Supplier;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $sortField = $request->input('sort_field', 'created_at');
        $sortDir = $request->input('sort_direction', 'desc');

        $medicines = Medicine::with(['category', 'batches'])
            ->withSum(['batches as total_stock' => function ($query) {
                $query->where('expired_at', '>', now());
            }], 'quantity_current')
            ->when($search, function ($query, $search) {
                $searchTerm = strtolower($search);
                $query->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"]);
            })
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($sortField === 'total_stock', function ($query) use ($sortDir) {
                // Tentukan posisi NULL berdasarkan arah sorting
                $nullPosition = strtolower($sortDir) === 'asc' ? 'NULLS FIRST' : 'NULLS LAST';
                
                // Gunakan alias langsung tanpa COALESCE, tapi tambahkan aturan posisi NULL
                $query->orderByRaw("total_stock {$sortDir} {$nullPosition}");
            }, function ($query) use ($sortField, $sortDir) {
                // Jika sort by kolom fisik (bukan alias)
                $query->orderBy($sortField, $sortDir);
            })
            ->paginate(10)
            ->withQueryString();

        $categories = Category::select('id', 'name')->orderBy('name')->get();
        $suppliers = Supplier::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('admin/medicines/index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'sort_field' => $sortField,
                'sort_direction' => $sortDir,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:prescription,over-the-counter,supplement,medical_device',
            'price' => 'required|numeric|min:0|max:99999999',
            'min_stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            
            // Validasi Kondisional untuk Batch Pertama
            'add_initial_batch' => 'boolean',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity' => 'nullable|required_if:add_initial_batch,true|integer|min:1',
            'expired_at' => 'nullable|required_if:add_initial_batch,true|date|after:today',
        ], [
            'price.max' => 'Harga tidak boleh lebih dari Rp 99.999.999',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('medicines', 'public');
            }

            $medicine = Medicine::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'],
                'type' => $validated['type'],
                'price' => $validated['price'],
                'min_stock' => $validated['min_stock'],
                'image_path' => $imagePath,
            ]);

            // Jika admin mencentang tambah stok awal
            if (!empty($validated['add_initial_batch'])) {
                $autoBatchNumber = 'BTC-' . date('Ymd') . '-' . strtoupper(Str::random(4));

                MedicineBatch::create([
                    'medicine_id' => $medicine->id,
                    'supplier_id' => $validated['supplier_id'],
                    'batch_number' => $autoBatchNumber,
                    'quantity_incoming' => $validated['quantity'],
                    'quantity_current' => $validated['quantity'], 
                    'received_at' => now(),
                    'expired_at' => $validated['expired_at'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Obat baru berhasil ditambahkan.');
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:prescription,over-the-counter,supplement,medical_device',
            'price' => 'required|numeric|min:0|max:99999999',
            'min_stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ], [
            'price.max' => 'Harga tidak boleh lebih dari Rp 99.999.999',
        ]);

        DB::transaction(function () use ($validated, $request, $medicine) {
            if ($request->hasFile('image')) {
                // Hapus gambar lama jika ada
                if ($medicine->image_path && Storage::disk('public')->exists($medicine->image_path)) {
                    Storage::disk('public')->delete($medicine->image_path);
                }
                $validated['image_path'] = $request->file('image')->store('medicines', 'public');
            }

            unset($validated['image']); // Jangan masukkan objek file ke update query
            $medicine->update($validated);
        });

        return redirect()->back()->with('success', 'Data obat berhasil diperbarui.');
    }

    public function destroy(Medicine $medicine)
    {
        if ($medicine->image_path && Storage::disk('public')->exists($medicine->image_path)) {
            Storage::disk('public')->delete($medicine->image_path);
        }

        // Berkat set cascadeOnDelete, semua MedicineBatch terkait akan ikut terhapus
        $medicine->delete();

        return redirect()->back()->with('success', 'Obat beserta riwayat stoknya berhasil dihapus.');
    }

    // Mengutus banyak pekerja untuk memecah CSV
    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:10240', // Maks 10MB
        ]);

        try {
            $path = $request->file('csv_file')->getRealPath();
            $handle = fopen($path, 'r');
            
            // Ambil header untuk pemetaan array_combine nanti
            $header = fgetcsv($handle);
            
            $chunkSize = 100;
            $chunk = [];
            $jobs = [];

            while (($row = fgetcsv($handle)) !== false) {
                // Abaikan baris kosong atau baris yang tidak sesuai dengan jumlah header
                if (empty(array_filter($row)) || count($row) !== count($header)) {
                    continue;
                }

                // Gabungkan header dengan data baris
                $chunk[] = array_combine($header, $row);

                if (count($chunk) === $chunkSize) {
                    $jobs[] = new ImportMedicineBatch($chunk);
                    $chunk = [];
                }
            }

            if (count($chunk) > 0) {
                $jobs[] = new ImportMedicineBatch($chunk);
            }

            fclose($handle);

            if (empty($jobs)) {
                return response()->json(['error' => 'File CSV tidak berisi data valid.'], 422);
            }

            // Jalankan Batching
            $batch = Bus::batch($jobs)
                ->name('Import Katalog Obat CSV: ' . now()->format('Y-m-d H:i:s'))
                ->dispatch();

            return response()->json([
                'batch_id' => $batch->id,
                'message' => 'File berhasil masuk antrean. Memproses di latar belakang...'
            ]);

        } catch (Exception $e) {
            return response()->json(['error' => 'Gagal membaca file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint API untuk mengecek progress bar secara realtime
     */
    public function importStatus(string $batchId)
    {
        $batch = Bus::findBatch($batchId);
        
        if (!$batch) {
            return response()->json(['progress' => 0, 'finished' => false]);
        }

        return response()->json([
            'progress' => $batch->progress(),
            'finished' => $batch->finished(),
            'failed' => $batch->hasFailures(),
            'total_jobs' => $batch->totalJobs,
            'processed_jobs' => $batch->processedJobs(),
        ]);
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
        $columns = ['name', 'category_name', 'type', 'price', 'min_stock', 'description'];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            // (Opsional) Tambahkan satu baris dummy sebagai contoh cara pengisian bagi user
            fputcsv($file, [
                'Paracetamol 500mg', 
                'Obat Bebas',
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