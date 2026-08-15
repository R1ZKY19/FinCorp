import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CurrencyInput } from '../common/CurrencyInput';
import { Button } from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';

export function TransactionModal({
  isOpen,
  onClose,
  transaction = null, // null for Add, object for Edit
  defaultType = 'expense',
  onSuccess
}) {
  const { accounts, categories, refreshAll } = useFinance();
  const { success, error } = useToast();

  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [type, setType] = useState(defaultType);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setDate(transaction.date || new Date().toISOString().substring(0, 10));
      setType(transaction.type || 'expense');
      setCategory(transaction.category || '');
      setSubcategory(transaction.subcategory || '');
      setAccountId(transaction.accountId || '');
      setAmount(transaction.amount || 0);
      setDescription(transaction.description || '');
    } else {
      setDate(new Date().toISOString().substring(0, 10));
      setType(defaultType);
      setCategory('');
      setSubcategory('');
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
      setAmount(0);
      setDescription('');
    }
    setErrors({});
  }, [transaction, defaultType, isOpen, accounts]);

  const filteredCategories = categories.filter(c => c.type === type);

  const validate = () => {
    const errs = {};
    if (!date) errs.date = 'Tanggal wajib diisi.';
    if (!category) errs.category = 'Kategori wajib dipilih.';
    if (!accountId) errs.accountId = 'Rekening wajib dipilih.';
    if (!amount || amount <= 0) errs.amount = 'Nominal harus lebih dari 0.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        date,
        type,
        category,
        subcategory,
        accountId,
        amount,
        description
      };

      let res;
      if (transaction && transaction.id) {
        res = await api.updateTransaction({ id: transaction.id, ...payload });
      } else {
        res = await api.addTransaction(payload);
      }

      if (res.success) {
        success(transaction ? 'Transaksi berhasil diperbarui.' : 'Transaksi berhasil disimpan.');
        if (onSuccess) onSuccess();
        onClose();
        refreshAll();
      } else {
        error(res.message || 'Gagal menyimpan transaksi.');
      }
    } catch (err) {
      error('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
      subtitle="Pastikan informasi nominal dan rekening sudah sesuai."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector (Pemasukan / Pengeluaran) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Jenis Transaksi
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                type === 'income'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-navy-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              + Pemasukan (Income)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                type === 'expense'
                  ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-navy-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              - Pengeluaran (Expense)
            </button>
          </div>
        </div>

        {/* Tanggal & Nominal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tanggal"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            required
          />
          <CurrencyInput
            label="Nominal (Rupiah)"
            value={amount}
            onChange={(val) => setAmount(val)}
            error={errors.amount}
            placeholder="Rp 0"
            required
          />
        </div>

        {/* Kategori & Subkategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Kategori"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={filteredCategories.map(c => ({ value: c.name, label: c.name }))}
            error={errors.category}
            placeholder="Pilih Kategori"
            required
          />
          <Input
            label="Subkategori (Opsional)"
            placeholder="Contoh: Bensin, Restoran..."
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          />
        </div>

        {/* Rekening Akun */}
        <Select
          label="Rekening / Akun"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accounts.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
          error={errors.accountId}
          placeholder="Pilih Rekening"
          required
        />

        {/* Catatan / Deskripsi */}
        <Input
          label="Catatan / Deskripsi"
          placeholder="Tuliskan keterangan detail transaksi..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            type="submit"
            variant={type === 'income' ? 'income' : 'danger'}
            loading={loading}
          >
            {transaction ? 'Simpan Perubahan' : 'Catat Transaksi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
