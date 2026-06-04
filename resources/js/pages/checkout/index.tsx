import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CartItem {
  id: number;
  medicine_id: number;
  quantity: number;
  subtotal: number;
  medicine: {
    name: string;
    price: string;
    type: string;
  }
}

export default function CheckoutIndex({
  carts,
  requires_prescription,
  total_price,
}: {
  carts: CartItem[];
  requires_prescription: boolean;
  total_price: number;
}) {
  const { auth } = usePage().props as any;
  
  const { data, setData, post, processing, errors } = useForm({
    address: auth.user?.address || '',
    payment_method: '',
    prescription_file: null as File | null,
  });

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    post('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-20">
      <Head title="Checkout Pembayaran" />

      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => router.get('/cart')} className="mb-6 -ml-4 text-gray-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Keranjang
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout Pesanan</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KOLOM KIRI: FORM PENGIRIMAN & PEMBAYARAN */}
          <div className="space-y-6">
            
            {/* ALAMAT */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Detail Pengiriman
              </h2>
              <div className="grid gap-2">
                <Label htmlFor="address">Alamat Pengiriman Lengkap</Label>
                <Textarea 
                  id="address" 
                  rows={4}
                  value={data.address} 
                  onChange={(e) => setData('address', e.target.value)}
                  placeholder="Jalan, RT/RW, Kecamatan, Kota..." 
                  required 
                />
                {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
              </div>
            </div>

            {/* SYARAT RESEP DOKTER (Dinamic Form UC4) */}
            {requires_prescription && (
              <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-200">
                <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" /> Unggah Resep Dokter
                </h2>
                <p className="text-sm text-amber-800 mb-4">
                  Pesanan Anda mengandung obat keras. Hukum mewajibkan Anda untuk melampirkan resep dokter asli yang masih berlaku.
                </p>
                <div className="grid gap-2 bg-white p-4 rounded border border-amber-100">
                  <Label htmlFor="prescription_file" className="text-gray-700">Pilih File (Foto / PDF)</Label>
                  <Input 
                    id="prescription_file" 
                    type="file" 
                    accept="image/*,.pdf" 
                    onChange={(e) => setData('prescription_file', e.target.files ? e.target.files[0] : null)} 
                  />
                  {errors.prescription_file && <span className="text-xs text-red-500 font-bold">{errors.prescription_file}</span>}
                </div>
              </div>
            )}

            {/* METODE PEMBAYARAN */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Pembayaran
              </h2>
              <div className="grid gap-2">
                <Label>Pilih Metode Pembayaran</Label>
                <Select value={data.payment_method} onValueChange={(val) => setData('payment_method', val)}>
                  <SelectTrigger className="h-12 text-md">
                    <SelectValue placeholder="-- Pilih Metode --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qris">QRIS (Otomatis dicek)</SelectItem>
                    <SelectItem value="transfer_bank">Transfer Bank / Virtual Account</SelectItem>
                    <SelectItem value="ewallet">E-Wallet (GoPay / OVO)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && <span className="text-xs text-red-500">{errors.payment_method}</span>}
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: RINGKASAN PESANAN & SUBMIT */}
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-3 mb-6 max-h-75 overflow-y-auto pr-2">
                {carts.map((cart) => (
                  <div key={cart.id} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 line-clamp-1">{cart.medicine.name}</p>
                      <p className="text-gray-500">{cart.quantity} x Rp {Number(cart.medicine.price).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="font-medium text-gray-900 text-right w-24">
                      Rp {cart.subtotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>Rp {total_price.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Biaya Layanan & Ongkir</span>
                  <span className="text-emerald-600 font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-gray-900 pt-4 border-t mt-4">
                  <span>Total Tagihan</span>
                  <span>Rp {total_price.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <form onSubmit={submit} className="mt-8">
                <Button 
                  type="submit" 
                  disabled={processing || !data.payment_method} 
                  className="w-full h-12 text-md bg-emerald-600 hover:bg-emerald-700"
                >
                  {processing ? 'Memproses Transaksi...' : 'Bayar Sekarang'}
                </Button>
                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> Transaksi dilindungi enkripsi SSL 256-bit
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}