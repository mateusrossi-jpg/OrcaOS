import { useMemo } from 'react';
import { formatCurrency, lineTotal } from '../../utils/guidedBudgetUtils';
import type { GuidedLine } from '../../types/guidedBudget';

interface GuidedBudgetCartHeaderProps {
  lines: GuidedLine[];
}

export function GuidedBudgetCartHeader({ lines }: GuidedBudgetCartHeaderProps) {
  const environmentGroups = useMemo(() => {
    const groups = new Map<string, GuidedLine[]>();
    lines.forEach((line) => groups.set(line.environment || 'Sem ambiente', [...(groups.get(line.environment || 'Sem ambiente') ?? []), line]));
    return Array.from(groups.entries()).map(([name, groupLines]) => ({
      name,
      lines: groupLines,
      itemCount: groupLines.length,
      totalQuantity: groupLines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: groupLines.reduce((sum, line) => sum + lineTotal(line), 0),
      materialSubtotal: groupLines.filter((line) => line.itemType === 'material').reduce((sum, line) => sum + lineTotal(line), 0),
      serviceSubtotal: groupLines.filter((line) => line.itemType === 'service').reduce((sum, line) => sum + lineTotal(line), 0),
    }));
  }, [lines]);
  const totalValue = environmentGroups.reduce((sum, group) => sum + group.subtotal, 0);
  const totalQuantity = environmentGroups.reduce((sum, group) => sum + group.totalQuantity, 0);

  return (
    <div className="guided-cart-header">
      <div>
        <h2>Orçamento por ambiente</h2>
        <p>Escolha um cômodo cadastrado, monte mão de obra, peças e kits, e envie ao fluxo.</p>
      </div>
      <div className="guided-cart-total">
        <span>{totalQuantity} unidade(s)</span>
        <strong>{formatCurrency(totalValue)}</strong>
      </div>
    </div>
  );
}