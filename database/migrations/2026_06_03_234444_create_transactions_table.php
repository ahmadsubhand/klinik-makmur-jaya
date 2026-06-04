<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            // patient_id nullable karena jika transaksi offline di kasir, bisa jadi pasien tidak terdaftar
            $table->foreignId('patient_id')->nullable()->constrained('users')->nullOnDelete();
            // cashier_id nullable karena transaksi online tidak ditangani kasir secara langsung
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('prescription_id')->nullable()->constrained()->nullOnDelete();
            
            $table->enum('type', ['online', 'offline']);
            $table->decimal('total_price', 15, 2); // Menggunakan 15,2 sesuai perbaikan limit sebelumnya
            $table->string('status'); // pending, confirmed, processing, ready_for_pickup, shipped, completed
            $table->string('payment_method');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
