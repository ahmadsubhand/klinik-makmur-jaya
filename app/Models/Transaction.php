<?php

namespace App\Models;

use App\Observers\AuditObserver;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(AuditObserver::class)]
#[Fillable([
    'patient_id', 'cashier_id', 'prescription_id', 
    'type', 'total_price', 'status', 'payment_method',
    'payment_status', 'payment_proof',
])]
class Transaction extends Model
{
    use Auditable;

    protected $appends = ['payment_proof_url'];

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

    public function getPaymentProofUrlAttribute() {
        return $this->payment_proof ? asset('storage/' . $this->payment_proof) : null;
    }
}
