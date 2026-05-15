import { lazy } from 'react';
import type { ActiveWorkContext } from '../orcaAppTypes';
import { ActiveWorkContextCard } from '../components/ActiveWorkContextCard';

const SimpleFinanceWorkspace = lazy(() => import('../../features/finance/components/SimpleFinanceWorkspace').then((module) => ({ default: module.SimpleFinanceWorkspace })));

interface FinancialScreenProps {
  context: ActiveWorkContext;
}

export function FinancialScreen({ context }: FinancialScreenProps) {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Financeiro</h1>
        <p>Receitas, custos e lucro real.</p>
      </header>
      <ActiveWorkContextCard {...context} />
      <SimpleFinanceWorkspace />
    </section>
  );
}
