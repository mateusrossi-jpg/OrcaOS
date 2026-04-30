import { CatalogHubWorkspace } from '../../catalog/components/CatalogHubWorkspace';
import type { CalculationCapture } from '../../../core/types/workflow';
import { GuidedBudgetCart as GuidedBudgetCartRoomsConnected } from './GuidedBudgetCartRoomsConnected';
import { GuidedRoomManager } from './GuidedRoomManager';

type GuidedCartMode = 'catalog' | 'manual' | 'parts' | 'all';

interface GuidedBudgetCartIntegratedProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  mode?: GuidedCartMode;
}

export function GuidedBudgetCart({ onSendToBudget, mode = 'all' }: GuidedBudgetCartIntegratedProps) {
  const shouldShowCatalogHub = mode === 'catalog' || mode === 'parts' || mode === 'all';
  const shouldShowRooms = mode === 'catalog' || mode === 'parts' || mode === 'manual' || mode === 'all';

  return (
    <>
      {shouldShowRooms && <GuidedRoomManager />}
      <GuidedBudgetCartRoomsConnected onSendToBudget={onSendToBudget} mode={mode} />
      {shouldShowCatalogHub && <CatalogHubWorkspace onSendToBudget={onSendToBudget} />}
    </>
  );
}
