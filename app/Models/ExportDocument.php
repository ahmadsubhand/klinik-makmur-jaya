<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([ 'user_id', 'report_name', 'type', 'status', 'file_path', 'error_message'])]
class ExportDocument extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}