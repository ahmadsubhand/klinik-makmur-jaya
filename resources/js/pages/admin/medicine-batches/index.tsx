import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, ArrowUpDown, PackageOpen, AlertCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Medicine { id: number; name: string; }
interface Supplier { id: number; name: string; }

interface MedicineBatch {
  id: number;
  medicine_id: number;
  supplier_id: number | null;
  batch_number: string;
  quantity_incoming: number;
  quantity_current: number;
  received_at: string;
  expired_at: string;
  medicine: Medicine;
  supplier: Supplier | null;
}

interface PaginatedData {
  data: MedicineBatch[];
  links: any[];
  current_page: number;
  last_page: number;
}

interface Filters {
  search: string;
  sort_field: string;
  sort_direction: string;
}

export default function MedicineBatchIndex({
  batches,
  medicines,
  suppliers,
  filters,
}: {
  batches: PaginatedData;
  medicines: Medicine[];
  suppliers: Supplier[];
  filters: Filters;
}) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [sortField, setSortField] = useState(filters?.sort_field || 'expired_at');
  const [sortDir, setSortDir] = useState(filters?.sort_direction || 'asc');
  
  const isMounted = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<MedicineBatch | null>(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({
    medicine_id: '',
    supplier_id: 'none',
    quantity_incoming: '',
    quantity_current: '', // Hanya dipakai saat edit
    received_at: new Date().toISOString().split('T')[0], // Default ke hari ini
    expired_at: '',
  });

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      router.get('/admin/medicine-batches', {
        search: searchTerm,
        sort_field: sortField,
        sort_direction: sortDir,
      }, { preserveState: true, preserveScroll: true, replace: true });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const openAddModal = () => {
    reset(); clearErrors(); setEditingBatch(null); setIsOpen(true);
  };

  const openEditModal = (batch: MedicineBatch) => {
    clearErrors();
    setEditingBatch(batch);
    setData({
      medicine_id: batch.medicine_id.toString(),
      supplier_id: batch.supplier_id ? batch.supplier_id.toString() : 'none',
      quantity_incoming: batch.quantity_incoming.toString(),
      quantity_current: batch.quantity_current.toString(),
      received_at: batch.received_at ? batch.received_at.substring(0, 10) : '',
      expired_at: batch.expired_at ? batch.expired_at.substring(0, 10) : '',
    });
    setIsOpen(true);
  };

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    transform((currentData) => ({
      ...currentData,
      supplier_id: currentData.supplier_id === 'none' ? '' : currentData.supplier_id,
    }));

    if (editingBatch) {
      put(`/admin/medicine-batches/${editingBatch.id}`, {
        preserveScroll: true,
        onSuccess: () => { 
          setIsOpen(false); reset(); setEditingBatch(null); 
        },
      });
    } else {
      post('/admin/medicine-batches', {
        preserveScroll: true,
        onSuccess: () => { 
          setIsOpen(false); reset(); 
        },
      });
    }
  };

  const deleteBatch = (id: number) => {
    if (confirm('Yakin ingin menghapus data restok/batch ini secara permanen?')) {
      router.delete(`/admin/medicine-batches/${id}`, { preserveScroll: true });
    }
  };

  // Helper untuk mengecek status kadaluarsa
  const getExpiryStatus = (expiryDateString: string, currentQty: number) => {
    if (currentQty === 0) { 
      return { label: 'Habis', className: 'text-gray-400 bg-gray-50' };
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDateString);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: 'Expired', className: 'bg-red-50 text-red-700 font-medium' };
    }

    if (diffDays <= 90) {
      return { label: 'Mendekati Expired', className: 'bg-amber-50 text-amber-700 font-medium' };
    }
    
    return { label: 'Aman', className: '' };
  };

  return (
    <div className="p-8 pb-20">
      <Head title="Riwayat Restok & Batch" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Restok & Batch</h1>
          <p className="text-sm text-gray-500">Pencatatan kedatangan obat, nomor batch, dan pantauan kadaluarsa.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Restok Obat Baru
        </Button>

        {/* MODAL (ADD / EDIT) */}
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          
          if (!open) { 
            reset(); setEditingBatch(null); clearErrors(); 
          } 
        }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingBatch ? 'Edit Data Batch' : 'Catat Kedatangan Restok'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={submit} className="flex flex-col gap-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="medicine_id">Produk / Obat *</Label>
                  <Select value={data.medicine_id} onValueChange={(val) => setData('medicine_id', val)} disabled={!!editingBatch}>
                    <SelectTrigger><SelectValue placeholder="Pilih Obat yang Direstok" /></SelectTrigger>
                    <SelectContent>
                      {medicines.map((med) => (
                        <SelectItem key={med.id} value={med.id.toString()}>{med.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.medicine_id && <span className="text-xs text-red-500">{errors.medicine_id}</span>}
                </div>

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
                  <Label htmlFor="quantity_incoming">Jumlah Kedatangan (Masuk) *</Label>
                  <Input id="quantity_incoming" type="number" min="1" value={data.quantity_incoming} onChange={(e) => setData('quantity_incoming', e.target.value)} required />
                  {errors.quantity_incoming && <span className="text-xs text-red-500">{errors.quantity_incoming}</span>}
                </div>

                {/* Field Sisa Stok hanya muncul saat mode edit */}
                {editingBatch && (
                  <div className="grid gap-2">
                    <Label htmlFor="quantity_current">Sisa Stok Saat Ini *</Label>
                    <Input id="quantity_current" type="number" min="0" value={data.quantity_current} onChange={(e) => setData('quantity_current', e.target.value)} required />
                    {errors.quantity_current && <span className="text-xs text-red-500">{errors.quantity_current}</span>}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="received_at">Tgl. Diterima *</Label>
                  <Input id="received_at" type="date" value={data.received_at} onChange={(e) => setData('received_at', e.target.value)} required />
                  {errors.received_at && <span className="text-xs text-red-500">{errors.received_at}</span>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expired_at">Tgl. Kadaluarsa *</Label>
                  <Input id="expired_at" type="date" value={data.expired_at} onChange={(e) => setData('expired_at', e.target.value)} required />
                  {errors.expired_at && <span className="text-xs text-red-500">{errors.expired_at}</span>}
                </div>

              </div>
              <Button type="submit" disabled={processing} className="w-full mt-2">
                {editingBatch ? 'Simpan Perubahan' : 'Catat Restok'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4 rounded-md border bg-white p-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Cari No. Batch atau Nama Obat..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Produk & Batch</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('quantity_current')}
              >
                <div className="flex items-center justify-center">
                  Sisa / Total Masuk <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('expired_at')}>
                <div className="flex items-center">Expired Date <ArrowUpDown className="ml-2 h-3 w-3" /></div>
              </TableHead>
              <TableHead className="text-right w-25">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {batches.data.length > 0 ? batches.data.map((batch) => {
              const status = getExpiryStatus(batch.expired_at, batch.quantity_current);
              
              return (
                <TableRow key={batch.id} className={status.className}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{batch.medicine.name}</span>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <PackageOpen className="h-3 w-3 mr-1" /> {batch.batch_number}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-gray-600">
                    {batch.supplier?.name || <em className="text-gray-400">Tidak ada</em>}
                  </TableCell>

                  <TableCell className="text-center font-mono text-sm">
                    {batch.quantity_current === 0 ? (
                      <Badge variant="outline" className="text-gray-400">Habis</Badge>
                    ) : (
                      <span>
                        <span className="font-bold text-gray-900">{batch.quantity_current}</span> 
                        <span className="text-gray-400"> / {batch.quantity_incoming}</span>
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {new Date(batch.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {status.label !== 'Aman' && status.label !== 'Habis' && (
                        <span className="flex items-center text-[10px] mt-1 font-semibold uppercase tracking-wider">
                           <AlertCircle className="h-3 w-3 mr-1" /> {status.label}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(batch)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteBatch(batch.id)}>
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  Data batch / restok tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {batches.data.length > 0 ? (batches.current_page - 1) * 10 + 1 : 0} - {Math.min(batches.current_page * 10, batches.data.length > 0 ? batches.current_page * 10 : 0)} dari total {batches.links ? batches.links.length - 2 : 0} Halaman
        </p>
        <div className="flex space-x-2">
          {batches.links.map((link, index) => (
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