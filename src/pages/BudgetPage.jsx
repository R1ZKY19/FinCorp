import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { BudgetModal } from "../components/forms/BudgetModal";
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { formatRupiah, formatPercent } from '../utils/formatters';
import { PieChart, Plus, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export function BudgetPage() {
  const { refreshAll } = useFinance();
  const { success, error } = useToast();

  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().substring(0, 7));
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.getBudgets({ month: currentMonth });
      if (res.success && res.data) {
        setBudgets(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [currentMonth]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.deleteBudget(deleteId);
      if (res.success) {
        success('Budget berhasil dihapus.');
        setDeleteId(null);
        fetchBudgets();
        refreshAll();
      } else {
        error(res.message || 'Gagal menghapus budget.');
      }
    } catch (err) {
      error('Terjadi kesalahan koneksi.');
    } finally {
      setDeleting(false);
    }
  };

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.budgetAmount, 0);
  const totalActual = budgets.reduce((acc, curr) => acc + (curr.actualExpense || 0), 0);
  const totalRemaining = Math.max(0, totalBudget - totalActual);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-subtle border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Budget Periode
            </span>
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div className="flex items-baseline gap-4 mt-2">
            <div>
              <p className="text-xs text-slate-500">Total Budget</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{formatRupiah(totalBudget)}</h3>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
              <p className="text-xs text-slate-500">Total Terpakai</p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatRupiah(totalActual)}</h3>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4 hidden sm:block">
              <p className="text-xs text-slate-500">Sisa Tersedia</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(totalRemaining)}</h3>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setSelectedBudget(null);
            setIsModalOpen(true);
          }}
        >
          + Atur Budget Kategori
        </Button>
      </div>

      {/* Budget Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat data budget...</div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="Belum ada budget yang diatur"
          description="Atur batas maksimal pengeluaran bulanan per kategori untuk mengendalikan pengeluaran Anda."
          actionLabel="+ Atur Budget Kategori"
          onAction={() => {
            setSelectedBudget(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isOver = b.status === 'over';
            const isWarning = b.status === 'warning';

            return (
              <Card key={b.id} className="relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {b.category}
                    </h3>
                    <div className="mt-1">
                      {isOver ? (
                        <Badge variant="expense">Melewati Budget</Badge>
                      ) : isWarning ? (
                        <Badge variant="warning">Hampir Habis (≥80%)</Badge>
                      ) : (
                        <Badge variant="income">Normal</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedBudget(b);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-accent rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Numbers */}
                <div className="my-4">
                  <div className="flex justify-between items-center text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">
                      Terpakai: {formatRupiah(b.actualExpense || 0)}
                    </span>
                    <span className={`font-bold ${isOver ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatPercent(b.percentage)}
                    </span>
                  </div>

                  <ProgressBar
                    value={b.percentage}
                    variant={isOver ? 'expense' : isWarning ? 'warning' : 'income'}
                    size="md"
                  />

                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Budget: {formatRupiah(b.budgetAmount)}</span>
                    <span>
                      Sisa: <strong className={b.remaining < 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}>
                        {formatRupiah(b.remaining)}
                      </strong>
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budget={selectedBudget}
        currentMonth={currentMonth}
        onSuccess={() => {
          fetchBudgets();
          refreshAll();
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Budget"
        message="Apakah Anda yakin ingin menghapus alokasi budget untuk kategori ini?"
      />
    </div>
  );
}

