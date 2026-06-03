<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // 1. Tangkap parameter dari URL (Inertia Frontend)
        $search = $request->input('search');
        $roleName = $request->input('role');
        $sortField = $request->input('sort_field', 'created_at'); // Default sort
        $sortDir = $request->input('sort_direction', 'desc');

        // 2. Query Builder dengan Optimasi (Eager Loading)
        $users = User::with(['roles'])
            // Filter Pencarian (Nama atau Email)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $searchTerm = strtolower($search);
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"])
                      ->orWhereRaw('LOWER(email) LIKE ?', ["%{$searchTerm}%"]);
                });
            })
            // Filter berdasarkan Peran (Role)
            ->when($roleName, function ($query, $roleName) {
                $query->whereHas('roles', function ($q) use ($roleName) {
                    $q->where('name', $roleName);
                });
            })
            // Sorting Dinamis
            ->orderBy($sortField, $sortDir)
            // 3. Paginasi (Misal 10 data per halaman)
            ->paginate(10)
            // withQueryString() sangat krusial agar saat pindah halaman (page=2), 
            // parameter search dan filter tidak hilang dari URL.
            ->withQueryString(); 

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => Role::all(), // Mengambil semua role untuk dropdown filter di UI
            // Kirim balik filter saat ini agar UI frontend tetap sinkron
            'filters' => $request->only(['search', 'role', 'sort_field', 'sort_direction'])
        ]);
    }

    public function changeRole(Request $request, User $user)
    {
        // Cek apakah user yang sedang login adalah Super Admin (ID = 1)
        $isSuperAdmin = Auth::id() === 1;

        // Super admin tidak dapat diubah sama sekali oleh siapapun
        if ($user->id === 1) { 
            return redirect()->back()->with('error', 'Akun Super Admin tidak dapat diubah rolenya.');
        }

        // Jika user yang diubah adalah admin, maka hanya super admin yang boleh melakukannya
        $targetIsAdmin = $user->hasRole('admin');
        if ($targetIsAdmin && !$isSuperAdmin) {
            return redirect()->back()->with('error', 'Anda tidak memiliki wewenang untuk mengubah role dari seorang Admin.');
        }

        // Validasi Input
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        // User hanya boleh didaftarkan menjadi admin jika user yang login adalah super admin
        $requestedRoleName = DB::table('roles')->where('id', $validated['role_id'])->value('name');
        
        if ($requestedRoleName === 'admin' && !$isSuperAdmin) {
            return redirect()->back()->with('error', 'Hanya Super Admin yang berhak mendaftarkan user menjadi Admin.');
        }

        // Ambil Role ID lama untuk keperluan Audit Log
        $oldRole = DB::table('model_has_roles')
            ->where('model_id', $user->id)
            ->where('model_type', User::class)
            ->first();
        
        $oldRoleId = $oldRole ? $oldRole->role_id : null;
        $newRoleId = $validated['role_id'];

        // Update Data menggunakan Transaksi
        DB::transaction(function () use ($user, $validated, $oldRoleId, $newRoleId) {
            // Update Role: Hapus role lama, pasang role baru
            DB::table('model_has_roles')
                ->where('model_id', $user->id)
                ->where('model_type', User::class)
                ->delete();

            DB::table('model_has_roles')->insert([
                'role_id' => $validated['role_id'],
                'model_type' => User::class,
                'model_id' => $user->id,
            ]);

            if ($oldRoleId != $newRoleId) {
                $user->logAudit(
                    'updated',
                    ['role_id' => $oldRoleId], 
                    ['role_id' => $newRoleId]
                );
            }
        });

        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $isSuperAdmin = Auth::id() === 1;
        $targetIsAdmin = $user->hasRole('admin');

        // Proteksi: Mencegah penghapusan admin oleh admin lain
        if ($targetIsAdmin && !$isSuperAdmin) {
            return redirect()->back()->with('error', 'Anda tidak memiliki wewenang untuk menghapus akun Admin.');
        }

        DB::transaction(function () use ($user) {
            // Hapus relasi role terlebih dahulu
            DB::table('model_has_roles')
                ->where('model_id', $user->id)
                ->where('model_type', User::class)
                ->delete();
            
            // Hapus user
            $user->delete();
        });

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus.');
    }
}