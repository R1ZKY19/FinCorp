import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { CurrencyInput } from '../common/CurrencyInput';
import { Button } from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import { ArrowRight } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export function TransferModal({
  isOpen,
  onClose,
  onSuccess
}) {
  const { accounts, refreshAll } = useFinance();
  const { success, error } = useToast();

  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().substring(0, 10));
      if (accounts.length >= 2) {
        setFromAccount(accounts[0].id);
        setToAccount(accounts[1].id);
      } else if (accounts.length === 1) {
        setFromAccount(accounts[0].id);
        setToAccount('');
      }
      setAmount(0);
      setDescription('');
      setErrors({});
    }
  }, [isOpen, accounts]);

  const validate = () => {
    const errs = {};
    if (!date) errs.date = 'Tanggal wajib diisi.';
    if (!fromAccount) errs.fromAccount = 'Rekening asal wajib dipilih.';
    if (!toAccount) errs.toAccount = 'Rekening tujuan wajib dipilih.';
    if (fromAccount === toAccount) errs.toAccount = 'Rekening tujuan tidak boleh sama dengan rekening asal.';
    if (!amount || amount <= 0) errs.amount = 'Nominal transfer harus lebih dari 0.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.transfer({
        date,
        fromAccount,
        toAccount,
        amount,
        description
      });

      if (res.success) {
        success('Transfer antar rekening berhasil.');
        if (onSuccess) onSuccess();
        onClose();
        refreshAll();
      } else {
        error(res.message || 'Gagal memproses transfer.');
      }
    } catch (err) {
      error('Terjadi masalah saat memproses transfer.');
    } finally {
      setLoading(false);
    }
  };

  const selectedFromAcc = accounts.find(a => a.id === fromAccount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Antar Rekening"
      subtitle="Pindahkan dana antar rekening bank, cash, atau e-wallet."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Card */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
          Transfer antar rekening tidak dihitung sebagai pengeluaran atau pemasukan baru. Total kekayaan Anda tetap sama.
        </div>

        {/* Tanggal & Nominal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tanggal Transfer"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            required
          />
          <CurrencyInput
            label="Nominal Transfer (Rp)"
            value={amount}
            onChange={(val) => setAmount(val)}
            error={errors.amount}
            placeholder="Rp 0"
            required
          />
        </div>

        {/* Source & Destination Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Dari Rekening (Asal)"
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              options={accounts.map(a => ({ value: a.id, label: `${a.name} (${formatRupiah(a.currentBalance)})` }))}
              error={errors.fromAccount}
              required
            />
            {selectedFromAcc && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Saldo saat ini: <strong className="text-slate-700 dark:text-slate-200">{formatRupiah(selectedFromAcc.currentBalance)}</strong>
              </p>
            )}
          </div>

          <div>
            <Select
              label="Ke Rekening (Tujuan)"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              options={accounts.map(a => ({ value: a.id, label: `${a.name} (${formatRupiah(a.currentBalance)})` }))}
              error={errors.toAccount}
              required
            />
          </div>
        </div>

        {/* Keterangan */}
        <Input
          label="Keterangan / Catatan Transfer"
          placeholder="Contoh: Top up e-wallet, tarik tunai, dll..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="accent"
            loading={loading}
            icon={ArrowRight}
          >
            Proses Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
