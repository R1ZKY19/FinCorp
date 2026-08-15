/**
 * ============================================================================
 * FINCORP - PREMIUM PERSONAL FINANCE DASHBOARD (GOOGLE APPS SCRIPT API)
 * ============================================================================
 * Backend API untuk menghubungkan frontend React dengan database Google Sheets.
 * Dilengkapi dengan Password Hashing (SHA-256), Session Token Verification,
 * Audit Logging, Validasi Input, dan Operasi Agregasi Teroptimasi.
 * ============================================================================
 */

// Konfigurasi Keamanan & Session
const SALT = "FINCORP_SECURE_SALT_v1_2026";
const TOKEN_EXPIRY_HOURS = 24 * 7; // 7 Hari masa berlaku token session

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Main Request Router with CORS and Unified JSON Response
 */
function handleRequest(e) {
  let params = {};
  
  if (e && e.parameter) {
    params = Object.assign({}, e.parameter);
  }
  
  if (e && e.postData && e.postData.contents) {
    try {
      const postBody = JSON.parse(e.postData.contents);
      params = Object.assign(params, postBody);
    } catch (err) {
      // Jika bukan JSON, biarkan query params yang ada
    }
  }

  const action = params.action || "";
  let response = { success: false, message: "Action tidak dikenal", data: null };

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. PUBLIC ACTIONS (Tanpa Auth Token)
    if (action === "ping") {
      response = { success: true, message: "API Backend Aktif & Berjalan", timestamp: new Date().toISOString() };
    } 
    else if (action === "login") {
      response = handleLogin(ss, params);
    } 
    else if (action === "register") {
      response = handleRegister(ss, params);
    } 
    // 2. PROTECTED ACTIONS (Wajib Auth Token)
    else {
      const auth = verifyToken(ss, params.token);
      if (!auth.valid) {
        response = { success: false, message: "Sesi tidak valid atau telah kadaluarsa. Silakan login kembali.", code: "UNAUTHORIZED" };
      } else {
        const userId = auth.userId;
        const user = auth.user;

        switch (action) {
          case "validateSession":
            response = { success: true, message: "Sesi Valid", data: { user } };
            break;

          case "dashboard":
            response = getDashboardData(ss, userId, params);
            break;

          case "transactions":
            response = getTransactions(ss, userId, params);
            break;

          case "addTransaction":
            response = addTransaction(ss, userId, params);
            break;

          case "updateTransaction":
            response = updateTransaction(ss, userId, params);
            break;

          case "deleteTransaction":
            response = deleteTransaction(ss, userId, params);
            break;

          case "accounts":
            response = getAccounts(ss, userId, params);
            break;

          case "addAccount":
            response = addAccount(ss, userId, params);
            break;

          case "updateAccount":
            response = updateAccount(ss, userId, params);
            break;

          case "deleteAccount":
            response = deleteAccount(ss, userId, params);
            break;

          case "transfer":
            response = handleTransfer(ss, userId, params);
            break;

          case "transfers":
            response = getTransfers(ss, userId, params);
            break;

          case "savings":
            response = getSavings(ss, userId, params);
            break;

          case "addSaving":
            response = addSaving(ss, userId, params);
            break;

          case "updateSaving":
            response = updateSaving(ss, userId, params);
            break;

          case "deleteSaving":
            response = deleteSaving(ss, userId, params);
            break;

          case "budgets":
            response = getBudgets(ss, userId, params);
            break;

          case "setBudget":
          case "addBudget":
            response = setBudget(ss, userId, params);
            break;

          case "deleteBudget":
            response = deleteBudget(ss, userId, params);
            break;

          case "categories":
            response = getCategories(ss, userId, params);
            break;

          case "addCategory":
            response = addCategory(ss, userId, params);
            break;

          case "updateCategory":
            response = updateCategory(ss, userId, params);
            break;

          case "deleteCategory":
            response = deleteCategory(ss, userId, params);
            break;

          case "reports":
            response = getReports(ss, userId, params);
            break;

          case "analytics":
            response = getAnalytics(ss, userId, params);
            break;

          case "audit_logs":
            response = getAuditLogs(ss, userId, params);
            break;

          case "updateProfile":
            response = updateProfile(ss, userId, params);
            break;

          case "changePassword":
            response = changePassword(ss, userId, params);
            break;

          default:
            response = { success: false, message: "Action '" + action + "' tidak valid." };
            break;
        }
      }
    }
  } catch (error) {
    response = {
      success: false,
      message: "Terjadi kesalahan internal pada server: " + error.toString(),
      error: error.stack
    };
  }

  // Return formatted JSON with CORS headers
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: Hashing SHA-256
 */
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + SALT, Utilities.Charset.UTF_8);
  let hashStr = "";
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let hex = byteVal.toString(16);
    if (hex.length === 1) hex = "0" + hex;
    hashStr += hex;
  }
  return hashStr;
}

/**
 * Generate Simple Secure Token (Format: Base64(userId:timestamp:signature))
 */
function generateToken(userId) {
  const expiry = new Date().getTime() + (TOKEN_EXPIRY_HOURS * 3600 * 1000);
  const payload = userId + "::" + expiry;
  const signature = hashPassword(payload);
  const fullToken = Utilities.base64Encode(payload + "::" + signature);
  return fullToken;
}

/**
 * Verify Session Token
 */
function verifyToken(ss, token) {
  if (!token) return { valid: false };
  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const parts = decoded.split("::");
    if (parts.length !== 3) return { valid: false };

    const userId = parts[0];
    const expiry = parseInt(parts[1], 10);
    const signature = parts[2];

    const expectedSignature = hashPassword(userId + "::" + expiry);
    if (signature !== expectedSignature) return { valid: false };

    if (new Date().getTime() > expiry) return { valid: false };

    // Fetch user info
    const usersSheet = ss.getSheetByName("Users");
    if (!usersSheet) return { valid: false };
    const rows = usersSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(userId) && rows[i][4] === "active") {
        return {
          valid: true,
          userId: userId,
          user: {
            id: rows[i][0],
            name: rows[i][1],
            email: rows[i][2],
            status: rows[i][4],
            createdAt: rows[i][5],
            lastLogin: rows[i][6]
          }
        };
      }
    }
    return { valid: false };
  } catch (e) {
    return { valid: false };
  }
}

/**
 * Log Action to Audit_Log Sheet
 */
function logAudit(ss, userId, action, module, recordId, details) {
  try {
    const sheet = ss.getSheetByName("Audit_Log");
    if (!sheet) return;
    const logId = "LOG-" + Utilities.getUuid().substring(0, 8);
    const timestamp = new Date().toISOString();
    const info = typeof details === "object" ? JSON.stringify(details) : (details || "");
    sheet.appendRow([logId, userId, action, module, recordId || "", timestamp, info]);
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

/**
 * Auth: Login
 */
function handleLogin(ss, params) {
  const email = (params.email || "").trim().toLowerCase();
  const password = params.password || "";

  if (!email || !password) {
    return { success: false, message: "Email dan kata sandi wajib diisi." };
  }

  const usersSheet = ss.getSheetByName("Users");
  if (!usersSheet) {
    return { success: false, message: "Database Users belum diinisialisasi. Jalankan initialSetup() terlebih dahulu." };
  }

  const rows = usersSheet.getDataRange().getValues();
  const hashedPassword = hashPassword(password);

  for (let i = 1; i < rows.length; i++) {
    const rowEmail = String(rows[i][2]).trim().toLowerCase();
    const rowPass = String(rows[i][3]);
    const status = rows[i][4];

    if (rowEmail === email) {
      if (rowPass !== hashedPassword) {
        return { success: false, message: "Kata sandi yang Anda masukkan salah." };
      }
      if (status !== "active") {
        return { success: false, message: "Akun Anda berstatus non-aktif. Silakan hubungi admin." };
      }

      const userId = rows[i][0];
      const nowStr = new Date().toISOString();
      usersSheet.getRange(i + 1, 7).setValue(nowStr); // Update last_login

      const token = generateToken(userId);
      logAudit(ss, userId, "LOGIN", "AUTH", userId, "User login berhasil");

      return {
        success: true,
        message: "Login berhasil",
        data: {
          token: token,
          user: {
            id: userId,
            name: rows[i][1],
            email: rows[i][2],
            status: rows[i][4],
            createdAt: rows[i][5],
            lastLogin: nowStr
          }
        }
      };
    }
  }

  return { success: false, message: "Akun dengan email tersebut tidak ditemukan." };
}

/**
 * Auth: Register New User
 */
function handleRegister(ss, params) {
  const name = (params.name || "").trim();
  const email = (params.email || "").trim().toLowerCase();
  const password = params.password || "";

  if (!name || !email || !password) {
    return { success: false, message: "Nama, email, dan kata sandi wajib diisi." };
  }

  if (password.length < 6) {
    return { success: false, message: "Kata sandi minimal 6 karakter." };
  }

  const usersSheet = ss.getSheetByName("Users");
  const rows = usersSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][2]).trim().toLowerCase() === email) {
      return { success: false, message: "Email sudah terdaftar. Silakan gunakan email lain." };
    }
  }

  const userId = "USR-" + Utilities.getUuid().substring(0, 8);
  const hashedPassword = hashPassword(password);
  const now = new Date().toISOString();

  usersSheet.appendRow([userId, name, email, hashedPassword, "active", now, now]);

  // Buat Rekening Default & Kategori Default untuk user baru
  seedDefaultUserData(ss, userId);

  const token = generateToken(userId);
  logAudit(ss, userId, "REGISTER", "AUTH", userId, "Registrasi user baru");

  return {
    success: true,
    message: "Registrasi berhasil",
    data: {
      token: token,
      user: {
        id: userId,
        name: name,
        email: email,
        status: "active",
        createdAt: now,
        lastLogin: now
      }
    }
  };
}

/**
 * Seed Default Accounts & Categories for new User
 */
function seedDefaultUserData(ss, userId) {
  const accSheet = ss.getSheetByName("Accounts");
  const catSheet = ss.getSheetByName("Categories");
  const now = new Date().toISOString();

  if (accSheet) {
    accSheet.appendRow(["ACC-" + Utilities.getUuid().substring(0, 8), userId, "BCA Utama", "Bank", 5000000, "active", now]);
    accSheet.appendRow(["ACC-" + Utilities.getUuid().substring(0, 8), userId, "Dompet Tunai", "Cash", 500000, "active", now]);
    accSheet.appendRow(["ACC-" + Utilities.getUuid().substring(0, 8), userId, "GoPay / OVO", "E-Wallet", 250000, "active", now]);
  }

  if (catSheet) {
    const defaultExpense = ["Makanan & Minuman", "Transportasi", "Belanja", "Tagihan & Utilitas", "Tempat Tinggal", "Hiburan", "Kesehatan", "Pendidikan", "Internet & Pulsa", "Investasi", "Lainnya"];
    const defaultIncome = ["Gaji Pokok", "Bonus & Tunjangan", "Investasi & Dividen", "Freelance", "Bisnis", "Lainnya"];

    defaultExpense.forEach(function(cat) {
      catSheet.appendRow(["CAT-" + Utilities.getUuid().substring(0, 8), userId, cat, "expense", "active", now]);
    });
    defaultIncome.forEach(function(cat) {
      catSheet.appendRow(["CAT-" + Utilities.getUuid().substring(0, 8), userId, cat, "income", "active", now]);
    });
  }
}

/**
 * Dashboard Aggregated Data Engine (High Performance)
 */
function getDashboardData(ss, userId, params) {
  const filterPeriod = params.period || "month"; // "today", "week", "month", "prev_month", "year", "all", "custom"
  const startDateStr = params.startDate;
  const endDateStr = params.endDate;

  // Baca sheet secara efisien (1x per sheet)
  const txSheet = ss.getSheetByName("Transactions");
  const accSheet = ss.getSheetByName("Accounts");
  const savSheet = ss.getSheetByName("Savings");
  const budSheet = ss.getSheetByName("Budgets");

  const txRows = txSheet ? txSheet.getDataRange().getValues() : [];
  const accRows = accSheet ? accSheet.getDataRange().getValues() : [];
  const savRows = savSheet ? savSheet.getDataRange().getValues() : [];
  const budRows = budSheet ? budSheet.getDataRange().getValues() : [];

  // 1. Hitung Saldo Tiap Rekening
  const accountsMap = {};
  let totalBalance = 0;

  for (let i = 1; i < accRows.length; i++) {
    if (String(accRows[i][1]) === String(userId) && accRows[i][5] === "active") {
      const accId = accRows[i][0];
      const initial = Number(accRows[i][4]) || 0;
      accountsMap[accId] = {
        id: accId,
        name: accRows[i][2],
        type: accRows[i][3],
        initialBalance: initial,
        currentBalance: initial,
        status: accRows[i][5]
      };
    }
  }

  // Periksa seluruh transaksi untuk saldo real-time akun
  const userTransactions = [];
  for (let i = 1; i < txRows.length; i++) {
    if (String(txRows[i][1]) === String(userId)) {
      const tx = {
        id: txRows[i][0],
        userId: txRows[i][1],
        date: formatDateStr(txRows[i][2]),
        type: txRows[i][3],
        category: txRows[i][4],
        subcategory: txRows[i][5],
        accountId: txRows[i][6],
        amount: Number(txRows[i][7]) || 0,
        description: txRows[i][8],
        createdAt: txRows[i][9]
      };
      userTransactions.push(tx);

      if (accountsMap[tx.accountId]) {
        if (tx.type === "income") {
          accountsMap[tx.accountId].currentBalance += tx.amount;
        } else if (tx.type === "expense") {
          accountsMap[tx.accountId].currentBalance -= tx.amount;
        }
      }
    }
  }

  // Hitung total balance dari seluruh rekening aktif
  Object.values(accountsMap).forEach(function(acc) {
    totalBalance += acc.currentBalance;
  });

  // 2. Hitung Filter Date Range
  const dateRange = computeDateRange(filterPeriod, startDateStr, endDateStr);
  const startD = dateRange.start;
  const endD = dateRange.end;

  let periodIncome = 0;
  let periodExpense = 0;
  const categoryExpenseMap = {};
  const categoryIncomeMap = {};
  const dailyCashFlowMap = {};

  // Filter transaksi untuk dashboard metrics
  const filteredTxs = userTransactions.filter(function(tx) {
    const tDate = new Date(tx.date);
    return tDate >= startD && tDate <= endD;
  });

  filteredTxs.forEach(function(tx) {
    if (tx.type === "income") {
      periodIncome += tx.amount;
      categoryIncomeMap[tx.category] = (categoryIncomeMap[tx.category] || 0) + tx.amount;
    } else if (tx.type === "expense") {
      periodExpense += tx.amount;
      categoryExpenseMap[tx.category] = (categoryExpenseMap[tx.category] || 0) + tx.amount;
    }

    const dKey = tx.date;
    if (!dailyCashFlowMap[dKey]) {
      dailyCashFlowMap[dKey] = { date: dKey, income: 0, expense: 0, net: 0 };
    }
    if (tx.type === "income") dailyCashFlowMap[dKey].income += tx.amount;
    if (tx.type === "expense") dailyCashFlowMap[dKey].expense += tx.amount;
    dailyCashFlowMap[dKey].net = dailyCashFlowMap[dKey].income - dailyCashFlowMap[dKey].expense;
  });

  // 3. Tabungan (Savings)
  let totalSavingsCollected = 0;
  let totalSavingsTarget = 0;
  const userSavings = [];

  for (let i = 1; i < savRows.length; i++) {
    if (String(savRows[i][1]) === String(userId)) {
      const current = Number(savRows[i][4]) || 0;
      const target = Number(savRows[i][3]) || 0;
      const item = {
        id: savRows[i][0],
        name: savRows[i][2],
        targetAmount: target,
        currentAmount: current,
        targetDate: formatDateStr(savRows[i][5]),
        status: savRows[i][6],
        progress: target > 0 ? Math.min(100, Math.round((current / target) * 10000) / 100) : 0
      };
      userSavings.push(item);
      if (item.status === "active") {
        totalSavingsCollected += current;
        totalSavingsTarget += target;
      }
    }
  }

  // 4. Budget Bulanan
  const currentMonthStr = getCurrentMonthStr();
  let totalBudgetAmount = 0;
  const userBudgets = [];

  for (let i = 1; i < budRows.length; i++) {
    if (String(budRows[i][1]) === String(userId) && budRows[i][2] === currentMonthStr) {
      const cat = budRows[i][3];
      const bAmount = Number(budRows[i][4]) || 0;
      const actualExp = categoryExpenseMap[cat] || 0;
      const remaining = bAmount - actualExp;
      const percentUsed = bAmount > 0 ? (actualExp / bAmount) * 100 : 0;

      let status = "normal";
      if (percentUsed >= 100) status = "over";
      else if (percentUsed >= 80) status = "warning";

      totalBudgetAmount += bAmount;
      userBudgets.push({
        id: budRows[i][0],
        month: budRows[i][2],
        category: cat,
        budgetAmount: bAmount,
        actualExpense: actualExp,
        remaining: remaining,
        percentage: Math.round(percentUsed * 100) / 100,
        status: status
      });
    }
  }

  const remainingBudget = Math.max(0, totalBudgetAmount - periodExpense);

  // 5. Transaksi Terbaru (Urutkan Descending)
  userTransactions.sort(function(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const recentTransactions = userTransactions.slice(0, 10).map(function(t) {
    return {
      id: t.id,
      date: t.date,
      type: t.type,
      category: t.category,
      subcategory: t.subcategory,
      accountId: t.accountId,
      accountName: accountsMap[t.accountId] ? accountsMap[t.accountId].name : "Rekening",
      amount: t.amount,
      description: t.description
    };
  });

  // 6. Category Breakdown List untuk Donut Chart
  const expenseByCategory = Object.keys(categoryExpenseMap).map(function(cat) {
    return { name: cat, value: categoryExpenseMap[cat] };
  }).sort(function(a, b) { return b.value - a.value; });

  // 7. Cash Flow Chart Data (Sorted by Date)
  const cashFlowTimeline = Object.values(dailyCashFlowMap).sort(function(a, b) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // 8. Dynamic Insights Generator
  const netCashFlow = periodIncome - periodExpense;
  const savingRate = periodIncome > 0 ? Math.round(((periodIncome - periodExpense) / periodIncome) * 1000) / 10 : 0;
  
  const insights = [];
  if (periodIncome > 0 && periodExpense > 0) {
    if (netCashFlow >= 0) {
      insights.push({ type: "positive", message: "Cash flow periode ini positif sebesar " + formatRupiahStr(netCashFlow) + "." });
    } else {
      insights.push({ type: "danger", message: "Peringatan: Pengeluaran melebihi pemasukan dengan defisit " + formatRupiahStr(Math.abs(netCashFlow)) + "." });
    }
  }

  if (expenseByCategory.length > 0) {
    const topCat = expenseByCategory[0];
    const topCatPercent = periodExpense > 0 ? Math.round((topCat.value / periodExpense) * 100) : 0;
    insights.push({ type: "info", message: "Kategori '" + topCat.name + "' menjadi pengeluaran terbesar (" + topCatPercent + "% dari total belanja)." });
  }

  if (totalSavingsTarget > 0) {
    const overallSavePercent = Math.round((totalSavingsCollected / totalSavingsTarget) * 100);
    insights.push({ type: "savings", message: "Anda telah mengumpulkan " + overallSavePercent + "% dari total target tabungan aktif." });
  }

  if (userBudgets.some(function(b) { return b.status === "over"; })) {
    const overBudgets = userBudgets.filter(function(b) { return b.status === "over"; });
    insights.push({ type: "warning", message: "Terdapat " + overBudgets.length + " kategori yang telah melebihi batas budget yang ditentukan." });
  }

  return {
    success: true,
    data: {
      summary: {
        totalBalance: totalBalance,
        income: periodIncome,
        expense: periodExpense,
        netCashFlow: netCashFlow,
        totalSavings: totalSavingsCollected,
        totalBudget: totalBudgetAmount,
        remainingBudget: remainingBudget,
        savingRate: savingRate
      },
      filter: {
        period: filterPeriod,
        startDate: formatDateStr(startD),
        endDate: formatDateStr(endD)
      },
      expenseByCategory: expenseByCategory,
      cashFlowTimeline: cashFlowTimeline,
      recentTransactions: recentTransactions,
      savings: userSavings,
      budgets: userBudgets,
      accounts: Object.values(accountsMap),
      insights: insights
    }
  };
}

/**
 * Get Transactions with Pagination, Search, Filter & Sort
 */
function getTransactions(ss, userId, params) {
  const page = parseInt(params.page, 10) || 1;
  const limit = parseInt(params.limit, 10) || 25;
  const search = (params.search || "").toLowerCase().trim();
  const type = params.type || ""; // "income", "expense", ""
  const category = params.category || "";
  const accountId = params.accountId || "";
  const startDate = params.startDate ? new Date(params.startDate) : null;
  const endDate = params.endDate ? new Date(params.endDate) : null;

  const txSheet = ss.getSheetByName("Transactions");
  const accSheet = ss.getSheetByName("Accounts");
  const txRows = txSheet ? txSheet.getDataRange().getValues() : [];
  const accRows = accSheet ? accSheet.getDataRange().getValues() : [];

  const accountsMap = {};
  for (let i = 1; i < accRows.length; i++) {
    if (String(accRows[i][1]) === String(userId)) {
      accountsMap[accRows[i][0]] = accRows[i][2];
    }
  }

  const results = [];
  for (let i = 1; i < txRows.length; i++) {
    if (String(txRows[i][1]) === String(userId)) {
      const txDateStr = formatDateStr(txRows[i][2]);
      const txDate = new Date(txDateStr);
      const txType = txRows[i][3];
      const txCat = txRows[i][4];
      const txSubcat = txRows[i][5] || "";
      const txAccId = txRows[i][6];
      const txAmt = Number(txRows[i][7]) || 0;
      const txDesc = txRows[i][8] || "";

      // Filtering
      if (type && txType !== type) continue;
      if (category && txCat !== category) continue;
      if (accountId && txAccId !== accountId) continue;
      if (startDate && txDate < startDate) continue;
      if (endDate && txDate > endDate) continue;

      if (search) {
        const fullTxt = (txCat + " " + txSubcat + " " + txDesc + " " + (accountsMap[txAccId] || "")).toLowerCase();
        if (fullTxt.indexOf(search) === -1) continue;
      }

      results.push({
        id: txRows[i][0],
        userId: txRows[i][1],
        date: txDateStr,
        type: txType,
        category: txCat,
        subcategory: txSubcat,
        accountId: txAccId,
        accountName: accountsMap[txAccId] || "Rekening",
        amount: txAmt,
        description: txDesc,
        createdAt: txRows[i][9],
        updatedAt: txRows[i][10]
      });
    }
  }

  // Sort Descending by Date
  results.sort(function(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedItems = results.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: {
      items: paginatedItems,
      pagination: {
        page: page,
        limit: limit,
        totalItems: totalItems,
        totalPages: totalPages
      }
    }
  };
}

/**
 * Add Transaction
 */
function addTransaction(ss, userId, params) {
  const date = params.date || formatDateStr(new Date());
  const type = params.type; // "income" or "expense"
  const category = (params.category || "").trim();
  const subcategory = (params.subcategory || "").trim();
  const accountId = (params.accountId || "").trim();
  const amount = Number(params.amount);
  const description = (params.description || "").trim();

  // Validasi Ketat
  if (!type || (type !== "income" && type !== "expense")) {
    return { success: false, message: "Jenis transaksi harus 'income' atau 'expense'." };
  }
  if (!category) {
    return { success: false, message: "Kategori wajib dipilih." };
  }
  if (!accountId) {
    return { success: false, message: "Rekening wajib dipilih." };
  }
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Nominal transaksi harus berupa angka positif." };
  }

  const txSheet = ss.getSheetByName("Transactions");
  const txId = "TX-" + Utilities.getUuid().substring(0, 8);
  const now = new Date().toISOString();

  txSheet.appendRow([txId, userId, date, type, category, subcategory, accountId, amount, description, now, now]);

  logAudit(ss, userId, "ADD_TRANSACTION", "TRANSACTION", txId, { type: type, amount: amount, category: category });

  return {
    success: true,
    message: "Transaksi berhasil disimpan.",
    data: { id: txId }
  };
}

/**
 * Update Transaction
 */
function updateTransaction(ss, userId, params) {
  const txId = params.id;
  if (!txId) return { success: false, message: "ID Transaksi wajib diberikan." };

  const txSheet = ss.getSheetByName("Transactions");
  const rows = txSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(txId) && String(rows[i][1]) === String(userId)) {
      const date = params.date || rows[i][2];
      const type = params.type || rows[i][3];
      const category = params.category !== undefined ? params.category : rows[i][4];
      const subcategory = params.subcategory !== undefined ? params.subcategory : rows[i][5];
      const accountId = params.accountId !== undefined ? params.accountId : rows[i][6];
      const amount = params.amount !== undefined ? Number(params.amount) : rows[i][7];
      const description = params.description !== undefined ? params.description : rows[i][8];
      const now = new Date().toISOString();

      if (isNaN(amount) || amount <= 0) {
        return { success: false, message: "Nominal transaksi harus lebih besar dari 0." };
      }

      txSheet.getRange(i + 1, 3, 1, 9).setValues([[
        date, type, category, subcategory, accountId, amount, description, rows[i][9], now
      ]]);

      logAudit(ss, userId, "UPDATE_TRANSACTION", "TRANSACTION", txId, { amount: amount, category: category });

      return { success: true, message: "Transaksi berhasil diperbarui." };
    }
  }

  return { success: false, message: "Transaksi tidak ditemukan." };
}

/**
 * Delete Transaction
 */
function deleteTransaction(ss, userId, params) {
  const txId = params.id;
  if (!txId) return { success: false, message: "ID Transaksi wajib diberikan." };

  const txSheet = ss.getSheetByName("Transactions");
  const rows = txSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(txId) && String(rows[i][1]) === String(userId)) {
      txSheet.deleteRow(i + 1);
      logAudit(ss, userId, "DELETE_TRANSACTION", "TRANSACTION", txId, "Hapus transaksi");
      return { success: true, message: "Transaksi berhasil dihapus." };
    }
  }

  return { success: false, message: "Transaksi tidak ditemukan." };
}

/**
 * Accounts Management
 */
function getAccounts(ss, userId, params) {
  const accSheet = ss.getSheetByName("Accounts");
  const txSheet = ss.getSheetByName("Transactions");
  const accRows = accSheet ? accSheet.getDataRange().getValues() : [];
  const txRows = txSheet ? txSheet.getDataRange().getValues() : [];

  const accounts = [];
  const balanceDelta = {};

  // Hitung delta transaksi
  for (let i = 1; i < txRows.length; i++) {
    if (String(txRows[i][1]) === String(userId)) {
      const accId = txRows[i][6];
      const type = txRows[i][3];
      const amt = Number(txRows[i][7]) || 0;
      if (!balanceDelta[accId]) balanceDelta[accId] = 0;
      if (type === "income") balanceDelta[accId] += amt;
      if (type === "expense") balanceDelta[accId] -= amt;
    }
  }

  for (let i = 1; i < accRows.length; i++) {
    if (String(accRows[i][1]) === String(userId)) {
      const accId = accRows[i][0];
      const initial = Number(accRows[i][4]) || 0;
      const current = initial + (balanceDelta[accId] || 0);

      accounts.push({
        id: accId,
        userId: accRows[i][1],
        name: accRows[i][2],
        type: accRows[i][3],
        initialBalance: initial,
        currentBalance: current,
        status: accRows[i][5],
        createdAt: accRows[i][6]
      });
    }
  }

  return { success: true, data: accounts };
}

function addAccount(ss, userId, params) {
  const name = (params.name || "").trim();
  const type = params.type || "Bank"; // "Bank", "Cash", "E-Wallet", "Lainnya"
  const initialBalance = Number(params.initialBalance) || 0;

  if (!name) return { success: false, message: "Nama rekening wajib diisi." };

  const accSheet = ss.getSheetByName("Accounts");
  const accId = "ACC-" + Utilities.getUuid().substring(0, 8);
  const now = new Date().toISOString();

  accSheet.appendRow([accId, userId, name, type, initialBalance, "active", now]);
  logAudit(ss, userId, "ADD_ACCOUNT", "ACCOUNT", accId, { name: name, type: type, initialBalance: initialBalance });

  return { success: true, message: "Rekening berhasil ditambahkan.", data: { id: accId } };
}

function updateAccount(ss, userId, params) {
  const accId = params.id;
  if (!accId) return { success: false, message: "ID Rekening wajib diberikan." };

  const accSheet = ss.getSheetByName("Accounts");
  const rows = accSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(accId) && String(rows[i][1]) === String(userId)) {
      const name = params.name || rows[i][2];
      const type = params.type || rows[i][3];
      const initialBalance = params.initialBalance !== undefined ? Number(params.initialBalance) : rows[i][4];
      const status = params.status || rows[i][5];

      accSheet.getRange(i + 1, 3, 1, 4).setValues([[name, type, initialBalance, status]]);
      logAudit(ss, userId, "UPDATE_ACCOUNT", "ACCOUNT", accId, { name: name, status: status });

      return { success: true, message: "Rekening berhasil diperbarui." };
    }
  }
  return { success: false, message: "Rekening tidak ditemukan." };
}

function deleteAccount(ss, userId, params) {
  const accId = params.id;
  if (!accId) return { success: false, message: "ID Rekening wajib diberikan." };

  const accSheet = ss.getSheetByName("Accounts");
  const rows = accSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(accId) && String(rows[i][1]) === String(userId)) {
      accSheet.deleteRow(i + 1);
      logAudit(ss, userId, "DELETE_ACCOUNT", "ACCOUNT", accId, "Hapus rekening");
      return { success: true, message: "Rekening berhasil dihapus." };
    }
  }
  return { success: false, message: "Rekening tidak ditemukan." };
}

/**
 * Transfer Between Accounts
 */
function handleTransfer(ss, userId, params) {
  const date = params.date || formatDateStr(new Date());
  const fromAccId = (params.fromAccount || "").trim();
  const toAccId = (params.toAccount || "").trim();
  const amount = Number(params.amount);
  const description = (params.description || "").trim();

  if (!fromAccId || !toAccId) {
    return { success: false, message: "Rekening asal dan tujuan wajib dipilih." };
  }
  if (fromAccId === toAccId) {
    return { success: false, message: "Rekening asal dan tujuan tidak boleh sama." };
  }
  if (isNaN(amount) || amount <= 0) {
    return { success: false, message: "Nominal transfer harus lebih besar dari 0." };
  }

  const transferSheet = ss.getSheetByName("Transfers");
  const txSheet = ss.getSheetByName("Transactions");
  const accSheet = ss.getSheetByName("Accounts");

  // Dapatkan nama rekening
  let fromName = "Rekening Asal";
  let toName = "Rekening Tujuan";
  const accRows = accSheet.getDataRange().getValues();
  for (let i = 1; i < accRows.length; i++) {
    if (String(accRows[i][0]) === fromAccId) fromName = accRows[i][2];
    if (String(accRows[i][0]) === toAccId) toName = accRows[i][2];
  }

  const transferId = "TRF-" + Utilities.getUuid().substring(0, 8);
  const now = new Date().toISOString();

  // 1. Simpan ke sheet Transfers
  transferSheet.appendRow([transferId, userId, date, fromAccId, toAccId, amount, description, now]);

  // 2. Buat 2 record transaksi (Expense di rekening asal, Income di rekening tujuan) dengan kategori "Transfer Antar Rekening"
  const txIdFrom = "TX-" + Utilities.getUuid().substring(0, 8);
  const txIdTo = "TX-" + Utilities.getUuid().substring(0, 8);

  const descFrom = "Transfer ke " + toName + (description ? " (" + description + ")" : "");
  const descTo = "Transfer dari " + fromName + (description ? " (" + description + ")" : "");

  txSheet.appendRow([txIdFrom, userId, date, "expense", "Transfer Keluar", "Transfer", fromAccId, amount, descFrom, now, now]);
  txSheet.appendRow([txIdTo, userId, date, "income", "Transfer Masuk", "Transfer", toAccId, amount, descTo, now, now]);

  logAudit(ss, userId, "TRANSFER", "TRANSFER", transferId, { from: fromAccId, to: toAccId, amount: amount });

  return {
    success: true,
    message: "Transfer antar rekening berhasil diproses.",
    data: { id: transferId }
  };
}

function getTransfers(ss, userId, params) {
  const trfSheet = ss.getSheetByName("Transfers");
  const accSheet = ss.getSheetByName("Accounts");
  const trfRows = trfSheet ? trfSheet.getDataRange().getValues() : [];
  const accRows = accSheet ? accSheet.getDataRange().getValues() : [];

  const accMap = {};
  for (let i = 1; i < accRows.length; i++) {
    if (String(accRows[i][1]) === String(userId)) {
      accMap[accRows[i][0]] = accRows[i][2];
    }
  }

  const list = [];
  for (let i = 1; i < trfRows.length; i++) {
    if (String(trfRows[i][1]) === String(userId)) {
      list.push({
        id: trfRows[i][0],
        userId: trfRows[i][1],
        date: formatDateStr(trfRows[i][2]),
        fromAccount: trfRows[i][3],
        fromAccountName: accMap[trfRows[i][3]] || "Rekening Asal",
        toAccount: trfRows[i][4],
        toAccountName: accMap[trfRows[i][4]] || "Rekening Tujuan",
        amount: Number(trfRows[i][5]) || 0,
        description: trfRows[i][6],
        createdAt: trfRows[i][7]
      });
    }
  }

  list.sort(function(a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
  return { success: true, data: list };
}

/**
 * Savings Goals Management
 */
function getSavings(ss, userId, params) {
  const savSheet = ss.getSheetByName("Savings");
  const rows = savSheet ? savSheet.getDataRange().getValues() : [];
  const list = [];

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(userId)) {
      const target = Number(rows[i][3]) || 0;
      const current = Number(rows[i][4]) || 0;
      list.push({
        id: rows[i][0],
        userId: rows[i][1],
        name: rows[i][2],
        targetAmount: target,
        currentAmount: current,
        targetDate: formatDateStr(rows[i][5]),
        status: rows[i][6],
        createdAt: rows[i][7],
        progress: target > 0 ? Math.min(100, Math.round((current / target) * 10000) / 100) : 0
      });
    }
  }

  return { success: true, data: list };
}

function addSaving(ss, userId, params) {
  const name = (params.name || "").trim();
  const targetAmount = Number(params.targetAmount);
  const currentAmount = Number(params.currentAmount) || 0;
  const targetDate = params.targetDate || "";

  if (!name) return { success: false, message: "Nama target tabungan wajib diisi." };
  if (isNaN(targetAmount) || targetAmount <= 0) return { success: false, message: "Target nominal harus lebih besar dari 0." };

  const savSheet = ss.getSheetByName("Savings");
  const savId = "SAV-" + Utilities.getUuid().substring(0, 8);
  const now = new Date().toISOString();

  savSheet.appendRow([savId, userId, name, targetAmount, currentAmount, targetDate, "active", now]);
  logAudit(ss, userId, "ADD_SAVING", "SAVING", savId, { name: name, target: targetAmount });

  return { success: true, message: "Target tabungan berhasil ditambahkan.", data: { id: savId } };
}

function updateSaving(ss, userId, params) {
  const savId = params.id;
  if (!savId) return { success: false, message: "ID Tabungan wajib diberikan." };

  const savSheet = ss.getSheetByName("Savings");
  const rows = savSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(savId) && String(rows[i][1]) === String(userId)) {
      const name = params.name || rows[i][2];
      const targetAmount = params.targetAmount !== undefined ? Number(params.targetAmount) : rows[i][3];
      const currentAmount = params.currentAmount !== undefined ? Number(params.currentAmount) : rows[i][4];
      const targetDate = params.targetDate !== undefined ? params.targetDate : rows[i][5];
      const status = params.status || rows[i][6];

      savSheet.getRange(i + 1, 3, 1, 5).setValues([[name, targetAmount, currentAmount, targetDate, status]]);
      logAudit(ss, userId, "UPDATE_SAVING", "SAVING", savId, { name: name, current: currentAmount, status: status });

      return { success: true, message: "Target tabungan berhasil diperbarui." };
    }
  }
  return { success: false, message: "Target tabungan tidak ditemukan." };
}

function deleteSaving(ss, userId, params) {
  const savId = params.id;
  if (!savId) return { success: false, message: "ID Tabungan wajib diberikan." };

  const savSheet = ss.getSheetByName("Savings");
  const rows = savSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(savId) && String(rows[i][1]) === String(userId)) {
      savSheet.deleteRow(i + 1);
      logAudit(ss, userId, "DELETE_SAVING", "SAVING", savId, "Hapus target tabungan");
      return { success: true, message: "Target tabungan berhasil dihapus." };
    }
  }
  return { success: false, message: "Target tabungan tidak ditemukan." };
}

/**
 * Monthly Budgets Management
 */
function getBudgets(ss, userId, params) {
  const month = params.month || getCurrentMonthStr();
  const budSheet = ss.getSheetByName("Budgets");
  const txSheet = ss.getSheetByName("Transactions");
  const budRows = budSheet ? budSheet.getDataRange().getValues() : [];
  const txRows = txSheet ? txSheet.getDataRange().getValues() : [];

  // Hitung pengeluaran aktual per kategori untuk bulan ini
  const actualExpenseMap = {};
  for (let i = 1; i < txRows.length; i++) {
    if (String(txRows[i][1]) === String(userId) && txRows[i][3] === "expense") {
      const txDate = formatDateStr(txRows[i][2]);
      if (txDate.startsWith(month)) {
        const cat = txRows[i][4];
        const amt = Number(txRows[i][7]) || 0;
        actualExpenseMap[cat] = (actualExpenseMap[cat] || 0) + amt;
      }
    }
  }

  const list = [];
  for (let i = 1; i < budRows.length; i++) {
    if (String(budRows[i][1]) === String(userId) && budRows[i][2] === month) {
      const cat = budRows[i][3];
      const bAmount = Number(budRows[i][4]) || 0;
      const actual = actualExpenseMap[cat] || 0;
      const remaining = bAmount - actual;
      const percent = bAmount > 0 ? (actual / bAmount) * 100 : 0;

      let status = "normal";
      if (percent >= 100) status = "over";
      else if (percent >= 80) status = "warning";

      list.push({
        id: budRows[i][0],
        userId: budRows[i][1],
        month: budRows[i][2],
        category: cat,
        budgetAmount: bAmount,
        actualExpense: actual,
        remaining: remaining,
        percentage: Math.round(percent * 100) / 100,
        status: status,
        createdAt: budRows[i][5]
      });
    }
  }

  return { success: true, data: list };
}

function setBudget(ss, userId, params) {
  const month = params.month || getCurrentMonthStr();
  const category = (params.category || "").trim();
  const budgetAmount = Number(params.budgetAmount);

  if (!category) return { success: false, message: "Kategori budget wajib diisi." };
  if (isNaN(budgetAmount) || budgetAmount < 0) return { success: false, message: "Nominal budget harus berupa angka valid." };

  const budSheet = ss.getSheetByName("Budgets");
  const rows = budSheet.getDataRange().getValues();

  // Cek apakah sudah ada budget untuk bulan dan kategori ini
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(userId) && rows[i][2] === month && rows[i][3] === category) {
      budSheet.getRange(i + 1, 5).setValue(budgetAmount);
      logAudit(ss, userId, "UPDATE_BUDGET", "BUDGET", rows[i][0], { month: month, category: category, amount: budgetAmount });
      return { success: true, message: "Budget kategori '" + category + "' berhasil diperbarui." };
    }
  }

  // Jika belum ada, buat baru
  const budId = "BUD-" + Utilities.getUuid().substring(0, 8);
  const now = new Date().toISOString();
  budSheet.appendRow([budId, userId, month, category, budgetAmount, now]);
  logAudit(ss, userId, "ADD_BUDGET", "BUDGET", budId, { month: month, category: category, amount: budgetAmount });

  return { success: true, message: "Budget berhasil disimpan.", data: { id: budId } };
}

function deleteBudget(ss, userId, params) {
  const budId = params.id;
  if (!budId) return { success: false, message: "ID Budget wajib diberikan." };

  const budSheet = ss.getSheetByName("Budgets");
  const rows = budSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(budId) && String(rows[i][1]) === String(userId)) {
      budSheet.deleteRow(i + 1);
      logAudit(ss, userId, "DELETE_BUDGET", "BUDGET", budId, "Hapus budget");
      return { success: true, message: "Budget berhasil dihapus." };
    }
  }
  return { success: false, message: "Budget tidak ditemukan." };
}

/**
 * Categories Management
 */
function getCategories(ss, userId, params) {
  const catSheet = ss.getSheetByName("Categories");
  const rows = catSheet ? catSheet.getDataRange().getValues() : [];
  const list = [];

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(userId)) {
      list.push({
        id: rows[i][0],
        userId: rows[i][1],
        name: rows[i][2],
        type: rows[i][3], // "income" or "expense"
        status: rows[i][4],
        createdAt: rows[i][5]
      });
    }
  }

  return { success: true, data: list };
}

function addCategory(ss, userId, params) {
  const name = (params.name || "").trim();
  const type = params.type || "expense"; // "income" or "expense"

  if (!name) return { success: false, message: "Nama kategori wajib diisi." };

  const catSheet = ss.getSheetByName("Categories");
  const catId = "CAT-" + Utilities.getUuid().substring(0, 8);
  const now = new Date().toISOString();

  catSheet.appendRow([catId, userId, name, type, "active", now]);
  logAudit(ss, userId, "ADD_CATEGORY", "CATEGORY", catId, { name: name, type: type });

  return { success: true, message: "Kategori berhasil ditambahkan.", data: { id: catId } };
}

function updateCategory(ss, userId, params) {
  const catId = params.id;
  if (!catId) return { success: false, message: "ID Kategori wajib diberikan." };

  const catSheet = ss.getSheetByName("Categories");
  const rows = catSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(catId) && String(rows[i][1]) === String(userId)) {
      const name = params.name || rows[i][2];
      const type = params.type || rows[i][3];
      const status = params.status || rows[i][4];

      catSheet.getRange(i + 1, 3, 1, 3).setValues([[name, type, status]]);
      logAudit(ss, userId, "UPDATE_CATEGORY", "CATEGORY", catId, { name: name, type: type, status: status });

      return { success: true, message: "Kategori berhasil diperbarui." };
    }
  }
  return { success: false, message: "Kategori tidak ditemukan." };
}

function deleteCategory(ss, userId, params) {
  const catId = params.id;
  if (!catId) return { success: false, message: "ID Kategori wajib diberikan." };

  const catSheet = ss.getSheetByName("Categories");
  const rows = catSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(catId) && String(rows[i][1]) === String(userId)) {
      catSheet.deleteRow(i + 1);
      logAudit(ss, userId, "DELETE_CATEGORY", "CATEGORY", catId, "Hapus kategori");
      return { success: true, message: "Kategori berhasil dihapus." };
    }
  }
  return { success: false, message: "Kategori tidak ditemukan." };
}

/**
 * Reports Data Engine
 */
function getReports(ss, userId, params) {
  const period = params.period || "month";
  const dateRange = computeDateRange(period, params.startDate, params.endDate);
  const startD = dateRange.start;
  const endD = dateRange.end;

  const txSheet = ss.getSheetByName("Transactions");
  const accSheet = ss.getSheetByName("Accounts");
  const txRows = txSheet ? txSheet.getDataRange().getValues() : [];
  const accRows = accSheet ? accSheet.getDataRange().getValues() : [];

  const accMap = {};
  for (let i = 1; i < accRows.length; i++) {
    if (String(accRows[i][1]) === String(userId)) {
      accMap[accRows[i][0]] = accRows[i][2];
    }
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const catSummary = {};
  const accSummary = {};
  const timeline = {};
  const reportTransactions = [];

  for (let i = 1; i < txRows.length; i++) {
    if (String(txRows[i][1]) === String(userId)) {
      const tDateStr = formatDateStr(txRows[i][2]);
      const tDate = new Date(tDateStr);

      if (tDate >= startD && tDate <= endD) {
        const type = txRows[i][3];
        const cat = txRows[i][4];
        const accId = txRows[i][6];
        const accName = accMap[accId] || "Rekening";
        const amt = Number(txRows[i][7]) || 0;

        if (type === "income") totalIncome += amt;
        if (type === "expense") totalExpense += amt;

        // Kategori Summary
        if (!catSummary[cat]) catSummary[cat] = { category: cat, type: type, total: 0, count: 0 };
        catSummary[cat].total += amt;
        catSummary[cat].count += 1;

        // Rekening Summary
        if (!accSummary[accName]) accSummary[accName] = { accountName: accName, income: 0, expense: 0, net: 0 };
        if (type === "income") accSummary[accName].income += amt;
        if (type === "expense") accSummary[accName].expense += amt;
        accSummary[accName].net = accSummary[accName].income - accSummary[accName].expense;

        // Timeline
        if (!timeline[tDateStr]) timeline[tDateStr] = { date: tDateStr, income: 0, expense: 0, net: 0 };
        if (type === "income") timeline[tDateStr].income += amt;
        if (type === "expense") timeline[tDateStr].expense += amt;
        timeline[tDateStr].net = timeline[tDateStr].income - timeline[tDateStr].expense;

        reportTransactions.push({
          id: txRows[i][0],
          date: tDateStr,
          type: type,
          category: cat,
          subcategory: txRows[i][5] || "",
          accountName: accName,
          amount: amt,
          description: txRows[i][8] || ""
        });
      }
    }
  }

  reportTransactions.sort(function(a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });

  return {
    success: true,
    data: {
      period: period,
      startDate: formatDateStr(startD),
      endDate: formatDateStr(endD),
      summary: {
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        netCashFlow: totalIncome - totalExpense,
        totalTransactions: reportTransactions.length
      },
      byCategory: Object.values(catSummary),
      byAccount: Object.values(accSummary),
      timeline: Object.values(timeline).sort(function(a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); }),
      transactions: reportTransactions
    }
  };
}

/**
 * Analytics Data Engine
 */
function getAnalytics(ss, userId, params) {
  const txSheet = ss.getSheetByName("Transactions");
  const txRows = txSheet ? txSheet.getDataRange().getValues() : [];

  const now = new Date();
  const currentMonthStr = getCurrentMonthStr();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = prevMonth.getFullYear() + "-" + String(prevMonth.getMonth() + 1).padStart(2, '0');

  let curIncome = 0, curExpense = 0;
  let prevIncome = 0, prevExpense = 0;
  let largestExpense = 0;
  let largestExpenseItem = null;
  const catCount = {};
  const catExpenseAmount = {};
  const monthlyTrends = {};

  for (let i = 1; i < txRows.length; i++) {
    if (String(txRows[i][1]) === String(userId)) {
      const tDateStr = formatDateStr(txRows[i][2]);
      const mStr = tDateStr.substring(0, 7);
      const type = txRows[i][3];
      const cat = txRows[i][4];
      const amt = Number(txRows[i][7]) || 0;

      // Inisialisasi trend bulanan (6-12 bulan terakhir)
      if (!monthlyTrends[mStr]) monthlyTrends[mStr] = { month: mStr, income: 0, expense: 0, net: 0 };
      if (type === "income") monthlyTrends[mStr].income += amt;
      if (type === "expense") monthlyTrends[mStr].expense += amt;
      monthlyTrends[mStr].net = monthlyTrends[mStr].income - monthlyTrends[mStr].expense;

      // Bulan Berjalan
      if (mStr === currentMonthStr) {
        if (type === "income") curIncome += amt;
        if (type === "expense") {
          curExpense += amt;
          catExpenseAmount[cat] = (catExpenseAmount[cat] || 0) + amt;
          catCount[cat] = (catCount[cat] || 0) + 1;
          if (amt > largestExpense) {
            largestExpense = amt;
            largestExpenseItem = {
              category: cat,
              amount: amt,
              date: tDateStr,
              description: txRows[i][8] || ""
            };
          }
        }
      }

      // Bulan Lalu
      if (mStr === prevMonthStr) {
        if (type === "income") prevIncome += amt;
        if (type === "expense") prevExpense += amt;
      }
    }
  }

  // Cari Largest Category & Most Frequent
  let largestCategory = "-";
  let largestCatAmount = 0;
  Object.keys(catExpenseAmount).forEach(function(c) {
    if (catExpenseAmount[c] > largestCatAmount) {
      largestCatAmount = catExpenseAmount[c];
      largestCategory = c;
    }
  });

  let mostFrequentCategory = "-";
  let maxCount = 0;
  Object.keys(catCount).forEach(function(c) {
    if (catCount[c] > maxCount) {
      maxCount = catCount[c];
      mostFrequentCategory = c;
    }
  });

  const curDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate() || 1;
  const avgDailySpending = curExpense > 0 ? Math.round(curExpense / currentDay) : 0;
  const savingRate = curIncome > 0 ? Math.round(((curIncome - curExpense) / curIncome) * 1000) / 10 : 0;

  const expenseMoMChange = prevExpense > 0 ? Math.round(((curExpense - prevExpense) / prevExpense) * 1000) / 10 : 0;
  const incomeMoMChange = prevIncome > 0 ? Math.round(((curIncome - prevIncome) / prevIncome) * 1000) / 10 : 0;

  const sortedTrends = Object.values(monthlyTrends).sort(function(a, b) {
    return a.month.localeCompare(b.month);
  });

  return {
    success: true,
    data: {
      metrics: {
        totalIncome: curIncome,
        totalExpense: curExpense,
        netCashFlow: curIncome - curExpense,
        savingRate: savingRate,
        avgDailySpending: avgDailySpending,
        avgMonthlySpending: curExpense,
        largestExpense: largestExpenseItem,
        largestExpenseCategory: { name: largestCategory, amount: largestCatAmount },
        mostFrequentCategory: { name: mostFrequentCategory, count: maxCount },
        mom: {
          expenseChangePercent: expenseMoMChange,
          incomeChangePercent: incomeMoMChange,
          prevMonthIncome: prevIncome,
          prevMonthExpense: prevExpense
        }
      },
      monthlyTrends: sortedTrends
    }
  };
}

/**
 * Audit Logs Retrieval
 */
function getAuditLogs(ss, userId, params) {
  const sheet = ss.getSheetByName("Audit_Log");
  const rows = sheet ? sheet.getDataRange().getValues() : [];
  const logs = [];

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(userId)) {
      logs.push({
        id: rows[i][0],
        userId: rows[i][1],
        action: rows[i][2],
        module: rows[i][3],
        recordId: rows[i][4],
        timestamp: rows[i][5],
        details: rows[i][6]
      });
    }
  }

  logs.sort(function(a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); });
  return { success: true, data: logs.slice(0, 100) };
}

/**
 * Profile & Security
 */
function updateProfile(ss, userId, params) {
  const name = (params.name || "").trim();
  if (!name) return { success: false, message: "Nama tidak boleh kosong." };

  const usersSheet = ss.getSheetByName("Users");
  const rows = usersSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(userId)) {
      usersSheet.getRange(i + 1, 2).setValue(name);
      logAudit(ss, userId, "UPDATE_PROFILE", "USER", userId, { name: name });
      return { success: true, message: "Profil berhasil diperbarui." };
    }
  }
  return { success: false, message: "User tidak ditemukan." };
}

function changePassword(ss, userId, params) {
  const oldPassword = params.oldPassword || "";
  const newPassword = params.newPassword || "";

  if (!oldPassword || !newPassword) {
    return { success: false, message: "Kata sandi lama dan kata sandi baru wajib diisi." };
  }
  if (newPassword.length < 6) {
    return { success: false, message: "Kata sandi baru minimal 6 karakter." };
  }

  const usersSheet = ss.getSheetByName("Users");
  const rows = usersSheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(userId)) {
      const storedHash = String(rows[i][3]);
      if (storedHash !== hashPassword(oldPassword)) {
        return { success: false, message: "Kata sandi saat ini tidak cocok." };
      }

      usersSheet.getRange(i + 1, 4).setValue(hashPassword(newPassword));
      logAudit(ss, userId, "CHANGE_PASSWORD", "SECURITY", userId, "User mengganti kata sandi");
      return { success: true, message: "Kata sandi berhasil diperbarui." };
    }
  }
  return { success: false, message: "User tidak ditemukan." };
}

/**
 * Utility Functions
 */
function formatDateStr(dateObj) {
  if (!dateObj) return "";
  if (typeof dateObj === "string") {
    if (dateObj.length >= 10 && dateObj.indexOf("-") > -1) return dateObj.substring(0, 10);
  }
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + "-" + month + "-" + day;
}

function getCurrentMonthStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return year + "-" + month;
}

function formatRupiahStr(num) {
  if (num === null || num === undefined) return "Rp 0";
  return "Rp " + Number(num).toLocaleString('id-ID');
}

function computeDateRange(period, customStart, customEnd) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = new Date(today);
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case "today":
      start = new Date(today);
      break;
    case "week":
      const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ...
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(today.getDate() + diffToMon);
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "prev_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "all":
      start = new Date(2000, 0, 1);
      break;
    case "custom":
      if (customStart) start = new Date(customStart + "T00:00:00");
      if (customEnd) end = new Date(customEnd + "T23:59:59");
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }
  return { start: start, end: end };
}
