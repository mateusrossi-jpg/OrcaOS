import type { CalculationCapture } from '../../../core/types/workflow';
import { PremiumCatalogWorkspace } from './PremiumCatalogWorkspace';
import type { CatalogHubItem } from '../types/catalogTypes';
import './SupplierProfileWorkspace.css';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

function convertToCapture(item: CatalogHubItem): CalculationCapture {
  return {
    id: `cap-${item.id}-${Date.now()}`,
    module: 'orcamentoTecnico',
    moduleLabel: 'Catálogo',
    calculatorLabel: item.kind,
    destination: item.destination,
    createdAt: new Date().toISOString(),
    summary: `${item.title} (${item.defaultQuantity} ${item.unit})`,
    details: [item.title, `Unidade: ${item.unit}`, `Valor: ${item.defaultUnitValue}`],
    itemType: item.itemType || 'material',
    editableDescription: item.title,
    technicalNote: item.notes || '',
    quantity: String(item.defaultQuantity),
    unitValue: String(item.defaultUnitValue),
    shouldGenerateBudgetItem: true,
    convertedToBudgetItem: false,
    reportReady: true,
  };
}

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceWithTaxProps) {
  const handleSelect = (items: CatalogHubItem[]) => {
    onSendToBudget(items.map(convertToCapture));
  };

  return (
    <section className="catalog-hub-organized">
      <p className="catalog-beta-context">Itens e serviços já validados para reutilizar no campo e no orçamento.</p>
      <PremiumCatalogWorkspace onSendToBudget={handleSelect} />
    </section>
  );
}
