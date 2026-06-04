<?php

namespace App\Jobs;

use App\Models\Medicine;
use Illuminate\Bus\Batchable; // Wajib ditambahkan untuk proses batch
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

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
        // Proses paralel: Masukkan tiap baris CSV ke database
        foreach ($this->dataChunk as $row) {
            Medicine::updateOrCreate(
                ['name' => $row['name']], // Jika nama obat sudah ada, update. Jika belum, buat baru.
                [
                    'category_id' => $row['category_id'],
                    'type' => $row['type'],
                    'price' => $row['price'],
                    'min_stock' => $row['min_stock'],
                    'description' => $row['description'] ?? null,
                ]
            );
        }
    }
}