import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  Landmark,
  Menu,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  PiggyBank,
  PieChart,
  FileSpreadsheet,
  TrendingUp,
  Tags,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { APP_NAME } from '../../utils/constants';

export function MobileNav({
  activePage,
  onNavigate,
  onOpenAddTransaction,
  isDrawerOpen,
  onCloseDrawer,
  onLogout,
  user
}) {
  const drawerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Pemasukan', icon: ArrowDownLeft, color: 'text-emerald-500' },
    { id: 'expense', label: 'Pengeluaran', icon: ArrowUpRight, color: 'text-rose-500' },
    { id: 'transactions', label: 'Semua Transaksi', icon: ReceiptText },
    { id: 'accounts', label: 'Rekening & Saldo', icon: Landmark },
    { id: 'transfer', label: 'Transfer Antar Rekening', icon: ArrowLeftRight },
    { id: 'savings', label: 'Tabungan & Target', icon: PiggyBank },
    { id: 'budget', label: 'Budget Bulanan', icon: PieChart },
    { id: 'reports', label: 'Laporan Keuangan', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analitik & Grafik', icon: TrendingUp },
    { id: 'categories', label: 'Kelola Kategori', icon: Tags },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
    { id: 'profile', label: 'Profil Pengguna', icon: User }
  ];

  return (
    <>
      {/* Bottom Navigation Bar (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-around z-30 shadow-lg">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 ${
            activePage === 'dashboard' ? 'text-accent' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => onNavigate('transactions')}
          className={`flex flex-col items-center gap-1 ${
            activePage === 'transactions' ? 'text-accent' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] font-medium">Transaksi</span>
        </button>

        {/* Center Floating Plus Button */}
        <button
          onClick={onOpenAddTransaction}
          className="w-12 h-12 -mt-5 rounded-full bg-accent text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Tambah Transaksi"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => onNavigate('accounts')}
          className={`flex flex-col items-center gap-1 ${
            activePage === 'accounts' ? 'text-accent' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Landmark className="w-5 h-5" />
          <span className="text-[10px] font-medium">Rekening</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center gap-1 ${
            activePage === 'settings' ? 'text-accent' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>

      {/* Slide-over Drawer for All Menus */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseDrawer}
          />

          <div className="relative w-4/5 max-w-xs bg-navy-950 text-slate-300 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-navy-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-base">
                  F
                </div>
                <span className="font-bold text-white text-base">{APP_NAME}</span>
              </div>
              <button
                onClick={onCloseDrawer}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onCloseDrawer();
                    }}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-slate-400 hover:text-white hover:bg-navy-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-navy-900 bg-navy-950">
              <div className="mb-3 px-2">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Pengguna'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@fincorp.id'}</p>
              </div>
              <button
                onClick={() => {
                  onCloseDrawer();
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/40 text-xs font-semibold border border-rose-900/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
