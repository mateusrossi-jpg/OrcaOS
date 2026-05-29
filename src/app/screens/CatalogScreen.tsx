import { lazy } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import { PageTitle, PageShell } from '../components/ui';

const CatalogHubWorkspace = lazy(() => import('../../features/catalog/components/CatalogHubWorkspaceWithTax').then((module) => ({ default: module.CatalogHubWorkspace })));

interface CatalogScreenProps {
  onAddMany: (items: CalculationCapture[]) => void;
  context: unknown;
  onBack?: () => void;
}

export function CatalogScreen({ onAddMany, context: _context, onBack }: CatalogScreenProps) {
  return (
    <PageShell>
      <PageTitle 
        onBack={onBack}
        eyebrow="Configurações" 
        title="Catálogo" 
        subtitle="Gerencie sua biblioteca de serviços e materiais padrão." 
      />

      <CatalogHubWorkspace onSendToBudget={onAddMany} />
    </PageShell>
  );
}

