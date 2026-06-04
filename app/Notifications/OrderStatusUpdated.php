<?php

namespace App\Notifications;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // Gunakan ShouldQueue agar pengiriman email lewat background job (UC7)
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public Transaction $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    // Mengirim via Email dan Database (In-App)
    public function via(): array
    {
        return ['mail', 'database'];
    }

    // Format Email yang dikirim
    public function toMail(object $notifiable): MailMessage
    {
        $statusLabel = strtoupper($this->transaction->status);
        $url = route('user.orders.index'); // Link ke halaman riwayat pesanan pasien

        return (new MailMessage)
                    ->subject("Update Pesanan #TRX-{$this->transaction->id} - Status: {$statusLabel}")
                    ->greeting("Halo, {$notifiable->name}!")
                    ->line("Status pesanan obat Anda (TRX-{$this->transaction->id}) baru saja diperbarui menjadi: **{$statusLabel}**.")
                    ->line("Total Tagihan: Rp " . number_format($this->transaction->total_price, 0, ',', '.'))
                    ->action('Lacak Pesanan Saya', $url)
                    ->line('Terima kasih telah mempercayakan kesehatan Anda pada Klinik Makmur Jaya!');
    }

    // Format Data untuk In-App Notification (Database)
    public function toDatabase(object $notifiable): array
    {
        return [
            'transaction_id' => $this->transaction->id,
            'status' => $this->transaction->status,
            'message' => "Pesanan TRX-{$this->transaction->id} Anda kini berstatus {$this->transaction->status}.",
            'type' => 'order_update'
        ];
    }
}