/**
 * Utilitários de formatação e manipulação de números.
 */

/**
 * Arredonda um número para uma quantidade específica de casas decimais.
 * Garante que o retorno seja um número finito (retorna 0 se for NaN ou Infinity).
 */
export function roundTechnical(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Alias comercial para arredondamento técnico.
 */
export const roundTrade = roundTechnical;
