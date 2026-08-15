import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { Settings, Moon, Sun, Lock, ShieldCheck, Database, History } from 'lucide-react';

export function SettingsPage({ onNavigate }) {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return error('Nama tidak boleh kosong.');

    setLoadingProfile(true);
    try {
      const res = await api.updateProfile({ name });
      if (res.success) {
        updateUser({ name });
        success('Nama profil berhasil diperbarui.');
      } else {
        error(res.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      error('Terjadi kesalahan koneksi.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return error('Semua bidang kata sandi wajib diisi.');
    if (newPassword.length < 6) return error('Kata sandi baru minimal 6 karakter.');
    if (newPassword !== confirmPassword) return error('Konfirmasi kata sandi tidak cocok.');

    setLoadingPass(true);
    try {
      const res = await api.changePassword({ oldPassword, newPassword });
      if (res.success) {
        success('Kata sandi berhasil diganti.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        error(res.message || 'Gagal mengganti kata sandi.');
      }
    } catch (err) {
      error('Terjadi kesalahan.');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pengaturan Aplikasi</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola preferensi umum, keamanan, dan riwayat aktivitas akun.
        </p>
      </div>

      {/* General Settings */}
      <Card title="Pengaturan Umum" subtitle="Nama pengguna dan preferensi tampilan">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Nama Pengguna"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mode Tampilan (Tema)</p>
              <p className="text-[11px] text-slate-400">Pilih antara tema terang atau gelap premium.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={theme === 'dark' ? Sun : Moon}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Mata Uang Utama</p>
              <p className="text-[11px] text-slate-400">Rupiah Indonesia (IDR / Rp) • Rp 1.250.000</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
              IDR Aktif
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={loadingProfile}>
              Simpan Profil
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Password */}
      <Card title="Keamanan & Kata Sandi" subtitle="Perbarui kata sandi untuk melindungi akun Anda">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Kata Sandi Saat Ini"
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kata Sandi Baru"
              type="password"
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={loadingPass}>
              Perbarui Kata Sandi
            </Button>
          </div>
        </form>
      </Card>

      {/* Audit Log Shortcut */}
      <Card title="Riwayat Aktivitas & Keamanan" subtitle="Catatan audit log aktivitas login, transaksi, dan perubahan data">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Pantau seluruh rekam jejak aktivitas akun Anda untuk transparansi dan audit.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={History}
            onClick={() => onNavigate('audit_logs')}
          >
            Lihat Audit Log
          </Button>
        </div>
      </Card>
    </div>
  );
}

