import { Head, router } from '@inertiajs/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  Wallet, 
  Calendar,
  ArrowRight,
  FileText,
  CheckCircle,
  RefreshCw,
  Clock,
  XCircle,
  Download,
  Award
} from 'lucide-react';
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Stats {
  revenueToday: number;
  revenueMonth: number;
  ordersToday: number;
  ordersMonth: number;
}

interface ChartItem {
  name: string;
  Pendapatan: number;
}

interface CriticalStock {
  id: number;
  name: string;
  min_stock: number;
  calculated_stock: number;
  category: { name: string } | null;
}

interface ExportDoc {
  id: number;
  report_name: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path: string | null;
  error_message: string | null;
  created_at: string;
  user: { name: string };
}

interface BestSeller {
  id: number;
  name: string;
  total_sold: number;
}

export default function DashboardIndex({
  stats,
  chartData,
  criticalStocks,
  exports,
  bestSellers,
}: {
  stats: Stats;
  chartData: ChartItem[];
  criticalStocks: CriticalStock[];
  exports: ExportDoc[];
  bestSellers: BestSeller[];
}) {

  // Custom Tooltip untuk Grafik Recharts agar format uangnya Rupiah
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-sm">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-indigo-600 font-bold">
            Rp {payload[0].value.toLocaleString('id-ID')}
          </p>
        </div>
      );
    }

    return null;
  };

  const requestPdf = () => router.post('/admin/dashboard/request-pdf', {}, { preserveScroll: true });

  return (
    <div className="p-8 pb-20 bg-gray-50/50 min-h-screen">
      <Head title="Dashboard" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Statistik</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan performa penjualan dan pantauan stok real-time.</p>
      </div>

      {/* 1. KARTU STATISTIK (TOP CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pendapatan Hari Ini</p>
            <h3 className="text-2xl font-bold text-gray-900">Rp {stats.revenueToday.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pendapatan Bulan Ini</p>
            <h3 className="text-2xl font-bold text-gray-900">Rp {stats.revenueMonth.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Transaksi Hari Ini</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.ordersToday} Pesanan</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Transaksi Bulan Ini</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.ordersMonth} Pesanan</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* CARD TOP 5 OBAT TERLARIS (BARU) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" /> Obat Terlaris Bulan Ini
            </h2>
          </div>

          <div className="flex-1 space-y-3">
            {bestSellers.length > 0 ? bestSellers.map((item, index) => (
              <div key={item.id} className="p-3 border rounded-lg bg-emerald-50/30 flex justify-between items-center gap-1">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-700 font-bold h-8 w-8 rounded-full flex items-center justify-center text-sm shadow-sm">
                    #{index + 1}
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{item.total_sold}</p>
                  <p className="text-[10px] text-gray-500">Terjual</p>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-6">
                <p className="text-sm">Belum ada data penjualan.</p>
              </div>
            )}
          </div>
        </div>
        {/* 2. GRAFIK PENDAPATAN (KIRI - Lebar) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-center">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-400" /> Tren Pendapatan (7 Hari Terakhir)
          </h2>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `Rp ${value / 1000}K`} // Format ribuan (K)
                />
                <Tooltip content={CustomTooltip} cursor={{ fill: '#f3f4f6' }} />
                <Bar 
                  dataKey="Pendapatan" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. ALERT STOK KRITIS (KANAN - Sempit) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Alert Stok Kritis
            </h2>
            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
              {criticalStocks.length} Produk
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-75">
            {criticalStocks.length > 0 ? criticalStocks.map((med) => (
              <div key={med.id} className="p-3 border rounded-lg bg-red-50/30 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm text-gray-900 line-clamp-1">{med.name}</p>
                  <p className="text-xs text-gray-500">{med.category?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{med.calculated_stock} Sisa</p>
                  <p className="text-[10px] text-gray-400">Min: {med.min_stock}</p>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="font-medium text-emerald-700">Stok Aman!</p>
                <p className="text-sm mt-1">Tidak ada obat yang berada di bawah batas minimum.</p>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4 flex items-center justify-center text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            onClick={() => router.get('/admin/medicine-batches')}
          >
            Lakukan Restok <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* TABEL HASIL GENERATE PDF */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Riwayat Export Dokumen</h2>
          <div className="rounded-md border shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Laporan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='h-full'>
                {exports.length > 0 ? exports.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <p className="font-semibold">{doc.report_name}</p>
                      <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleString('id-ID')}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase text-[10px]">{doc.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{doc.user?.name}</TableCell>
                    <TableCell>
                      {doc.status === 'completed' && <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3 mr-1"/> Completed</Badge>}
                      {doc.status === 'processing' && <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1 animate-spin"/> Processing</Badge>}
                      {doc.status === 'pending' && <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1"/> Pending</Badge>}
                      {doc.status === 'failed' && (
                        <div className="flex flex-col gap-1 items-start">
                          <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1"/> Failed</Badge>
                          <span className="text-[10px] text-red-500 max-w-37.5 truncate" title={doc.error_message || ''}>
                            {doc.error_message || 'Terjadi kesalahan sistem'}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {doc.status === 'completed' ? (
                        <a href={`/storage/${doc.file_path}`} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200">
                            <Download className="h-4 w-4 mr-2" /> File PDF
                          </Button>
                        </a>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => router.reload()}>
                          <RefreshCw className="h-4 w-4" /> Refresh
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">Belum ada riwayat export dokumen.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* PANEL EXPORT PDF */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center text-center justify-center">
          <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Export Laporan PDF</h2>
          <p className="text-gray-500 text-sm mb-6">Sistem akan menyusun seluruh data transaksi menjadi dokumen PDF berlogo resmi. Proses ini berjalan di latar belakang.</p>
          <Button onClick={requestPdf} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
            Mulai Ekstrak Laporan PDF
          </Button>
        </div>
      </div>
    </div>
  );
}