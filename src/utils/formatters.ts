export function safeMoneyValue(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  if (!Number.isFinite(num)) {
    if (import.meta.env.DEV) {
      console.warn(`[Aferix Hardening] Invalid money value detected:`, value);
    }
    return 0;
  }
  return num;
}

export function formatCurrencyBRL(value: number): string {
  const safeValue = isNaN(value) || value === null || value === undefined ? 0 : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safeValue);
}

export function formatPercent(value: number): string {
  const safeValue = isNaN(value) || value === null || value === undefined ? 0 : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(safeValue / 100);
}
