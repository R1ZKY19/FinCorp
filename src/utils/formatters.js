/**
 * Format angka ke format Rupiah Indonesia
 * Contoh: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount, withPrefix = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return withPrefix ? "Rp 0" : "0";
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  if (isNegative) {
    return withPrefix ? `-Rp ${formatted}` : `-${formatted}`;
  }
  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Parsing string format Rupiah ke nilai numerik murni
 * Contoh: "Rp 1.500.000" atau "1.500.000" -> 1500000
 */
export function parseRupiah(str) {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const cleanStr = str.toString().replace(/[^0-9-]/g, "");
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Format Tanggal Bahasa Indonesia
 * Contoh: "2026-08-16" -> "16 Agustus 2026" atau "16 Agu 2026"
 */
export function formatDate(dateString, shortMonth = false) {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const monthsFull = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthsShort = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];

    const day = d.getDate();
    const month = shortMonth ? monthsShort[d.getMonth()] : monthsFull[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateString;
  }
}

/**
 * Format Tanggal & Waktu Lengkap
 */
export function formatDateTime(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const dateFormatted = formatDate(isoString, true);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateFormatted}, ${hours}:${minutes}`;
  } catch (e) {
    return isoString;
  }
}

/**
 * Format Persentase
 * Contoh: 0.5667 -> "56,67%"
 */
export function formatPercent(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return "0%";
  const val = Number(num).toFixed(decimals).replace(".", ",");
  return `${val}%`;
}
