import { Head, useForm, router } from '@inertiajs/react';
import { Pencil, Trash2, Plus, Search, ArrowUpDown, Tag } from 'lucide-react';
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

interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

interface PaginatedData {
  data: Category[];
  links: any[];
  current_page: number;
  last_page: number;
}

interface Filters {
  search: string;
  sort_field: string;
  sort_direction: string;
}

export default function CategoryIndex({
  categories,
  filters,
}: {
  categories: PaginatedData;
  filters: Filters;
}) {
  // STATE FILTER & SORTING
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [sortField, setSortField] = useState(filters?.sort_field || 'created_at');
  const [sortDir, setSortDir] = useState(filters?.sort_direction || 'desc');
  
  const isMounted = useRef(false);

  // STATE MODAL
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // FORM HANDLING
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    description: '',
  });

  // DEBOUNCE SEARCH & SORT
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      router.get('/admin/categories', {
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

  // MODAL CONTROLS
  const openAddModal = () => {
    reset();
    clearErrors();
    setEditingCategory(null);
    setIsOpen(true);
  };

  const openEditModal = (category: Category) => {
    clearErrors();
    setEditingCategory(category);
    setData({
      name: category.name,
      description: category.description || '',
    });
    setIsOpen(true);
  };

  // SUBMIT HANDLER
  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (editingCategory) {
      put(`/admin/categories/${editingCategory.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setIsOpen(false);
          reset();
          setEditingCategory(null);
        },
      });
    } else {
      post('/admin/categories', {
        preserveScroll: true,
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      });
    }
  };

  const deleteCategory = (id: number) => {
    if (confirm('Yakin ingin menghapus kategori ini? Obat terkait tidak akan dihapus, tetapi kategorinya menjadi kosong.')) {
      router.delete(`/admin/categories/${id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <div className="p-8">
      <Head title="Kelola Kategori Obat" />

      {/* HEADER SECTION */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategori Obat</h1>
          <p className="text-sm text-gray-500">Kelola master data pengelompokan obat dan alat kesehatan.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
        </Button>

        {/* MODAL (ADD / EDIT) */}
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) { 
            reset(); setEditingCategory(null); clearErrors(); 
          } 
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={submit} className="flex flex-col gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Misal: Antibiotik, Obat Bebas..."
                  required
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Penjelasan singkat mengenai kategori ini..."
                  rows={3}
                />
                {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
              </div>

              <Button type="submit" disabled={processing} className="w-full mt-2">
                {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
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
            placeholder="Cari nama atau deskripsi kategori..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="rounded-md border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 w-1/4" 
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Nama Kategori <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 w-1/5" 
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Dibuat Pada <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right w-25">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.data.length > 0 ? categories.data.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    {category.name}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 truncate max-w-xs">
                  {category.description || <em className="text-gray-400">Tidak ada deskripsi</em>}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {new Date(category.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(category.id)}>
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                  Kategori tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan {categories.data.length > 0 ? (categories.current_page - 1) * 10 + 1 : 0} - {Math.min(categories.current_page * 10, categories.data.length > 0 ? categories.current_page * 10 : 0)} dari total {categories.links ? categories.links.length - 2 : 0} Halaman
        </p>
        <div className="flex space-x-2">
          {categories.links.map((link, index) => (
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