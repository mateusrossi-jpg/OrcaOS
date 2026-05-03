export function formatDecimalPtBr(value: number, maximumFractionDigits = 2, minimumFractionDigits = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatKilowattsFromWatts(watts: number): string {
  const kilowatts = watts / 1000;
  const absValue = Math.abs(kilowatts);
  const maximumFractionDigits = absValue > 0 && absValue < 0.01 ? 4 : 3;

  return `${formatDecimalPtBr(kilowatts, maximumFractionDigits)} kW`;
}

