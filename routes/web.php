<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\MedicineBatchController;
use App\Http\Controllers\Admin\MedicineController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\SystemMonitorController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PrescriptionController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        // ========================================================
        // UC1: MANAJEMEN PENGGUNA
        // ========================================================
        Route::middleware(['role:admin'])->group(function () {
            Route::get('/users', [UserController::class, 'index'])->name('users.index');
            Route::post('/users/{user}/change-role', [UserController::class, 'changeRole'])->name('users.change-role');
            Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

             // ========================================================
            // UC8: MEMANTAU SERVER & LOG
            // ========================================================
            Route::get('/system-monitor', [SystemMonitorController::class, 'index'])->name('system.monitor');
        });


        Route::middleware(['role:admin|pharmacist'])->group(function () {
            // ========================================================
            // UC2: MANAJEMEN OBAT DAN KATEGORI
            // ========================================================
            Route::resource('categories', CategoryController::class)->except(['create', 'edit']);
            Route::resource('suppliers', SupplierController::class)->except(['create', 'edit']);
            Route::resource('medicines', MedicineController::class)->except(['create', 'edit']);
            Route::resource('medicine-batches', MedicineBatchController::class)->except(['create', 'edit']);
            
            // ========================================================
            // UC3: VERIFIKASI RESEP DOKTER
            // ========================================================
            Route::get('/prescriptions', [PrescriptionController::class, 'index'])->name('prescriptions.index');
            Route::put('/prescriptions/{prescription}', [PrescriptionController::class, 'update'])->name('prescriptions.update');
        });
    });

    // ========================================================
    // UC3: TRANSAKSI BELANJA
    // ========================================================
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::post('/', [CartController::class, 'store'])->name('store');
        Route::put('/{cart}', [CartController::class, 'update'])->name('update');
        Route::delete('/{cart}', [CartController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'index'])->name('index');
        Route::post('/', [CheckoutController::class, 'process'])->name('process');
    });

});

// ========================================================
// UC3: KATALOG OBAT
// ========================================================
Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');

require __DIR__.'/settings.php';
