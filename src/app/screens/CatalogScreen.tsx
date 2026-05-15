import { lazy } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { ActiveWorkContext } from '../orcaAppTypes';
import { ActiveWorkContextCard } from '../components/ActiveWorkContextCard';

const CatalogHubWorkspace = lazy(() => import('../../features/catalog/components/CatalogHubWorkspaceWithTax').then((module) => ({ default: module.CatalogHubWorkspace })));

interface CatalogScreenProps {
  onAddMany: (items: CalculationCapture[]) => void;
  context: ActiveWorkContext;
}

export function CatalogScreen({ onAddMany, context }: CatalogScreenProps) {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Estoque e catálogo</h1>
        <p>Catálogo local para apoiar proposta e compra.</p>
      </header>
      <ActiveWorkContextCard {...context} />
      <CatalogHubWorkspace onSendToBudget={onAddMany} />
    </section>
  );
}
