import React from 'react';
import { Card } from '../common/Card';
import { formatRupiah } from '../../utils/formatters';

export function StatCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'default', // 'default', 'income', 'expense', 'savings', 'budget'
  badgeText,
  badgeType = 'neutral'
}) {
  const iconVariants = {
    default: 'bg-navy-50 dark:bg-navy-900 text-navy-800 dark:text-accent',
    income: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    expense: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
    savings: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    budget: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
  };

  const amountVariants = {
    default: 'text-slate-900 dark:text-white',
    income: 'text-emerald-600 dark:text-emerald-400',
    expense: 'text-rose-600 dark:text-rose-400',
    savings: 'text-blue-600 dark:text-blue-400',
    budget: 'text-slate-900 dark:text-white'
  };

  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {title}
          </p>
          <h3 className={`text-xl sm:text-2xl font-black mt-2 tracking-tight ${amountVariants[variant] || amountVariants.default}`}>
            {formatRupiah(amount)}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${iconVariants[variant] || iconVariants.default} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
