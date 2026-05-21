import type { CalculationCapture } from '../../../core/types/workflow';
import { PremiumCatalogWorkspace } from './PremiumCatalogWorkspace';
import './SupplierProfileWorkspace.css';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceWithTaxProps) {
  return (
    <section className="catalog-hub-organized">
      <p className="catalog-beta-context">Itens e serviços já validados para reutilizar no campo e no orçamento.</p>
      <PremiumCatalogWorkspace />
    </section>
  );
}
