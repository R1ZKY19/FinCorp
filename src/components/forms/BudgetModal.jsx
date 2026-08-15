import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';
import { CurrencyInput } from '../common/CurrencyInput';
import { Button } from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';

export function BudgetModal({
  isOpen,
  onClose,
  budget = null,
  currentMonth,
  onSuccess
}) {
  const { categories, refreshAll } = useFinance();
  const { success, error } = useToast();

  const [category, setCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    if (budget) {
      setCategory(budget.category || '');
      setBudgetAmount(budget.budgetAmount || 0);
    } else {
      setCategory('');
      setBudgetAmount(0);
    }
    setErrors({});
  }, [budget, isOpen]);

  const validate = () => {
    const errs = {};
    if (!category) errs.category = 'Kategori wajib dipilih.';
    if (!budgetAmount || budgetAmount <= 0) errs.budgetAmount = 'Nominal budget harus lebih dari 0.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        month: currentMonth || new Date().toISOString().substring(0, 7),
        category,
        budgetAmount
      };

      const res = await api.setBudget(payload);
      if (res.success) {
        success('Budget berhasil disimpan.');
        if (onSuccess) onSuccess();
        onClose();
        refreshAll();
      } else {
        error(res.message || 'Gagal menyimpan budget.');
      }
    } catch (err) {
      error('Terjadi masalah koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? 'Edit Budget Kategori' : 'Atur Budget Bulanan'}
      subtitle={`Alokasikan batas pengeluaran untuk periode ${currentMonth}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Kategori Pengeluaran"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={expenseCategories.map(c => ({ value: c.name, label: c.name }))}
          error={errors.category}
          placeholder="Pilih Kategori"
          required
        />

        <CurrencyInput
          label="Batas Maksimal Budget (Rp)"
          value={budgetAmount}
          onChange={(val) => setBudgetAmount(val)}
          error={errors.budgetAmount}
          placeholder="Rp 0"
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Simpan Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
}
