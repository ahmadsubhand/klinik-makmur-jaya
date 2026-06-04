import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import AppLogo from '../../components/app-logo';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 p-6 md:p-10 selection:bg-emerald-500 selection:text-white">
            {/* Wrapper Kartu Login */}
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium group"
                        >
                            {/* Kotak Logo HeartPulse */}
                            <AppLogo isLarge={true} />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-1.5 text-center mt-2">
                            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                            <p className="text-center text-sm text-slate-500">
                                {description}
                            </p>
                        </div>
                    </div>
                    
                    {/* Form Login/Register masuk ke sini */}
                    {children}
                </div>
            </div>
        </div>
    );
}