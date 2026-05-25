import { lazy } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import { PageHeader, PageShell } from '../components/ui';

const CatalogHubWorkspace = lazy(() => import('../../features/catalog/components/CatalogHubWorkspaceWithTax').then((module) => ({ default: module.CatalogHubWorkspace })));

interface CatalogScreenProps {
  onAddMany: (items: CalculationCapture[]) => void;
  context: unknown;
}

export function CatalogScreen({ onAddMany, context: _context }: CatalogScreenProps) {
  return (
    <PageShell className="wide-screen catalog-screen-premium">
      <PageHeader title="Catálogo" />
      <CatalogHubWorkspace onSendToBudget={onAddMany} />
    </PageShell>
  );
}
