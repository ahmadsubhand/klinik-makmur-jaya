import { Head, router } from '@inertiajs/react';
import { Search, ShoppingCart, Info, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NotificationBell from '../../components/notification-bell';

interface Category { id: number; name: string; }
interface Medicine {
  id: number;
  name: string;
  description: string;
  type: string;
  price: string;
  total_stock: number;
  image_url: string | null;
  category: Category | null;
}

interface PaginatedData {
  data: Medicine[];
  links: any[];
  current_page: number;
}

export default function ShopIndex({
  medicines,
  categories,
  cart_items,
  filters,
}: {
  medicines: PaginatedData;
  categories: Category[];
  cart_items: Record<number, number>;
  filters: { search: string; category_id: string };
}) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || 'all');
  const isMounted = useRef(false);

  // Debounce untuk Live Search
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      
      return;
    }
    
    const delay = setTimeout(() => {
      router.get('/shop', {
        search: searchTerm,
        category_id: selectedCategory === 'all' ? null : selectedCategory,
      }, { preserveState: true, preserveScroll: true, replace: true });
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm, selectedCategory]);

  const addToCart = (medicineId: number) => {
    router.post('/cart', { medicine_id: medicineId, quantity: 1 }, {
      preserveScroll: true,
      onSuccess: () => {
         // Anda bisa menambahkan toast notification di sini jika ada
      }
    });
  };

  const formatType = (type: string) => {
    const types: Record<string, { label: string, color: string }> = {
      'prescription': { label: 'Obat Resep', color: 'bg-red-100 text-red-700' },
      'over-the-counter': { label: 'Obat Bebas', color: 'bg-green-100 text-green-700' },
      'supplement': { label: 'Suplemen', color: 'bg-blue-100 text-blue-700' },
      'medical_device': { label: 'Alkes', color: 'bg-purple-100 text-purple-700' },
    };

    return types[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-20">
      <Head title="Katalog Apotek" />

      {/* HEADER & FILTER */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Katalog Apotek</h1>
            <p className="text-gray-500 mt-1">Temukan kebutuhan obat dan alat kesehatan Anda.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => router.get('/my-orders')} variant="outline" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Pesanan Saya
            </Button>

            <Button onClick={() => router.get('/cart')} variant="outline" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Lihat Keranjang
            </Button>

            <NotificationBell />
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Cari obat (Misal: Paracetamol)..." 
              className="pl-10 h-11 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {medicines.data.length > 0 ? medicines.data.map((med) => {
          const typeInfo = formatType(med.type);
          const isOutOfStock = med.total_stock <= 0;
          const qtyInCart = cart_items[med.id] || 0;

          return (
            <div key={med.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="aspect-square bg-gray-100 relative p-4 flex items-center justify-center">
                
                {qtyInCart > 0 && (
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 z-10">
                    <ShoppingCart className="h-3 w-3" /> {qtyInCart} di keranjang
                  </div>
                )}

                {med.image_url ? (
                  <img src={med.image_url} alt={med.name} className="object-contain w-full h-full mix-blend-multiply" />
                ) : (
                  <div className="text-gray-300 flex flex-col items-center">
                    <Info className="h-10 w-10 mb-2" />
                    <span>No Image</span>
                  </div>
                )}
                
                {med.type === 'prescription' && (
                   <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                     WAJIB RESEP
                   </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <Badge variant="secondary" className={`w-fit text-[10px] mb-2 ${typeInfo.color}`}>
                  {typeInfo.label}
                </Badge>
                <h3 className="font-semibold text-gray-900 leading-tight mb-1">{med.name}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{med.category?.name}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-lg text-emerald-600">
                    Rp {Number(med.price).toLocaleString('id-ID')}
                  </span>
                </div>

                <Button 
                  className={`w-full mt-4 ${qtyInCart > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`} 
                  disabled={isOutOfStock}
                  onClick={() => addToCart(med.id)}
                >
                  {isOutOfStock ? 'Stok Habis' : (qtyInCart > 0 ? `Tambah Lagi (+)` : 'Tambah ke Keranjang')}
                </Button>
              </div>
            </div>
          )
        }) : (
          <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-xl border">
            Obat yang Anda cari tidak ditemukan.
          </div>
        )}
      </div>

      {/* Pagination (Bisa disalin dari komponen Admin sebelumnya) */}
      <div className="max-w-6xl mx-auto mt-8 flex justify-center space-x-2">
        {medicines.links.map((link, idx) => (
           <Button
             key={idx}
             variant={link.active ? "default" : "outline"}
             disabled={!link.url}
             onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
             dangerouslySetInnerHTML={{ __html: link.label }}
           />
        ))}
      </div>
    </div>
  );
}