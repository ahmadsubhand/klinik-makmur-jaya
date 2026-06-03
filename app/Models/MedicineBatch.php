<?php

namespace App\Models;

use App\Observers\AuditObserver;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(AuditObserver::class)]
#[Fillable([
    'medicine_id', 'supplier_id', 'batch_number', 
    'quantity_incoming', 'quantity_current', 
    'received_at', 'expired_at'
])]
class MedicineBatch extends Model
{
    use Auditable;

    protected $casts = [
        'received_at' => 'date',
        'expired_at' => 'date',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}