import React from 'react';
import { useFinance } from '../hooks/useFinance';
import { StatCard } from '../components/dashboard/StatCard';
import { InsightBanner } from '../components/dashboard/InsightBanner';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { IncomeVsExpenseChart } from '../charts/IncomeVsExpenseChart';
import { ExpenseCategoryDonut } from '../charts/ExpenseCategoryDonut';
import { CashFlowChart } from '../charts/CashFlowChart';
import { Card } from '../components/common/Card';
import { StatCardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  PieChart,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export function DashboardPage({ onNavigate, onOpenAddTransaction }) {
  const { dashboardData, loading } = useFinance();

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Memuat Grafik..."><TableSkeleton rows={4} /></Card>
          <Card title="Memuat Grafik..."><TableSkeleton rows={4} /></Card>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {
    totalBalance: 0,
    income: 0,
    expense: 0,
    totalSavings: 0,
    remainingBudget: 0,
    netCashFlow: 0,
    savingRate: 0
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Saldo"
          amount={summary.totalBalance}
          subtitle="Akumulasi seluruh rekening"
          icon={Wallet}
          variant="default"
        />
        <StatCard
          title="Pemasukan"
          amount={summary.income}
          subtitle="Periode terpilih"
          icon={ArrowDownLeft}
          variant="income"
        />
        <StatCard
          title="Pengeluaran"
          amount={summary.expense}
          subtitle="Periode terpilih"
          icon={ArrowUpRight}
          variant="expense"
        />
        <StatCard
          title="Tabungan"
          amount={summary.totalSavings}
          subtitle="Target tabungan aktif"
          icon={PiggyBank}
          variant="savings"
        />
        <StatCard
          title="Sisa Budget"
          amount={summary.remainingBudget}
          subtitle="Alokasi bulan berjalan"
          icon={PieChart}
          variant="budget"
        />
      </div>

      {/* 2. Automated Financial Insights Banner */}
      <InsightBanner insights={dashboardData?.insights || []} />

      {/* 3. Main Dashboard Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <Card
          title="Pemasukan vs Pengeluaran"
          subtitle="Perbandingan arus kas masuk dan keluar"
        >
          <IncomeVsExpenseChart data={dashboardData?.cashFlowTimeline || []} />
        </Card>

        {/* Expense by Category Donut Chart */}
        <Card
          title="Pengeluaran Berdasarkan Kategori"
          subtitle="Distribusi belanja periode berjalan"
        >
          <ExpenseCategoryDonut data={dashboardData?.expenseByCategory || []} />
        </Card>
      </div>

      {/* 4. Cash Flow Timeline & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="Arus Kas (Cash Flow)"
          subtitle="Grafik tren pergerakan pemasukan, pengeluaran & saldo bersih"
        >
          <CashFlowChart data={dashboardData?.cashFlowTimeline || []} />
        </Card>

        <div className="space-y-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions || []}
            onViewAll={() => onNavigate('transactions')}
            onAddTransaction={onOpenAddTransaction}
          />
        </div>
      </div>
    </div>
  );
}

