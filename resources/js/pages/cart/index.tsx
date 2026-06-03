import { Head, router } from '@inertiajs/react';
import { Trash2, Plus, Minus, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItem {
  id: number;
  medicine_id: number;
  quantity: number;
  subtotal: number;
  medicine: {
    name: string;
    price: string;
    type: string;
    image_url: string | null;
    total_stock: number;
  }
}

export default function CartIndex({ carts }: { carts: CartItem[] }) {
  const updateQuantity = (cartId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;

    if (newQty < 1) { 
      return; // Tidak boleh kurang dari 1 (gunakan tombol hapus)
    }
    
    router.put(`/cart/${cartId}`, { quantity: newQty }, { preserveScroll: true });
  };

  const removeCart = (cartId: number) => {
    if (confirm('Hapus obat ini dari keranjang?')) {
      router.delete(`/cart/${cartId}`, { preserveScroll: true });
    }
  };

  // Menghitung Grand Total
  const grandTotal = carts.reduce((total, item) => total + item.subtotal, 0);
  
  // Mengecek apakah ada obat resep di dalam keranjang (untuk UC4 nantinya)
  const requiresPrescription = carts.some(item => item.medicine.type === 'prescription');

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-20">
      <Head title="Keranjang Belanja" />

      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => router.get('/shop')} className="mb-6 -ml-4 text-gray-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali Belanja
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Keranjang Anda</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* BAGIAN KIRI: DAFTAR BARANG */}
          <div className="lg:col-span-2 space-y-4">
            {carts.length > 0 ? carts.map((cart) => (
              <div key={cart.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4">
                <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                  {cart.medicine.image_url && (
                    <img src={cart.medicine.image_url} alt={cart.medicine.name} className="w-full h-full object-cover" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cart.medicine.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Rp {Number(cart.medicine.price).toLocaleString('id-ID')} / unit</p>
                  
                  {cart.medicine.type === 'prescription' && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Wajib Resep</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(cart.id, cart.quantity, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{cart.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(cart.id, cart.quantity, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="w-24 text-right font-bold text-gray-900">
                    Rp {cart.subtotal.toLocaleString('id-ID')}
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => removeCart(cart.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )) : (
              <div className="bg-white p-12 text-center rounded-xl border text-gray-500">
                Keranjang belanja Anda masih kosong.
              </div>
            )}
          </div>

          {/* BAGIAN KANAN: RINGKASAN & CHECKOUT */}
          <div className="bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Ringkasan Belanja</h2>
            
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Total Harga ({carts.length} barang)</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="flex justify-between font-bold text-lg text-emerald-700 mt-4 border-t pt-4">
              <span>Grand Total</span>
              <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>

            {requiresPrescription && (
              <div className="mt-6 bg-amber-50 border border-amber-200 p-3 rounded-md text-sm text-amber-800 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <p>Pesanan Anda mengandung obat keras. Anda <b>wajib mengunggah resep dokter</b> pada tahap checkout selanjutnya.</p>
              </div>
            )}

            <Button 
              className="w-full mt-6 h-12 text-md" 
              disabled={carts.length === 0}
              onClick={() => router.get('/checkout')}
            >
              Lanjut ke Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}