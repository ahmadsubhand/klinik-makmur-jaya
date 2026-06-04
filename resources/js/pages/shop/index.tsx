import { Head, router, usePage } from '@inertiajs/react';
import {
    Search,
    ShoppingCart,
    ShoppingBag,
    LayoutDashboard,
    Sparkles,
    LogIn
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import NotificationBell from '../../components/notification-bell';

interface Category {
    id: number;
    name: string;
}
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
    const [selectedCategory, setSelectedCategory] = useState(
        filters?.category_id || 'all',
    );
    const isMounted = useRef(false);
    const { auth, flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) { 
          toast.success(flash.success);
        }

        if (flash?.error) { 
          toast.error(flash.error); 
        }
    }, [flash]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;

            return;
        }

        const delay = setTimeout(() => {
            router.get(
                '/shop',
                {
                    search: searchTerm,
                    category_id: selectedCategory === 'all' ? null : selectedCategory,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(delay);
    }, [searchTerm, selectedCategory]);

    const addToCart = (medicineId: number) => {
        router.post(
            '/cart',
            { medicine_id: medicineId, quantity: 1 },
            {
                preserveScroll: true,
            },
        );
    };

    const formatType = (type: string) => {
        const types: Record<string, { label: string; color: string }> = {
            prescription: {
                label: 'Obat Resep',
                color: 'bg-red-50 text-red-700 border-red-200',
            },
            'over-the-counter': {
                label: 'Obat Bebas',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            },
            supplement: {
                label: 'Suplemen',
                color: 'bg-blue-50 text-blue-700 border-blue-200',
            },
            medical_device: {
                label: 'Alkes',
                color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            },
        };

        return types[type] || { label: type, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    };

    return (
        <div className="relative min-h-screen bg-slate-50 p-6 pb-20 selection:bg-emerald-500 selection:text-white md:p-8 overflow-hidden">
            <Head title="Katalog Apotek" />

            {/* Dekorasi Background Latar ala Landing Page */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#86efac] to-[#047857] opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"></div>
            </div>

            {/* HEADER & FILTER */}
            <div className="mx-auto mb-10 max-w-7xl relative z-10">
                <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-sm font-medium text-emerald-600 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-600 mr-2 animate-pulse"></span>
                            Katalog Produk Resmi
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                            Temukan Kebutuhan <span className="text-emerald-600">Kesehatan Anda</span>
                        </h1>
                        <p className="mt-3 text-lg text-slate-600">
                            Pesan obat dan alat kesehatan dengan aman. Stok diperbarui secara real-time.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={() => router.get('/cart')}
                            variant="outline"
                            className="flex items-center gap-2 rounded-full border-slate-200 bg-white/80 text-slate-700 backdrop-blur-sm hover:bg-slate-50 hover:text-emerald-600"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Keranjang
                        </Button>
                                                
                        <Button
                            onClick={() => router.get('/my-orders')}
                            variant="outline"
                            className="flex items-center gap-2 rounded-full border-slate-200 bg-white/80 text-slate-700 backdrop-blur-sm hover:bg-slate-50 hover:text-emerald-600"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Pesanan Saya
                        </Button>

                        {auth?.user ? (
                            <>
                                <Button
                                    onClick={() => router.get('/dashboard')}
                                    className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>

                                <NotificationBell />
                            </>
                        ) : (
                            <Button
                                onClick={() => router.get('/login')}
                                className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                            >
                                <LogIn className='h-4 w-4' />
                                Masuk
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter Bar dengan efek Kaca */}
                <div className="flex flex-col items-center gap-4 rounded-2xl p-4 sm:flex-row">
                    <div className="relative w-full flex-1">
                        <Search className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Cari obat (Misal: Paracetamol, Vitamin C)..."
                            className="h-12 rounded-xl border-slate-200 bg-white pl-12 text-base shadow-sm focus-visible:ring-emerald-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full flex justify-end sm:w-72">
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-emerald-500">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 relative z-10">
                {medicines.data.length > 0 ? (
                    medicines.data.map((med) => {
                        const typeInfo = formatType(med.type);
                        const isOutOfStock = med.total_stock <= 0;
                        const qtyInCart = cart_items[med.id] || 0;

                        return (
                            <div
                                key={med.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
                            >
                                <div className="relative flex aspect-square items-center justify-center border-b border-slate-50 bg-linear-to-b from-slate-50 to-white p-8 overflow-hidden">
                                    {/* Overlay Background Efek pada Hover */}
                                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    
                                    {qtyInCart > 0 && (
                                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            {qtyInCart} di keranjang
                                        </div>
                                    )}

                                    {med.image_url ? (
                                        <img
                                            src={med.image_url}
                                            alt={med.name}
                                            className="h-full w-full object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-300 transition-transform duration-500 group-hover:scale-110">
                                            <Sparkles className="mb-2 h-10 w-10 text-emerald-100" />
                                            <span className="text-sm font-medium">Gambar Menyusul</span>
                                        </div>
                                    )}

                                    {med.type === 'prescription' && (
                                        <div className="absolute top-4 right-4 rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                                            WAJIB RESEP
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    <Badge
                                        variant="outline"
                                        className={`mb-3 w-fit border text-[10px] uppercase tracking-wider ${typeInfo.color}`}
                                    >
                                        {typeInfo.label}
                                    </Badge>
                                    <h3 className="mb-1.5 line-clamp-2 text-lg leading-snug font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                        {med.name}
                                    </h3>
                                    <p className="mb-5 text-sm font-medium text-slate-500">
                                        Kategori: {med.category?.name || '-'}
                                    </p>

                                    <div className="mt-auto mb-5 flex flex-col">
                                        <span className="text-sm text-slate-500 mb-1">Harga</span>
                                        <span className="text-2xl font-extrabold tracking-tight text-emerald-600">
                                            Rp {Number(med.price).toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    <Button
                                        className={`w-full rounded-xl py-6 font-semibold shadow-sm transition-all duration-300 ${
                                            qtyInCart > 0 
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md' 
                                                : 'bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-md'
                                        }`}
                                        disabled={isOutOfStock}
                                        onClick={() => addToCart(med.id)}
                                    >
                                        {isOutOfStock
                                            ? 'Stok Habis'
                                            : qtyInCart > 0
                                              ? 'Tambah Lagi (+)'
                                              : 'Tambah ke Keranjang'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm py-32 text-slate-500 shadow-sm">
                        <div className="rounded-full bg-slate-100 p-6 mb-4">
                            <Search className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-slate-900">
                            Obat Tidak Ditemukan
                        </h3>
                        <p className="text-center max-w-md">
                            Kami tidak dapat menemukan apa yang Anda cari. Coba gunakan kata kunci lain atau periksa kembali filter kategori Anda.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {medicines.links.length > 3 && (
                <div className="mx-auto mt-14 flex max-w-7xl flex-wrap justify-center gap-2 relative z-10">
                    {medicines.links.map((link, idx) => (
                        <Button
                            key={idx}
                            variant={link.active ? 'default' : 'outline'}
                            className={`${
                                link.active 
                                    ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700' 
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                            } rounded-lg transition-all`}
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
            )}

            <Toaster richColors closeButton position="top-right" />
        </div>
    );
}