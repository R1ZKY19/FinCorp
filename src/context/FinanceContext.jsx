import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePeriod, setActivePeriod] = useState('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const fetchDashboard = useCallback(async (period = activePeriod, custom = customRange) => {
    setLoading(true);
    try {
      const res = await api.getDashboard({
        period,
        startDate: custom.start,
        endDate: custom.end
      });
      if (res.success && res.data) {
        setDashboardData(res.data);
        if (res.data.accounts) setAccounts(res.data.accounts);
      }
    } catch (e) {
      console.error("Fetch dashboard error", e);
    } finally {
      setLoading(false);
    }
  }, [activePeriod, customRange]);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.getAccounts();
      if (res.success && res.data) {
        setAccounts(res.data);
      }
    } catch (e) {
      console.error("Fetch accounts error", e);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (e) {
      console.error("Fetch categories error", e);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchDashboard();
    fetchAccounts();
    fetchCategories();
  }, [fetchDashboard, fetchAccounts, fetchCategories]);

  useEffect(() => {
    fetchDashboard();
    fetchAccounts();
    fetchCategories();
  }, []);

  return (
    <FinanceContext.Provider value={{
      dashboardData,
      accounts,
      categories,
      loading,
      activePeriod,
      setActivePeriod,
      customRange,
      setCustomRange,
      fetchDashboard,
      fetchAccounts,
      fetchCategories,
      refreshAll
    }}>
      {children}
    </FinanceContext.Provider>
  );
}
