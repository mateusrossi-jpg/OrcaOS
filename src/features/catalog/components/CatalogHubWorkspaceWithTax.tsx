import type { CalculationCapture } from '../../../core/types/workflow';
import { CatalogHubWorkspace as CatalogHubWorkspaceLive } from './CatalogHubWorkspaceLive';
import { PurchaseToCatalogBridge } from './PurchaseToCatalogBridge';
import { SupplierTaxMarginWorkspace } from './SupplierTaxMarginWorkspace';
import './SupplierTaxMarginWorkspace.css';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceWithTaxProps) {
  return (
    <>
      <CatalogHubWorkspaceLive onSendToBudget={onSendToBudget} />
      <SupplierTaxMarginWorkspace />
      <PurchaseToCatalogBridge />
    </>
  );
}
