import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { TrendLineChart } from '../charts/TrendLineChart';
import { api } from '../services/api';
import { formatRupiah, formatPercent } from '../utils/formatters';
import { TrendingUp, TrendingDown, Award, Calendar, DollarSign, Activity } from 'lucide-react';

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await api.getAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const metrics = data?.metrics || {
    totalIncome: 0,
    totalExpense: 0,
    netCashFlow: 0,
    savingRate: 0,
    avgDailySpending: 0,
    avgMonthlySpending: 0,
    largestExpense: null,
    largestExpenseCategory: { name: '-', amount: 0 },
    mostFrequentCategory: { name: '-', count: 0 },
    mom: { expenseChangePercent: 0, incomeChangePercent: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Saving Rate</p>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatPercent(metrics.savingRate)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Rasio tabungan dari total pemasukan</p>
        </Card>

        <Card className="border-l-4 border-l-rose-600">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rata-rata Pengeluaran / Hari</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatRupiah(metrics.avgDailySpending)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Estimasi pengeluaran harian</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Kategori Terbesar</p>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
            {metrics.largestExpenseCategory.name}
          </h3>
          <p className="text-xs text-emerald-600 font-bold mt-1">{formatRupiah(metrics.largestExpenseCategory.amount)}</p>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Kategori Paling Sering</p>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
            {metrics.mostFrequentCategory.name}
          </h3>
          <p className="text-xs text-amber-600 font-bold mt-1">{metrics.mostFrequentCategory.count} kali transaksi</p>
        </Card>
      </div>

      {/* Historical Trend Chart */}
      <Card
        title="Tren Arus Kas Historis (Multi-Bulan)"
        subtitle="Analisis tren pertumbuhan pemasukan, pengeluaran & saldo bersih dari waktu ke waktu"
      >
        <TrendLineChart data={data?.monthlyTrends || []} />
      </Card>

      {/* Deep-Dive Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Pengeluaran Terbesar Periode Ini" subtitle="Item transaksi belanja tertinggi">
          {metrics.largestExpense ? (
            <div className="p-4 bg-slate-50 dark:bg-navy-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{metrics.largestExpense.category}</span>
                <span className="text-base font-black text-rose-600">{formatRupiah(metrics.largestExpense.amount)}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{metrics.largestExpense.description || 'Tanpa keterangan'}</p>
              <p className="text-[11px] text-slate-400">Tanggal: {metrics.largestExpense.date}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Belum ada data pengeluaran.</p>
          )}
        </Card>

        <Card title="Perbandingan Bulan Lalu (MoM Growth)" subtitle="Perubahan pengeluaran & pemasukan">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Perubahan Pengeluaran</span>
              <span className={`font-bold flex items-center gap-1 ${metrics.mom.expenseChangePercent <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {metrics.mom.expenseChangePercent <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                {metrics.mom.expenseChangePercent > 0 ? `+${metrics.mom.expenseChangePercent}%` : `${metrics.mom.expenseChangePercent}%`}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Perubahan Pemasukan</span>
              <span className={`font-bold flex items-center gap-1 ${metrics.mom.incomeChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {metrics.mom.incomeChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metrics.mom.incomeChangePercent > 0 ? `+${metrics.mom.incomeChangePercent}%` : `${metrics.mom.incomeChangePercent}%`}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

