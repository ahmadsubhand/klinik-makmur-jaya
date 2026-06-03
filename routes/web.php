<?php

use App\Http\Controllers\Admin\SystemMonitorController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
        // ========================================================
        // UC1: MANAJEMEN PENGGUNA (SUPER ADMIN ONLY)
        // Akses: Admin
        // ========================================================
        Route::middleware(['role:admin'])->group(function () {
            Route::get('/users', [UserController::class, 'index'])->name('users.index');
            Route::post('/users/{user}/change-role', [UserController::class, 'changeRole'])->name('users.change-role');
            Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

             // ========================================================
            // UC8: MEMANTAU SERVER & LOG
            // Akses: Admin
            // ========================================================
            Route::get('/system-monitor', [SystemMonitorController::class, 'index'])->name('system.monitor');
        });
    });
});

require __DIR__.'/settings.php';
