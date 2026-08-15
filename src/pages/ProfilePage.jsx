import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime } from '../utils/formatters';
import { User, Mail, ShieldCheck, Clock, LogOut, Settings } from 'lucide-react';

export function ProfilePage({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <Card title="Profil Pengguna" subtitle="Informasi akun FinCorp Anda">
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4">
          <div className="w-20 h-20 rounded-3xl bg-navy-950 dark:bg-accent text-white flex items-center justify-center text-3xl font-black shadow-md shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'Pengguna'}</h3>
              <Badge variant="income">Akun Aktif</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email || 'user@fincorp.id'}
            </p>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Login Terakhir: {formatDateTime(user?.lastLogin)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" icon={Settings} onClick={() => onNavigate('settings')}>
            Pengaturan Akun
          </Button>
          <Button variant="dangerOutline" size="sm" icon={LogOut} onClick={logout}>
            Keluar dari Sesi
          </Button>
        </div>
      </Card>
    </div>
  );
}

