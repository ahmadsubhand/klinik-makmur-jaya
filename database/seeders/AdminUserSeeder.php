<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'admin@mail.com');
        $adminPassword = env('ADMIN_PASSWORD', '12341234');

        // 1. Buat Role Admin jika belum ada
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['guard_name' => 'web']
        );

        // 2. Buat akun User Admin untuk testing
        $adminUser = User::firstOrCreate(
            ['email' => $adminEmail], // Gunakan email ini untuk login
            [
                'name' => 'Super Admin',
                'password' => Hash::make($adminPassword), // Password default testing
                'email_verified_at' => now(), // langsung verified
            ]
        );

        // 3. Hubungkan User dengan Role Admin (jika belum terhubung)
        if (!$adminUser->hasRole('admin')) {
            $adminUser->roles()->attach($adminRole->id, [
                'model_type' => User::class
            ]);
        }

        $adminSecondaryEmail = env('ADMIN_SECONDARY_EMAIL', 'admin2@mail.com');
        $adminSecondaryPassword = env('ADMIN_SECONDARY_PASSWORD', '43214321');

        // 2. Buat akun User Admin untuk testing
        $adminSecondaryUser = User::firstOrCreate(
            ['email' => $adminSecondaryEmail], // Gunakan email ini untuk login
            [
                'name' => 'Super Admin',
                'password' => Hash::make($adminSecondaryPassword), // Password default testing
                'email_verified_at' => now(), // langsung verified
            ]
        );

        // 3. Hubungkan User dengan Role Admin (jika belum terhubung)
        if (!$adminSecondaryUser->hasRole('admin')) {
            $adminSecondaryUser->roles()->attach($adminRole->id, [
                'model_type' => User::class
            ]);
        }

        $this->command->info('Admin user berhasil dibuat! Email: ' . $adminEmail . ' | Password: ' . $adminPassword);
    }
}