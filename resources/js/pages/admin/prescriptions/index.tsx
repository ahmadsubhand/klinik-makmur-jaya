import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface TransactionDetail {
  id: number;
  medicine: { name: string; type: string };
  quantity: number;
}

interface Prescription {
  id: number;
  patient: { name: string; email: string };
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  transaction: {
    id: number;
    total_price: string;
    details: TransactionDetail[];
  };
}

interface PaginatedData {
  data: Prescription[];
  links: any[];
  current_page: number;
  last_page: number;
}

export default function PrescriptionIndex({
  prescriptions,
  filters
}: {
  prescriptions: PaginatedData;
  filters: { status: string };
}) {
  const [selectedStatus, setSelectedStatus] = useState(filters.status);
  const [isOpen, setIsOpen] = useState(false);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);

  const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
    status: '',
    notes: '',
  });

  const handleFilterChange = (val: string) => {
    setSelectedStatus(val);
    router.get('/admin/prescriptions', { status: val }, { preserveState: true });
  };

  const openVerifyModal = (p: Prescription) => {
    setActivePrescription(p);
    reset();
    clearErrors();
    setIsOpen(true);
  };

  const submitVerification = (status: 'approved' | 'rejected') => {
    setData('status', status);
    
    // Gunakan setTimeout agar state 'status' sempat diperbarui oleh React sebelum disubmit
    setTimeout(() => {
      put(`/admin/prescriptions/${activePrescription?.id}`, {
        preserveScroll: true,
        onSuccess: () => { 
          setIsOpen(false); setActivePrescription(null); 
        },
      });
    }, 100);
  };

  return (
    <div className="p-8 pb-20">
      <Head title="Verifikasi Resep" />

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Verifikasi Resep Dokter</h1>
          <p className="text-sm text-gray-500">Evaluasi keabsahan resep pasien sebelum pesanan diproses.</p>
        </div>
        
        <div className="flex max-w-xs items-center space-x-2">
          <Select value={selectedStatus} onValueChange={handleFilterChange}>
            <SelectTrigger><SelectValue placeholder="Filter Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal & Waktu</TableHead>
              <TableHead>Pasien</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.data.length > 0 ? prescriptions.data.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-sm">
                  {new Date(p.created_at).toLocaleString('id-ID')}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{p.patient?.name}</span>
                    <span className="text-xs text-gray-500">{p.patient?.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    p.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }>
                    {p.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => openVerifyModal(p)}>
                    <Eye className="h-4 w-4 mr-2" /> Lihat & Evaluasi
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                  Tidak ada data resep dengan status ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {prescriptions.data.length > 0 ? (prescriptions.current_page - 1) * 10 + 1 : 0} - {Math.min(prescriptions.current_page * 10, prescriptions.data.length > 0 ? prescriptions.current_page * 10 : 0)} dari total {prescriptions.links ? prescriptions.links.length - 2 : 0} Halaman
        </p>
        <div className="flex space-x-2">
          {prescriptions.links.map((link, index) => (
            <Button
              key={index}
              variant={link.active ? "default" : "outline"}
              size="sm"
              disabled={!link.url}
              onClick={() => {
                if (link.url) {
                  router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                }
              }}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      </div>

      {/* MODAL VERIFIKASI */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>Evaluasi Resep: {activePrescription?.patient?.name}</DialogTitle>
          </DialogHeader>
          
          {activePrescription && (
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50">
              
              {/* KIRI: VIEWER RESEP */}
              <div className="w-full lg:w-1/2 border-r bg-black/5 p-4 flex items-center justify-center overflow-auto relative">
                {activePrescription.file_url?.endsWith('.pdf') ? (
                  <iframe src={activePrescription.file_url} className="w-full h-full rounded-md shadow-sm bg-white" />
                ) : (
                  <img src={activePrescription.file_url} alt="Resep" className="max-w-full max-h-full object-contain shadow-sm bg-white rounded-md" />
                )}
              </div>

              {/* KANAN: DETAIL TRANSAKSI & AKSI */}
              <div className="w-full lg:w-1/2 p-6 flex flex-col bg-white overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" /> Daftar Obat Dipesan
                </h3>
                
                <div className="bg-gray-50 rounded-lg border p-4 mb-6 space-y-3 max-h-62.5 overflow-y-auto">
                  {activePrescription.transaction?.details.map((detail) => (
                    <div key={detail.id} className="flex justify-between items-start border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{detail.medicine.name}</p>
                        {detail.medicine.type === 'prescription' && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Resep</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{detail.quantity} Unit</span>
                    </div>
                  ))}
                </div>

                {activePrescription.status === 'pending' ? (
                  <div className="mt-auto border-t pt-4 space-y-4">
                    <div className="grid gap-4">
                      <Label htmlFor="notes">Catatan Penolakan <span className="text-gray-400 font-normal">(Wajib jika ditolak)</span></Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Contoh: Resep sudah kadaluarsa / Tidak ada tanda tangan dokter..." 
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        className='h-20'
                      />
                      {errors.notes && <span className="text-xs text-red-500 font-bold">{errors.notes}</span>}
                    </div>

                    <div className="flex flex-col gap-4">
                      <Button 
                        type="button" 
                        onClick={() => submitVerification('approved')} 
                        disabled={processing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Setujui Resep
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => submitVerification('rejected')} 
                        disabled={processing}
                        variant="outline" 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Tolak Resep
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto border-t pt-4">
                    <div className={`p-4 rounded-lg border flex flex-col gap-2 ${
                      activePrescription.status === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="font-bold flex items-center gap-2">
                        {activePrescription.status === 'approved' ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                        Status: {activePrescription.status.toUpperCase()}
                      </div>
                      {activePrescription.notes && (
                        <p className="text-sm text-gray-700 mt-2 border-t pt-2 border-black/10">
                          <strong>Catatan Apoteker:</strong> {activePrescription.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}