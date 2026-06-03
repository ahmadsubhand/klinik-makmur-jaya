<?php

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
        // 1. SUPER ADMIN ONLY (Kelola Pengguna)
        Route::middleware(['role:admin'])->group(function () {
            Route::get('/users', [UserController::class, 'index'])->name('users.index');
            Route::post('/users/{user}/change-role', [UserController::class, 'changeRole'])->name('users.change-role');
            Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        });
    });
});

require __DIR__.'/settings.php';
