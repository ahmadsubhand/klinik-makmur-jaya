<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('2/4: Membangun Data Pegawai & Puluhan Pasien...');
        
        $faker = Faker::create('id_ID');
        $password = Hash::make('12341234'); // Password universal: 12341234

        // Ambil ID Roles
        $adminRole = Role::where('name', 'admin')->first();
        $pharmacistRole = Role::where('name', 'pharmacist')->first();
        $cashierRole = Role::where('name', 'cashier')->first();
        $patientRole = Role::where('name', 'patient')->first();

        // 1. PEGAWAI INTI
        $admin = User::firstOrCreate(
            ['email' => 'admin@klinik.com'],
            [
                'name' => 'Admin Utama', 
                'password' => $password, 
                'phone_number' => '081100001111', 
                'email_verified_at' => now()
            ]
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id => ['model_type' => User::class]]);

        $apoteker = User::firstOrCreate(
            ['email' => 'apoteker@klinik.com'],
            [
                'name' => 'Apoteker Budi', 
                'password' => $password, 
                'phone_number' => '081200002222', 
                'email_verified_at' => now()
            ]
        );
        $apoteker->roles()->syncWithoutDetaching([$pharmacistRole->id => ['model_type' => User::class]]);

        $kasir = User::firstOrCreate(
            ['email' => 'kasir@klinik.com'],
            [
                'name' => 'Kasir Siti', 
                'password' => $password, 
                'phone_number' => '081300003333',  
                'email_verified_at' => now()
            ]
        );
        $kasir->roles()->syncWithoutDetaching([$cashierRole->id => ['model_type' => User::class]]);

        // 2. DATA PASIEN (30 Orang dengan data bervariasi)
        for ($i = 1; $i <= 30; $i++) {
            $patient = User::firstOrCreate(
                ['email' => "pasien{$i}@klinik.com"],
                [
                    'name' => $faker->name,
                    'password' => $password,
                    'phone_number' => $faker->phoneNumber,
                    'address' => $faker->address,
                    'email_verified_at' => now()
                ]
            );
            $patient->roles()->syncWithoutDetaching([$patientRole->id => ['model_type' => User::class]]);
        }

        $this->command->info('✅ Pegawai dan 30 Pasien berhasil dibuat!');
    }
}