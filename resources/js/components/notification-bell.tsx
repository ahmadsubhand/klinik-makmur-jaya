import axios from 'axios';
import { Bell, AlertTriangle, CheckCircle2, Info, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// 1. SESUAIKAN INTERFACE DENGAN PAYLOAD LARAVEL BARU
interface NotificationItem {
  id: string;
  data: {
    title?: string;
    message: string;
    level?: 'critical' | 'warning' | 'info'; // Dari SystemAlertNotification
    type?: string;                           // Dari OrderStatusUpdated
    transaction_id?: number;
  };
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const res = await axios.get('/notifications');
        
        if (isMounted) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error('Gagal mengambil notifikasi', err);
      }
    };

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 180000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await axios.post('/notifications/mark-as-read'); // Pastikan prefix URL sesuai
      setNotifications([]); 
      setIsOpen(false);
    } catch (err) {
      console.error("Gagal menandai dibaca", err);
    }
  };

  // 2. FUNGSI UNTUK MERENDER ICON & WARNA DINAMIS
  const getDisplayConfig = (data: NotificationItem['data']) => {
    if (data.level === 'critical') {
      return { Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' };
    }

    if (data.level === 'warning') {
      return { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100' };
    }

    if (data.type === 'order_update') {
      return { Icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-100' };
    }

    return { Icon: Info, color: 'text-blue-500', bg: 'bg-blue-100' };
  };

  const unreadCount = notifications.length;

  return (
    <div ref={dropdownRef} className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-700">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-gray-500 font-medium">{unreadCount} belum dibaca</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {unreadCount > 0 ? (
              notifications.map((notif) => {
                const { Icon, color, bg } = getDisplayConfig(notif.data);
                
                return (
                  <div key={notif.id} className="p-4 border-b hover:bg-gray-50 transition-colors flex gap-3">
                    <div className={`shrink-0 mt-1 h-8 w-8 rounded-full flex items-center justify-center ${bg}`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div>
                      {/* Judul Notifikasi (opsional jika ada) */}
                      {notif.data.title && (
                        <p className="text-sm font-semibold text-gray-900 mb-0.5">{notif.data.title}</p>
                      )}
                      <p className="text-sm text-gray-700 leading-snug">
                        {notif.data.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2 opacity-50" />
                <p className="text-sm">Tidak ada notifikasi baru.</p>
                <p className="text-xs text-gray-400 mt-1">Semua sistem dalam keadaan aman.</p>
              </div>
            )}
          </div>

          {unreadCount > 0 && (
            <div className="p-2 border-t bg-gray-50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={markAllAsRead}
              >
                Tandai semua dibaca
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}