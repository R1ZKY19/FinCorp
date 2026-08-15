import { formatRupiah, formatDate } from './formatters';

/**
 * Export data array ke file CSV
 */
export function exportToCSV(data, filename = 'laporan-keuangan.csv', headers = null) {
  if (!data || !data.length) return;

  const columnHeaders = headers || Object.keys(data[0]);
  const csvRows = [];

  // Tambahkan baris header
  csvRows.push(columnHeaders.map(h => `"${h}"`).join(','));

  // Tambahkan baris data
  for (const row of data) {
    const values = columnHeaders.map(header => {
      const val = row[header] !== undefined ? row[header] : '';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper untuk Cetak Halaman / Save to PDF
 */
export function printDocument() {
  window.print();
}
