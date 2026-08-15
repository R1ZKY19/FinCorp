import React from 'react';
import { formatRupiah, parseRupiah } from '../../utils/formatters';

export function CurrencyInput({
  label,
  value,
  onChange,
  error,
  helperText,
  required,
  placeholder = "Rp 0",
  className = '',
  id,
  ...props
}) {
  const inputId = id || Math.random().toString(36).substring(2, 9);

  // Format value to Rupiah on display
  const displayValue = value ? formatRupiah(value, true) : '';

  const handleChange = (e) => {
    const rawVal = e.target.value;
    const numericVal = parseRupiah(rawVal);
    onChange(numericVal);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          required={required}
          className={`block w-full rounded-xl border bg-white dark:bg-navy-900/60 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700 dark:focus:ring-accent transition-colors ${
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
