import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CurrencyInput } from '../common/CurrencyInput';
import { Button } from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';

export function SavingModal({
  isOpen,
  onClose,
  saving = null,
  onSuccess
}) {
  const { refreshAll } = useFinance();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (saving) {
      setName(saving.name || '');
      setTargetAmount(saving.targetAmount || 0);
      setCurrentAmount(saving.currentAmount || 0);
      setTargetDate(saving.targetDate || '');
      setStatus(saving.status || 'active');
    } else {
      setName('');
      setTargetAmount(0);
      setCurrentAmount(0);
      setTargetDate('');
      setStatus('active');
    }
    setErrors({});
  }, [saving, isOpen]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Nama target tabungan wajib diisi.';
    if (!targetAmount || targetAmount <= 0) errs.targetAmount = 'Target nominal harus lebih dari 0.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { name, targetAmount, currentAmount, targetDate, status };
      let res;
      if (saving && saving.id) {
        res = await api.updateSaving({ id: saving.id, ...payload });
      } else {
        res = await api.addSaving(payload);
      }

      if (res.success) {
        success(saving ? 'Target tabungan diperbarui.' : 'Target tabungan berhasil dibuat.');
        if (onSuccess) onSuccess();
        onClose();
        refreshAll();
      } else {
        error(res.message || 'Gagal menyimpan target tabungan.');
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
      title={saving ? 'Edit Target Tabungan' : 'Buat Target Tabungan Baru'}
      subtitle="Tentukan target impian Anda dan pantau progresnya."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Target"
          placeholder="Contoh: Dana Darurat, MacBook Pro, Liburan Jepang..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CurrencyInput
            label="Target Nominal (Rp)"
            value={targetAmount}
            onChange={(val) => setTargetAmount(val)}
            error={errors.targetAmount}
            placeholder="Rp 0"
            required
          />
          <CurrencyInput
            label="Saldo Terkumpul Saat Ini (Rp)"
            value={currentAmount}
            onChange={(val) => setCurrentAmount(val)}
            placeholder="Rp 0"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Tanggal Tercapai (Opsional)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          {saving && (
            <Select
              label="Status Target"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'active', label: 'Aktif Berjalan' },
                { value: 'completed', label: 'Tercapai' },
                { value: 'cancelled', label: 'Dibatalkan' }
              ]}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {saving ? 'Simpan Perubahan' : 'Buat Target'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
