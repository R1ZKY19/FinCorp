import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensePage } from './pages/ExpensePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountsPage } from './pages/AccountsPage';
import { TransferPage } from './pages/TransferPage';
import { SavingsPage } from './pages/SavingsPage';
import { BudgetPage } from './pages/BudgetPage';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuditLogPage } from './pages/AuditLogPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TransactionModal } from './components/forms/TransactionModal';
import { useFinance } from './hooks/useFinance';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const { refreshAll } = useFinance();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B132B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-xl animate-pulse">
            F
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider">Memuat FinCorp...</p>
        </div>
      </div>
    );
  }

  // 1. Protected Route: If not logged in, show Login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 2. Render Target Page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} onOpenAddTransaction={() => setIsQuickAddOpen(true)} />;
      case 'income':
        return <IncomePage />;
      case 'expense':
        return <ExpensePage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'transfer':
        return <TransferPage />;
      case 'savings':
        return <SavingsPage />;
      case 'budget':
        return <BudgetPage />;
      case 'reports':
        return <ReportsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      case 'audit_logs':
        return <AuditLogPage onNavigate={setCurrentPage} />;
      default:
        return <NotFoundPage onNavigate={setCurrentPage} />;
    }
  };

  const pageTitles = {
    dashboard: 'Dashboard Utama',
    income: 'Manajemen Pemasukan',
    expense: 'Manajemen Pengeluaran',
    transactions: 'Riwayat Transaksi',
    accounts: 'Rekening & Saldo',
    transfer: 'Transfer Antar Rekening',
    savings: 'Target Tabungan',
    budget: 'Alokasi Budget',
    reports: 'Laporan Keuangan',
    analytics: 'Analitik & Grafik',
    categories: 'Kelola Kategori',
    settings: 'Pengaturan',
    profile: 'Profil Pengguna',
    audit_logs: 'Audit Log'
  };

  return (
    <MainLayout
      activePage={currentPage}
      onNavigate={setCurrentPage}
      pageTitle={pageTitles[currentPage] || 'Dashboard'}
    >
      {renderPage()}

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          setIsQuickAddOpen(false);
          refreshAll();
        }}
      />
    </MainLayout>
  );
}
