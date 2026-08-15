import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function InsightBanner({ insights = [] }) {
  if (!insights || insights.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
      case 'danger': return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'savings': return <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />;
      default: return <Info className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4 sm:p-5 rounded-2xl shadow-subtle border border-navy-700/60">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-accent/20 rounded-lg text-accent-light">
          <Sparkles className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Analisis Finansial Otomatis
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 bg-navy-950/60 p-3 rounded-xl border border-navy-800 text-xs text-slate-200"
          >
            {getIcon(item.type)}
            <span className="leading-relaxed">{item.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
