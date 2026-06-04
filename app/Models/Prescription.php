<?php

namespace App\Models;

use App\Observers\AuditObserver;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(AuditObserver::class)]
class Prescription extends Model
{
    use Auditable;

    protected $fillable = [
        'patient_id', 'pharmacist_id', 'prescription_path', 'status', 'notes'
    ];

    // Accessor untuk mendapatkan URL lengkap gambar/PDF resep
    protected $appends = ['file_url'];

    public function patient() {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function pharmacist() {
        return $this->belongsTo(User::class, 'pharmacist_id');
    }

    public function transaction() {
        return $this->hasOne(Transaction::class);
    }

    public function getFileUrlAttribute() {
        return $this->prescription_path ? asset('storage/' . $this->prescription_path) : null;
    }
}