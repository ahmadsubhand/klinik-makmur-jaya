<!DOCTYPE html>
<html>
<head>
    <title>Laporan Penjualan</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; }
        .logo-text { font-size: 24px; font-weight: bold; color: #4f46e5; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #4f46e5; color: white; padding: 8px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .total-box { margin-top: 20px; background-color: #e0e7ff; padding: 15px; text-align: right; font-weight: bold; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-text">🏥 KLINIK MAKMUR JAYA</div>
        <p>Laporan Resmi Rekapitulasi Penjualan Apotek</p>
        <p>Dicetak pada: {{ now()->format('d F Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Pasien / Pelanggan</th>
                <th>Total Belanja</th>
            </tr>
        </thead>
        <tbody>
            @php $grandTotal = 0; @endphp
            @foreach($transactions as $trx)
                @php $grandTotal += $trx->total_price; @endphp
                <tr>
                    <td>#TRX-{{ str_pad($trx->id, 5, '0', STR_PAD_LEFT) }}</td>
                    <td>{{ $trx->created_at->format('d/m/Y') }}</td>
                    <td>{{ strtoupper($trx->type) }}</td>
                    <td>{{ $trx->patient ? $trx->patient->name : 'Walk-in (Kasir)' }}</td>
                    <td>Rp {{ number_format($trx->total_price, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-box">
        TOTAL PENDAPATAN: Rp {{ number_format($grandTotal, 0, ',', '.') }}
    </div>
</body>
</html>