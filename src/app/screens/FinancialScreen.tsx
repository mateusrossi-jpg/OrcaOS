import { lazy, memo, Suspense } from 'react';
import { ERPLoader, AferixV12Tokens } from '../../ui/system';

const SimpleFinanceWorkspace = lazy(() => import('../../features/finance/components/SimpleFinanceWorkspace').then((module) => ({ default: module.SimpleFinanceWorkspace })));

export const FinancialScreen = memo(function FinancialScreen() {
  return (
    <Suspense fallback={<div className={AferixV12Tokens.layout.pageContainer + " flex items-center justify-center min-h-[60vh]"}><ERPLoader message="Carregando financeiro..." /></div>}>
      <SimpleFinanceWorkspace />
    </Suspense>
  );
});

