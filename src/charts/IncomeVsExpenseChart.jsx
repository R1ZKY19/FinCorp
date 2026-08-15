import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatRupiah, formatDate } from '../utils/formatters';

export function IncomeVsExpenseChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Belum ada data grafik untuk periode ini.
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
              <span className="font-bold">{formatRupiah(payload[0]?.value)}</span>
            </p>
            <p className="text-rose-400 flex justify-between gap-4">
              <span>Pengeluaran:</span>
              <span className="font-bold">{formatRupiah(payload[1]?.value)}</span>
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
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <Bar name="Pemasukan" dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar name="Pengeluaran" dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
