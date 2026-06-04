import { Head, router, useForm } from '@inertiajs/react';
import { FileText, Upload, Download, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

export default function ReportIndex({ exports }: { exports: ExportDoc[] }) {
  const { setData, post, processing, errors } = useForm({
    csv_file: null as File | null,
  });

  const requestPdf = () => router.post('/admin/reports/request-pdf', {}, { preserveScroll: true });

  const submitCsv = (e: React.SyntheticEvent) => {
    e.preventDefault();
    post('/admin/reports/import-csv', { onSuccess: () => setData('csv_file', null) });
  };

  return (
    <div className="p-8 pb-20">
      <Head title="Export & Import Data" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Background Jobs & Laporan</h1>
        <p className="text-sm text-gray-500">Generate laporan massal dan import data paralel tanpa membebani server.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
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

        {/* PANEL IMPORT CSV */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center text-center justify-center">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Batch Import Obat (CSV)</h2>
          <p className="text-gray-500 text-sm mb-6">Unggah file CSV untuk mengupdate katalog. Data akan dipotong-potong dan diproses secara paralel.</p>
          <form onSubmit={submitCsv} className="w-full flex gap-2">
            <Input 
              type="file" 
              accept=".csv" 
              onChange={(e) => setData('csv_file', e.target.files ? e.target.files[0] : null)} 
              required
            />
            <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
              Upload
            </Button>
          </form>
          {errors.csv_file && <span className="text-xs text-red-500 mt-2">{errors.csv_file}</span>}
          <div className="mt-4 border-t w-full pt-4">
            <p className="text-xs text-gray-500 mb-2">Belum punya format filenya?</p>
            <a 
              href="/admin/reports/template-csv" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" /> Download Format CSV
            </a>
          </div>
        </div>
      </div>

      {/* TABEL HASIL GENERATE PDF */}
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
          <TableBody>
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
  );
}