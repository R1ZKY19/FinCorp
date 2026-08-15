import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TransferModal } from '../components/forms/TransferModal';
import { useFinance } from '../hooks/useFinance';
import { api } from '../services/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { ArrowLeftRight, ArrowRight, Plus, Inbox } from 'lucide-react';

export function TransferPage() {
  const { accounts, refreshAll } = useFinance();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await api.getTransfers();
      if (res.success && res.data) {
        setTransfers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 p-5 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-950 dark:text-blue-100">
              Transfer Antar Rekening
            </h2>
            <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
              Pindahkan saldo antar Bank, Cash, atau E-Wallet tanpa memengaruhi total kekayaan.
            </p>
          </div>
        </div>

        <Button
          variant="accent"
          size="sm"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          + Transfer Baru
        </Button>
      </div>

      {/* Transfer History Table */}
      <Card
        title="Riwayat Transfer"
        subtitle="Log mutasi perpindahan dana antar rekening"
        noPadding
      >
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat riwayat transfer...</div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-900 text-slate-400 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Belum ada transaksi transfer</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Pindahkan dana antar rekening kapan pun Anda butuhkan.</p>
            <Button variant="accent" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
              + Transfer Baru
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Tanggal</th>
                  <th className="py-3.5 px-4">Dari Rekening</th>
                  <th className="py-3.5 px-4 text-center">Arah</th>
                  <th className="py-3.5 px-4">Ke Rekening</th>
                  <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                  <th className="py-3.5 px-4 sm:px-6">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-900/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(trf.date, true)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {trf.fromAccountName}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      <ArrowRight className="w-4 h-4 inline-block text-blue-500" />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {trf.toAccountName}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {formatRupiah(trf.amount)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {trf.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchTransfers();
          refreshAll();
        }}
      />
    </div>
  );
}

