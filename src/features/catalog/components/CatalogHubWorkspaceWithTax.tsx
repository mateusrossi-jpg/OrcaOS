import type { CalculationCapture } from '../../../core/types/workflow';
import { PremiumCatalogWorkspace } from './PremiumCatalogWorkspace';
import type { CatalogHubItem } from '../types/catalogTypes';
import { ContextBanner } from '../../../app/components/ui';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

function convertToCapture(item: CatalogHubItem): CalculationCapture {
  return {
    id: crypto.randomUUID(),
    title: item.title,
    clientId: '',
    workOrderId: '',
    category: item.kind === 'labor' ? 'service' : 'material',
    description: item.title,
    quantity: item.defaultQuantity || 1,
    unitValue: item.defaultUnitValue || 0,
    markup: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    <div className="flex flex-col gap-6">
      <ContextBanner
        title="Biblioteca Inteligente"
        meta="Materiais e serviços pré-configurados para agilizar seus orçamentos técnicos."
        icon="📚"
      />
      
      <PremiumCatalogWorkspace onSendToBudget={handleSelect} />
    </div>
  );
}
