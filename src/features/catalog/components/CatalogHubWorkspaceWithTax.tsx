import type { CalculationCapture } from '../../../core/types/workflow';
import { CatalogHubWorkspace as CatalogHubWorkspaceLive } from './CatalogHubWorkspaceLive';
import { PurchaseToCatalogBridge } from './PurchaseToCatalogBridge';
import { SupplierProfileWorkspace } from './SupplierProfileWorkspace';
import { SupplierTaxMarginWorkspace } from './SupplierTaxMarginWorkspace';
import './SupplierProfileWorkspace.css';
import './SupplierTaxMarginWorkspace.css';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceWithTaxProps) {
  return (
    <>
      <CatalogHubWorkspaceLive onSendToBudget={onSendToBudget} />
      <SupplierProfileWorkspace />
      <SupplierTaxMarginWorkspace />
      <PurchaseToCatalogBridge />
    </>
  );
}
