<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MedicineBatchController;
use App\Http\Controllers\Admin\MedicineController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PosController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\SystemMonitorController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PrescriptionController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\UserOrderController;
use App\Models\Medicine;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            return redirect('/admin/dashboard');
        }

        if ($user->hasRole('pharmacist')) {
            return redirect('/prescriptions');
        }

        if ($user->hasRole('cashier')) {
            return redirect('/cashier/dashboard');
        }

        if ($user->hasRole('patient')) {
            return redirect('/my-orders');
        }

        abort(403, 'Role tidak memiliki dashboard.');
    })->name('dashboard');

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
            Route::get('/system-monitor', [SystemMonitorController::class, 'index'])->name('system-monitor');

            // ========================================================
            // UC8: DASHBOARD REAL-TIME
            // ========================================================
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            // ========================================================
            // UC7: LAPORAN PDF LATAR BELAKANG
            // ========================================================
            Route::post('/dashboard/request-pdf', [DashboardController::class, 'requestPdf'])->name('request-pdf');
        });


        Route::middleware(['role:admin|pharmacist'])->group(function () {
            // ========================================================
            // UC7: MANAJEMEN OBAT DAN KATEGORI
            // ========================================================
            Route::post('/medicines/import-csv', [MedicineController::class, 'importCsv'])->name('import-csv');
            Route::get('/medicines/template-csv', [MedicineController::class, 'downloadCsvTemplate'])->name('template-csv');
            Route::get('/medicines/import-status/{batchId}', [MedicineController::class, 'importStatus'])->name('import-status');

            // ========================================================
            // UC2: MANAJEMEN OBAT DAN KATEGORI
            // ========================================================
            Route::resource('categories', CategoryController::class)->except(['create', 'edit']);
            Route::resource('suppliers', SupplierController::class)->except(['create', 'edit']);
            Route::resource('medicines', MedicineController::class)->except(['create', 'edit']);
            Route::resource('medicine-batches', MedicineBatchController::class)->except(['create', 'edit']);

            // ========================================================
            // UC3: TRANSAKSI BELANJA
            // ========================================================
            Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
            Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
            Route::put('/orders/{order}/verify-payment', [OrderController::class, 'verifyPayment'])->name('orders.verify-payment');
            
            // ========================================================
            // UC4: VERIFIKASI RESEP DOKTER
            // ========================================================
            Route::get('/prescriptions', [PrescriptionController::class, 'index'])->name('prescriptions.index');
            Route::put('/prescriptions/{prescription}', [PrescriptionController::class, 'update'])->name('prescriptions.update');
        });

        // ========================================================
        // UC5: TRANSAKSI OFFLINE
        // ========================================================
        Route::middleware(['role:cashier'])->group(function() {
            Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
            Route::post('/pos', [PosController::class, 'store'])->name('pos.store');
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

    Route::prefix('my-orders')->name('user.orders.')->group(function () {
        Route::get('/', [UserOrderController::class, 'index'])->name('index');
        Route::put('/{order}/complete', [UserOrderController::class, 'complete'])->name('complete');
        Route::post('/{order}/payment', [UserOrderController::class, 'uploadPaymentProof'])->name('payment');
    });

    Route::get('/notifications', function () {
        return response()->json(Auth::user()->unreadNotifications);
    })->name('notifications.index');

    Route::post('/notifications/mark-as-read', function () {
        Auth::user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    })->name('notifications.markAllRead');
});

// ========================================================
// UC3: KATALOG OBAT
// ========================================================
Route::get('/shop', [ShopController::class, 'index'])->name('shop.index');

// ========================================================
// UC3: API PENCARIAN
// ========================================================
Route::get('/api/medicines/search', function (Request $request) {
    $search = $request->query('q');

    return Medicine::when($search, function ($query) use ($search) {
            $searchTerm = strtolower($search);
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"]);
        })
        ->limit(20)
        ->get(['id', 'name']);
});

Route::get('/api/suppliers/search', function (Request $request) {
    $search = $request->query('q');

    return Supplier::when($search, function ($query) use ($search) {
            $searchTerm = strtolower($search);
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"]);
        })
        ->limit(20)
        ->get(['id', 'name']);
});

require __DIR__.'/settings.php';
