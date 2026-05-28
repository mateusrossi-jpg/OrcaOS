import type { CalculationCapture } from '../../../core/types/workflow';
import { PremiumCatalogWorkspace } from './PremiumCatalogWorkspace';
import type { CatalogHubItem } from '../types/catalogTypes';
import { Surface } from '../../../app/components/ui';

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

/**
 * CatalogHubWorkspace: O hub de inteligência de itens.
 * Refatorado para o padrão V5: Centered and Purified.
 */
export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceWithTaxProps) {
  const handleSelect = (items: CatalogHubItem[]) => {
    onSendToBudget(items.map(convertToCapture));
  };

  return (
    <div className="catalog-hub-container" style={{ maxWidth: '440px', margin: '0 auto' }}>
      <Surface elevation={0} padding="md" className="aferix-mb-md">
        <p className="aferix-text-muted text-small">Biblioteca de materiais e serviços pré-configurados para agilizar seus orçamentos.</p>
      </Surface>
      
      <PremiumCatalogWorkspace onSendToBudget={handleSelect} />
    </div>
  );
}
