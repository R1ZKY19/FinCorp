/**
 * ============================================================================
 * FINCORP - SETUP & DATABASE INITIALIZATION SCRIPT
 * ============================================================================
 * Jalankan fungsi initialSetup() sekali dari editor Google Apps Script untuk
 * membuat semua Sheet dengan header kolom, styling rapi, dan data awal.
 * ============================================================================
 */

function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const schema = {
    "Users": [
      ["id", "name", "email", "password_hash", "status", "created_at", "last_login"]
    ],
    "Transactions": [
      ["id", "user_id", "date", "type", "category", "subcategory", "account_id", "amount", "description", "created_at", "updated_at"]
    ],
    "Accounts": [
      ["id", "user_id", "name", "type", "initial_balance", "status", "created_at"]
    ],
    "Categories": [
      ["id", "user_id", "name", "type", "status", "created_at"]
    ],
    "Transfers": [
      ["id", "user_id", "date", "from_account", "to_account", "amount", "description", "created_at"]
    ],
    "Savings": [
      ["id", "user_id", "name", "target_amount", "current_amount", "target_date", "status", "created_at"]
    ],
    "Budgets": [
      ["id", "user_id", "month", "category", "budget_amount", "created_at"]
    ],
    "Audit_Log": [
      ["id", "user_id", "action", "module", "record_id", "timestamp", "ip_or_session"]
    ]
  };

  const headerBgColor = "#0F172A"; // Dark Navy
  const headerFontColor = "#FFFFFF";

  Object.keys(schema).forEach(function(sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // Periksa apakah sheet masih kosong
    if (sheet.getLastRow() === 0) {
      const headers = schema[sheetName];
      sheet.getRange(1, 1, headers.length, headers[0].length).setValues(headers);
      
      // Styling Header
      const headerRange = sheet.getRange(1, 1, 1, headers[0].length);
      headerRange.setBackground(headerBgColor)
                 .setFontColor(headerFontColor)
                 .setFontWeight("bold")
                 .setFontFamily("Inter");
      sheet.setFrozenRows(1);
    }
  });

  // Hapus Sheet default 'Sheet1' jika ada dan tidak dipakai
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch(e) {}
  }

  // Buat User Demo / Admin Pertama jika sheet Users masih hanya punya header
  const usersSheet = ss.getSheetByName("Users");
  if (usersSheet && usersSheet.getLastRow() === 1) {
    const adminId = "USR-ADMIN01";
    const adminName = "Rizky Prayogi";
    const adminEmail = "demo@fincorp.id";
    const defaultPassword = "password123";
    const hashedPassword = hashPassword(defaultPassword);
    const now = new Date().toISOString();

    usersSheet.appendRow([adminId, adminName, adminEmail, hashedPassword, "active", now, now]);

    // Seed Rekening Awal
    const accSheet = ss.getSheetByName("Accounts");
    const accBca = "ACC-BCA001";
    const accCash = "ACC-CSH001";
    const accGopay = "ACC-GPY001";
    accSheet.appendRow([accBca, adminId, "BCA Prioritas", "Bank", 15000000, "active", now]);
    accSheet.appendRow([accCash, adminId, "Dompet Tunai", "Cash", 1250000, "active", now]);
    accSheet.appendRow([accGopay, adminId, "GoPay / OVO", "E-Wallet", 850000, "active", now]);

    // Seed Kategori Awal
    const catSheet = ss.getSheetByName("Categories");
    const defaultExpense = [
      "Makanan & Minuman", "Transportasi", "Belanja", "Tagihan & Utilitas", 
      "Tempat Tinggal", "Hiburan", "Kesehatan", "Pendidikan", 
      "Internet & Pulsa", "Investasi", "Lainnya"
    ];
    const defaultIncome = [
      "Gaji Pokok", "Bonus & Tunjangan", "Investasi & Dividen", "Freelance", "Bisnis", "Lainnya"
    ];

    defaultExpense.forEach(function(c) {
      catSheet.appendRow(["CAT-" + Utilities.getUuid().substring(0, 8), adminId, c, "expense", "active", now]);
    });
    defaultIncome.forEach(function(c) {
      catSheet.appendRow(["CAT-" + Utilities.getUuid().substring(0, 8), adminId, c, "income", "active", now]);
    });

    // Seed Target Tabungan
    const savSheet = ss.getSheetByName("Savings");
    savSheet.appendRow(["SAV-001", adminId, "Dana Darurat (6 Bulan)", 30000000, 18500000, "2026-12-31", "active", now]);
    savSheet.appendRow(["SAV-002", adminId, "MacBook Pro M3", 25000000, 14200000, "2026-10-30", "active", now]);

    // Seed Budget Bulanan
    const currentMonth = getCurrentMonthStr();
    const budSheet = ss.getSheetByName("Budgets");
    budSheet.appendRow(["BUD-001", adminId, currentMonth, "Makanan & Minuman", 2500000, now]);
    budSheet.appendRow(["BUD-002", adminId, currentMonth, "Transportasi", 1000000, now]);
    budSheet.appendRow(["BUD-003", adminId, currentMonth, "Belanja", 1500000, now]);
    budSheet.appendRow(["BUD-004", adminId, currentMonth, "Tagihan & Utilitas", 1200000, now]);
    budSheet.appendRow(["BUD-005", adminId, currentMonth, "Hiburan", 600000, now]);

    // Seed Transaksi Sampel Bulan Ini
    const txSheet = ss.getSheetByName("Transactions");
    const todayStr = formatDateStr(new Date());
    const daysAgo = function(d) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      return formatDateStr(dt);
    };

    txSheet.appendRow(["TX-001", adminId, daysAgo(1), "expense", "Makanan & Minuman", "Restoran", accBca, 145000, "Makan Siang Tim", now, now]);
    txSheet.appendRow(["TX-002", adminId, daysAgo(2), "expense", "Transportasi", "Bensin", accCash, 100000, "Isi Bensin Pertamax", now, now]);
    txSheet.appendRow(["TX-003", adminId, daysAgo(3), "expense", "Internet & Pulsa", "Paket Data", accGopay, 150000, "Paket Internet Bulanan", now, now]);
    txSheet.appendRow(["TX-004", adminId, daysAgo(5), "income", "Gaji Pokok", "Bulanan", accBca, 12500000, "Gaji Bulanan Masuk", now, now]);
    txSheet.appendRow(["TX-005", adminId, daysAgo(7), "income", "Freelance", "Web Dev", accBca, 3500000, "Honor Desain & Dev", now, now]);
    txSheet.appendRow(["TX-006", adminId, daysAgo(8), "expense", "Tagihan & Utilitas", "Listrik", accBca, 650000, "Token Listrik PLN", now, now]);

    // Seed Log
    const logSheet = ss.getSheetByName("Audit_Log");
    logSheet.appendRow(["LOG-001", adminId, "SETUP_INITIAL", "SYSTEM", adminId, now, "Database dan akun demo berhasil diinisialisasi"]);
  }

  Logger.log("Inisialisasi Database FinCorp Berhasil!");
}
