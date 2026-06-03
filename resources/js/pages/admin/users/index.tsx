import { Head, router, usePage } from '@inertiajs/react';
import { Trash2, Search, ArrowUpDown, Clock, Loader2, Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone_number: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

interface PaginatedData<T> {
  data: T[];
  links: any[];
  current_page: number;
  last_page: number;
}

interface Filters {
  search: string;
  role: string;
  sort_field: string;
  sort_direction: string;
}

// --- KAMUS MAPPING ROLE KE BAHASA INDONESIA ---
const roleTranslations: Record<string, string> = {
  'admin': 'Administrator',
  'pharmacist': 'Apoteker',
  'cashier': 'Kasir',
  'customer': 'Pelanggan',
  // Tambahkan role lain di sini jika ada di database Anda
};

// Fungsi pembantu untuk menerjemahkan role
const translateRole = (roleName: string) => {
  const lowerName = roleName.toLowerCase();

  // Jika ada di kamus, gunakan terjemahan. Jika tidak, gunakan nama asli dengan huruf kapital di awal.
  return roleTranslations[lowerName] || (roleName.charAt(0).toUpperCase() + roleName.slice(1));
};

export default function UserIndex({
  users,
  roles,
  filters,
}: {
  users: PaginatedData<User>;
  roles: Role[];
  filters: Filters;
}) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth.user.id === 1;

  // --- FILTER & SORTING STATE ---
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedRole, setSelectedRole] = useState(filters?.role || 'all');
  const [sortField, setSortField] = useState(filters?.sort_field || 'created_at');
  const [sortDir, setSortDir] = useState(filters?.sort_direction || 'desc');
  
  // State untuk melacak user mana yang sedang diproses rolenya (loading spinner)
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [detailUser, setDetailUser] = useState<User | null>(null);

  const isMounted = useRef(false);

  // Efek Debounce untuk Filter
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      return;
    }

    const delayDebounceFn = setTimeout(() => {
      router.get(`/admin/users`, {
        search: searchTerm,
        role: selectedRole === 'all' ? null : selectedRole,
        sort_field: sortField,
        sort_direction: sortDir,
      }, {
        preserveState: true, 
        preserveScroll: true, 
        replace: true, 
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedRole, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // --- FUNGSI GANTI ROLE (INLINE) ---
  const handleRoleChange = (userId: number, newRoleId: string) => {
    router.post(`/admin/users/${userId}/change-role`, {
      role_id: newRoleId
    }, {
      preserveScroll: true,
      onStart: () => setProcessingId(userId),
      onFinish: () => setProcessingId(null),
    });
  };

  // --- FUNGSI HAPUS USER ---
  const deleteUser = (id: number) => {
    if (confirm('Yakin ingin menghapus pengguna ini secara permanen?')) {
      router.delete(`/admin/users/${id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <div className="p-8">
      <Head title="Kelola Akses Pengguna" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Akses Pengguna</h1>
        <p className="text-sm text-gray-500">Atur hak akses staf dan admin secara langsung dari tabel.</p>
      </div>
      {/* 3. MODAL DETAIL PENGGUNA */}
      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pengguna</DialogTitle>
          </DialogHeader>
          
          {detailUser && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-gray-500 font-medium">Nama Lengkap</span>
                <span className="col-span-2 font-semibold">{detailUser.name}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-gray-500 font-medium">Email</span>
                <span className="col-span-2">{detailUser.email}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-gray-500 font-medium">Nomor Telepon</span>
                <span className="col-span-2">{detailUser.phone_number || <em className="text-gray-400">Belum diatur</em>}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-gray-500 font-medium">Alamat</span>
                <span className="col-span-2">{detailUser.address || <em className="text-gray-400">Belum diatur</em>}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-gray-500 font-medium">Terdaftar Pada</span>
                <span className="col-span-2">
                  {new Date(detailUser.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="text-gray-500 font-medium">Terakhir Diperbarui</span>
                <span className="col-span-2">
                  {new Date(detailUser.updated_at).toLocaleDateString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-500 font-medium">Peran (Role)</span>
                <span className="col-span-2 flex flex-wrap gap-1">
                  {detailUser.roles.length > 0 ? detailUser.roles.map((role) => (
                    <span key={role.id} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {translateRole(role.name)}
                    </span>
                  )) : (
                    <em className="text-gray-400">Tidak ada</em>
                  )}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* FILTER & PENCARIAN */}
      <div className="mb-4 flex items-center justify-between gap-4 rounded-md border bg-white p-4 shadow-sm">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Cari Nama atau Email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex max-w-xs items-center space-x-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peran</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {translateRole(role.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABEL PENGGUNA */}
      <div className="rounded-md border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 w-1/3" 
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Pengguna <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Hak Akses / Peran</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('email_verified_at')}
              >
                <div className="flex items-center">
                  Status Terverifikasi <ArrowUpDown className="ml-2 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.data.length > 0 ? users.data.map((user) => {
              
              // --- EVALUASI ATURAN PROTEKSI ---
              const targetIsAdmin = user.roles.some(r => r.name === 'admin');
              const isSelf = user.id === auth.user.id;
              
              // Cek apakah user yang login punya hak untuk mengubah/menghapus user ini
              const canEdit = user.id !== 1 && !isSelf && (!targetIsAdmin || isSuperAdmin);
              const currentRoleId = user.roles.length > 0 ? user.roles[0].id.toString() : "";

              return (
                <TableRow key={user.id}>
                  
                  {/* Kolom Nama & Email */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </TableCell>

                  {/* Kolom Hak Akses (Dropdown Inline) */}
                  <TableCell>
                    {canEdit ? (
                      <div className="flex items-center gap-2">
                        <Select 
                          defaultValue={currentRoleId}
                          onValueChange={(val) => handleRoleChange(user.id, val)}
                          disabled={processingId === user.id}
                        >
                          <SelectTrigger className="w-35 h-8 text-xs font-medium">
                            <SelectValue placeholder="Pilih Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              // Aturan: Hanya Super Admin yang bisa melihat/mendaftarkan 'admin'
                              (role.name !== 'admin' || isSuperAdmin) && (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {translateRole(role.name)}
                                </SelectItem>
                              )
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Spinner loading saat request dikirim */}
                        {processingId === user.id && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                      </div>
                    ) : (
                      // Jika tidak boleh edit, tampilkan sebagai badge statis
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span key={role.id} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                            {translateRole(role.name)}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>

                  {/* Kolom Verifikasi */}
                  <TableCell className="text-gray-500 text-sm">
                    {
                      user.email_verified_at ? new Date(user.email_verified_at).toLocaleString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : 
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        <Clock className="mr-1 h-3 w-3" /> Belum Aktivasi
                      </Badge>
                    }
                  </TableCell>

                  {/* Kolom Aksi */}
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDetailUser(user)} 
                      title="Lihat Detail Pengguna"
                    >
                      <Eye className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                    </Button>

                    {canEdit && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteUser(user.id)} 
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </Button>
                    )}
                  </TableCell>

                </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                  Data pengguna tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Menampilkan Halaman {users.current_page} dari {users.last_page}
        </p>
        <div className="flex space-x-2">
          {users.links.map((link, index) => (
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