<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'guard_name'])]
class Role extends Model
{
    /**
     * Relasi ke model User (atau model lain) yang memiliki role ini
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'model_has_roles', 'role_id', 'model_id')
                    ->wherePivot('model_type', User::class);
    }

    /**
     * Relasi ke permission yang dimiliki oleh role ini
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_has_permissions', 'role_id', 'permission_id');
    }

    /**
     * Helper untuk mengecek apakah role ini memiliki permission tertentu
     */
    public function hasPermission(string $permissionName): bool
    {
        return $this->permissions()->where('name', $permissionName)->exists();
    }
}