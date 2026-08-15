import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TransactionModal } from '../components/forms/TransactionModal';
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { Plus, Download, Edit2, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export function TransactionsPage() {
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
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        page,
        limit,
        search,
        type,
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
    fetchTransactions();
  }, [page, limit, search, type, category, accountId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.deleteTransaction(deleteId);
      if (res.success) {
        success('Transaksi berhasil dihapus.');
        setDeleteId(null);
        fetchTransactions();
        refreshAll();
      } else {
        error(res.message || 'Gagal menghapus transaksi.');
      }
    } catch (err) {
      error('Terjadi masalah koneksi.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const exportData = transactions.map(t => ({
      ID: t.id,
      Tanggal: t.date,
      Jenis: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: t.category,
      Subkategori: t.subcategory || '-',
      Rekening: t.accountName,
      Nominal: t.amount,
      Deskripsi: t.description || '-'
    }));
    exportToCSV(exportData, `riwayat-transaksi-${new Date().toISOString().substring(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Riwayat Seluruh Transaksi</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar lengkap pemasukan dan pengeluaran dengan filter lanjutan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExport} disabled={transactions.length === 0}>
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setSelectedTx(null);
              setIsModalOpen(true);
            }}
          >
            + Transaksi Baru
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={setType}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        accountId={accountId}
        onAccountChange={setAccountId}
        accounts={accounts}
        onReset={() => {
          setSearch('');
          setType('');
          setCategory('');
          setAccountId('');
        }}
      />

      {/* Master Transactions Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat transaksi...</div>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi yang cocok"
            description="Coba ubah kriteria pencarian atau tambahkan transaksi baru."
            actionLabel="+ Transaksi Baru"
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
                    <th className="py-3.5 px-4">Jenis</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Rekening</th>
                    <th className="py-3.5 px-4">Catatan</th>
                    <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-900/40 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {formatDate(tx.date, true)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge variant={isIncome ? 'income' : 'expense'}>
                            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {tx.category}
                          {tx.subcategory && <span className="block text-[11px] font-normal text-slate-400">{tx.subcategory}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {tx.accountName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {tx.description || '-'}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-black whitespace-nowrap ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isIncome ? `+${formatRupiah(tx.amount)}` : `-${formatRupiah(tx.amount)}`}
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
                    );
                  })}
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

      {/* Add / Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTx}
        onSuccess={() => {
          fetchTransactions();
          refreshAll();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dipulihkan."
      />
    </div>
  );
}

