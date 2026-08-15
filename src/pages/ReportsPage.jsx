import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { exportToCSV, printDocument } from '../utils/exportUtils';
import { FileSpreadsheet, Download, Printer, Filter } from 'lucide-react';

export function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.getReports({
        period,
        startDate,
        endDate
      });
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period, startDate, endDate]);

  const handleExportCSV = () => {
    if (!reportData || !reportData.transactions) return;
    const rows = reportData.transactions.map(t => ({
      Tanggal: t.date,
      Jenis: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: t.category,
      Subkategori: t.subcategory || '-',
      Rekening: t.accountName,
      Nominal: t.amount,
      Deskripsi: t.description || '-'
    }));
    exportToCSV(rows, `laporan-keuangan-${period}-${new Date().toISOString().substring(0, 10)}.csv`);
  };

  const summary = reportData?.summary || { totalIncome: 0, totalExpense: 0, netCashFlow: 0, totalTransactions: 0 };

  return (
    <div className="space-y-6">
      {/* Filter & Export Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Periode:</span>
          {['month', 'year', 'custom'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-navy-900 text-white dark:bg-accent'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              {p === 'month' ? 'Bulan Ini' : p === 'year' ? 'Tahun Ini' : 'Kustom Tanggal'}
            </button>
          ))}

          {period === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
              />
              <span className="text-xs text-slate-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={printDocument}>
            Cetak PDF
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Total Pemasukan" subtitle="Seluruh sumber">
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{formatRupiah(summary.totalIncome)}
          </h3>
        </Card>
        <Card title="Total Pengeluaran" subtitle="Seluruh pos belanja">
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            -{formatRupiah(summary.totalExpense)}
          </h3>
        </Card>
        <Card title="Net Cash Flow" subtitle="Saldo bersih periode">
          <h3 className={`text-2xl font-black mt-1 ${summary.netCashFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatRupiah(summary.netCashFlow)}
          </h3>
        </Card>
      </div>

      {/* Breakdown by Category & Account */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <Card title="Laporan Per Kategori" subtitle="Rincian akumulasi transaksi per kategori" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Kategori</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4 text-center">Jumlah Tx</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Total (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(reportData?.byCategory || []).map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/30">
                    <td className="py-3 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">{cat.category}</td>
                    <td className="py-3 px-4 capitalize text-slate-500">{cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">{cat.count}</td>
                    <td className={`py-3 px-4 sm:px-6 text-right font-black ${cat.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatRupiah(cat.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Account Breakdown Table */}
        <Card title="Laporan Per Rekening" subtitle="Mutasi masuk dan keluar per akun" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Rekening</th>
                  <th className="py-3 px-4 text-right">Pemasukan</th>
                  <th className="py-3 px-4 text-right">Pengeluaran</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Net Arus Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(reportData?.byAccount || []).map((acc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/30">
                    <td className="py-3 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">{acc.accountName}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">+{formatRupiah(acc.income)}</td>
                    <td className="py-3 px-4 text-right text-rose-600 font-semibold">-{formatRupiah(acc.expense)}</td>
                    <td className={`py-3 px-4 sm:px-6 text-right font-black ${acc.net >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                      {formatRupiah(acc.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

