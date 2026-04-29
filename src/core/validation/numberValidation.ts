export function ensurePositiveNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} deve ser um número válido.`);
  }

  if (value <= 0) {
    throw new Error(`${fieldName} deve ser maior que zero.`);
  }
}

export function ensurePowerFactor(value: number): void {
  if (!Number.isFinite(value) || value <= 0 || value > 1) {
    throw new Error('Fator de potência deve estar entre 0 e 1.');
  }
}
