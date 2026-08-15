import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CategoryModal } from "../components/forms/CategoryModal";
import { useFinance } from '../hooks/useFinance';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { Tags, Plus, Edit2, Trash2 } from 'lucide-react';

export function CategoriesPage() {
  const { categories, refreshAll } = useFinance();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredCategories = categories.filter(c => c.type === activeTab);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.deleteCategory(deleteId);
      if (res.success) {
        success('Kategori berhasil dihapus.');
        setDeleteId(null);
        refreshAll();
      } else {
        error(res.message || 'Gagal menghapus kategori.');
      }
    } catch (err) {
      error('Terjadi kesalahan koneksi.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kelola Kategori Transaksi</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sesuaikan daftar kategori pengeluaran dan pemasukan sesuai kebutuhan Anda.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
        >
          + Tambah Kategori
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expense'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400'
          }`}
        >
          Kategori Pengeluaran ({categories.filter(c => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400'
          }`}
        >
          Kategori Pemasukan ({categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <Card key={cat.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${activeTab === 'expense' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'}`}>
                <Tags className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                <span className="text-[10px] text-slate-400 capitalize">{cat.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsModalOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-accent rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteId(cat.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        defaultType={activeTab}
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
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini?"
      />
    </div>
  );
}

