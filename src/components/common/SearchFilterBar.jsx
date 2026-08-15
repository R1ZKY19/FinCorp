import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';

export function SearchFilterBar({
  search = '',
  onSearchChange,
  category = '',
  onCategoryChange,
  categories = [],
  accountId = '',
  onAccountChange,
  accounts = [],
  type = '',
  onTypeChange,
  onReset,
  className = ''
}) {
  const hasActiveFilter = search || category || accountId || type;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-slate-50/80 dark:bg-navy-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl ${className}`}>
      {/* Search Input */}
      <div className="sm:col-span-2">
        <Input
          placeholder="Cari transaksi, deskripsi, catatan..."
          icon={Search}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Type Filter */}
      {onTypeChange && (
        <div>
          <Select
            placeholder="Semua Jenis"
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            options={[
              { value: '', label: 'Semua Jenis' },
              { value: 'income', label: 'Pemasukan' },
              { value: 'expense', label: 'Pengeluaran' }
            ]}
          />
        </div>
      )}

      {/* Category Filter */}
      {onCategoryChange && (
        <div>
          <Select
            placeholder="Semua Kategori"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={[
              { value: '', label: 'Semua Kategori' },
              ...categories.map(c => ({ value: c.name || c, label: c.name || c }))
            ]}
          />
        </div>
      )}

      {/* Account Filter */}
      {onAccountChange && (
        <div>
          <Select
            placeholder="Semua Rekening"
            value={accountId}
            onChange={(e) => onAccountChange(e.target.value)}
            options={[
              { value: '', label: 'Semua Rekening' },
              ...accounts.map(a => ({ value: a.id, label: a.name }))
            ]}
          />
        </div>
      )}

      {/* Reset Filter Button */}
      {hasActiveFilter && onReset && (
        <div className="flex items-center">
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset} className="w-full text-slate-500">
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}
