import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
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

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <Toaster richColors closeButton position="top-right" />
        </AppLayoutTemplate>
    );
}
