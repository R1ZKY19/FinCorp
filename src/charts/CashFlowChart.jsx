import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatRupiah, formatDate } from '../utils/formatters';

export function CashFlowChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Belum ada arus kas untuk ditampilkan.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-semibold mb-2 text-slate-300">{formatDate(label, true)}</p>
          <div className="space-y-1">
            <p className="text-emerald-400 flex justify-between gap-4">
              <span>Pemasukan:</span>
              <span className="font-bold">{formatRupiah(payload.find(p => p.dataKey === 'income')?.value || 0)}</span>
            </p>
            <p className="text-rose-400 flex justify-between gap-4">
              <span>Pengeluaran:</span>
              <span className="font-bold">{formatRupiah(payload.find(p => p.dataKey === 'expense')?.value || 0)}</span>
            </p>
            <p className="text-blue-400 flex justify-between gap-4 border-t border-slate-700 pt-1 mt-1">
              <span>Net Cash Flow:</span>
              <span className="font-bold">{formatRupiah(payload.find(p => p.dataKey === 'net')?.value || 0)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => formatDate(val, true)}
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(val) => (val >= 1000000 ? `${(val / 1000000).toFixed(0)}jt` : `${(val / 1000).toFixed(0)}k`)}
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-medium">{value}</span>}
          />
          <Area type="monotone" name="Pemasukan" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
          <Area type="monotone" name="Pengeluaran" dataKey="expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
