import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import { formatDateTime } from '../utils/formatters';
import { History, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export function AuditLogPage({ onNavigate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await api.getAuditLogs();
        if (res.success && res.data) {
          setLogs(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => onNavigate('settings')}>
            Kembali
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Log Keamanan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Riwayat aktivitas penting, otentikasi, dan mutasi data akun Anda.
            </p>
          </div>
        </div>
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat catatan log...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Belum ada riwayat aktivitas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-900/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Waktu</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4 sm:px-6">Detail Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/30">
                    <td className="py-3 px-4 sm:px-6 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {log.module}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={log.action.includes('LOGIN') ? 'income' : log.action.includes('DELETE') ? 'expense' : 'info'}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-slate-600 dark:text-slate-300">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

