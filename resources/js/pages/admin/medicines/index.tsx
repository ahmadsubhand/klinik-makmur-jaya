import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, ArrowUpDown, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import ImportCsv from '../../../components/import-csv';

interface Category { id: number; name: string; }
interface Supplier { id: number; name: string; }

interface Medicine {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  type: string;
  price: string;
  min_stock: number;
  total_stock: number;
  image_url: string | null;
  category: Category | null;
}

interface PaginatedData {
  data: Medicine[];
  links: any[];
  current_page: number;
  last_page: number;
}

interface Filters {
  search: string;
  category_id: string;
  sort_field: string;
  sort_direction: string;
}

export default function MedicineIndex({
  medicines,
  categories,
  suppliers,
  filters,
}: {
  medicines: PaginatedData;
  categories: Category[];
  suppliers: Supplier[];
  filters: Filters;
}) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || 'all');
  const [sortField, setSortField] = useState(filters?.sort_field || 'created_at');
  const [sortDir, setSortDir] = useState(filters?.sort_direction || 'desc');
  
  const isMounted = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form State
  const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
    name: '',
    category_id: '',
    description: '',
    type: 'over-the-counter',
    price: '',
    min_stock: '10',
    image: null as File | null,
    
    // Initial Batch Fields
    add_initial_batch: false,
    supplier_id: 'none',
    quantity: '',
    expired_at: '',
    
    // Diperlukan untuk trik Upload File saat Update di Laravel
    _method: 'post', 
  });

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      return;
    }

    const delayDebounceFn = setTimeout(() => {
      router.get('/admin/medicines', {
        search: searchTerm,
        category_id: selectedCategory === 'all' ? null : selectedCategory,
        sort_field: sortField,
        sort_direction: sortDir,
      }, {
        preserveState: true, preserveScroll: true, replace: true, 
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const openAddModal = () => {
    reset();
    clearErrors();
    setEditingMedicine(null);
    setData('_method', 'post'); // Method standar untuk Create
    setIsOpen(true);
  };

  const openEditModal = (medicine: Medicine) => {
    clearErrors();
    setEditingMedicine(medicine);
    setData({
      name: medicine.name,
      category_id: medicine.category_id?.toString() || '',
      description: medicine.description || '',
      type: medicine.type,
      price: Math.floor(Number(medicine.price)).toString(), // Buang desimal jika .00
      min_stock: medicine.min_stock.toString(),
      image: null, // Jangan isi image saat edit kecuali user upload baru
      
      add_initial_batch: false,
      supplier_id: 'none',
      quantity: '',
      expired_at: '',
      
      _method: 'put', // Trik Laravel untuk update dengan FormData (file)
    });
    setIsOpen(true);
  };

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    transform((currentData) => ({
      ...currentData,
      supplier_id: currentData.supplier_id === 'none' ? '' : currentData.supplier_id,
    }));

    if (editingMedicine) {
      // Walaupun methodnya POST di frontend, Laravel akan membacanya sebagai PUT
      // berkat parameter _method: 'put' yang kita set sebelumnya.
      post(`/admin/medicines/${editingMedicine.id}`, {
        preserveScroll: true,
        onSuccess: () => { 
          setIsOpen(false); reset(); setEditingMedicine(null); 
        },
      });
    } else {
      post('/admin/medicines', {
        preserveScroll: true,
        onSuccess: () => { 
          setIsOpen(false); reset(); 
        },
      });
    }
  };

  const deleteMedicine = (id: number) => {
    if (confirm('Yakin ingin menghapus obat ini? PERHATIAN: Semua stok (batch) dari obat ini juga akan ikut terhapus!')) {
      router.delete(`/admin/medicines/${id}`, { preserveScroll: true });
    }
  };

  // Helper tampilan tipe obat
  const formatType = (type: string) => {
    const map: Record<string, { label: string, color: string }> = {
      'prescription': { label: 'Resep Dokter', color: 'bg-red-100 text-red-800 border-red-200' },
      'over-the-counter': { label: 'Obat Bebas', color: 'bg-green-100 text-green-800 border-green-200' },
      'supplement': { label: 'Suplemen', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'medical_device': { label: 'Alkes', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    };

    return map[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
  };

  // Menentukan sumber gambar untuk preview
  const imagePreview = data.image 
    ? URL.createObjectURL(data.image) // Preview gambar yang baru dipilih
    : (editingMedicine?.image_url || null); // Preview gambar lama dari database

  
  const [isOpenCsv, setIsOpenCsv] = useState(false);

  return (
    <div className="p-8 pb-20">
      <Head title="Kelola Master Obat" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Obat & Alkes</h1>
          <p className="text-sm text-gray-500">Kelola katalog produk, harga, dan pengaturan stok dasar.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setIsOpenCsv(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" /> Tambah Obat dengan CSV
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Obat
          </Button>
        </div>

        {/* MODAL UPLOAD */}
        <Dialog open={isOpenCsv} onOpenChange={(open) => {
          setIsOpenCsv(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Obat dengan CSV</DialogTitle>
            </DialogHeader>

            <ImportCsv />
          </DialogContent>
        </Dialog>

        {/* MODAL (ADD / EDIT) */}
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) { 
            reset(); setEditingMedicine(null); clearErrors(); 
          } 
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMedicine ? 'Edit Data Obat' : 'Tambah Obat Baru'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={submit} className="flex flex-col gap-6 mt-2">
              <div className="grid grid-cols-2 gap-4">
                {/* KOLOM KIRI */}
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama Obat / Produk</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Paracetamol 500mg..." required />
                    {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category_id">Kategori</Label>
                    <Select value={data.category_id} onValueChange={(val) => setData('category_id', val)} required>
                      <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && <span className="text-xs text-red-500">{errors.category_id}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">Golongan / Tipe Obat</Label>
                    <Select value={data.type} onValueChange={(val) => setData('type', val)} required>
                      <SelectTrigger><SelectValue placeholder="Pilih Golongan" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="over-the-counter">Obat Bebas</SelectItem>
                        <SelectItem value="prescription">Obat Resep</SelectItem>
                        <SelectItem value="supplement">Suplemen / Vitamin</SelectItem>
                        <SelectItem value="medical_device">Alat Kesehatan</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <span className="text-xs text-red-500">{errors.type}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image">Gambar Produk {editingMedicine && <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}</Label>
                    {imagePreview && (
                      <div className="mt-1 mb-2 h-32 w-32 shrink-0 overflow-hidden rounded-md border bg-gray-50 flex items-center justify-center">
                        <img 
                          src={imagePreview} 
                          alt="Preview Gambar Obat" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <Input id="image" type="file" accept="image/*" onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)} />
                    {errors.image && <span className="text-xs text-red-500">{errors.image}</span>}
                  </div>
                </div>

                {/* KOLOM KANAN */}
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Harga Jual Satuan (Rp)</Label>
                    <Input id="price" type="number" min="0" value={data.price} onChange={(e) => setData('price', e.target.value)} placeholder="5000" required />
                    {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="min_stock">Peringatan Minimum Stok</Label>
                    <Input id="min_stock" type="number" min="0" value={data.min_stock} onChange={(e) => setData('min_stock', e.target.value)} required />
                    {errors.min_stock && <span className="text-xs text-red-500">{errors.min_stock}</span>}
                  </div>

                  <div className="grid gap-2 flex-1 items-end">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" className="h-full min-h-25" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* SECTION: BATCH PERTAMA (Hanya tampil saat CREATE) */}
              {!editingMedicine && (
                <div className="rounded-md border p-4 bg-gray-50 flex flex-col gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="add_initial_batch" 
                      checked={data.add_initial_batch} 
                      onCheckedChange={(checked) => setData('add_initial_batch', checked as boolean)} 
                    />
                    <Label htmlFor="add_initial_batch" className="font-semibold cursor-pointer">Tambahkan Stok Awal (Batch Pertama)</Label>
                  </div>

                  {data.add_initial_batch && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                      <div className="grid gap-2">
                        <Label htmlFor="supplier_id">Supplier (Opsional)</Label>
                        <Select value={data.supplier_id} onValueChange={(val) => setData('supplier_id', val)}>
                          <SelectTrigger><SelectValue placeholder="Pilih Supplier" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- Tanpa Supplier --</SelectItem>
                            {suppliers.map((sup) => (
                              <SelectItem key={sup.id} value={sup.id.toString()}>{sup.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Jumlah Unit *</Label>
                        <Input id="quantity" type="number" min="1" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} required={data.add_initial_batch} />
                        {errors.quantity && <span className="text-xs text-red-500">{errors.quantity}</span>}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="expired_at">Tanggal Kadaluarsa *</Label>
                        <Input id="expired_at" type="date" value={data.expired_at} onChange={(e) => setData('expired_at', e.target.value)} required={data.add_initial_batch} />
                        {errors.expired_at && <span className="text-xs text-red-500">{errors.expired_at}</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" disabled={processing} className="w-full">
                {editingMedicine ? 'Simpan Perubahan Data' : 'Simpan Obat'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTER & SEARCH */}
      <div className="mb-4 flex items-center justify-between gap-4 rounded-md border bg-white p-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Cari nama produk..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex max-w-xs items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="rounded-md border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-75" onClick={() => handleSort('name')}>
                <div className="flex items-center cursor-pointer hover:text-gray-700">Produk <ArrowUpDown className="ml-2 h-3 w-3" /></div>
              </TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead onClick={() => handleSort('price')}>
                <div className="flex items-center cursor-pointer hover:text-gray-700">Harga Jual <ArrowUpDown className="ml-2 h-3 w-3" /></div>
              </TableHead>
              <TableHead onClick={() => handleSort('total_stock')}>
                <div className="flex items-center cursor-pointer hover:text-gray-700">Stok Gudang <ArrowUpDown className="ml-2 h-3 w-3" /></div>
              </TableHead>
              <TableHead className="text-right w-25">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {medicines.data.length > 0 ? medicines.data.map((med) => {
              const typeStyling = formatType(med.type);
              const isLowStock = med.total_stock <= med.min_stock;

              return (
                <TableRow key={med.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-gray-100 flex items-center justify-center">
                        {med.image_url ? (
                          <img src={med.image_url} alt={med.name} className="object-cover w-full h-full" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{med.name}</span>
                        <span className="text-xs text-gray-500">{med.category?.name || 'Tanpa Kategori'}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className={typeStyling.color}>{typeStyling.label}</Badge>
                  </TableCell>

                  <TableCell className="font-mono text-gray-700">
                    Rp {Number(med.price).toLocaleString('id-ID')}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center gap-2">
                      {isLowStock && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      <span className={`font-semibold ${isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {med.total_stock} Unit
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(med)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMedicine(med.id)}>
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  Data produk / obat tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {medicines.data.length > 0 ? (medicines.current_page - 1) * 10 + 1 : 0} - {Math.min(medicines.current_page * 10, medicines.data.length > 0 ? medicines.current_page * 10 : 0)} dari total {medicines.links ? medicines.links.length - 2 : 0} Halaman
        </p>
        <div className="flex space-x-2">
          {medicines.links.map((link, index) => (
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
    </div>
  );
}