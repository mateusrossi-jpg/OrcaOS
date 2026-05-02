import { useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { CatalogHubWorkspace as CatalogHubWorkspaceLive } from './CatalogHubWorkspaceLive';
import { PurchaseToCatalogBridge } from './PurchaseToCatalogBridge';
import { SupplierProfileWorkspace } from './SupplierProfileWorkspace';
import { SupplierTaxMarginWorkspace } from './SupplierTaxMarginWorkspace';
import './SupplierProfileWorkspace.css';
import './SupplierTaxMarginWorkspace.css';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

type CatalogHubSection = 'items' | 'suppliers' | 'purchases' | 'tax';

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceWithTaxProps) {
  const [activeSection, setActiveSection] = useState<CatalogHubSection>('items');

  return (
    <section className="catalog-hub-organized">
      <div className="section-mode-tabs">
        <button className={activeSection === 'items' ? 'active' : ''} type="button" onClick={() => setActiveSection('items')}>Itens</button>
        <button className={activeSection === 'suppliers' ? 'active' : ''} type="button" onClick={() => setActiveSection('suppliers')}>Fornecedores</button>
        <button className={activeSection === 'purchases' ? 'active' : ''} type="button" onClick={() => setActiveSection('purchases')}>Compras</button>
        <button className={activeSection === 'tax' ? 'active' : ''} type="button" onClick={() => setActiveSection('tax')}>Impostos e margem</button>
      </div>

      {activeSection === 'items' && <CatalogHubWorkspaceLive onSendToBudget={onSendToBudget} />}
      {activeSection === 'suppliers' && <SupplierProfileWorkspace />}
      {activeSection === 'purchases' && <PurchaseToCatalogBridge />}
      {activeSection === 'tax' && <SupplierTaxMarginWorkspace />}
    </section>
  );
}
