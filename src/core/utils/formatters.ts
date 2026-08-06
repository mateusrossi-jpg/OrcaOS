/**
 * Aferix OS - Global Utility Formatters
 * Centraliza as lógicas de conversão visual para garantir Single Source of Truth
 */

/**
 * Formata um valor centesimal absoluto (integer math) para a moeda local BRL.
 * Isso garante que toda a aplicação exiba os valores de forma uniforme,
 * protegendo-se contra divisões manuais por 100 espalhadas no código.
 *
 * @param cents Valor da moeda armazenado em centavos (ex: 1845000 = R$ 18.450,00)
 */
export function formatCurrencyFromCents(cents: number): string {
  // Tratamento defensivo contra NaN e indefinidos
  if (cents === null || cents === undefined || isNaN(cents)) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
  }

  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

/**
 * Motor Matemático de Formação de Preço (Integer Math + Markup Reverso)
 * Preço de Venda = Custo / (1 - ((Imposto + Margem) / 100))
 *
 * @param costCents Custo Base (em centavos)
 * @param taxPercent Carga Tributária (em %)
 * @param marginPercent Margem de Lucro Desejada (em %)
 */
export function calculateSalePrice(costCents: number, taxPercent: number, marginPercent: number): number {
  const totalDeductions = (taxPercent + marginPercent) / 100;

  // Trava de segurança para impedir divisão por zero ou negativa (margem + imposto >= 100%)
  if (totalDeductions >= 1) {
    return costCents;
  }

  return Math.round(costCents / (1 - totalDeductions));
}

/**
 * Formata um valor de data para exibições relativas de UX como "Amanhã" ou "Dia X".
 * @param isoString Timestamp ISO 8601
 */
export function formatRelativeDueDate(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
  if (date.toDateString() === now.toDateString()) return 'Hoje';

  return `Dia ${date.getDate()}`;
}

/**
 * Formata um valor de data para o histórico em tempo passado como "Hoje", "Ontem" ou "Mês passado"
 * @param isoDateString Timestamp ISO 8601
 */
export function formatPastRelativeDate(isoDateString?: string): string {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays > 25 && diffDays <= 35) return 'Mês passado';

  return date.toLocaleDateString('pt-BR');
}
