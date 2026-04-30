import { useEffect, useState } from 'react';
import type { CalculationCapture } from '../../../core/types/workflow';
import { CATALOG_HUB_ITEMS_CHANGED_EVENT } from '../storage/catalogHubSync';
import { CatalogHubWorkspace as CatalogHubWorkspaceEditable } from './CatalogHubWorkspaceEditable';

interface CatalogHubWorkspaceLiveProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

export function CatalogHubWorkspace({ onSendToBudget }: CatalogHubWorkspaceLiveProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    function handleCatalogChanged() {
      setRefreshKey((current) => current + 1);
    }

    window.addEventListener(CATALOG_HUB_ITEMS_CHANGED_EVENT, handleCatalogChanged);
    return () => window.removeEventListener(CATALOG_HUB_ITEMS_CHANGED_EVENT, handleCatalogChanged);
  }, []);

  return <CatalogHubWorkspaceEditable key={refreshKey} onSendToBudget={onSendToBudget} />;
}
