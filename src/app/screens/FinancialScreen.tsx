import { lazy, useRef } from 'react';

const SimpleFinanceWorkspace = lazy(() => import('../../features/finance/components/SimpleFinanceWorkspace').then((module) => ({ default: module.SimpleFinanceWorkspace })));

export function FinancialScreen() {
  const triggerNewEntryRef = useRef<(() => void) | null>(null);

  return (
    <section className="app-screen wide-screen">
      <header className="screen-header finance-screen-header">
        <h1>Financeiro</h1>
        <button className="primary-action premium-cta finance-primary-cta" type="button" onClick={() => triggerNewEntryRef.current?.()}>+ Novo Fechamento</button>
      </header>
      <SimpleFinanceWorkspace onNewEntryRequest={(cb) => { triggerNewEntryRef.current = cb; }} />
    </section>
  );
}
