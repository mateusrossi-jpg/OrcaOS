import { financialSafety } from './financialSafety';

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

export function calculateProjectMargin(input: ProjectMarginInput): ProjectMarginResult {
  const totalServicos = financialSafety.safeCurrency(input.total_servicos ?? input.totalServices);
  const custoMateriais = financialSafety.safeCurrency(input.custo_materiais ?? input.materialCost);
  const custosOperacionais = financialSafety.safeCurrency(input.custos_operacionais ?? input.operationalCosts);
  const aliquotaImposto = financialSafety.safePercentage(input.aliquota_imposto ?? input.taxRate);

  const valorImpostos = financialSafety.normalizeMoney((totalServicos * aliquotaImposto) / 100);
  const custosTotais = financialSafety.normalizeMoney(custoMateriais + custosOperacionais + valorImpostos);
  
  const lucroLiquido = financialSafety.normalizeMoney(totalServicos - custosTotais);
  
  // Safe division for margin
  let margemPercentual = 0;
  if (totalServicos > 0) {
    margemPercentual = financialSafety.normalizeMoney((lucroLiquido / totalServicos) * 100);
  }

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
