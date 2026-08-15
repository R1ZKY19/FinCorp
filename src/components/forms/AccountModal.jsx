import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CurrencyInput } from '../common/CurrencyInput';
import { Button } from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import { ACCOUNT_TYPES } from '../../utils/constants';

export function AccountModal({
  isOpen,
  onClose,
  account = null,
  onSuccess
}) {
  const { refreshAll } = useFinance();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState('Bank');
  const [initialBalance, setInitialBalance] = useState(0);
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setType(account.type || 'Bank');
      setInitialBalance(account.initialBalance || 0);
      setStatus(account.status || 'active');
    } else {
      setName('');
      setType('Bank');
      setInitialBalance(0);
      setStatus('active');
    }
    setErrors({});
  }, [account, isOpen]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Nama rekening wajib diisi.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { name, type, initialBalance, status };
      let res;
      if (account && account.id) {
        res = await api.updateAccount({ id: account.id, ...payload });
      } else {
        res = await api.addAccount(payload);
      }

      if (res.success) {
        success(account ? 'Rekening berhasil diperbarui.' : 'Rekening berhasil ditambahkan.');
        if (onSuccess) onSuccess();
        onClose();
        refreshAll();
      } else {
        error(res.message || 'Gagal menyimpan rekening.');
      }
    } catch (err) {
      error('Terjadi kesalahan saat menyimpan rekening.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? 'Edit Rekening' : 'Tambah Rekening Baru'}
      subtitle="Kelola rekening bank, uang tunai, atau dompet digital."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Rekening"
          placeholder="Contoh: BCA Prioritas, Mandiri, Dompet Tunai, GoPay..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Jenis Rekening"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={ACCOUNT_TYPES}
            required
          />

          {!account && (
            <CurrencyInput
              label="Saldo Awal (Rp)"
              value={initialBalance}
              onChange={(val) => setInitialBalance(val)}
              placeholder="Rp 0"
            />
          )}

          {account && (
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Non-Aktif' }
              ]}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {account ? 'Simpan Perubahan' : 'Tambah Rekening'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
