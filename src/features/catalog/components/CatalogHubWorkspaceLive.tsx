import type { CalculationCapture } from '../../../core/types/workflow';
import { CatalogHubWorkspace as CatalogHubWorkspaceEditable } from './CatalogHubWorkspaceEditable';

interface CatalogHubWorkspaceLiveProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  initialTab?: 'items' | 'suppliers' | 'online';
  enabledTabs?: Array<'items' | 'suppliers' | 'online'>;
}

export function CatalogHubWorkspace({ onSendToBudget, initialTab, enabledTabs }: CatalogHubWorkspaceLiveProps) {
  return <CatalogHubWorkspaceEditable initialTab={initialTab} enabledTabs={enabledTabs} onSendToBudget={onSendToBudget} />;
}
