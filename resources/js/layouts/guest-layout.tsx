import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { flash } = usePage().props as {
      flash?: {
        success?: string;
        error?: string;
      };
    };

    useEffect(() => {
      if (flash?.success) {
        toast.success(flash.success);
      }

      if (flash?.error) {
        toast.error(flash.error);
      }
    }, [flash]);

    return children;
}
