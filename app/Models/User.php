<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'phone_number', 'address'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'model_has_roles', 'model_id', 'role_id')
            ->wherePivot('model_type', static::class);
    }

    // Helper method opsional untuk mempermudah pengecekan
    public function hasRole(string $role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    // Scope untuk memfilter user berdasarkan satu atau banyak role.
    public function scopeRole(Builder $query, string|array $roles)
    {
        // Pastikan input selalu berbentuk array meskipun hanya string tunggal yang dikirim
        $roles = is_array($roles) ? $roles : [$roles];

        return $query->whereHas('roles', function ($q) use ($roles) {
            $q->whereIn('name', $roles);
        });
    }
}
