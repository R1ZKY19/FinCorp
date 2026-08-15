/**
 * Utility Perhitungan Keuangan
 */

export function calculateSavingRate(income, expense) {
  if (!income || income <= 0) return 0;
  const net = income - expense;
  return Math.max(0, Math.round((net / income) * 1000) / 10);
}

export function calculateBudgetProgress(actual, budget) {
  if (!budget || budget <= 0) return 0;
  return Math.round((actual / budget) * 10000) / 100;
}

export function getBudgetStatus(actual, budget) {
  const percentage = calculateBudgetProgress(actual, budget);
  if (percentage >= 100) return { status: 'over', label: 'Melewati Budget', color: 'red' };
  if (percentage >= 80) return { status: 'warning', label: 'Hampir Habis', color: 'amber' };
  return { status: 'normal', label: 'Normal', color: 'emerald' };
}
