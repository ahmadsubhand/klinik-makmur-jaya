<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Inertia\Inertia;

class SystemMonitorController extends Controller
{
    public function index()
    {
        // 1. Ambil Metrik Sistem Dasar
        $cpuLoad = function_exists('sys_getloadavg') ? sys_getloadavg()[0] : 0;
        $memoryUsage = round(memory_get_usage(true) / 1024 / 1024, 2);
        
        $diskFree = function_exists('disk_free_space') ? round(disk_free_space(base_path()) / 1024 / 1024 / 1024, 2) : 0;
        $diskTotal = function_exists('disk_total_space') ? round(disk_total_space(base_path()) / 1024 / 1024 / 1024, 2) : 1;
        $diskUsagePercentage = $diskTotal > 0 ? round((($diskTotal - $diskFree) / $diskTotal) * 100, 2) : 0;

        // 2. Ambil data Audit Log (Aktivitas User)
        $auditLogs = AuditLog::with('user')
            ->latest()
            ->paginate(15)
            ->through(function ($log) {
                return [
                    'id' => $log->id,
                    'event' => $log->event,
                    'subject_type' => class_basename($log->auditable_type),
                    'user' => $log->user?->name ?? 'System',
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->format('d M Y H:i:s'),
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                ];
            });

        return Inertia::render('admin/system/monitor', [
            'metrics' => [
                'cpu_load' => $cpuLoad,
                'memory_usage_mb' => $memoryUsage,
                'disk_free_gb' => $diskFree,
                'disk_usage_percent' => $diskUsagePercentage,
            ],
            'audit_logs' => $auditLogs,
        ]);
    }
}