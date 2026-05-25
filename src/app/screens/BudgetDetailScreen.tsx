// src/app/screens/BudgetDetailScreen.tsx
import { lazy } from 'react';
import { PageHeader, PageShell, PrimaryButton } from '../components/ui';
import type { AppTab } from '../appTypes';

// Lazy load the workspace to keep bundle size low
const BudgetDetailWorkspace = lazy(() =>
  import('../../features/budgets/components/BudgetDetailWorkspace').then((m) => ({ default: m.BudgetDetailWorkspace }))
);

interface BudgetDetailScreenProps {
  budgetId: string | null;
  onBack: () => void;
  // we need navigation for possible redirects (e.g., after delete)
  onNavigate: (tab: AppTab) => void;
}

export function BudgetDetailScreen({ budgetId, onBack, onNavigate }: BudgetDetailScreenProps) {
  if (!budgetId) {
    return (
      <PageShell className="wide-screen">
<PageHeader title="Detalhe do orçamento" />
        <PrimaryButton onClick={onBack}>Voltar</PrimaryButton>
      </PageShell>
    );
  }

  return (
    <PageShell className="wide-screen">
        <PageHeader title="Detalhe do orçamento" action={
          <PrimaryButton onClick={onBack}>Voltar</PrimaryButton>
        } /> <BudgetDetailWorkspace budgetId={budgetId} onNavigate={onNavigate} />
    </PageShell>
  );
}
