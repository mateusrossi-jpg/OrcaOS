import { CatalogHubWorkspace } from '../../catalog/components/CatalogHubWorkspace';
import { GuidedBudgetCart as GuidedBudgetCartNext } from './GuidedBudgetCartNext';
import type { CalculationCapture } from '../../../core/types/workflow';

type GuidedCartMode = 'catalog' | 'manual' | 'parts' | 'all';

interface GuidedBudgetCartIntegratedProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  mode?: GuidedCartMode;
}

export function GuidedBudgetCart({ onSendToBudget, mode = 'all' }: GuidedBudgetCartIntegratedProps) {
  const shouldShowCatalogHub = mode === 'catalog' || mode === 'parts' || mode === 'all';

  return (
    <>
      <GuidedBudgetCartNext onSendToBudget={onSendToBudget} mode={mode} />
      {shouldShowCatalogHub && <CatalogHubWorkspace onSendToBudget={onSendToBudget} />}
    </>
  );
}
