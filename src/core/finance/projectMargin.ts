export interface ProjectMarginInput {
  total_servicos?: number;
  custo_materiais?: number;
  custos_operacionais?: number;
  aliquota_imposto?: number;
  totalServices?: number;
  materialCost?: number;
  operationalCosts?: number;
  taxRate?: number;
}

export interface ProjectMarginResult {
  total_servicos: number;
  custo_materiais: number;
  custos_operacionais: number;
  aliquota_imposto: number;
  valor_impostos: number;
  custos_totais: number;
  lucro_liquido: number;
  margem_percentual: number;
  netFinalValue: number;
  marginPercent: number;
}

function safeMoney(value: number | undefined, label: string): number {
  const amount = value ?? 0;
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${label} não pode ser negativo ou inválido.`);
  }
  return amount;
}

export function calculateProjectMargin(input: ProjectMarginInput): ProjectMarginResult {
  const totalServicos = safeMoney(input.total_servicos ?? input.totalServices, 'Total de serviços');
  const custoMateriais = safeMoney(input.custo_materiais ?? input.materialCost, 'Custo de materiais');
  const custosOperacionais = safeMoney(input.custos_operacionais ?? input.operationalCosts, 'Custos operacionais');
  const aliquotaImposto = safeMoney(input.aliquota_imposto ?? input.taxRate, 'Alíquota de imposto');

  if (aliquotaImposto > 100) {
    throw new Error('Alíquota de imposto não pode ser maior que 100%.');
  }

  const valorImpostos = totalServicos * aliquotaImposto / 100;
  const custosTotais = custoMateriais + custosOperacionais + valorImpostos;
  const lucroLiquido = totalServicos - custosTotais;
  const margemPercentual = totalServicos > 0 ? lucroLiquido / totalServicos * 100 : 0;

  return {
    total_servicos: totalServicos,
    custo_materiais: custoMateriais,
    custos_operacionais: custosOperacionais,
    aliquota_imposto: aliquotaImposto,
    valor_impostos: valorImpostos,
    custos_totais: custosTotais,
    lucro_liquido: lucroLiquido,
    margem_percentual: margemPercentual,
    netFinalValue: lucroLiquido,
    marginPercent: margemPercentual,
  };
}
