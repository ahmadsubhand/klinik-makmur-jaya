<?php

namespace App\Jobs;

use App\Models\Category;
use App\Models\Medicine;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ImportMedicineBatch implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $dataChunk;

    public function __construct(array $dataChunk)
    {
        $this->dataChunk = $dataChunk;
    }

    public function handle(): void
    {
        // 1. Cek apakah user membatalkan proses batch
        if ($this->batch() && $this->batch()->cancelled()) {
            return;
        }

        // 2. Gunakan Transaction agar jika 1 chunk gagal, tidak ada data parsial yang tersimpan
        DB::beginTransaction();

        try {
            foreach ($this->dataChunk as $row) {
                // 1. Cari kategori berdasarkan nama (case-insensitive)
                // Menggunakan firstOrCreate untuk memastikan kategori tersedia
                $categoryName = trim($row['category_name']);
                
                $category = Category::whereRaw('LOWER(name) = ?', [strtolower($categoryName)])
                                    ->first();

                if (!$category) {
                    $category = Category::create(['name' => $categoryName]);
                }

                // 2. Simpan obat dengan category_id yang baru saja ditemukan/dibuat
                Medicine::updateOrCreate(
                    ['name' => $row['name']], 
                    [
                        'category_id' => $category->id,
                        'type'        => $row['type'],
                        'price'       => $row['price'],
                        'min_stock'   => $row['min_stock'],
                        'description' => $row['description'] ?? null,
                    ]
                );
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            
            // 3. Lempar kembali error agar Laravel mencatatnya di 'failed_jobs'
            // dan menandai batch ini sebagai gagal
            throw $e;
        }
    }
}