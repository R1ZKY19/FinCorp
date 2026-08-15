import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SavingModal } from '../components/forms/SavingModal';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { formatRupiah, formatDate, formatPercent } from '../utils/formatters';
import { PiggyBank, Plus, Edit2, Trash2, CheckCircle2, Calendar, Target } from 'lucide-react';

export function SavingsPage() {
  const { refreshAll } = useFinance();
  const { success, error } = useToast();

  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSavings = async () => {
    setLoading(true);
    try {
      const res = await api.getSavings();
      if (res.success && res.data) {
        setSavings(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.deleteSaving(deleteId);
      if (res.success) {
        success('Target tabungan berhasil dihapus.');
        setDeleteId(null);
        fetchSavings();
        refreshAll();
      } else {
        error(res.message || 'Gagal menghapus tabungan.');
      }
    } catch (err) {
      error('Terjadi masalah koneksi.');
    } finally {
      setDeleting(false);
    }
  };

  const totalTarget = savings.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.targetAmount : 0), 0);
  const totalCollected = savings.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.currentAmount : 0), 0);
  const overallProgress = totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white p-6 rounded-3xl shadow-sm border border-navy-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Tabungan Terkumpul
            </p>
            <h2 className="text-3xl font-black text-white tracking-tight mt-1">
              {formatRupiah(totalCollected)}
              <span className="text-sm font-normal text-slate-400 ml-2">/ target {formatRupiah(totalTarget)}</span>
            </h2>
          </div>

          <Button
            variant="accent"
            icon={Plus}
            onClick={() => {
              setSelectedSaving(null);
              setIsModalOpen(true);
            }}
          >
            + Buat Target Tabungan
          </Button>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-2">
          <ProgressBar value={overallProgress} size="lg" variant="income" />
          <div className="flex justify-between items-center text-xs text-slate-300 font-medium mt-2">
            <span>Progres Keseluruhan</span>
            <span>{formatPercent(overallProgress)}</span>
          </div>
        </div>
      </div>

      {/* Target Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat target tabungan...</div>
      ) : savings.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Belum ada target tabungan"
          description="Rencanakan target masa depan seperti dana darurat, gadget baru, atau liburan impian Anda."
          actionLabel="+ Buat Target Tabungan"
          onAction={() => {
            setSelectedSaving(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savings.map((s) => {
            const isCompleted = s.status === 'completed' || s.currentAmount >= s.targetAmount;
            return (
              <Card key={s.id} className="relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </h3>
                    <div className="mt-1">
                      {isCompleted ? (
                        <Badge variant="income">Tercapai 🎉</Badge>
                      ) : s.status === 'cancelled' ? (
                        <Badge variant="expense">Dibatalkan</Badge>
                      ) : (
                        <Badge variant="info">Aktif</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedSaving(s);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-accent rounded-lg transition-colors"
                      title="Edit Target"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Hapus Target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-4">
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300">{formatRupiah(s.currentAmount)}</span>
                    <span className="text-accent font-bold">{formatPercent(s.progress)}</span>
                  </div>
                  <ProgressBar
                    value={s.progress}
                    variant={isCompleted ? 'income' : 'accent'}
                    size="md"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    Target: {formatRupiah(s.targetAmount)}
                  </div>
                </div>

                {/* Target Date */}
                {s.targetDate && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {formatDate(s.targetDate)}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <SavingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        saving={selectedSaving}
        onSuccess={() => {
          fetchSavings();
          refreshAll();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Target Tabungan"
        message="Apakah Anda yakin ingin menghapus target tabungan ini?"
      />
    </div>
  );
}

