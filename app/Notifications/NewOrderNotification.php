<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

// Tetap gunakan ShouldQueue agar penyimpanan tidak memblokir proses
class NewOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $transactionId;
    public string $title;
    public string $message;
    public string $level;

    public function __construct(int $transactionId, string $title, string $message, string $level)
    {
        $this->transactionId = $transactionId;
        $this->title = $title;
        $this->message = $message;
        $this->level = $level;
    }

    /**
     * Tentukan channel pengiriman notifikasi.
     * Karena kita hapus 'mail' dan hanya pakai 'database', 
     * email tidak akan pernah dikirim.
     */
    public function via(object $notifiable): array
    {
        return ['database']; 
    }

    /**
     * Format data yang akan disimpan ke tabel 'notifications'
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'transaction_id' => $this->transactionId,
            'title' => $this->title,
            'message' => $this->message,
            'level' => $this->level,
            'action_url' => $this->level === 'warning' ? "/admin/prescriptions" : "/admin/transactions" ,
        ];
    }
}