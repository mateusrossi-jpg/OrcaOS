import { generateUUID } from '../../../core/utils/idGenerator';
import type { CalculationCapture } from '../../../core/types/workflow';
import { PremiumCatalogWorkspace } from './PremiumCatalogWorkspace';
import type { CatalogHubItem } from '../types/catalogTypes';
import { ContextBanner } from '../../../app/components/ui';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  onBack?: () => void;
}

function convertToCapture(item: CatalogHubItem): CalculationCapture {
  const qty = item.defaultQuantity || 1;
  const val = item.defaultUnitValue || 0;
  const subtotal = qty * val;
  const moneyStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const subtotalStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal);

  return {
    id: generateUUID(),
    module: 'orcamentoTecnico',
    moduleLabel: 'Catálogo profissional',
    calculatorLabel: item.kind === 'labor' ? 'Mão de Obra / Serviço' : 'Material / Equipamento',
    destination: item.destination || 'both',
    createdAt: new Date().toISOString(),
    summary: `${item.title} · ${qty} ${item.unit || 'un'} × ${moneyStr}`,
    details: [
      `Tipo: ${item.kind === 'labor' ? 'Mão de Obra / Serviço' : 'Material / Equipamento'}`,
      `Categoria: ${item.category || 'não informada'}`,
      `Marca: ${item.brand || 'não informada'}`,
      `Modelo: ${item.model || 'não informado'}`,
      `Referência: ${item.reference || 'não informada'}`,
      `Unidade: ${item.unit || 'un'}`,
      `Quantidade padrão: ${qty}`,
      `Valor unitário: ${moneyStr}`,
      `Subtotal: ${subtotalStr}`,
    ],
    itemType: item.itemType || (item.kind === 'labor' ? 'service' : 'material'),
    editableDescription: item.title,
    technicalNote: item.notes || 'Item vindo do catálogo profissional.',
    quantity: String(qty),
    unitValue: String(val),
    shouldGenerateBudgetItem: item.destination !== 'survey',
    convertedToBudgetItem: false,
    reportReady: item.destination === 'survey' || item.destination === 'both',
    clientId: '',
    workOrderId: ''
  };
}

/**
 * CatalogHubWorkspace: O hub de inteligência de itens.
 * Refatorado para o padrão V5: Centered and Purified.
 */
export function CatalogHubWorkspace({ onSendToBudget, onBack }: CatalogHubWorkspaceWithTaxProps) {
  const handleSelect = (items: CatalogHubItem[]) => {
    onSendToBudget(items.map(convertToCapture));
  };

  return (
    <PremiumCatalogWorkspace onSendToBudget={handleSelect} onBack={onBack} />
  );
}
