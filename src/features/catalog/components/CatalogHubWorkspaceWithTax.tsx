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

type CatalogHubSection = 'catalog' | 'online' | 'suppliers' | 'purchases' | 'pricing';

const sectionCopy: Record<CatalogHubSection, { title: string; text: string }> = {
  catalog: {
    title: 'Catálogo',
    text: 'Itens e serviços já validados para reutilizar no campo e no orçamento.',
  },
  online: {
    title: 'Busca online',
    text: 'Pesquise produto real no fornecedor e traga modelo, preço e referência para o catálogo.',
  },
  suppliers: {
    title: 'Fornecedores',
    text: 'Cadastro fiscal e gerencial de lojas, distribuidores, fabricantes e contatos de compra.',
  },
  purchases: {
    title: 'Compras e estoque',
    text: 'Transforme compras já lançadas em itens de catálogo ou novos lotes de estoque.',
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
      <header className="screen-header">
        <h1>Catálogo e Estoque</h1>
      </header>

      <div className="home-action-toolbar">
        <button className={`ghost-action ${activeSection === 'catalog' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('catalog')}>Itens</button>
        <button className={`ghost-action ${activeSection === 'suppliers' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('suppliers')}>Fornecedores</button>
        <button className={`ghost-action ${activeSection === 'pricing' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('pricing')}>Margem</button>
        <button className={`ghost-action ${activeSection === 'online' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('online')}>Busca Online</button>
        <button className={`ghost-action ${activeSection === 'purchases' ? 'active' : ''}`} type="button" onClick={() => setActiveSection('purchases')}>Estoque</button>
      </div>

      {activeSection === 'catalog' && <CatalogHubWorkspaceLive enabledTabs={['items']} onSendToBudget={onSendToBudget} />}
      {activeSection === 'online' && <CatalogHubWorkspaceLive initialTab="online" enabledTabs={['online']} onSendToBudget={onSendToBudget} />}
      {activeSection === 'suppliers' && <SupplierProfileWorkspace />}
      {activeSection === 'purchases' && <PurchaseToCatalogBridge />}
      {activeSection === 'pricing' && <SupplierTaxMarginWorkspace />}
    </section>
  );
}
