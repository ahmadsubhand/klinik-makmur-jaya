<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    /**
     * Fungsi helper untuk menyimpan data ke tabel audit_logs.
     */
    public function logAudit(string $event, ?array $oldValues = null, ?array $newValues = null)
    {
        AuditLog::create([
            'user_id' => Auth::id(), // Akan null jika dijalankan via CLI/Seeder
            'event' => $event,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(), // Ambil IP Address
        ]);
    }
}