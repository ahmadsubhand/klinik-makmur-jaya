import { Head, router } from '@inertiajs/react';
import { Activity, Cpu, HardDrive, ShieldAlert, History, RefreshCw, Server, Eye, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface Metrics {
  cpu_load: number;
  memory_usage_mb: number;
  disk_free_gb: number;
  disk_usage_percent: number;
}

interface AuditLog {
  id: number;
  event: string;
  subject_type: string | null;
  user: string;
  ip_address: string | null;
  created_at: string;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
}

interface PaginatedData<T> {
  data: T[];
  links: any[];
  current_page: number;
}

export default function SystemMonitor({
  metrics,
  audit_logs // Sekarang menerima paginated data
}: {
  metrics: Metrics;
  audit_logs: PaginatedData<AuditLog>; 
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const refreshData = () => {
    setIsRefreshing(true);
    router.reload({
      only: ['metrics', 'audit_logs'],
      onFinish: () => setIsRefreshing(false)
    });
  };

  return (
    <div className="p-8 pb-20">
      <Head title="System Monitor & Logs" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6 text-gray-700" />
            System Monitor & Telemetry
          </h1>
          <p className="text-sm text-gray-500">Pantau kesehatan server, log error, dan audit aktivitas pengguna.</p>
        </div>
        <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* 1. KARTU METRIK SERVER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cpu className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">CPU Load (1m)</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{metrics.cpu_load}</p>
          <p className="text-xs text-gray-500 mt-1">Indikator beban prosesor</p>
        </div>

        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Memory Usage (PHP)</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{metrics.memory_usage_mb} <span className="text-lg text-gray-500">MB</span></p>
          <p className="text-xs text-gray-500 mt-1">Memori yang dialokasikan saat ini</p>
        </div>

        <div className="rounded-md border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <HardDrive className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold">Disk Usage</h3>
          </div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-3xl font-bold text-gray-800">{metrics.disk_usage_percent}%</p>
            <p className="text-sm text-gray-500">{metrics.disk_free_gb} GB Free</p>
          </div>
          <Progress value={metrics.disk_usage_percent} className="h-2" />
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. AUDIT LOGS (Aktivitas User) */}
        <div className="flex h-125 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
          {/* MODAL DETAIL AUDIT LOG */}
          <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detail Perubahan Data</DialogTitle>
              </DialogHeader>
              {selectedLog && (
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div className="border rounded-md p-4 bg-red-50">
                    <h4 className="font-semibold text-red-700 mb-2">Data Lama</h4>
                    <pre className="whitespace-pre-wrap text-xs text-gray-700 overflow-auto max-h-60">
                      {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : 'Tidak ada data lama'}
                    </pre>
                  </div>
                  <div className="border rounded-md p-4 bg-emerald-50">
                    <h4 className="font-semibold text-emerald-700 mb-2">Data Baru</h4>
                    <pre className="whitespace-pre-wrap text-xs text-gray-700 overflow-auto max-h-60">
                      {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : 'Tidak ada data baru'}
                    </pre>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* 2. AUDIT LOGS (Aktivitas User) */}
          <div className="flex h-125 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600" />
                <div>
                  <h2 className="font-semibold text-gray-800">Audit Logs</h2>
                  <p className="text-xs text-gray-500">Histori perubahan oleh entitas sistem</p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b bg-white">
                  <tr className="text-left">
                    <th className="px-5 py-3 font-medium text-gray-500">User / Waktu</th>
                    <th className="px-5 py-3 font-medium text-gray-500">Event</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {audit_logs.data.length > 0 ? (
                    audit_logs.data.map((log) => (
                      <tr key={log.id} className="border-b transition hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{log.user}</span>
                            <span className="text-xs text-gray-400">{log.created_at}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center rounded-full border bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-gray-700">
                              {log.event}
                            </span>
                            <span className="text-xs text-gray-500">{log.subject_type || '-'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedLog(log)}
                            disabled={!log.old_values && !log.new_values}
                          >
                            <Eye className="h-4 w-4 mr-2" /> Detail
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400">Belum ada aktivitas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Sederhana */}
            <div className="border-t p-3 bg-gray-50 flex justify-end">
              {/* Render tombol pagination di sini berdasarkan audit_logs.links */}
            </div>
          </div>
        </div>

        {/* 3. OPCODES LOG VIEWER PORTAL */}
        <div className="rounded-md border bg-white shadow-sm flex flex-col h-125">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <div>
                <h2 className="font-semibold text-gray-800">Sistem Deteksi Error Log</h2>
                <p className="text-xs text-gray-500">Klasifikasi Info, Warning, dan Critical</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
            <div className="bg-white p-4 rounded-full border mb-4 shadow-sm">
              <ShieldAlert className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Akses Log Viewer Eksekutif</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              Untuk memenuhi standar klasifikasi tingkat keparahan error dan pemantauan mendalam, gunakan panel Log Viewer terdedikasi kami.
            </p>
            <a 
              href="/log-viewer" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-10 px-6 py-2"
            >
              Buka Panel Error Log <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}