import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded-xl ${className}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-36 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28 ml-auto" />
        </div>
      ))}
    </div>
  );
}
