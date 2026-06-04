import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Order {
  id: number;
  patient: { name: string; email: string };
  total_price: string;
  status: string;
  created_at: string;
  payment_status: string;
  payment_proof_url: string | null;
}

export default function AdminOrderIndex({ orders, filters }: { orders: any, filters: { status: string } }) {
  
  const updateStatus = (orderId: number, newStatus: string) => {
    router.put(`/admin/orders/${orderId}`, { status: newStatus }, { preserveScroll: true });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const [viewingPayment, setViewingPayment] = useState<Order|null>(null);

  return (
    <div className="p-8 pb-20">
      <Head title="Manajemen Pesanan Online" />

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pesanan Online</h1>
          <p className="text-sm text-gray-500">Kelola dan update status pengiriman pesanan pelanggan.</p>
        </div>
        
        <div className="w-64">
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(val) => router.get('/admin/orders', val === 'all' ? {} : { status: val }, { preserveState: true })}
          >
            <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
              <SelectItem value="processing">Sedang Diproses (Kemas)</SelectItem>
              <SelectItem value="shipped">Sedang Dikirim</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tgl Transaksi</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Total Tagihan</TableHead>
              <TableHead>Status Saat Ini</TableHead>
              <TableHead className="text-right">Ubah Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.length > 0 ? orders.data.map((order: Order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-sm">
                  {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-gray-900">{order.patient?.name || 'Guest'}</p>
                </TableCell>
                <TableCell className="font-bold text-emerald-600">
                  Rp {Number(order.total_price).toLocaleString('id-ID')}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 items-start">
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                    
                    {/* STATUS PEMBAYARAN */}
                    {order.payment_status === 'paid' ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">LUNAS</span>
                    ) : order.payment_status === 'pending_verification' ? (
                      <Button variant="link" className="h-auto p-0 text-[11px] text-amber-600 font-bold" onClick={() => setViewingPayment(order)}>
                        Cek Bukti Bayar 🔍
                      </Button>
                    ) : (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200">BELUM BAYAR</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {/* Dropdown cepat untuk admin mengubah status order */}
                  <Select 
                    value={order.status} 
                    onValueChange={(val) => updateStatus(order.id, val)}
                    disabled={order.status === 'completed' || order.status === 'cancelled'}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs ml-auto">
                      <SelectValue placeholder="Ubah Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing (Kemas)</SelectItem>
                      <SelectItem value="shipped">Shipped (Kirim)</SelectItem>
                      <SelectItem value="cancelled">Batalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  Tidak ada data pesanan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* MODAL LIHAT BUKTI BAYAR */}
        <Dialog open={!!viewingPayment} onOpenChange={() => setViewingPayment(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Bukti Pembayaran</DialogTitle></DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              {viewingPayment?.payment_proof_url ? (
                <img src={viewingPayment.payment_proof_url} alt="Bukti Pembayaran" className="max-w-full rounded-md shadow-sm" />
              ) : (
                <p className="text-gray-500">Belum ada foto bukti pembayaran.</p>
              )}
              
              {viewingPayment?.payment_status === 'pending_verification' && (
                <Button
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    router.put(`/admin/orders/${viewingPayment.id}/verify-payment`, {}, { preserveScroll: true });
                    setViewingPayment(null);
                  }}
                >
                  Verifikasi Pembayaran Valid
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}