<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Pastikan user sudah login
        if (! $request->user()) {
            abort(401, 'Unauthorized');
        }

        // Pecah string "admin|manajer" menjadi array ['admin', 'manajer']
        $roles = explode('|', $role);
        
        $hasAccess = false;

        // Cek apakah user memiliki SETIDAKNYA SATU dari role yang disyaratkan
        foreach ($roles as $r) {
            if ($request->user()->hasRole($r)) {
                $hasAccess = true;
                break; // Jika ketemu satu yang cocok, langsung lolos
            }
        }

        // Jika tidak ada satu pun role yang cocok
        if (! $hasAccess) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}