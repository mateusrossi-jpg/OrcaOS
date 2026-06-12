import { lazy, memo } from 'react';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import { 
  ERPLoader 
} from '../components/ui';

const OperationsHubWorkspace = lazy(() => import('../../features/clients/components/OperationsHubWorkspace').then((module) => ({ default: module.OperationsHubWorkspace })));

interface OperationsScreenProps {
  activeWorkOrderId: string | null;
  onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void;
  onOpenBudgets: () => void;
  onNavigate: (tab: any) => void;
  initialAction?: string | null;
  onActionConsummated?: () => void;
}

/**
 * OperationsScreen: The Technical Execution Workspace.
 * Connected to 'base' tab.
 */
export const OperationsScreen = memo(function OperationsScreen({
  activeWorkOrderId,
  onContextChange,
  onOpenBudgets,
  onNavigate,
  initialAction,
  onActionConsummated
}: OperationsScreenProps) {
  return (
    <OperationsHubWorkspace
      activeWorkOrderId={activeWorkOrderId}
      onContextChange={onContextChange}
      onOpenBudgets={onOpenBudgets}
      onNavigate={onNavigate}
      initialAction={initialAction}
      onActionConsummated={onActionConsummated}
    />
  );
});
