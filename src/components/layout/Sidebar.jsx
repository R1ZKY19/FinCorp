import React from 'react';
import {
  LayoutDashboard, ArrowDownLeft, ArrowUpRight, ReceiptText, Landmark,
  ArrowLeftRight, PiggyBank, PieChart, FileSpreadsheet, TrendingUp, Tags,
  Settings, User, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';

export function Sidebar({ activePage, onNavigate, isCollapsed, onToggleCollapse, onLogout, user }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Pemasukan', icon: ArrowDownLeft, color: 'text-emerald-500' },
    { id: 'expense', label: 'Pengeluaran', icon: ArrowUpRight, color: 'text-rose-500' },
    { id: 'transactions', label: 'Transaksi', icon: ReceiptText },
    { id: 'accounts', label: 'Rekening', icon: Landmark },
    { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
    { id: 'savings', label: 'Tabungan', icon: PiggyBank },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analitik', icon: TrendingUp },
    { id: 'categories', label: 'Kategori', icon: Tags },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <aside className={`hidden lg:flex flex-col bg-navy-950 text-slate-300 border-r border-navy-900 transition-all duration-300 select-none z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-20 flex items-center justify-between px-4 border-b border-navy-900/80">
        <div onClick={() => onNavigate('dashboard')} className="flex items-center cursor-pointer overflow-hidden min-w-0">
          {isCollapsed ? (
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">F</div>
          ) : (
            <img src="/FinCorp/fincorp-logo.svg" alt="FinCorp Financial Dashboard" className="w-[178px] h-[58px] object-contain object-left" />
          )}
        </div>
        <button onClick={onToggleCollapse} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition-colors hidden lg:block shrink-0" aria-label="Toggle Sidebar">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${isActive ? 'bg-accent text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-navy-900/60'}`} title={isCollapsed ? item.label : undefined}>
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isCollapsed && <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">{item.label}</div>}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-navy-900/80 space-y-1 bg-navy-950/80">
        <button onClick={() => onNavigate('profile')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activePage === 'profile' ? 'bg-navy-900 text-white' : 'text-slate-400 hover:text-white hover:bg-navy-900/40'}`} title={isCollapsed ? 'Profile' : undefined}>
          <div className="w-7 h-7 rounded-lg bg-navy-800 border border-slate-700 flex items-center justify-center text-accent shrink-0"><User className="w-4 h-4" /></div>
          {!isCollapsed && <div className="flex flex-col text-left truncate"><span className="text-white text-xs font-medium truncate">{user?.name || 'Pengguna'}</span><span className="text-[10px] text-slate-400 truncate">{user?.email || 'user@fincorp.id'}</span></div>}
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors" title={isCollapsed ? 'Keluar' : undefined}>
          <LogOut className="w-4 h-4 shrink-0" />{!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
