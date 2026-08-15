/**
 * API Service Client untuk FinCorp
 * Menghubungkan frontend ke Google Apps Script Web App.
 * Jika URL belum dikonfigurasi atau mode demo aktif, fallback otomatis ke In-Memory mock DB.
 */
import { getLocalDB, saveLocalDB } from './mockData';

const GAS_API_URL = import.meta.env.VITE_API_URL || "";
const FORCE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function isUsingMock() {
  return FORCE_MOCK || !GAS_API_URL || GAS_API_URL.includes("YOUR_DEPLOYMENT_ID");
}

async function request(action, params = {}, method = "POST") {
  // Jika dalam mode mock / offline demo
  if (isUsingMock()) {
    return handleMockRequest(action, params);
  }

  const token = localStorage.getItem("fincorp_auth_token") || "";
  const payload = { action, token, ...params };

  try {
    let response;
    if (method === "GET") {
      const queryParams = new URLSearchParams(payload).toString();
      response = await fetch(`${GAS_API_URL}?${queryParams}`, {
        method: "GET",
        mode: "cors"
      });
    } else {
      // POST ke Google Apps Script
      response = await fetch(GAS_API_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8" // GAS menangani text/plain lebih baik tanpa CORS preflight issue
        },
        body: JSON.stringify(payload)
      });
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("GAS API Request Failed. Falling back to Local Mock DB:", error);
    return handleMockRequest(action, params);
  }
}

/**
 * In-Memory & LocalStorage Mock Handler (Mirrors Code.gs behavior)
 */
function handleMockRequest(action, params) {
  const db = getLocalDB();
  const now = new Date().toISOString();

  switch (action) {
    case "login": {
      const { email, password } = params;
      if (email === "demo@fincorp.id" && password === "password123") {
        const token = "MOCK_TOKEN_" + Math.random().toString(36).substring(2);
        return {
          success: true,
          message: "Login berhasil (Demo Mode)",
          data: { token, user: db.user }
        };
      }
      // Support any email in demo mode if password >= 6 chars
      if (email && password && password.length >= 6) {
        const token = "MOCK_TOKEN_" + Math.random().toString(36).substring(2);
        db.user.email = email;
        db.user.name = email.split('@')[0].toUpperCase();
        saveLocalDB(db);
        return {
          success: true,
          message: "Login berhasil",
          data: { token, user: db.user }
        };
      }
      return { success: false, message: "Email atau kata sandi salah. Gunakan demo@fincorp.id / password123" };
    }

    case "validateSession":
      return { success: true, data: { user: db.user } };

    case "dashboard": {
      const period = params.period || "month";
      
      // Calculate current balances
      let totalBalance = 0;
      db.accounts.forEach(a => { totalBalance += a.currentBalance; });

      // Income & Expense this month
      let income = 0;
      let expense = 0;
      const categoryExpenseMap = {};
      const timelineMap = {};

      db.transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        if (t.type === "expense") {
          expense += t.amount;
          categoryExpenseMap[t.category] = (categoryExpenseMap[t.category] || 0) + t.amount;
        }
        if (!timelineMap[t.date]) timelineMap[t.date] = { date: t.date, income: 0, expense: 0, net: 0 };
        if (t.type === "income") timelineMap[t.date].income += t.amount;
        if (t.type === "expense") timelineMap[t.date].expense += t.amount;
        timelineMap[t.date].net = timelineMap[t.date].income - timelineMap[t.date].expense;
      });

      const expenseByCategory = Object.keys(categoryExpenseMap).map(k => ({
        name: k,
        value: categoryExpenseMap[k]
      })).sort((a, b) => b.value - a.value);

      const cashFlowTimeline = Object.values(timelineMap).sort((a, b) => new Date(a.date) - new Date(b.date));

      let totalSavings = 0;
      db.savings.forEach(s => { if (s.status === "active") totalSavings += s.currentAmount; });

      let totalBudget = 0;
      db.budgets.forEach(b => { totalBudget += b.budgetAmount; });

      const netCashFlow = income - expense;
      const savingRate = income > 0 ? Math.round(((income - expense) / income) * 1000) / 10 : 0;

      const insights = [
        { type: "positive", message: `Cash flow bulan ini surplus ${formatRupiah(netCashFlow)}.` },
        { type: "info", message: `Pengeluaran terbesar ada di kategori '${expenseByCategory[0]?.name || "Makanan"}' (${Math.round((expenseByCategory[0]?.value || 0) / (expense || 1) * 100)}% dari total).` },
        { type: "savings", message: "Anda berada di jalur yang baik untuk mencapai target Dana Darurat." }
      ];

      return {
        success: true,
        data: {
          summary: {
            totalBalance,
            income,
            expense,
            netCashFlow,
            totalSavings,
            totalBudget,
            remainingBudget: Math.max(0, totalBudget - expense),
            savingRate
          },
          filter: { period },
          expenseByCategory,
          cashFlowTimeline,
          recentTransactions: db.transactions.slice(0, 10),
          savings: db.savings,
          budgets: db.budgets,
          accounts: db.accounts,
          insights
        }
      };
    }

    case "transactions": {
      const page = parseInt(params.page, 10) || 1;
      const limit = parseInt(params.limit, 10) || 25;
      const search = (params.search || "").toLowerCase().trim();
      const type = params.type || "";
      const category = params.category || "";
      const accountId = params.accountId || "";

      let items = [...db.transactions];
      if (type) items = items.filter(t => t.type === type);
      if (category) items = items.filter(t => t.category === category);
      if (accountId) items = items.filter(t => t.accountId === accountId);
      if (search) {
        items = items.filter(t => 
          (t.category + " " + (t.subcategory || "") + " " + (t.description || "") + " " + (t.accountName || "")).toLowerCase().includes(search)
        );
      }

      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const paginated = items.slice((page - 1) * limit, page * limit);

      return {
        success: true,
        data: {
          items: paginated,
          pagination: { page, limit, totalItems, totalPages }
        }
      };
    }

    case "addTransaction": {
      const txId = "TX-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      const acc = db.accounts.find(a => a.id === params.accountId);
      const newTx = {
        id: txId,
        userId: db.user.id,
        date: params.date,
        type: params.type,
        category: params.category,
        subcategory: params.subcategory || "",
        accountId: params.accountId,
        accountName: acc ? acc.name : "Rekening",
        amount: Number(params.amount),
        description: params.description || "",
        createdAt: now,
        updatedAt: now
      };

      db.transactions.unshift(newTx);
      
      // Update account current balance
      if (acc) {
        if (newTx.type === "income") acc.currentBalance += newTx.amount;
        if (newTx.type === "expense") acc.currentBalance -= newTx.amount;
      }

      db.auditLogs.unshift({
        id: "LOG-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
        userId: db.user.id,
        action: "ADD_TRANSACTION",
        module: "TRANSACTION",
        recordId: txId,
        timestamp: now,
        details: `Tambah transaksi ${newTx.type}: ${newTx.category} Rp ${newTx.amount}`
      });

      saveLocalDB(db);
      return { success: true, message: "Transaksi berhasil disimpan.", data: { id: txId } };
    }

    case "updateTransaction": {
      const idx = db.transactions.findIndex(t => t.id === params.id);
      if (idx !== -1) {
        const oldTx = db.transactions[idx];
        const oldAcc = db.accounts.find(a => a.id === oldTx.accountId);
        if (oldAcc) {
          if (oldTx.type === "income") oldAcc.currentBalance -= oldTx.amount;
          if (oldTx.type === "expense") oldAcc.currentBalance += oldTx.amount;
        }

        const newAcc = db.accounts.find(a => a.id === params.accountId);
        const updatedTx = {
          ...oldTx,
          date: params.date || oldTx.date,
          type: params.type || oldTx.type,
          category: params.category || oldTx.category,
          subcategory: params.subcategory !== undefined ? params.subcategory : oldTx.subcategory,
          accountId: params.accountId || oldTx.accountId,
          accountName: newAcc ? newAcc.name : oldTx.accountName,
          amount: params.amount !== undefined ? Number(params.amount) : oldTx.amount,
          description: params.description !== undefined ? params.description : oldTx.description,
          updatedAt: now
        };

        if (newAcc) {
          if (updatedTx.type === "income") newAcc.currentBalance += updatedTx.amount;
          if (updatedTx.type === "expense") newAcc.currentBalance -= updatedTx.amount;
        }

        db.transactions[idx] = updatedTx;
        saveLocalDB(db);
        return { success: true, message: "Transaksi berhasil diperbarui." };
      }
      return { success: false, message: "Transaksi tidak ditemukan." };
    }

    case "deleteTransaction": {
      const idx = db.transactions.findIndex(t => t.id === params.id);
      if (idx !== -1) {
        const tx = db.transactions[idx];
        const acc = db.accounts.find(a => a.id === tx.accountId);
        if (acc) {
          if (tx.type === "income") acc.currentBalance -= tx.amount;
          if (tx.type === "expense") acc.currentBalance += tx.amount;
        }
        db.transactions.splice(idx, 1);
        saveLocalDB(db);
        return { success: true, message: "Transaksi berhasil dihapus." };
      }
      return { success: false, message: "Transaksi tidak ditemukan." };
    }

    case "accounts":
      return { success: true, data: db.accounts };

    case "addAccount": {
      const accId = "ACC-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const initial = Number(params.initialBalance) || 0;
      const newAcc = {
        id: accId,
        userId: db.user.id,
        name: params.name,
        type: params.type || "Bank",
        initialBalance: initial,
        currentBalance: initial,
        status: "active",
        createdAt: now
      };
      db.accounts.push(newAcc);
      saveLocalDB(db);
      return { success: true, message: "Rekening berhasil ditambahkan.", data: { id: accId } };
    }

    case "updateAccount": {
      const idx = db.accounts.findIndex(a => a.id === params.id);
      if (idx !== -1) {
        db.accounts[idx] = {
          ...db.accounts[idx],
          name: params.name || db.accounts[idx].name,
          type: params.type || db.accounts[idx].type,
          status: params.status || db.accounts[idx].status
        };
        saveLocalDB(db);
        return { success: true, message: "Rekening berhasil diperbarui." };
      }
      return { success: false, message: "Rekening tidak ditemukan." };
    }

    case "deleteAccount": {
      db.accounts = db.accounts.filter(a => a.id !== params.id);
      saveLocalDB(db);
      return { success: true, message: "Rekening berhasil dihapus." };
    }

    case "transfer": {
      const { fromAccount, toAccount, amount, date, description } = params;
      const amt = Number(amount);
      const fromAcc = db.accounts.find(a => a.id === fromAccount);
      const toAcc = db.accounts.find(a => a.id === toAccount);

      if (!fromAcc || !toAcc) return { success: false, message: "Rekening tidak ditemukan." };
      if (fromAcc.currentBalance < amt) {
        // Warning if insufficient but allow proceed
      }

      fromAcc.currentBalance -= amt;
      toAcc.currentBalance += amt;

      const trfId = "TRF-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      db.transfers.unshift({
        id: trfId,
        userId: db.user.id,
        date: date || now.substring(0, 10),
        fromAccount,
        fromAccountName: fromAcc.name,
        toAccount,
        toAccountName: toAcc.name,
        amount: amt,
        description: description || "",
        createdAt: now
      });

      saveLocalDB(db);
      return { success: true, message: "Transfer antar rekening berhasil diproses." };
    }

    case "transfers":
      return { success: true, data: db.transfers };

    case "savings":
      return { success: true, data: db.savings };

    case "addSaving": {
      const savId = "SAV-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const target = Number(params.targetAmount);
      const current = Number(params.currentAmount) || 0;
      const newSav = {
        id: savId,
        userId: db.user.id,
        name: params.name,
        targetAmount: target,
        currentAmount: current,
        targetDate: params.targetDate,
        status: "active",
        progress: target > 0 ? Math.min(100, Math.round((current / target) * 10000) / 100) : 0,
        createdAt: now
      };
      db.savings.push(newSav);
      saveLocalDB(db);
      return { success: true, message: "Target tabungan berhasil ditambahkan.", data: { id: savId } };
    }

    case "updateSaving": {
      const idx = db.savings.findIndex(s => s.id === params.id);
      if (idx !== -1) {
        const item = db.savings[idx];
        const target = params.targetAmount !== undefined ? Number(params.targetAmount) : item.targetAmount;
        const current = params.currentAmount !== undefined ? Number(params.currentAmount) : item.currentAmount;
        db.savings[idx] = {
          ...item,
          name: params.name || item.name,
          targetAmount: target,
          currentAmount: current,
          targetDate: params.targetDate !== undefined ? params.targetDate : item.targetDate,
          status: params.status || item.status,
          progress: target > 0 ? Math.min(100, Math.round((current / target) * 10000) / 100) : 0
        };
        saveLocalDB(db);
        return { success: true, message: "Target tabungan berhasil diperbarui." };
      }
      return { success: false, message: "Tabungan tidak ditemukan." };
    }

    case "deleteSaving": {
      db.savings = db.savings.filter(s => s.id !== params.id);
      saveLocalDB(db);
      return { success: true, message: "Target tabungan berhasil dihapus." };
    }

    case "budgets":
      return { success: true, data: db.budgets };

    case "setBudget":
    case "addBudget": {
      const idx = db.budgets.findIndex(b => b.category === params.category && b.month === params.month);
      const bAmt = Number(params.budgetAmount);
      if (idx !== -1) {
        db.budgets[idx].budgetAmount = bAmt;
        saveLocalDB(db);
        return { success: true, message: `Budget kategori '${params.category}' berhasil diperbarui.` };
      }
      const budId = "BUD-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      db.budgets.push({
        id: budId,
        userId: db.user.id,
        month: params.month || "2026-08",
        category: params.category,
        budgetAmount: bAmt,
        actualExpense: 0,
        remaining: bAmt,
        percentage: 0,
        status: "normal",
        createdAt: now
      });
      saveLocalDB(db);
      return { success: true, message: "Budget berhasil disimpan.", data: { id: budId } };
    }

    case "deleteBudget": {
      db.budgets = db.budgets.filter(b => b.id !== params.id);
      saveLocalDB(db);
      return { success: true, message: "Budget berhasil dihapus." };
    }

    case "categories":
      return { success: true, data: db.categories };

    case "addCategory": {
      const catId = "CAT-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      db.categories.push({
        id: catId,
        userId: db.user.id,
        name: params.name,
        type: params.type || "expense",
        status: "active",
        createdAt: now
      });
      saveLocalDB(db);
      return { success: true, message: "Kategori berhasil ditambahkan.", data: { id: catId } };
    }

    case "updateCategory": {
      const idx = db.categories.findIndex(c => c.id === params.id);
      if (idx !== -1) {
        db.categories[idx] = {
          ...db.categories[idx],
          name: params.name || db.categories[idx].name,
          type: params.type || db.categories[idx].type
        };
        saveLocalDB(db);
        return { success: true, message: "Kategori berhasil diperbarui." };
      }
      return { success: false, message: "Kategori tidak ditemukan." };
    }

    case "deleteCategory": {
      db.categories = db.categories.filter(c => c.id !== params.id);
      saveLocalDB(db);
      return { success: true, message: "Kategori berhasil dihapus." };
    }

    case "reports": {
      let income = 0;
      let expense = 0;
      const catMap = {};
      const accMap = {};

      db.transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        if (t.type === "expense") expense += t.amount;

        if (!catMap[t.category]) catMap[t.category] = { category: t.category, type: t.type, total: 0, count: 0 };
        catMap[t.category].total += t.amount;
        catMap[t.category].count += 1;

        if (!accMap[t.accountName]) accMap[t.accountName] = { accountName: t.accountName, income: 0, expense: 0, net: 0 };
        if (t.type === "income") accMap[t.accountName].income += t.amount;
        if (t.type === "expense") accMap[t.accountName].expense += t.amount;
        accMap[t.accountName].net = accMap[t.accountName].income - accMap[t.accountName].expense;
      });

      return {
        success: true,
        data: {
          summary: { totalIncome: income, totalExpense: expense, netCashFlow: income - expense, totalTransactions: db.transactions.length },
          byCategory: Object.values(catMap),
          byAccount: Object.values(accMap),
          transactions: db.transactions
        }
      };
    }

    case "analytics": {
      let income = 0, expense = 0;
      db.transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        if (t.type === "expense") expense += t.amount;
      });

      return {
        success: true,
        data: {
          metrics: {
            totalIncome: income,
            totalExpense: expense,
            netCashFlow: income - expense,
            savingRate: income > 0 ? Math.round(((income - expense) / income) * 1000) / 10 : 0,
            avgDailySpending: Math.round(expense / 30),
            avgMonthlySpending: expense,
            largestExpense: { category: "Tagihan & Utilitas", amount: 750000, date: "2026-08-11", description: "Listrik PLN" },
            largestExpenseCategory: { name: "Belanja", amount: 920000 },
            mostFrequentCategory: { name: "Makanan & Minuman", count: 12 },
            mom: { expenseChangePercent: -12.5, incomeChangePercent: 8.2, prevMonthIncome: 19000000, prevMonthExpense: 4800000 }
          },
          monthlyTrends: [
            { month: "2026-03", income: 18000000, expense: 4200000, net: 13800000 },
            { month: "2026-04", income: 19500000, expense: 5100000, net: 14400000 },
            { month: "2026-05", income: 18500000, expense: 4600000, net: 13900000 },
            { month: "2026-06", income: 20000000, expense: 5300000, net: 14700000 },
            { month: "2026-07", income: 19000000, expense: 4800000, net: 14200000 },
            { month: "2026-08", income: income, expense: expense, net: income - expense }
          ]
        }
      };
    }

    case "audit_logs":
      return { success: true, data: db.auditLogs };

    case "updateProfile": {
      db.user.name = params.name;
      saveLocalDB(db);
      return { success: true, message: "Profil berhasil diperbarui." };
    }

    case "changePassword":
      return { success: true, message: "Kata sandi berhasil diperbarui." };

    default:
      return { success: true, data: null };
  }
}

function formatRupiah(num) {
  if (!num) return "Rp 0";
  return "Rp " + Number(num).toLocaleString('id-ID');
}

export const api = {
  login: (email, password) => request("login", { email, password }),
  register: (name, email, password) => request("register", { name, email, password }),
  validateSession: () => request("validateSession"),
  getDashboard: (params) => request("dashboard", params),
  getTransactions: (params) => request("transactions", params),
  addTransaction: (data) => request("addTransaction", data),
  updateTransaction: (data) => request("updateTransaction", data),
  deleteTransaction: (id) => request("deleteTransaction", { id }),
  getAccounts: () => request("accounts"),
  addAccount: (data) => request("addAccount", data),
  updateAccount: (data) => request("updateAccount", data),
  deleteAccount: (id) => request("deleteAccount", { id }),
  transfer: (data) => request("transfer", data),
  getTransfers: () => request("transfers"),
  getSavings: () => request("savings"),
  addSaving: (data) => request("addSaving", data),
  updateSaving: (data) => request("updateSaving", data),
  deleteSaving: (id) => request("deleteSaving", { id }),
  getBudgets: (params) => request("budgets", params),
  setBudget: (data) => request("setBudget", data),
  deleteBudget: (id) => request("deleteBudget", { id }),
  getCategories: () => request("categories"),
  addCategory: (data) => request("addCategory", data),
  updateCategory: (data) => request("updateCategory", data),
  deleteCategory: (id) => request("deleteCategory", { id }),
  getReports: (params) => request("reports", params),
  getAnalytics: (params) => request("analytics", params),
  getAuditLogs: () => request("audit_logs"),
  updateProfile: (data) => request("updateProfile", data),
  changePassword: (data) => request("changePassword", data)
};
