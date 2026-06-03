<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        $medicines = Medicine::with('category')
            ->when($search, function ($query, $search) {
                // Simulasi Fuzzy Search Sederhana: 
                // Memecah kata kunci berdasarkan spasi agar pencarian lebih fleksibel
                $terms = explode(' ', strtolower($search));
                foreach ($terms as $term) {
                    $query->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"]);
                }
            })
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->latest()
            ->paginate(12) // Menampilkan 12 obat per halaman (Grid layout)
            ->withQueryString();

        $categories = Category::select('id', 'name')->orderBy('name')->get();

        $cartItems = [];
        if (Auth::check()) {
            // pluck akan menghasilkan array format: [medicine_id => quantity]
            // Contoh: [1 => 2, 5 => 1] (Obat ID 1 sebanyak 2, Obat ID 5 sebanyak 1)
            $cartItems = Cart::where('user_id', Auth::id())
                ->pluck('quantity', 'medicine_id')
                ->toArray();
        }

        return Inertia::render('shop/index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'cart_items' => (object) $cartItems,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
            ],
        ]);
    }
}