<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Penjualan - MakmurJaya</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        
        /* Tema Warna Emerald-600: #059669 */
        .header-container { width: 100%; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
        .section-title { background-color: #f3f4f6; padding: 8px; font-weight: bold; margin-top: 20px; border-left: 4px solid #059669; }
        
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data-table th, table.data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        table.data-table th { background-color: #059669; color: white; }
        
        /* emerald-50 untuk background box */
        .summary-box { border: 1px solid #ddd; padding: 10px; background-color: #ecfdf5; width: 45%; display: inline-block; }
        .chart-container { text-align: center; margin-top: 20px; }
        .warning { color: #dc2626; font-weight: bold; }
        
        /* Tabel layout khusus header agar rapi di DomPDF */
        table.header-table { width: 100%; border: none; }
        table.header-table td { border: none; padding: 0; vertical-align: middle; }
    </style>
</head>
<body>

    <div class="header-container">
        <table class="header-table">
            <tr>
                <td style="width: 55%;">
                    <table style="border: none; margin: 0; padding: 0;">
                        <tr>
                            <td style="width: 45px; border: none; padding: 0;">
                                @php
                                    // Ambil file PNG dari folder public
                                    $logoPath = public_path('apple-touch-icon.png');
                                    $logoData = file_exists($logoPath) ? base64_encode(file_get_contents($logoPath)) : '';
                                    $logoSrc = 'data:image/png;base64,' . $logoData;
                                @endphp

                                @if($logoData)
                                    <img src="{{ $logoSrc }}" alt="Logo MakmurJaya" style="width: 40px; height: 40px; border-radius: 8px; display: block;">
                                @else
                                    <div style="width: 40px; height: 40px; background-color: #059669; border-radius: 8px;"></div>
                                @endif
                            </td>
                            <td style="border: none; padding-left: 10px; vertical-align: middle;">
                                <div style="font-size: 22px; font-weight: bold; color: #0f172a; line-height: 1;">
                                    Makmur<span style="color: #059669;">Jaya</span>
                                </div>
                                <div style="font-size: 11px; color: #64748b; font-weight: bold; margin-top: 2px;">
                                    Klinik & Apotek
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
                <td style="width: 45%; text-align: right;">
                    <h2 style="margin: 0; color: #059669; font-size: 18px; text-transform: uppercase;">Laporan Penjualan</h2>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">
                        Periode: <strong style="color: #333;">{{ $monthYear }}</strong>
                    </p>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">Rekapitulasi Penjualan</div>
    <div>
        <div class="summary-box">
            <strong>Total Transaksi Selesai:</strong> <br>
            <span style="font-size: 18px; color: #059669; font-weight: bold;">{{ $totalTransactions }} Transaksi</span>
        </div>
        <div class="summary-box" style="float: right;">
            <strong>Total Pendapatan:</strong> <br>
            <span style="font-size: 18px; color: #059669; font-weight: bold;">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</span>
        </div>
        <div style="clear: both;"></div>
    </div>

    <div class="section-title">Grafik Obat Terlaris</div>
    <div class="chart-container">
        @if($chartUrl)
            <img src="{{ $chartUrl }}" alt="Grafik Terlaris" style="max-width: 100%; height: auto;">
        @else
            <p style="color: #64748b; font-style: italic;">Belum ada data penjualan yang cukup untuk grafik.</p>
        @endif
    </div>

    <div class="section-title warning">Peringatan: Batch Obat Mendekati Kadaluarsa (90 hari)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Nama Obat</th>
                <th>No. Batch</th>
                <th>Sisa Stok</th>
                <th>Tgl Kadaluarsa</th>
                <th>Sisa Waktu</th>
            </tr>
        </thead>
        <tbody>
            @forelse($expiringBatches as $batch)
                <tr>
                    <td>{{ $batch->name }}</td>
                    <td>{{ $batch->batch_number }}</td>
                    <td>{{ $batch->quantity_current }} Unit</td>
                    <td>{{ \Carbon\Carbon::parse($batch->expired_at)->format('d M Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($batch->expired_at)->startOfDay()->diffInDays(today(), true) }} Hari</td>
                </tr>
            @empty
                <tr><td colspan="5" style="text-align: center;">Tidak ada batch obat yang mendekati kadaluarsa.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">Rincian Transaksi Selesai</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>ID Transaksi</th>
                <th>Tipe Pembelian</th>
                <th>Pasien</th>
                <th>Total Nominal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $trx)
                <tr>
                    <td>{{ $trx->created_at->format('d/m/Y H:i') }}</td>
                    <td>TRX-{{ str_pad($trx->id, 5, '0', STR_PAD_LEFT) }}</td>
                    <td>{{ ucfirst($trx->type) }}</td>
                    <td>{{ $trx->patient->name ?? 'Pelanggan Umum (Offline)' }}</td>
                    <td>Rp {{ number_format($trx->total_price, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" style="text-align: center;">Tidak ada transaksi di bulan ini.</td></tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>