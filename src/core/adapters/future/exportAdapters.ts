import type { Budget } from '../../types/business';
import type { TaxProfile, ExportProvider } from '../../types/future-contracts';

/**
 * Adapter Shell: Preparação arquitetural para exportação fiscal futura.
 * Esta função não possui implementação real e não deve ser chamada na UI atual.
 * Ela serve como contrato para garantir que a entidade Budget possa ser convertida sem acoplamento.
 */
export function formatBudgetForTaxExport(_budget: Budget, _taxProfile: TaxProfile, _provider: ExportProvider): string | null {
  // TODO(Scale): Implementar mapeamento de itens do orçamento para NCM/CFOP quando o módulo fiscal for ativado.
  // Retorna null por enquanto para garantir invisibilidade e segurança.
  return null;
}
