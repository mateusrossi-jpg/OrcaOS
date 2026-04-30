import { CatalogHubWorkspace } from '../../catalog/components/CatalogHubWorkspace';
import { GuidedBudgetCart as GuidedBudgetCartGrouped } from './GuidedBudgetCartGrouped';
import type { CalculationCapture } from '../../../core/types/workflow';
import './GuidedBudgetCartGrouped.css';

type GuidedCartMode = 'catalog' | 'manual' | 'parts' | 'all';

interface GuidedBudgetCartIntegratedProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  mode?: GuidedCartMode;
}

export function GuidedBudgetCart({ onSendToBudget, mode = 'all' }: GuidedBudgetCartIntegratedProps) {
  const shouldShowCatalogHub = mode === 'catalog' || mode === 'parts' || mode === 'all';

  return (
    <>
      <GuidedBudgetCartGrouped onSendToBudget={onSendToBudget} mode={mode} />
      {shouldShowCatalogHub && <CatalogHubWorkspace onSendToBudget={onSendToBudget} />}
    </>
  );
}
