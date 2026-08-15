import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AccountModal } from '../components/forms/AccountModal';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { formatRupiah } from '../utils/formatters';
import { Landmark, Wallet, Banknote, CreditCard, Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';

export function AccountsPage() {
  const { accounts, refreshAll } = useFinance();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getAccountIcon = (type) => {
    switch (type) {
      case 'Bank': return <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Cash': return <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'E-Wallet': return <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default: return <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getAccountBadge = (type) => {
    switch (type) {
      case 'Bank': return <Badge variant="bank">Bank</Badge>;
      case 'Cash': return <Badge variant="cash">Cash</Badge>;
      case 'E-Wallet': return <Badge variant="wallet">E-Wallet</Badge>;
      default: return <Badge variant="info">Rekening</Badge>;
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.deleteAccount(deleteId);
      if (res.success) {
        success('Rekening berhasil dihapus.');
        setDeleteId(null);
        refreshAll();
      } else {
        error(res.message || 'Gagal menghapus rekening.');
      }
    } catch (err) {
      error('Terjadi kesalahan.');
    } finally {
      setDeleting(false);
    }
  };

  const totalWealth = accounts.reduce((acc, curr) => acc + curr.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Total Saldo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-950 text-white p-6 rounded-3xl shadow-sm border border-navy-900">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Kekayaan Bersih (Net Worth)
          </p>
          <h2 className="text-3xl font-black text-white tracking-tight mt-1">
            {formatRupiah(totalWealth)}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dari total {accounts.length} rekening aktif & e-wallet
          </p>
        </div>

        <Button
          variant="accent"
          icon={Plus}
          onClick={() => {
            setSelectedAccount(null);
            setIsModalOpen(true);
          }}
        >
          + Tambah Rekening
        </Button>
      </div>

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Belum ada rekening"
          description="Tambahkan rekening bank, dompet kas, atau akun e-wallet Anda untuk mulai mencatat saldo."
          actionLabel="+ Tambah Rekening"
          onAction={() => {
            setSelectedAccount(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <Card key={acc.id} className="relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200/60 dark:border-slate-800 shrink-0">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {acc.name}
                    </h3>
                    <div className="mt-0.5">
                      {getAccountBadge(acc.type)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedAccount(acc);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-accent rounded-lg transition-colors"
                    title="Edit Rekening"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(acc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Hapus Rekening"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-xs text-slate-500 dark:text-slate-400">Saldo Saat Ini</p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatRupiah(acc.currentBalance)}
                </h4>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                  <span>Saldo Awal: {formatRupiah(acc.initialBalance)}</span>
                  <span className="capitalize">{acc.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        account={selectedAccount}
        onSuccess={() => {
          refreshAll();
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Rekening"
        message="Apakah Anda yakin ingin menghapus rekening ini? Seluruh transaksi yang terkait dengan rekening ini mungkin perlu disesuaikan."
      />
    </div>
  );
}

