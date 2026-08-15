import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  required,
  ...props
}) {
  const inputId = id || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          required={required}
          className={`block w-full rounded-xl border bg-white dark:bg-navy-900/60 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700 dark:focus:ring-accent transition-colors ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-700'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
