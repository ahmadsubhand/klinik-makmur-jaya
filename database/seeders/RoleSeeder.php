<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'guard_name' => 'web'],
            ['name' => 'pharmacist', 'guard_name' => 'web'],
            ['name' => 'cashier', 'guard_name' => 'web'],
            ['name' => 'customer', 'guard_name' => 'web'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']], // unique key
                $role
            );
        }
    }
}