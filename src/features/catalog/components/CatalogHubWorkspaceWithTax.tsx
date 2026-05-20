import { useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { CatalogHubWorkspace as CatalogHubWorkspaceLive } from './CatalogHubWorkspaceLive';
import { SupplierTaxMarginWorkspace } from './SupplierTaxMarginWorkspace';
import './SupplierProfileWorkspace.css';
import './SupplierTaxMarginWorkspace.css';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

type CatalogHubSection = 'catalog' | 'pricing';

const sectionCopy: Record<CatalogHubSection, { title: string; text: string }> = {
  catalog: {
    title: 'Catálogo',
    text: 'Itens e serviços já validados para reutilizar no campo e no orçamento.',
  },
  pricing: {
    title: 'Preço e margem',
    text: 'Lance compra, impostos, custos extras e margem para chegar ao preço viável.',
  },
};

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceWithTaxProps) {
  const [activeSection, setActiveSection] = useState<CatalogHubSection>('catalog');
  const activeCopy = sectionCopy[activeSection];

  return (
    <section className="catalog-hub-organized">
      <div className="catalog-beta-switcher" role="tablist" aria-label="Área do catálogo">
        <button className={activeSection === 'catalog' ? 'active' : ''} type="button" role="tab" aria-selected={activeSection === 'catalog'} onClick={() => setActiveSection('catalog')}>
          Catálogo
        </button>
        <button className={activeSection === 'pricing' ? 'active' : ''} type="button" role="tab" aria-selected={activeSection === 'pricing'} onClick={() => setActiveSection('pricing')}>
          Margem
        </button>
      </div>
      <p className="catalog-beta-context">{activeCopy.text}</p>

      {activeSection === 'catalog' && <CatalogHubWorkspaceLive enabledTabs={['items']} onSendToBudget={onSendToBudget} />}
      {activeSection === 'pricing' && <SupplierTaxMarginWorkspace />}
    </section>
  );
}
