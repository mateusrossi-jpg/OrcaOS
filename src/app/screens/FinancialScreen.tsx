import { lazy, useRef } from 'react';
import { PageHeader, Button, PageShell } from '../components/ui';

const SimpleFinanceWorkspace = lazy(() => import('../../features/finance/components/SimpleFinanceWorkspace').then((module) => ({ default: module.SimpleFinanceWorkspace })));

export function FinancialScreen() {
  const triggerNewEntryRef = useRef<(() => void) | null>(null);

  return (
    <PageShell className="wide-screen">
      <PageHeader 
        title="Financeiro" 
        description="Gestão de orçamentos por status e histórico financeiro."
        action={
          <Button variant="primary" className="full-page-cta" onClick={() => triggerNewEntryRef.current?.()}>
            + Nova Apuração
          </Button>
        }
      />
      <SimpleFinanceWorkspace onNewEntryRequest={(cb) => { triggerNewEntryRef.current = cb; }} />
    </PageShell>
  );
}
