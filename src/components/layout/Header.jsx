import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Plus,
  ArrowLeftRight,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Button } from '../common/Button';
import { PERIOD_FILTERS } from '../../utils/constants';

export function Header({
  pageTitle = "Dashboard",
  onOpenMobileMenu,
  onOpenAddTransaction,
  onOpenTransfer,
  theme,
  onToggleTheme,
  activePeriod,
  onPeriodChange,
  showPeriodFilter = false
}) {
  return (
    <header className="h-16 bg-white dark:bg-navy-800 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white capitalize tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Period Filter (If applicable) */}
        {showPeriodFilter && (
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-navy-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {PERIOD_FILTERS.map((p) => (
              <button
                key={p.id}
                onClick={() => onPeriodChange(p.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activePeriod === p.id
                    ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Quick Transfer Button */}
        {onOpenTransfer && (
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeftRight}
            onClick={onOpenTransfer}
            className="hidden sm:inline-flex"
          >
            Transfer
          </Button>
        )}

        {/* Add Transaction Button */}
        {onOpenAddTransaction && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenAddTransaction}
            className="shadow-sm"
          >
            <span className="hidden sm:inline">+ Transaksi</span>
            <span className="sm:hidden">+ Catat</span>
          </Button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          aria-label="Toggle Dark Mode"
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
}
