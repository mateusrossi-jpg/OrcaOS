import { describe, expect, it } from 'vitest';
import { calculateProjectMargin } from './projectMargin';

describe('calculateProjectMargin', () => {
  it('returns net value and margin percent for a project', () => {
    const result = calculateProjectMargin({
      total_servicos: 1000,
      custo_materiais: 250,
      custos_operacionais: 100,
      aliquota_imposto: 6,
    });

    expect(result.valor_impostos).toBe(60);
    expect(result.custos_totais).toBe(410);
    expect(result.lucro_liquido).toBe(590);
    expect(result.margem_percentual).toBe(59);
    expect(result.netFinalValue).toBe(590);
    expect(result.marginPercent).toBe(59);
  });

  it('rejects invalid negative values', () => {
    expect(() => calculateProjectMargin({ total_servicos: 100, custo_materiais: -1 })).toThrow('Custo de materiais');
  });

  it('rejects tax rates above 100 percent', () => {
    expect(() => calculateProjectMargin({ total_servicos: 100, aliquota_imposto: 101 })).toThrow('Alíquota');
  });
});
