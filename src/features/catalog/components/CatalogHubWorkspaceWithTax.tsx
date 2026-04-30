import type { CalculationCapture } from '../../../core/types/workflow';
import { CatalogHubWorkspace as CatalogHubWorkspaceEditable } from './CatalogHubWorkspaceEditable';
import { PurchaseToCatalogBridge } from './PurchaseToCatalogBridge';
import { SupplierTaxMarginWorkspace } from './SupplierTaxMarginWorkspace';
import './SupplierTaxMarginWorkspace.css';

interface CatalogHubWorkspaceWithTaxProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceWithTaxProps) {
  return (
    <>
      <CatalogHubWorkspaceEditable onSendToBudget={onSendToBudget} />
      <SupplierTaxMarginWorkspace />
      <PurchaseToCatalogBridge />
    </>
  );
}
