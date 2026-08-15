import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatRupiah } from '../utils/formatters';

export function TrendLineChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Belum ada tren historis.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-semibold mb-2 text-slate-300">Bulan: {label}</p>
          <div className="space-y-1">
            <p className="text-emerald-400 flex justify-between gap-4">
              <span>Income:</span>
              <span className="font-bold">{formatRupiah(payload.find(p => p.dataKey === 'income')?.value || 0)}</span>
            </p>
            <p className="text-rose-400 flex justify-between gap-4">
              <span>Expense:</span>
              <span className="font-bold">{formatRupiah(payload.find(p => p.dataKey === 'expense')?.value || 0)}</span>
            </p>
            <p className="text-blue-400 flex justify-between gap-4 border-t border-slate-700 pt-1 mt-1">
              <span>Net:</span>
              <span className="font-bold">{formatRupiah(payload.find(p => p.dataKey === 'net')?.value || 0)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(val) => `${(val / 1000000).toFixed(0)}jt`}
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
          <Line type="monotone" name="Pemasukan" dataKey="income" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" name="Pengeluaran" dataKey="expense" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" name="Net Cash Flow" dataKey="net" stroke="#2563EB" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
