import React from 'react';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export function NotFoundPage({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-2">404</h1>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6">
        Halaman yang Anda cari tidak ditemukan.
      </p>
      <Button variant="primary" icon={Home} onClick={() => onNavigate('dashboard')}>
        Kembali ke Dashboard
      </Button>
    </div>
  );
}

