import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ImportCsv() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(localStorage.getItem('import_batch_id') || null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Gunakan tipe 'number' untuk lingkungan browser
    let interval: number;

    // 2. Hapus 'progress < 100' agar interval terus berjalan
    // sampai secara eksplisit dihentikan oleh clearInterval
    if (batchId) {
      interval = window.setInterval(async () => {
        try {
          const res = await axios.get(`/admin/medicines/import-status/${batchId}`);
          
          setProgress(res.data.progress);
          
          // 3. Perbaikan typo variabel backend: processed_jobs (pakai underscore)
          setStatusText(`Memproses... ${res.data.processed_jobs ?? 0} dari ${res.data.total_jobs} bagian selesai.`);

          // 4. Jika backend mengirim sinyal finished
         if (res.data.finished || res.data.failed) {
            localStorage.removeItem('import_batch_id');
            
            if (res.data.finished) {
              setProgress(100);
              setStatusText('Selesai! Seluruh data berhasil diimpor.');
            } else {
              setErrorText('Sebagian proses gagal. Cek log error server Anda.');
            }
            
            window.clearInterval(interval);
            setIsUploading(false); // Reset status upload
          }

        } catch (err) {
          console.error("Gagal mengecek status batch", err);
          window.clearInterval(interval); // Hentikan agar tidak membombardir server jika error
        }
      }, 1500);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [batchId]); // 5. Hapus 'progress' dari dependency array

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorText('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }
    
    setIsUploading(true);
    setErrorText('');
    setProgress(0);
    setBatchId(null);
    setStatusText('Mengirim file ke server...');

    const formData = new FormData();
    formData.append('csv_file', file);

    try {
      // Kita kirim pakai axios agar tidak trigger reload Inertia otomatis
      const res = await axios.post('/admin/medicines/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      localStorage.setItem('import_batch_id', res.data.batch_id);
      
      setBatchId(res.data.batch_id);
      setStatusText('Antrean berhasil dibuat. Menunggu worker memulai...');
    } catch (err: any) {
      setErrorText(err.response?.data?.error || 'Gagal mengunggah file.');
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="rounded-md border bg-white p-8 shadow-sm text-center flex flex-col items-center justify-center">
        
        {/* State 1: Upload File */}
        {!batchId && (
          <div className="w-full max-w-md">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center mb-6 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-10 w-10 text-blue-500 mb-3" />
              <p className="font-medium text-gray-700">
                {file ? file.name : "Klik untuk memilih file CSV"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Format: CSV. Ukuran maksimal: 50MB.</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, .txt"
                onChange={handleFileChange}
              />
            </div>

            <div className="mb-6 border-t w-full pt-4">
                <p className="text-xs text-gray-500 mb-2">Belum punya format filenya?</p>
                <a 
                  href="/admin/medicines/template-csv" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" /> Download Format CSV
                </a>
              </div>

            {errorText && (
              <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" /> {errorText}
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Mengunggah...</>
              ) : (
                'Mulai Import Data'
              )}
            </Button>
          </div>
        )}

        {/* State 2: Progress Loading */}
        {batchId && progress < 100 && (
          <div className="w-full max-w-lg py-10">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Memproses Data</h2>
            <p className="text-gray-500 text-sm mb-6">{statusText}</p>
            
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-sm font-medium">
                <span>Progress Total</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 w-full" />
            </div>
            
            <p className="text-xs text-gray-400 mt-6">
              Anda boleh meninggalkan halaman ini. Proses akan tetap berjalan di server.
            </p>
          </div>
        )}

        {/* State 3: Selesai */}
        {batchId && progress === 100 && (
          <div className="w-full max-w-lg py-10">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Selesai!</h2>
            <p className="text-gray-500 mb-6">{statusText}</p>
            
            <Button variant="outline" onClick={() => {
              setBatchId(null);
              setFile(null);
              setIsUploading(false);
            }}>
              Import File Lainnya
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}