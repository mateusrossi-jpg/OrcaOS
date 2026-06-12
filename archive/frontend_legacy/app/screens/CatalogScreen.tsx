import { lazy, memo } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';

const CatalogHubWorkspace = lazy(() => import('../../features/catalog/components/CatalogHubWorkspaceWithTax').then((module) => ({ default: module.CatalogHubWorkspace })));

interface CatalogScreenProps {
  onAddMany: (items: CalculationCapture[]) => void;
  context: unknown;
  onBack?: () => void;
}

export const CatalogScreen = memo(function CatalogScreen({ onAddMany, context: _context, onBack }: CatalogScreenProps) {
  return (
    <CatalogHubWorkspace onSendToBudget={onAddMany} onBack={onBack} />
  );
});
