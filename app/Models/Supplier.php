<?php

namespace App\Models;

use App\Observers\AuditObserver;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(AuditObserver::class)]
#[Fillable(['name', 'contact', 'address'])]
class Supplier extends Model
{
    use Auditable;

    public function batches()
    {
        return $this->hasMany(MedicineBatch::class);
    }
}