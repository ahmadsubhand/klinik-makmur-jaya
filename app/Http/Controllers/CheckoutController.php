<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\MedicineBatch;
use App\Models\Prescription;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $carts = Cart::where('user_id', Auth::id())->get();

        if ($carts->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang Anda kosong.');
        }

        // Cek apakah ada obat resep di keranjang
        $requiresPrescription = $carts->contains(function ($cart) {
            return $cart->medicine->type === 'prescription';
        });

        $totalPrice = $carts->sum('subtotal');

        return Inertia::render('checkout/index', [
            'carts' => $carts,
            'requires_prescription' => $requiresPrescription,
            'total_price' => $totalPrice,
        ]);
    }

    public function process(Request $request)
    {
        $carts = Cart::where('user_id', Auth::id())->get();

        if ($carts->isEmpty()) {
            return redirect()->route('shop.index')->with('error', 'Keranjang Anda kosong.');
        }

        $requiresPrescription = $carts->contains(function ($cart) {
            return $cart->medicine->type === 'prescription';
        });

        $totalPrice = $carts->sum('subtotal');

        $validated = $request->validate([
            'payment_method' => 'required|string|in:transfer_bank,ewallet,qris',
            'address' => 'required|string',
            // Resep wajib diunggah JIKA membutuhkan resep
            'prescription_file' => $requiresPrescription ? 'required|file|mimes:jpg,jpeg,png,pdf|max:5120' : 'nullable',
        ], [
            'prescription_file.required' => 'Anda wajib mengunggah resep dokter karena terdapat obat keras di keranjang Anda.',
        ]);

        try {
            DB::transaction(function () use ($validated, $carts, $requiresPrescription, $totalPrice, $request) {
                $userId = Auth::id();

                // 1. Tangani Upload Resep & Buat Transaksi
                $prescriptionId = null;
                if ($requiresPrescription && $request->hasFile('prescription_file')) {
                    $path = $request->file('prescription_file')->store('prescriptions', 'public');
                    
                    $prescription = Prescription::create([
                        'patient_id' => $userId,
                        'prescription_path' => $path,
                        'status' => 'pending', // Menunggu divalidasi Apoteker (UC4)
                    ]);
                    $prescriptionId = $prescription->id;
                }

                $transaction = Transaction::create([
                    'patient_id' => $userId,
                    'prescription_id' => $prescriptionId,
                    'type' => 'online',
                    'total_price' => $totalPrice,
                    // Jika butuh resep, statusnya pending. Jika tidak, langsung confirmed/processing
                    'status' => $requiresPrescription ? 'pending' : 'confirmed', 
                    'payment_method' => $validated['payment_method'],
                ]);

                // 2. ALGORITMA FIFO & Pengurangan Stok
                foreach ($carts as $cart) {
                    $qtyNeeded = $cart->quantity;
                    $medicinePrice = $cart->medicine->price;

                    // Ambil batch dari expired terdekat yang stoknya > 0
                    // Gunakan lockForUpdate agar tabel dikunci sementara jika ada transaksi berbarengan
                    $batches = MedicineBatch::where('medicine_id', $cart->medicine_id)
                        ->where('expired_at', '>', now())
                        ->where('quantity_current', '>', 0)
                        ->orderBy('expired_at', 'asc')
                        ->lockForUpdate() 
                        ->get();

                    foreach ($batches as $batch) {
                        if ($qtyNeeded <= 0) break;

                        // Ambil sebanyak yang dibutuhkan, atau habiskan batch ini jika tidak cukup
                        $taken = min($batch->quantity_current, $qtyNeeded);

                        // Catat ke detail transaksi
                        TransactionDetail::create([
                            'transaction_id' => $transaction->id,
                            'medicine_id' => $cart->medicine_id,
                            'medicine_batch_id' => $batch->id, // Tepat ke batch mana obat diambil
                            'quantity' => $taken,
                            'price_per_unit' => $medicinePrice,
                            'subtotal' => $taken * $medicinePrice,
                        ]);

                        // Kurangi stok batch
                        $batch->decrement('quantity_current', $taken);
                        
                        // Kurangi target kebutuhan
                        $qtyNeeded -= $taken;
                    }

                    // Jika setelah looping batch ternyata stok masih kurang (meleset saat di keranjang)
                    if ($qtyNeeded > 0) {
                        throw new \Exception("Stok tidak mencukupi untuk obat: {$cart->medicine->name}. Mohon periksa kembali keranjang Anda.");
                    }
                }

                // 3. Bersihkan keranjang
                Cart::where('user_id', $userId)->delete();
            });

            return redirect()->route('shop.index')->with('success', 'Pesanan berhasil dibuat! Silakan tunggu konfirmasi.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}