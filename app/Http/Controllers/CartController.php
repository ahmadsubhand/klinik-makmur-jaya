<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    // Menampilkan isi keranjang belanja
    public function index()
    {
        $carts = Cart::where('user_id', Auth::id())->get();
        
        return Inertia::render('cart/index', [
            'carts' => $carts
        ]);
    }

    // Menambah barang ke keranjang
    public function store(Request $request)
    {
        $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $medicine = Medicine::findOrFail($request->medicine_id);

        // 1. Validasi Stok Awal
        if ($medicine->total_stock < $request->quantity) {
            return back()->with('error', "Stok obat ini tidak mencukupi. Sisa stok: {$medicine->total_stock}");
        }

        // Cek apakah obat sudah ada di keranjang user ini
        $cart = Cart::where('user_id', Auth::id())
                    ->where('medicine_id', $medicine->id)
                    ->first();

        if ($cart) {
            // 2. Validasi Stok Akumulasi (Jika barang sudah ada di keranjang, ditambah input baru)
            $newQuantity = $cart->quantity + $request->quantity;
            
            if ($medicine->total_stock < $newQuantity) {
                return back()->with('error', "Anda tidak bisa menambahkan lebih dari stok yang tersedia ({$medicine->total_stock} unit).");
            }

            $cart->update(['quantity' => $newQuantity]);
        } else {
            // Buat entri keranjang baru
            Cart::create([
                'user_id' => Auth::id(),
                'medicine_id' => $medicine->id,
                'quantity' => $request->quantity,
            ]);
        }

        return back()->with('success', 'Obat berhasil ditambahkan ke keranjang.');
    }

    // Mengubah jumlah barang langsung dari halaman keranjang (Misal dari 1 jadi 3)
    public function update(Request $request, Cart $cart)
    {
        // Pastikan keranjang milik user yang login
        if ($cart->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate(['quantity' => 'required|integer|min:1']);
        
        $medicine = $cart->medicine;

        if ($medicine->total_stock < $request->quantity) {
            return back()->with('error', "Stok hanya tersisa {$medicine->total_stock} unit.");
        }

        $cart->update(['quantity' => $request->quantity]);

        return back();
    }

    // Menghapus barang dari keranjang
    public function destroy(Cart $cart)
    {
        if ($cart->user_id === Auth::id()) {
            $cart->delete();
        }

        return back()->with('success', 'Obat dikeluarkan dari keranjang.');
    }
}