import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = "Belum ada data",
  description = "Mulai tambahkan data pertama Anda sekarang.",
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-navy-900/20 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" icon={Plus} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
