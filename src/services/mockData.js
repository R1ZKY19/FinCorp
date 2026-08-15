/**
 * Mock Database & In-Memory Storage (with LocalStorage Sync)
 * Digunakan untuk mode demo atau fallback jika backend Google Apps Script belum dideploy.
 */

const STORAGE_KEY = "FINCORP_LOCAL_DB_V1";

const initialMockDB = {
  user: {
    id: "USR-001",
    name: "Rizky Prayogi",
    email: "demo@fincorp.id",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    lastLogin: new Date().toISOString()
  },
  accounts: [
    { id: "ACC-01", userId: "USR-001", name: "BCA Prioritas", type: "Bank", initialBalance: 12500000, currentBalance: 18250000, status: "active", createdAt: "2026-01-01" },
    { id: "ACC-02", userId: "USR-001", name: "Bank Mandiri", type: "Bank", initialBalance: 5000000, currentBalance: 6500000, status: "active", createdAt: "2026-01-01" },
    { id: "ACC-03", userId: "USR-001", name: "Dompet Tunai", type: "Cash", initialBalance: 1000000, currentBalance: 1350000, status: "active", createdAt: "2026-01-01" },
    { id: "ACC-04", userId: "USR-001", name: "GoPay / OVO", type: "E-Wallet", initialBalance: 500000, currentBalance: 780000, status: "active", createdAt: "2026-01-01" }
  ],
  categories: [
    { id: "CAT-01", userId: "USR-001", name: "Makanan & Minuman", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-02", userId: "USR-001", name: "Transportasi", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-03", userId: "USR-001", name: "Belanja", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-04", userId: "USR-001", name: "Tagihan & Utilitas", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-05", userId: "USR-001", name: "Tempat Tinggal", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-06", userId: "USR-001", name: "Hiburan", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-07", userId: "USR-001", name: "Kesehatan", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-08", userId: "USR-001", name: "Pendidikan", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-09", userId: "USR-001", name: "Internet & Pulsa", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-10", userId: "USR-001", name: "Investasi", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-11", userId: "USR-001", name: "Lainnya", type: "expense", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-12", userId: "USR-001", name: "Gaji Pokok", type: "income", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-13", userId: "USR-001", name: "Bonus & Tunjangan", type: "income", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-14", userId: "USR-001", name: "Investasi & Dividen", type: "income", status: "active", createdAt: "2026-01-01" },
    { id: "CAT-15", userId: "USR-001", name: "Freelance", type: "income", status: "active", createdAt: "2026-01-01" }
  ],
  transactions: [
    { id: "TX-101", userId: "USR-001", date: "2026-08-15", type: "income", category: "Gaji Pokok", subcategory: "Gaji Agustus", accountId: "ACC-01", accountName: "BCA Prioritas", amount: 15000000, description: "Transfer Gaji Bulanan", createdAt: "2026-08-15T08:00:00.000Z" },
    { id: "TX-102", userId: "USR-001", date: "2026-08-14", type: "expense", category: "Makanan & Minuman", subcategory: "Restoran", accountId: "ACC-04", accountName: "GoPay / OVO", amount: 185000, description: "Makan Malam Keluarga", createdAt: "2026-08-14T19:30:00.000Z" },
    { id: "TX-103", userId: "USR-001", date: "2026-08-13", type: "expense", category: "Transportasi", subcategory: "Bensin", accountId: "ACC-03", accountName: "Dompet Tunai", amount: 200000, description: "Bensin Pertamax Mobil", createdAt: "2026-08-13T10:15:00.000Z" },
    { id: "TX-104", userId: "USR-001", date: "2026-08-12", type: "income", category: "Freelance", subcategory: "Web UI Design", accountId: "ACC-01", accountName: "BCA Prioritas", amount: 4500000, description: "Pembayaran Project Desain Web", createdAt: "2026-08-12T14:00:00.000Z" },
    { id: "TX-105", userId: "USR-001", date: "2026-08-11", type: "expense", category: "Tagihan & Utilitas", subcategory: "Listrik PLN", accountId: "ACC-01", accountName: "BCA Prioritas", amount: 750000, description: "Tagihan Listrik Rumah", createdAt: "2026-08-11T09:00:00.000Z" },
    { id: "TX-106", userId: "USR-001", date: "2026-08-10", type: "expense", category: "Internet & Pulsa", subcategory: "WiFi Fiber", accountId: "ACC-01", accountName: "BCA Prioritas", amount: 450000, description: "Langganan Internet IndiHome", createdAt: "2026-08-10T11:20:00.000Z" },
    { id: "TX-107", userId: "USR-001", date: "2026-08-08", type: "expense", category: "Belanja", subcategory: "Supermarket", accountId: "ACC-01", accountName: "BCA Prioritas", amount: 920000, description: "Belanja Bulanan Supermarket", createdAt: "2026-08-08T16:45:00.000Z" },
    { id: "TX-108", userId: "USR-001", date: "2026-08-05", type: "expense", category: "Hiburan", subcategory: "Bioskop & Streaming", accountId: "ACC-04", accountName: "GoPay / OVO", amount: 180000, description: "Nonton Bioskop Weekend", createdAt: "2026-08-05T20:00:00.000Z" },
    { id: "TX-109", userId: "USR-001", date: "2026-08-03", type: "expense", category: "Kesehatan", subcategory: "Vitamin & Obat", accountId: "ACC-03", accountName: "Dompet Tunai", amount: 150000, description: "Beli Multivitamin", createdAt: "2026-08-03T13:10:00.000Z" },
    { id: "TX-110", userId: "USR-001", date: "2026-08-01", type: "income", category: "Investasi & Dividen", subcategory: "Reksadana", accountId: "ACC-02", accountName: "Bank Mandiri", amount: 1200000, description: "Hasil Dividen Reksadana", createdAt: "2026-08-01T08:30:00.000Z" }
  ],
  transfers: [
    { id: "TRF-01", userId: "USR-001", date: "2026-08-14", fromAccount: "ACC-01", fromAccountName: "BCA Prioritas", toAccount: "ACC-04", toAccountName: "GoPay / OVO", amount: 500000, description: "Top Up E-Wallet", createdAt: "2026-08-14T15:00:00.000Z" },
    { id: "TRF-02", userId: "USR-001", date: "2026-08-10", fromAccount: "ACC-01", fromAccountName: "BCA Prioritas", toAccount: "ACC-03", toAccountName: "Dompet Tunai", amount: 1000000, description: "Tarik Tunai ATM", createdAt: "2026-08-10T12:00:00.000Z" }
  ],
  savings: [
    { id: "SAV-01", userId: "USR-001", name: "Dana Darurat (6 Bulan)", targetAmount: 30000000, currentAmount: 21500000, targetDate: "2026-12-31", status: "active", progress: 71.67, createdAt: "2026-01-01" },
    { id: "SAV-02", userId: "USR-001", name: "MacBook Pro M3", targetAmount: 25000000, currentAmount: 16500000, targetDate: "2026-11-30", status: "active", progress: 66.0, createdAt: "2026-02-15" },
    { id: "SAV-03", userId: "USR-001", name: "Liburan ke Jepang", targetAmount: 20000000, currentAmount: 8500000, targetDate: "2027-04-15", status: "active", progress: 42.5, createdAt: "2026-04-01" }
  ],
  budgets: [
    { id: "BUD-01", userId: "USR-001", month: "2026-08", category: "Makanan & Minuman", budgetAmount: 2500000, actualExpense: 185000, remaining: 2315000, percentage: 7.4, status: "normal", createdAt: "2026-08-01" },
    { id: "BUD-02", userId: "USR-001", month: "2026-08", category: "Transportasi", budgetAmount: 1000000, actualExpense: 200000, remaining: 800000, percentage: 20.0, status: "normal", createdAt: "2026-08-01" },
    { id: "BUD-03", userId: "USR-001", month: "2026-08", category: "Belanja", budgetAmount: 1500000, actualExpense: 920000, remaining: 580000, percentage: 61.33, status: "normal", createdAt: "2026-08-01" },
    { id: "BUD-04", userId: "USR-001", month: "2026-08", category: "Tagihan & Utilitas", budgetAmount: 1200000, actualExpense: 750000, remaining: 450000, percentage: 62.5, status: "normal", createdAt: "2026-08-01" },
    { id: "BUD-05", userId: "USR-001", month: "2026-08", category: "Hiburan", budgetAmount: 600000, actualExpense: 180000, remaining: 420000, percentage: 30.0, status: "normal", createdAt: "2026-08-01" }
  ],
  auditLogs: [
    { id: "LOG-01", userId: "USR-001", action: "LOGIN", module: "AUTH", recordId: "USR-001", timestamp: "2026-08-16T05:40:00.000Z", details: "User login session active" },
    { id: "LOG-02", userId: "USR-001", action: "ADD_TRANSACTION", module: "TRANSACTION", recordId: "TX-101", timestamp: "2026-08-15T08:00:00.000Z", details: "Tambah pemasukan Gaji Pokok" },
    { id: "LOG-03", userId: "USR-001", action: "TRANSFER", module: "TRANSFER", recordId: "TRF-01", timestamp: "2026-08-14T15:00:00.000Z", details: "Transfer ke GoPay Rp 500.000" }
  ]
};

export function getLocalDB() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading localStorage DB", e);
    }
  }
  saveLocalDB(initialMockDB);
  return initialMockDB;
}

export function saveLocalDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}
