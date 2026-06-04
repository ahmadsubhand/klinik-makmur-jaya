<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        // Mengambil obat untuk ditampilkan di grid kasir
        $medicines = Medicine::with('category')
            ->when($search, function ($query, $search) {
                $terms = explode(' ', strtolower($search));
                foreach ($terms as $term) {
                    $query->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"]);
                }
            })
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->orderBy('name')
            ->paginate(24) // Tampilkan lebih banyak per halaman untuk kasir
            ->withQueryString();

        return Inertia::render('admin/pos/index', [
            'medicines' => $medicines,
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string', // cash, qris, debit
            'patient_name' => 'nullable|string|max:255', // Nama pasien walk-in (opsional)
        ], [
            'items.required' => 'Keranjang belanja kasir tidak boleh kosong.',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $grandTotal = 0;

                // 1. Buat Transaksi Offline
                $transaction = Transaction::create([
                    'cashier_id' => Auth::id(),
                    'type' => 'offline',
                    'status' => 'completed', // Transaksi kasir langsung dianggap selesai
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'paid', // Langsung lunas
                    'total_price' => 0, // Akan diupdate di bawah
                ]);

                // 2. Looping Item & Potong Stok dengan FIFO
                foreach ($validated['items'] as $item) {
                    $medicine = Medicine::findOrFail($item['medicine_id']);
                    $qtyNeeded = $item['quantity'];
                    $medicinePrice = $medicine->price;

                    $batches = MedicineBatch::where('medicine_id', $medicine->id)
                        ->where('quantity_current', '>', 0)
                        ->orderBy('expired_at', 'asc')
                        ->lockForUpdate()
                        ->get();

                    foreach ($batches as $batch) {
                        if ($qtyNeeded <= 0) break;

                        $taken = min($batch->quantity_current, $qtyNeeded);

                        TransactionDetail::create([
                            'transaction_id' => $transaction->id,
                            'medicine_id' => $medicine->id,
                            'medicine_batch_id' => $batch->id,
                            'quantity' => $taken,
                            'price_per_unit' => $medicinePrice,
                            'subtotal' => $taken * $medicinePrice,
                        ]);

                        $batch->decrement('quantity_current', $taken);
                        $qtyNeeded -= $taken;
                        $grandTotal += ($taken * $medicinePrice);
                    }

                    if ($qtyNeeded > 0) {
                        throw new \Exception("Stok di gudang tidak mencukupi untuk: {$medicine->name}.");
                    }
                }

                // Update total harga
                $transaction->update(['total_price' => $grandTotal]);
            });

            return back()->with('success', 'Transaksi Kasir berhasil diproses.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}