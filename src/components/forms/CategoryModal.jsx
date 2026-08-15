import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';

export function CategoryModal({
  isOpen,
  onClose,
  category = null,
  defaultType = 'expense',
  onSuccess
}) {
  const { refreshAll } = useFinance();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setType(category.type || 'expense');
    } else {
      setName('');
      setType(defaultType);
    }
    setErrors({});
  }, [category, defaultType, isOpen]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Nama kategori wajib diisi.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { name, type };
      let res;
      if (category && category.id) {
        res = await api.updateCategory({ id: category.id, ...payload });
      } else {
        res = await api.addCategory(payload);
      }

      if (res.success) {
        success(category ? 'Kategori diperbarui.' : 'Kategori berhasil ditambahkan.');
        if (onSuccess) onSuccess();
        onClose();
        refreshAll();
      } else {
        error(res.message || 'Gagal menyimpan kategori.');
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
      title={category ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      subtitle="Kelola kategori untuk pengelompokan transaksi yang rapi."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Kategori"
          placeholder="Contoh: Asuransi, Belanja Gadget, Bonus..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Select
          label="Jenis Kategori"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'expense', label: 'Pengeluaran (Expense)' },
            { value: 'income', label: 'Pemasukan (Income)' }
          ]}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {category ? 'Simpan Perubahan' : 'Tambah Kategori'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
