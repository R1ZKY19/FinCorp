import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TransactionModal } from '../components/forms/TransactionModal';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { Plus, ArrowUpRight, Edit2, Trash2, Download } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export function ExpensePage() {
  const { accounts, categories, refreshAll } = useFinance();
  const { success, error } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        type: 'expense',
        page,
        limit,
        search,
        category,
        accountId
      });
      if (res.success && res.data) {
        setTransactions(res.data.items);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, limit, search, category, accountId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.deleteTransaction(deleteId);
      if (res.success) {
        success('Pengeluaran berhasil dihapus.');
        setDeleteId(null);
        fetchExpenses();
        refreshAll();
      } else {
        error(res.message || 'Gagal menghapus pengeluaran.');
      }
    } catch (err) {
      error('Terjadi kesalahan koneksi.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const exportData = transactions.map(t => ({
      Tanggal: t.date,
      Kategori: t.category,
      Subkategori: t.subcategory || '-',
      Rekening: t.accountName,
      Nominal: t.amount,
      Deskripsi: t.description || '-'
    }));
    exportToCSV(exportData, `data-pengeluaran-${new Date().toISOString().substring(0, 10)}.csv`);
  };

  const totalExpenseAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Stat & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 p-5 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Total Pengeluaran (Tercatat)
            </p>
            <h2 className="text-2xl font-black text-rose-950 dark:text-rose-100 tracking-tight mt-0.5">
              {formatRupiah(totalExpenseAmount)}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExport} disabled={transactions.length === 0}>
            Export CSV
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Plus}
            onClick={() => {
              setSelectedTx(null);
              setIsModalOpen(true);
            }}
          >
            + Catat Pengeluaran
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categories.filter(c => c.type === 'expense')}
        accountId={accountId}
        onAccountChange={setAccountId}
        accounts={accounts}
        onReset={() => {
          setSearch('');
          setCategory('');
          setAccountId('');
        }}
      />

      {/* Transaction Table / List */}
      <Card noPadding>
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat data pengeluaran...</div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Belum ada data pengeluaran"
            description="Catat pengeluaran harian, belanja, tagihan, atau makan Anda untuk kontrol finansial yang lebih baik."
            actionLabel="+ Catat Pengeluaran"
            onAction={() => {
              setSelectedTx(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Tanggal</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Rekening</th>
                    <th className="py-3.5 px-4">Catatan</th>
                    <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-900/40 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatDate(tx.date, true)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {tx.category}
                        {tx.subcategory && <span className="block text-[11px] font-normal text-slate-400">{tx.subcategory}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {tx.accountName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {tx.description || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        -{formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedTx(tx);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-accent rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 sm:px-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Expense Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTx}
        defaultType="expense"
        onSuccess={() => {
          fetchExpenses();
          refreshAll();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Transaksi Pengeluaran"
        message="Apakah Anda yakin ingin menghapus data pengeluaran ini? Saldo rekening Anda akan bertambah kembali."
      />
    </div>
  );
}

