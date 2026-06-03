<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class AuditObserver
{
    /**
     * Helper rahasia untuk membuang data sensitif sebelum dicatat ke log.
     */
    private function cleanSensitiveData(Model $model, array $data): array
    {
        // 1. Ambil bawaan $hidden dari model (password, remember_token, dll)
        $hiddenFields = $model->getHidden();
        
        // 2. Buat properti `protected $auditExclude = ['...']` di model 
        // jika ingin memblokir kolom lain KHUSUS untuk audit log
        $auditExclude = property_exists($model, 'auditExclude') ? $model->auditExclude : [];

        // Gabungkan semua kolom yang dilarang masuk
        $excludedFields = array_merge($hiddenFields, $auditExclude);

        // Buang key/kolom tersebut dari array data
        return Arr::except($data, $excludedFields);
    }

    public function created(Model $model)
    {
        if (method_exists($model, 'logAudit')) {
            // Bersihkan $model->getAttributes() menggunakan helper
            $cleanData = $this->cleanSensitiveData($model, $model->getAttributes());
            
            $model->logAudit('created', null, $cleanData);
        }
    }

    public function updated(Model $model)
    {
        if (method_exists($model, 'logAudit')) {
            $newValues = $model->getChanges();
            $oldValues = array_intersect_key($model->getOriginal(), $newValues);

            // Bersihkan kolom waktu yang tidak penting
            unset($newValues['updated_at']);
            unset($oldValues['updated_at']);

            // Bersihkan kolom sensitif
            $newValues = $this->cleanSensitiveData($model, $newValues);
            $oldValues = $this->cleanSensitiveData($model, $oldValues);

            // Catat log hanya jika masih ada data TERSISA setelah dibersihkan
            if (count($newValues) > 0) {
                $model->logAudit('updated', $oldValues, $newValues);
            }
        }
    }

    public function deleted(Model $model)
    {
        if (method_exists($model, 'logAudit')) {
            // Bersihkan data lama sebelum dicatat
            $cleanData = $this->cleanSensitiveData($model, $model->getOriginal());
            
            $model->logAudit('deleted', $cleanData, null);
        }
    }
}