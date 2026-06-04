import { Head, router, useForm } from '@inertiajs/react';
import { Search, ShoppingBag, Plus, Minus, Trash2, Banknote, CreditCard, QrCode } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Medicine {
  id: number;
  name: string;
  price: string;
  total_stock: number;
  image_url: string | null;
}

interface CartItem extends Medicine {
  cartQuantity: number;
}

export default function PosIndex({ medicines, categories, filters }: any) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [activeCategory, setActiveCategory] = useState(filters?.category_id || '');
  const isMounted = useRef(false);

  // Keranjang POS disimpan di state lokal
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [cashGiven, setCashGiven] = useState<number | ''>('');

  const { data, setData, post, processing, reset } = useForm({
    items: [] as { medicine_id: number; quantity: number }[],
    payment_method: 'cash',
    patient_name: '',
  });

  // Debounce Search & Filter
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      
      return;
    }
    
    const delay = setTimeout(() => {
      router.get('/admin/pos', {
        search: searchTerm,
        category_id: activeCategory || null,
      }, { preserveState: true, preserveScroll: true, replace: true });
    }, 300);
    
    return () => clearTimeout(delay);
  }, [searchTerm, activeCategory]);

  const addToCart = (med: Medicine) => {
    if (med.total_stock <= 0) {
      return; // Dicegah jika stok gudang habis
    }
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === med.id);
      
      if (existing) {
        if (existing.cartQuantity >= med.total_stock) {
          return prev; // Cegah lewat stok
        }
        
        return prev.map((item) => item.id === med.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }

      return [...prev, { ...med, cartQuantity: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;

        if (newQty > 0 && newQty <= item.total_stock) {
          return { ...item, cartQuantity: newQty };
        }
      }

      return item;
    }));
  };

  const removeCart = (id: number) => setCart((prev) => prev.filter((item) => item.id !== id));

  const totalBelanja = cart.reduce((sum, item) => sum + (Number(item.price) * item.cartQuantity), 0);
  const kembalian = typeof cashGiven === 'number' ? cashGiven - totalBelanja : 0;

  const openCheckout = () => {
    setData('items', cart.map((c) => ({ medicine_id: c.id, quantity: c.cartQuantity })));
    setIsCheckoutModalOpen(true);
  };

  const processPayment = (e: React.SyntheticEvent) => {
    e.preventDefault();
    post('/admin/pos', {
      onSuccess: () => {
        setCart([]); // Kosongkan keranjang jika berhasil
        setCashGiven('');
        reset();
        setIsCheckoutModalOpen(false);
      }
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Head title="Point of Sale (Kasir)" />

      {/* HEADER */}
      <div className="bg-white px-6 py-4 border-b flex items-center justify-between shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold">Kasir Apotek</h1>
          <p className="text-sm text-gray-500">Digunakan untuk melayani pemesanan offline.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button variant={activeCategory === '' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveCategory('')}>Semua</Button>
          {categories.map((c: any) => (
            <Button key={c.id} variant={activeCategory === c.id.toString() ? 'default' : 'ghost'} size="sm" onClick={() => setActiveCategory(c.id.toString())}>
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* KIRI: AREA PRODUK */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Cari nama obat (Fuzzy Search)..." 
              className="pl-10 h-12 text-lg shadow-sm border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {medicines.data.map((med: Medicine) => (
              <div 
                key={med.id} 
                onClick={() => addToCart(med)}
                className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:border-indigo-400 hover:shadow-md ${med.total_stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                  {med.image_url ? (
                    <img src={med.image_url} alt={med.name} className="object-contain w-full h-full mix-blend-multiply" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{med.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-emerald-600 font-bold text-sm">Rp {Number(med.price).toLocaleString('id-ID')}</span>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Stok: {med.total_stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KANAN: AREA KERANJANG STRUK */}
        <div className="w-100 bg-white border-l flex flex-col shadow-xl z-20">
          <div className="p-4 border-b bg-gray-50 text-center font-bold text-gray-700">
            Daftar Belanja
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length > 0 ? cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 border-b pb-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</span>
                  <span className="font-bold text-sm">Rp {(Number(item.price) * item.cartQuantity).toLocaleString('id-ID')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center border rounded-md h-8 w-fit">
                    <button onClick={() => updateQty(item.id, -1)} className="px-2 hover:bg-gray-100 h-full w-full"><Minus className="h-3 w-3" /></button>
                    <span className="px-3 text-xs font-bold border-x">{item.cartQuantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-2 hover:bg-gray-100 h-full w-full"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => removeCart(item.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingBag className="h-12 w-12 mb-2 opacity-20" />
                <p>Belum ada barang dipilih</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-semibold">Total Tagihan</span>
              <span className="text-2xl font-bold text-emerald-600">Rp {totalBelanja.toLocaleString('id-ID')}</span>
            </div>
            <Button 
              className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700" 
              disabled={cart.length === 0} 
              onClick={openCheckout}
            >
              Bayar Pesanan
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL CHECKOUT KASIR */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-2xl">Pembayaran POS</DialogTitle></DialogHeader>
          <form onSubmit={processPayment} className="space-y-6 mt-2">
            
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
              <p className="text-emerald-800 font-semibold mb-1">Total yang harus dibayar</p>
              <p className="text-3xl font-bold text-emerald-600">Rp {totalBelanja.toLocaleString('id-ID')}</p>
            </div>

            <div className="grid gap-2">
              <Label>Nama Pasien (Opsional)</Label>
              <Input placeholder="Walk-in Customer..." value={data.patient_name} onChange={(e) => setData('patient_name', e.target.value)} />
            </div>

            <div className="grid gap-3">
              <Label>Metode Pembayaran</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant={data.payment_method === 'cash' ? 'default' : 'outline'} className="h-12" onClick={() => setData('payment_method', 'cash')}>
                  <Banknote className="h-4 w-4 mr-2" /> Tunai
                </Button>
                <Button type="button" variant={data.payment_method === 'qris' ? 'default' : 'outline'} className="h-12" onClick={() => setData('payment_method', 'qris')}>
                  <QrCode className="h-4 w-4 mr-2" /> QRIS
                </Button>
                <Button type="button" variant={data.payment_method === 'debit' ? 'default' : 'outline'} className="h-12" onClick={() => setData('payment_method', 'debit')}>
                  <CreditCard className="h-4 w-4 mr-2" /> Debit
                </Button>
              </div>
            </div>

            {/* Hitung Kembalian (Hanya muncul jika tunai) */}
            {data.payment_method === 'cash' && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid gap-2">
                  <Label>Uang Diterima (Rp)</Label>
                  <Input 
                    type="number" 
                    className="text-lg font-bold h-12"
                    value={cashGiven} 
                    onChange={(e) => setCashGiven(e.target.value === '' ? '' : Number(e.target.value))} 
                  />
                </div>
                {kembalian > 0 && (
                  <div className="flex justify-between items-center text-indigo-700 font-bold bg-indigo-50 p-3 rounded-lg">
                    <span>Kembalian</span>
                    <span className="text-xl">Rp {kembalian.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {typeof cashGiven === 'number' && cashGiven < totalBelanja && (
                  <p className="text-red-500 text-sm font-bold text-center">Uang yang diterima kurang!</p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-lg" 
              disabled={processing || (data.payment_method === 'cash' && typeof cashGiven === 'number' && cashGiven < totalBelanja)}
            >
              Proses Transaksi Selesai
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}