import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Panduan Sistem',
        href: '#',
        icon: BookOpen,
    },
    {
        title: 'Bantuan IT',
        href: '#',
        icon: FolderGit2,
    },
];

export function AppSidebar() {
  // 1. Ambil data user dari global props Inertia
    const { auth } = usePage().props as any;

    // 2. Fungsi Helper untuk mengecek Role
    // Asumsi: auth.user.roles berisi array nama role seperti ['admin'] atau ['manager']
    const hasAnyRole = (allowedRoles: string[]) => {
        if (!auth?.user?.roles) { 
          return false;
        }

        return allowedRoles.some(role => auth.user.roles.includes(role));
    };

    // 3. Render Menu Berdasarkan Hak Akses (RBAC)
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },

        // --- PENGATURAN SISTEM (Hanya Admin) ---
        ...(hasAnyRole(['admin']) ? [
            { title: 'Kelola Pengguna', href: '/admin/users', icon: Users },
        ] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
