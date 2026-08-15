import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Inbox } from 'lucide-react';
import { Button } from '../common/Button';

export function RecentTransactions({
  transactions = [],
  onViewAll,
  onAddTransaction
}) {
  return (
    <Card
      title="Transaksi Terbaru"
      subtitle="10 aktivitas pemasukan dan pengeluaran terakhir"
      action={
        <Button variant="ghost" size="sm" onClick={onViewAll} icon={ChevronRight}>
          Lihat Semua
        </Button>
      }
      noPadding
    >
      {transactions.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-900 text-slate-400 flex items-center justify-center mb-2">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Belum ada transaksi</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={onAddTransaction}>
            + Tambah Transaksi
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 dark:hover:bg-navy-900/40 transition-colors"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {tx.category} {tx.subcategory && <span className="font-normal text-slate-500">({tx.subcategory})</span>}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatDate(tx.date, true)}</span>
                      <span>•</span>
                      <span className="truncate">{tx.accountName}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0 pl-3">
                  <p
                    className={`text-xs sm:text-sm font-black ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? `+${formatRupiah(tx.amount)}` : `-${formatRupiah(tx.amount)}`}
                  </p>
                  {tx.description && (
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px] mt-0.5">
                      {tx.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
