import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo({ isLarge = false }) {
    return (
        <div className="flex items-center gap-1">
            {/* Kotak Logo berwarna Hijau Medis */}
            <div className={`flex aspect-square ${isLarge ? 'size-14' : 'size-8'} items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm`}>
                <AppLogoIcon className={isLarge ? 'size-10' : 'size-5'} />
            </div>
            
            {/* Teks Merek */}
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className={`truncate leading-tight font-bold text-slate-900 dark:text-white ${isLarge ? 'text-3xl' : 'text-base'}`}>
                    Makmur<span className="text-emerald-600 dark:text-emerald-500">Jaya</span>
                </span>
                <span className={`truncate text-[10px] ${isLarge ? 'text-[16px]' : 'text-[10px]'} font-medium text-slate-500 dark:text-slate-400`}>
                    Klinik & Apotek
                </span>
            </div>
        </div>
    );
}