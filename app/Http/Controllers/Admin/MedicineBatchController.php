<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MedicineBatch;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MedicineBatchController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $sortField = $request->input('sort_field', 'expired_at'); // Default sort: yang paling cepat expired
        $sortDir = $request->input('sort_direction', 'asc');

        $batches = MedicineBatch::with(['medicine', 'supplier'])
            ->when($search, function ($query, $search) {
                $searchTerm = strtolower($search);
                $query->whereRaw('LOWER(batch_number) LIKE ?', ["%{$searchTerm}%"])
                      ->orWhereHas('medicine', function ($q) use ($searchTerm) {
                          $q->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"]);
                      });
            })
            ->orderBy($sortField, $sortDir)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/medicine-batches/index', [
            'batches' => $batches,
            'suppliers' => Supplier::select('id', 'name')->orderBy('name')->get(),
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
            'medicine_id' => 'required|exists:medicines,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity_incoming' => 'required|integer|min:1',
            'received_at' => 'required|date',
            'expired_at' => 'required|date|after:today',
        ]);

        // Jika admin tidak mengisi batch number, sistem yang buatkan otomatis
        $autoBatchNumber = 'BTC-' . date('Ymd') . '-' . strtoupper(Str::random(4));

        MedicineBatch::create([
            'medicine_id' => $validated['medicine_id'],
            'supplier_id' => $validated['supplier_id'],
            'batch_number' => $autoBatchNumber,
            'quantity_incoming' => $validated['quantity_incoming'],
            'quantity_current' => $validated['quantity_incoming'], // Saat baru datang, current = incoming
            'received_at' => $validated['received_at'],
            'expired_at' => $validated['expired_at'],
        ]);

        return redirect()->back()->with('success', 'Stok batch baru berhasil ditambahkan.');
    }

    public function update(Request $request, MedicineBatch $medicine_batch)
    {
        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity_incoming' => 'required|integer|min:1',
            'quantity_current' => 'required|integer|min:0',
            'received_at' => 'required|date',
            'expired_at' => 'required|date',
        ]);

        // Validasi Logika: Sisa stok saat ini tidak mungkin lebih besar dari total yang datang
        if ($validated['quantity_current'] > $validated['quantity_incoming']) {
            return back()->withErrors(['quantity_current' => 'Sisa stok tidak boleh melebihi jumlah awal yang datang.'])->withInput();
        }

        $medicine_batch->update($validated);

        return redirect()->back()->with('success', 'Data batch berhasil diperbarui.');
    }

    public function destroy(MedicineBatch $medicine_batch)
    {
        $medicine_batch->delete();

        return redirect()->back()->with('success', 'Data batch stok berhasil dihapus.');
    }
}