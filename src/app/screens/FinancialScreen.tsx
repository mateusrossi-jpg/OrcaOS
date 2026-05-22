import { lazy } from 'react';
import { PageHeader, PageShell } from '../components/ui';

const SimpleFinanceWorkspace = lazy(() => import('../../features/finance/components/SimpleFinanceWorkspace').then((module) => ({ default: module.SimpleFinanceWorkspace })));

export function FinancialScreen() {
  return (
    <PageShell className="wide-screen">
      <PageHeader
        title="Money"
        description="Resultados automáticos baseados em orçamentos finalizados."
      />
      <SimpleFinanceWorkspace />
    </PageShell>
  );
}
