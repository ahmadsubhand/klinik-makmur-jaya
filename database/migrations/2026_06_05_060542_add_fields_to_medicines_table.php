<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->boolean('is_low_stock_notified')->default(false);
            $table->string('composition')->nullable();
            $table->string('dosage')->nullable();
            $table->string('side_effects')->nullable();
        });
    }

    public function down()
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn('is_low_stock_notified');
        });
    }
};