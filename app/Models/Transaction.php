<?php

namespace App\Models;

use App\Observers\AuditObserver;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(AuditObserver::class)]
class Transaction extends Model
{
    use Auditable;

    protected $fillable = [
        'patient_id', 'cashier_id', 'prescription_id', 
        'type', 'total_price', 'status', 'payment_method'
    ];

    public function patient() {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function cashier() {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function prescription() {
        return $this->belongsTo(Prescription::class);
    }

    public function details() {
        return $this->hasMany(TransactionDetail::class);
    }
}
