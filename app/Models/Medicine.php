<?php

namespace App\Models;

use App\Observers\AuditObserver;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(AuditObserver::class)]
#[Fillable([
    'category_id', 'name', 'description', 'type', 'price', 'min_stock', 'image_path'
])]
class Medicine extends Model
{
    use Auditable;

    // Menambahkan custom attribute secara otomatis (Total Stok & URL Gambar)
    protected $appends = ['total_stock', 'image_url'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function batches()
    {
        return $this->hasMany(MedicineBatch::class);
    }

    // Accessor: Menghitung sisa stok dari semua batch yang belum expired
    public function getTotalStockAttribute()
    {
        // 1. Jika total_stock sudah ada hasil dari 'withSum' di SQL, langsung gunakan!
        if (array_key_exists('total_stock', $this->attributes)) {
            return (int) $this->attributes['total_stock'] ?? 0;
        }

        // 2. Jika tidak ada withSum (misal dipanggil di halaman lain), 
        // gunakan Collection $this->batches (TANPA KURUNG agar tidak hit database lagi)
        if ($this->relationLoaded('batches')) {
            return $this->batches
                ->where('expired_at', '>', now())
                ->sum('quantity_current');
        }

        // 3. Fallback jika relasi belum di-load sama sekali (Hit Database)
        return $this->batches()
            ->where('expired_at', '>', now())
            ->sum('quantity_current');
    }

    // Accessor: Mengembalikan URL lengkap untuk gambar
    public function getImageUrlAttribute()
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }
}