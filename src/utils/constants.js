export const APP_NAME = "FinCorp";
export const APP_TAGLINE = "Corporate Personal Finance Dashboard";

export const ACCOUNT_TYPES = [
  { value: "Bank", label: "Bank", icon: "Landmark" },
  { value: "Cash", label: "Cash / Tunai", icon: "Banknote" },
  { value: "E-Wallet", label: "E-Wallet", icon: "Wallet" },
  { value: "Lainnya", label: "Rekening Lainnya", icon: "CreditCard" }
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Tagihan & Utilitas",
  "Tempat Tinggal",
  "Hiburan",
  "Kesehatan",
  "Pendidikan",
  "Internet & Pulsa",
  "Investasi",
  "Lainnya"
];

export const DEFAULT_INCOME_CATEGORIES = [
  "Gaji Pokok",
  "Bonus & Tunjangan",
  "Investasi & Dividen",
  "Freelance",
  "Bisnis",
  "Hadiah",
  "Lainnya"
];

export const PERIOD_FILTERS = [
  { id: "today", label: "Hari Ini" },
  { id: "week", label: "Minggu Ini" },
  { id: "month", label: "Bulan Ini" },
  { id: "prev_month", label: "Bulan Lalu" },
  { id: "year", label: "Tahun Ini" },
  { id: "custom", label: "Kustom" }
];

export const PAGINATION_SIZES = [25, 50, 100];
