<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SystemAlertNotification extends Notification
{
    use Queueable;

    public string $title;
    public string $message;
    public string $level; // critical, warning, info

    public function __construct(string $title, string $message, string $level = 'warning')
    {
        $this->title = $title;
        $this->message = $message;
        $this->level = $level;
    }

    public function via(): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('🚨 Alert Sistem Apotek: ' . $this->title)
            ->greeting('Halo ' . $notifiable->name . ',');

        // Jika levelnya critical (merah), kita ubah tema tombol email bawaan Laravel menjadi merah
        if ($this->level === 'critical') {
            $mail->error(); 
        }

        return $mail
            ->line('Sistem mendeteksi adanya peringatan yang memerlukan perhatian Anda:')
            ->line('**' . $this->message . '**')
            ->action('Buka Dashboard Admin', route('admin.dashboard')) // Pastikan route ini sesuai
            ->line('Harap segera tindak lanjuti peringatan ini untuk kelancaran operasional klinik.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'level' => $this->level, // Berguna untuk mewarnai icon di UI (Merah/Kuning)
        ];
    }
}