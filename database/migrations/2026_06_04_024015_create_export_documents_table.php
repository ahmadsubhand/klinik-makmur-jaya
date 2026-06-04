<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('export_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->comment('User yang meminta export');
            $table->string('report_name')->comment('Contoh: Laporan Penjualan');
            $table->string('type')->comment('inventory, transaction, audit, transfer');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->string('file_path')->nullable()->comment('Lokasi file hasil generate PDF/Excel');
            $table->text('error_message')->nullable();
            $table->timestamps();

            // Sesuai ERD: Menambahkan Indexes untuk optimasi query
            $table->index('user_id');
            $table->index('status');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('export_documents');
    }
};