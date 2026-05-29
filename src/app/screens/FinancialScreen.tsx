import { lazy } from 'react';
import { PageShell } from '../components/ui';

const SimpleFinanceWorkspace = lazy(() => import('../../features/finance/components/SimpleFinanceWorkspace').then((module) => ({ default: module.SimpleFinanceWorkspace })));

export function FinancialScreen() {
  return (
    <PageShell>
      <SimpleFinanceWorkspace />
    </PageShell>
  );
}

