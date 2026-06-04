// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verifikasi Email" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 text-center text-sm font-medium text-emerald-600 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    Tautan verifikasi baru telah dikirimkan ke alamat email yang Anda berikan saat pendaftaran.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                            disabled={processing} 
                        >
                            {processing && <Spinner className="mr-2 h-4 w-4" />}
                            Kirim Ulang Email Verifikasi
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm text-slate-500 hover:text-emerald-700 font-medium transition-colors"
                        >
                            Keluar Akun
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi Email',
    description:
        'Terima kasih telah mendaftar! Sebelum memulai akses layanan, harap verifikasi alamat email Anda dengan mengeklik tautan yang baru saja kami kirimkan.',
};