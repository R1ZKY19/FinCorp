import React from 'react';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  noPadding = false,
  ...props
}) {
  return (
    <div
      className={`bg-white dark:bg-navy-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-subtle transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
}
