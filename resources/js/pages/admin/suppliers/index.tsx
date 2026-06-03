import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, ArrowUpDown, Truck } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface Supplier {
  id: number;
  name: string;
  contact: string | null;
  address: string | null;
  created_at: string;
}

interface PaginatedData {
  data: Supplier[];
  links: any[];
  current_page: number;
  last_page: number;
}

interface Filters {
  search: string;
  sort_field: string;
  sort_direction: string;
}

export default function SupplierIndex({
  suppliers,
  filters,
}: {
  suppliers: PaginatedData;
  filters: Filters;
}) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [sortField, setSortField] = useState(filters?.sort_field || 'created_at');
  const [sortDir, setSortDir] = useState(filters?.sort_direction || 'desc');
  
  const isMounted = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    contact: '',
    address: '',
  });

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      return;
    }

    const delayDebounceFn = setTimeout(() => {
      // Perbaikan: menambahkan prefix /admin
      router.get('/admin/suppliers', {
        search: searchTerm,
        sort_field: sortField,
        sort_direction: sortDir,
      }, {
        preserveState: true, 
        preserveScroll: true, 
        replace: true, 
      });
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
    reset();
    clearErrors();
    setEditingSupplier(null);
    setIsOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    clearErrors();
    setEditingSupplier(supplier);
    setData({
      name: supplier.name,
      contact: supplier.contact || '',
      address: supplier.address || '',
    });
    setIsOpen(true);
  };

  // Perbaikan: Menggunakan React.SyntheticEvent
  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (editingSupplier) {
      put(`/admin/suppliers/${editingSupplier.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setIsOpen(false);
          reset();
          setEditingSupplier(null);
        },
      });
    } else {
      post('/admin/suppliers', {
        preserveScroll: true,
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      });
    }
  };

  const deleteSupplier = (id: number) => {
    if (confirm('Yakin ingin menghapus pemasok ini? Data stok/batch sebelumnya tidak akan terhapus namun kehilangan informasi pemasoknya.')) {
      router.delete(`/admin/suppliers/${id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <div className="p-8">
      <Head title="Kelola Pemasok (Supplier)" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pemasok Obat</h1>
          <p className="text-sm text-gray-500">Kelola master data distributor dan pabrik farmasi.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Pemasok
        </Button>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) { 
            reset(); setEditingSupplier(null); clearErrors(); 
          } 
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Data Pemasok' : 'Tambah Pemasok Baru'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={submit} className="flex flex-col gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Pemasok / Perusahaan</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="PT. Bina San Prima..."
                  required
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact">Kontak (No. HP / Telepon)</Label>
                <Input
                  id="contact"
                  value={data.contact}
                  onChange={(e) => setData('contact', e.target.value)}
                  placeholder="08123456789 atau (021) 123456"
                />
                {errors.contact && <span className="text-xs text-red-500">{errors.contact}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  placeholder="Alamat kantor atau gudang pemasok..."
                  rows={3}
                />
                {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
              </div>

              <Button type="submit" disabled={processing} className="w-full mt-2">
                {editingSupplier ? 'Simpan Perubahan' : 'Tambah Pemasok'}
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
            placeholder="Cari nama atau kontak pemasok..."
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
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 w-1/3" 
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Nama Pemasok <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right w-25">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {suppliers.data.length > 0 ? suppliers.data.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    {supplier.name}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {supplier.contact || <em className="text-gray-400">Belum diatur</em>}
                </TableCell>
                <TableCell className="text-gray-600 truncate max-w-xs" title={supplier.address || ''}>
                  {supplier.address || <em className="text-gray-400">Belum diatur</em>}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(supplier)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteSupplier(supplier.id)}>
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                  Data pemasok tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {suppliers.data.length > 0 ? (suppliers.current_page - 1) * 10 + 1 : 0} - {Math.min(suppliers.current_page * 10, suppliers.data.length > 0 ? suppliers.current_page * 10 : 0)} dari total {suppliers.links ? suppliers.links.length - 2 : 0} Halaman
        </p>
        <div className="flex space-x-2">
          {suppliers.links.map((link, index) => (
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