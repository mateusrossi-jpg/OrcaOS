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

  it('sanitizes invalid negative values to zero instead of throwing', () => {
    const result = calculateProjectMargin({ total_servicos: 100, custo_materiais: -1 });
    expect(result.custo_materiais).toBe(0);
    expect(result.lucro_liquido).toBe(100);
  });

  it('clamps tax rates above 100 percent to 100', () => {
    const result = calculateProjectMargin({ total_servicos: 100, aliquota_imposto: 101 });
    expect(result.aliquota_imposto).toBe(100);
  });
});
