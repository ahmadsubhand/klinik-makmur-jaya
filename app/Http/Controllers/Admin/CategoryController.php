<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        // 1. Tangkap parameter dari URL (Inertia Frontend)
        $search = $request->input('search');
        $sortField = $request->input('sort_field', 'created_at'); // Default sort
        $sortDir = $request->input('sort_direction', 'desc');

        // 2. Query Builder dengan Optimasi
        $categories = Category::query()
            // Filter Pencarian (Nama atau Deskripsi)
            ->when($search, function ($query, $search) {
                $searchTerm = strtolower($search);
                $query->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"])
                      ->orWhereRaw('LOWER(description) LIKE ?', ["%{$searchTerm}%"]);
            })
            // Sorting dinamis
            ->orderBy($sortField, $sortDir)
            // Pagination yang mempertahankan query string (untuk search & sort)
            ->paginate(10)
            ->withQueryString();

        // 3. Render ke React View
        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'sort_field' => $sortField,
                'sort_direction' => $sortDir,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        Category::create($validated);

        return redirect()->back()->with('success', 'Kategori baru berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category)
    {
        // Berkat properti nullOnDelete di Migration Medicine,
        // obat yang terhubung ke kategori ini tidak akan terhapus, hanya category_id nya menjadi NULL.
        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }
}