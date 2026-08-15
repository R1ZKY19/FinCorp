import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'accent',
  size = 'md',
  showLabel = false,
  className = ''
}) {
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));

  const variants = {
    accent: 'bg-accent',
    income: 'bg-emerald-500',
    expense: 'bg-rose-500',
    warning: 'bg-amber-500',
    indigo: 'bg-indigo-600'
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden ${sizes[size] || sizes.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variants[variant] || variants.accent}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          <span>Progress</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
