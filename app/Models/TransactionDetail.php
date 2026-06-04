<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    protected $fillable = [
        'transaction_id', 'medicine_id', 'medicine_batch_id', 
        'quantity', 'price_per_unit', 'subtotal'
    ];

    public function transaction() {
        return $this->belongsTo(Transaction::class);
    }

    public function medicine() {
        return $this->belongsTo(Medicine::class);
    }

    public function medicineBatch() {
        return $this->belongsTo(MedicineBatch::class);
    }
}