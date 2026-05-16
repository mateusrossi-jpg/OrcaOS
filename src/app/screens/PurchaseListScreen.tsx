import { lazy } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { ActiveWorkContext } from '../appTypes';
import { ActiveWorkContextCard } from '../components/ActiveWorkContextCard';

const ClientPurchaseListWorkspace = lazy(() => import('../../features/workflow/components/ClientPurchaseListWorkspace').then((module) => ({ default: module.ClientPurchaseListWorkspace })));

interface PurchaseListScreenProps {
  captures: CalculationCapture[];
  onUpdate: (id: string, patch: Partial<CalculationCapture>) => void;
  context: ActiveWorkContext;
}

export function PurchaseListScreen({ captures, onUpdate, context }: PurchaseListScreenProps) {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Lista de compra do cliente</h1>
        <p>Materiais que o cliente compra.</p>
      </header>
      <ActiveWorkContextCard {...context} />
      <ClientPurchaseListWorkspace captures={captures} onUpdate={onUpdate} />
    </section>
  );
}
