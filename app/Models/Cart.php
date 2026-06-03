<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'medicine_id',
        'quantity',
    ];

    // Otomatis mengambil relasi obat saat data cart dipanggil
    protected $with = ['medicine']; 
    
    // Custom attribute untuk menghitung subtotal per baris keranjang
    protected $appends = ['subtotal'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * Accessor untuk menghitung Subtotal: (Harga Obat * Kuantitas)
     */
    public function getSubtotalAttribute()
    {
        if ($this->medicine) {
            return $this->medicine->price * $this->quantity;
        }
        return 0;
    }
}