import { Head, Link, usePage } from '@inertiajs/react';
import {
  ShieldCheck, 
  Truck, 
  Pill, 
  ArrowRight, 
  FileText, 
  CheckCircle, 
  Clock, 
  ShoppingBag
} from 'lucide-react';
import AppLogo from '@/components/app-logo';

export default function Welcome() {
    const { auth } = usePage().props as any;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white pb-20">
            <Head title="Klinik Makmur Jaya - Solusi Kesehatan Terpercaya" />

            {/* ================= NAVBAR ================= */}
            <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    <AppLogo />

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
                        <a href="#layanan" className="hover:text-emerald-600 transition-colors">Layanan</a>
                        <a href="#cara-kerja" className="hover:text-emerald-600 transition-colors">Cara Kerja</a>
                        <Link href="/shop" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors">
                            <ShoppingBag className="h-4 w-4" /> Katalog Obat
                        </Link>
                    </div>

                    {/* Auth Links */}
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
                            >
                                Dashboard Akun
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all"
                                >
                                    Daftar Sekarang
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ================= HERO SECTION ================= */}
            <main className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-600 mr-2 animate-pulse"></span>
                            Apotek Online Resmi & Berizin
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                            Akses Obat & Kesehatan <br/>
                            <span className="text-emerald-600">Dalam Genggaman Anda</span>
                        </h1>
                        <p className="text-lg leading-8 text-slate-600 mb-10">
                            Beli obat bebas maupun obat keras dengan aman. Sistem kami dilengkapi dengan 
                            fitur verifikasi resep elektronik yang diawasi langsung oleh Apoteker tersertifikasi.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/shop"
                                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-emerald-700 transition-all hover:scale-105"
                            >
                                Mulai Belanja Obat <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                href="/register"
                                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
                            >
                                Buat Akun Pasien
                            </Link>
                        </div>
                    </div>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#86efac] to-[#047857] opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"></div>
                </div>
            </main>

            {/* ================= FEATURE SECTION ================= */}
            <section id="layanan" className="py-16 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Mengapa Memilih Makmur Jaya?
                        </h2>
                        <p className="mt-4 text-slate-600">
                            Kami menggabungkan kemudahan e-commerce dengan ketatnya standar keamanan medis.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Verifikasi Apoteker</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Setiap resep obat keras yang Anda unggah akan dievaluasi ketat oleh Apoteker profesional kami sebelum diproses.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                <Pill className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Produk Original</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Jaminan 100% obat asli dan terdaftar di BPOM. Stok langsung disuplai dari distributor farmasi resmi.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                                <Truck className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Pengiriman Cepat</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Pesanan langsung dikemas dari gudang kami dan dikirim di hari yang sama untuk area jangkauan klinik.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Pelacakan Real-time</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Pantau status pesanan Anda dari proses verifikasi resep hingga barang sampai di depan pintu Anda.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= HOW IT WORKS SECTION ================= */}
            <section id="cara-kerja" className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                                Cara Beli Obat Keras Secara Online
                            </h2>
                            <p className="text-slate-600 mb-8 text-lg">
                                Tidak perlu antre di klinik. Beli obat keras Anda dengan aman melalui proses terstandarisasi kami.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">1</div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">Pilih Obat & Checkout</h4>
                                        <p className="mt-1 text-slate-600">Masukkan obat ke keranjang. Jika terdeteksi obat keras, sistem akan meminta Anda lanjut ke tahap unggah resep.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">2</div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">Unggah Resep Dokter</h4>
                                        <p className="mt-1 text-slate-600">Foto resep dokter Anda yang masih berlaku. Pastikan tulisan terbaca dengan jelas agar mempercepat proses.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">3</div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">Verifikasi & Pengiriman</h4>
                                        <p className="mt-1 text-slate-600">Apoteker kami akan mengecek keabsahan resep. Jika disetujui, pesanan langsung dikemas dan dikirim ke alamat Anda.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Illustration Card */}
                        <div className="relative rounded-2xl bg-emerald-600 p-8 shadow-xl lg:p-12 overflow-hidden">
                            <div className="relative z-10 bg-white rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-4 border-b pb-4 mb-4">
                                    <FileText className="h-8 w-8 text-emerald-600" />
                                    <div>
                                        <p className="font-bold text-slate-900">Status Resep: #TRX-9821</p>
                                        <p className="text-sm text-emerald-600 font-semibold">Disetujui oleh Apoteker</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Amoxicillin 500mg (10 Tablet)</span>
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Omeprazole 20mg (5 Kapsul)</span>
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    </div>
                                </div>
                                <button className="mt-6 w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white">
                                    Pesanan Sedang Dikirim
                                </button>
                            </div>
                            
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-500 opacity-50 blur-2xl"></div>
                            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-400 opacity-20 blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}