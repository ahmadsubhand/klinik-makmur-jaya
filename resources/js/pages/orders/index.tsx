import { Head, router } from '@inertiajs/react';
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ... (Interface disederhanakan untuk contoh)
interface Order {
  id: number;
  created_at: string;
  total_price: string;
  status: string;
  details: { id: number; quantity: number; subtotal: string; medicine: { name: string } }[];
}

export default function MyOrders({ orders }: { orders: { data: Order[]; links: any[] } }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusDisplay = (status: string) => {
    const maps: Record<string, { label: string, color: string, icon: any }> = {
      pending: { label: 'Menunggu Verifikasi', color: 'bg-amber-100 text-amber-800', icon: Clock },
      processing: { label: 'Sedang Diproses', color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { label: 'Sedang Dikirim', color: 'bg-purple-100 text-purple-800', icon: Truck },
      completed: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    return maps[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Package };
  };

  const markAsCompleted = (id: number) => {
    if (confirm('Konfirmasi bahwa Anda telah menerima pesanan ini dengan baik?')) {
      router.put(`/my-orders/${id}/complete`, {}, { preserveScroll: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-20">
      <Head title="Riwayat Pesanan" />

      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.get('/shop')} className="mb-6 -ml-4 text-gray-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali Belanja
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Riwayat Pesanan Anda</h1>

        <div className="space-y-4">
          {orders.data.length > 0 ? orders.data.map((order) => {
            const StatusIcon = getStatusDisplay(order.status).icon;
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Transaksi</p>
                    <p className="font-semibold text-gray-900">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-5 w-5 text-gray-500" />
                    <Badge variant="outline" className={getStatusDisplay(order.status).color}>
                      {getStatusDisplay(order.status).label}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="w-full">
                    <p className="font-semibold text-gray-800 line-clamp-1">
                      {order.details[0]?.medicine.name} {order.details.length > 1 ? ` & ${order.details.length - 1} produk lainnya` : ''}
                    </p>
                    <p className="text-sm text-gray-500">Total Belanja: <span className="font-bold text-emerald-600 text-lg">Rp {Number(order.total_price).toLocaleString('id-ID')}</span></p>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto" onClick={() => setSelectedOrder(order)}>Detail</Button>
                    {order.status === 'shipped' && (
                      <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700" onClick={() => markAsCompleted(order.id)}>
                        Pesanan Diterima
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border">
              Belum ada riwayat transaksi.
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAIL PESANAN */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detail Pesanan</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
            {selectedOrder?.details.map((detail) => (
              <div key={detail.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <p className="font-semibold text-sm">{detail.medicine.name}</p>
                  <p className="text-xs text-gray-500">{detail.quantity} x Rp {(Number(detail.subtotal) / detail.quantity).toLocaleString('id-ID')}</p>
                </div>
                <p className="font-bold">Rp {Number(detail.subtotal).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total Tagihan</span>
            <span className="text-emerald-600">Rp {Number(selectedOrder?.total_price).toLocaleString('id-ID')}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}