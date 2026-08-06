/**
 * Motor de Precificação (Pricing Engine)
 * Responsável por centralizar toda a matemática de orçamentos e catálogos.
 * TODAS AS FUNÇÕES TRABALHAM COM CENTAVOS (Integer Math) PARA PREVENIR ERROS DE PONTO FLUTUANTE.
 */

/**
 * Calcula o preço de venda de um insumo/serviço usando Markup Reverso.
 * Fórmula: Preço = Custo / (1 - ((Imposto + Margem) / 100))
 *
 * @param costCents Custo Base (em centavos)
 * @param taxPercent Carga Tributária embutida (em %)
 * @param marginPercent Margem de Lucro Desejada (em %)
 * @returns Preço de venda calculado (em centavos)
 */
export function calculateItemSalePrice(costCents: number, taxPercent: number, marginPercent: number): number {
  const totalDeductions = (taxPercent + marginPercent) / 100;

  // Trava de segurança: impede divisão por zero ou negativa (margem + imposto >= 100%)
  if (totalDeductions >= 1) {
    return costCents;
  }

  return Math.round(costCents / (1 - totalDeductions));
}

export interface BudgetItem {
  costCents: number;
  priceCents: number;
  quantity: number;
}

export interface WorkOrderTotals {
  totalCostCents: number;
  totalPriceCents: number;
  realMarginCents: number;
}

/**
 * Calcula os totais de uma Ordem de Serviço, agregando insumos, deslocamento e mão de obra.
 *
 * @param items Array de itens adicionados ao orçamento
 * @param displacementKm Quilômetros percorridos (Float)
 * @param costPerKmCents Custo configurado por Km (em centavos)
 * @param laborHours Horas técnicas aplicadas (Float)
 * @param hourlyRateCents Valor da hora técnica configurado (em centavos)
 * @returns Objeto contendo os totais agregados (Custo Total, Preço Total, Margem Real)
 */
export function calculateWorkOrderTotals(
  items: BudgetItem[],
  displacementKm: number,
  costPerKmCents: number,
  laborHours: number,
  hourlyRateCents: number
): WorkOrderTotals {

  // 1. Totalizar Insumos
  let itemsTotalCost = 0;
  let itemsTotalPrice = 0;

  for (const item of items) {
    itemsTotalCost += item.costCents * item.quantity;
    itemsTotalPrice += item.priceCents * item.quantity;
  }

  // 2. Calcular Deslocamento (Custo = Preço Repassado)
  const displacementTotalCents = Math.round(displacementKm * costPerKmCents);

  // 3. Calcular Mão de Obra (Custo = Preço Repassado)
  const laborTotalCents = Math.round(laborHours * hourlyRateCents);

  // 4. Somatórios Globais
  const totalCostCents = itemsTotalCost + displacementTotalCents + laborTotalCents;
  const totalPriceCents = itemsTotalPrice + displacementTotalCents + laborTotalCents;
  const realMarginCents = totalPriceCents - totalCostCents; // Equivale ao lucro obtido nos insumos

  return {
    totalCostCents,
    totalPriceCents,
    realMarginCents
  };
}
