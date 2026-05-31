import { lazy, memo } from 'react';
import { 
  ScreenContainer, 
  AppHeader 
} from '../../ui/system';

const SimpleFinanceWorkspace = lazy(() => import('../../features/finance/components/SimpleFinanceWorkspace').then((module) => ({ default: module.SimpleFinanceWorkspace })));

export const FinancialScreen = memo(function FinancialScreen() {
  return (
    <SimpleFinanceWorkspace />
  );
});

