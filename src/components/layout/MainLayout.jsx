import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useFinance } from '../../hooks/useFinance';
import { TransactionModal } from '../forms/TransactionModal';
import { TransferModal } from '../forms/TransferModal';

export function MainLayout({
  activePage,
  onNavigate,
  pageTitle,
  children
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activePeriod, setActivePeriod, refreshAll } = useFinance();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Global Quick Modals
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        onLogout={logout}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          pageTitle={pageTitle}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
          onOpenTransfer={() => setIsTransferOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          activePeriod={activePeriod}
          onPeriodChange={(p) => setActivePeriod(p)}
          showPeriodFilter={activePage === 'dashboard'}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Navigation & Slide-over Menu */}
        <MobileNav
          activePage={activePage}
          onNavigate={onNavigate}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
          isDrawerOpen={isMobileDrawerOpen}
          onCloseDrawer={() => setIsMobileDrawerOpen(false)}
          onLogout={logout}
          user={user}
        />
      </div>

      {/* Global Quick Action Modals */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSuccess={() => {
          setIsAddTxOpen(false);
          refreshAll();
        }}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={() => {
          setIsTransferOpen(false);
          refreshAll();
        }}
      />
    </div>
  );
}
