import { Suspense, useEffect, useState } from 'react';
import {
  loadAccountState,
  AFERIX_ACCOUNT_CHANGED_EVENT,
  type AferixAccountState,
} from '../core/access/accountPlanStorage';
import type { CalculationCapture } from '../core/types/workflow';
import { AppShell } from './components/AppShell';
import { AferixIntro } from './components/AferixIntro';
import { navItems } from './appData';
import type { AppTab } from './appTypes';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
import { loadStoredCaptures, saveStoredCaptures } from './storage/calculationCapturesStorage';
import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { FinancialScreen } from './screens/FinancialScreen';
import { ClientsScreen } from './screens/ClientsScreen';
import { StoreScreen } from './screens/StoreScreen';
import { MenuScreen } from './screens/MenuScreen';
import { BudgetForm } from '../pages/BudgetForm';
import { BudgetHistoryPage } from '../pages/BudgetHistoryPage';
import { RuntimeErrorBoundary } from './components/RuntimeErrorBoundary';
import { LegacyBudgetMigrationService } from '../legacy/LegacyBudgetMigrationService';
import { clientMigrationService } from '../services/ClientMigrationService';
import { catalogMigrationService } from '../services/CatalogMigrationService';
import { professionalProfileMigrationService } from '../services/ProfessionalProfileMigrationService';

function LazyWorkspaceFallback() {
  return (
    <section className="app-screen">
      <div className="empty-state-card">
        <strong>Carregando área de trabalho</strong>
        <p>Preparando os recursos desta tela.</p>
      </div>
    </section>
  );
}

import { useAppClients } from './hooks/useAppClients';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('pulse');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientInitialSection, setClientInitialSection] = useState<'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders'>('dashboard');
  const [clientSectionRequestKey, setClientSectionRequestKey] = useState(0);
  const [budgetResetKey, setBudgetResetKey] = useState(0);
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => {
    // cleanupRuntimeValidationData(); // Desativado para segurança operacional (Beta)
    return loadStoredCaptures();
  });
  
  const { 
    clients,
    workOrders,
    activeWorkOrderId, 
    activeClient, 
    activeWorkOrder, 
    context, 
    updateContext,
    refresh: refreshClients
  } = useAppClients();

  const [account, setAccount] = useState<AferixAccountState>(() => loadAccountState());

  const canNavigate = () => {
    return true;
  };

  useEffect(() => { saveStoredCaptures(captures); }, [captures]);
  useEffect(() => {
    function syncAccount() {
      setAccount(loadAccountState());
    }

    window.addEventListener(AFERIX_ACCOUNT_CHANGED_EVENT, syncAccount);
    return () => window.removeEventListener(AFERIX_ACCOUNT_CHANGED_EVENT, syncAccount);
  }, []);

  useEffect(() => {
    async function runMigration() {
      try {
        const migrationService = new LegacyBudgetMigrationService();
        await migrationService.runIfNeeded();
        await clientMigrationService.runIfNeeded();
        await catalogMigrationService.runIfNeeded();
        await professionalProfileMigrationService.runIfNeeded();
        await refreshClients();
      } catch (err) {
        console.error('Migration failed on bootstrap:', err);
      }
    }
    runMigration();
  }, [refreshClients]);

  function attachActiveWorkOrder(capture: CalculationCapture): CalculationCapture {
    return activeWorkOrderId && !capture.workOrderId ? { ...capture, workOrderId: activeWorkOrderId } : capture;
  }

  function addManyCalculationCaptures(items: CalculationCapture[]) {
    setCaptures((current) => [...items.map(attachActiveWorkOrder), ...current]);
  }

  function goTo(tab: AppTab) {
    if (!canNavigate()) return;
    if (tab === 'new-budget' || tab === 'budgets') {
      setSelectedBudgetId(null);
      setBudgetResetKey((current) => current + 1);
      setActiveTab('budgets');
      return;
    }

    if (tab === 'base') {
      setClientInitialSection('clients');
      setClientSectionRequestKey((current) => current + 1);
    } else {
      setSelectedClientId(null);
    }
    setActiveTab(tab);
  }

  function openBudgetForEdit(budgetId: string, workOrderId?: string | null) {
    if (!canNavigate()) return;
    setSelectedBudgetId(budgetId);
    if (workOrderId) {
      updateContext(clients, workOrders, workOrderId);
    }
    setActiveTab('budgets');
  }

  // Open detail view (hidden tab) – does not appear in navigation menu
  function openBudgetDetail(budgetId: string) {
    if (!canNavigate()) return;
    openBudgetForEdit(budgetId);
  }

  return (
    <>
      <AferixIntro />
      <AppShell activeTab={activeTab} navItems={navItems} activeClient={activeClient} activeWorkOrder={activeWorkOrder} onNavigate={goTo}>
        <Suspense fallback={<LazyWorkspaceFallback />}>
          {activeTab === 'pulse' && (
            <HomeScreen
              onNavigate={goTo}
              onSelectBudget={(budget) => {
                openBudgetForEdit(budget.id);
              }}
            />
          )}
          
          {activeTab === 'base' && (
            <ClientsScreen 
              initialSection={clientInitialSection} 
              initialClientId={selectedClientId}
              sectionRequestKey={clientSectionRequestKey} 
              onOpenBudgets={() => goTo('budgets')} 
              onContextChange={updateContext} 
            />
          )}

          {activeTab === 'money' && <FinancialScreen />}
          {activeTab === 'settings' && <MenuScreen account={account} onAccountChange={setAccount} onNavigate={goTo} />}

          {activeTab === 'budgets' && (
            <RuntimeErrorBoundary>
              <BudgetForm 
                key={`${selectedBudgetId || 'new'}-${budgetResetKey}`}
                id={selectedBudgetId}
                onBack={() => {
                  setSelectedBudgetId(null);
                  goTo('work-history');
                }}
              />
            </RuntimeErrorBoundary>
          )}

          {activeTab === 'new-budget' && (
            <RuntimeErrorBoundary>
              <BudgetForm 
                key={budgetResetKey + 1}
                id={null}
                onBack={() => {
                  goTo('work-history');
                }}
              />
            </RuntimeErrorBoundary>
          )}

          {activeTab === 'work-history' && (
            <BudgetHistoryPage 
              onNewBudget={() => goTo('new-budget')}
              onOpenBudget={(budgetId) => openBudgetDetail(budgetId)}
            />
          )}
          {activeTab === 'catalog' && <CatalogScreen onAddMany={addManyCalculationCaptures} context={context} />}
          {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} />}
          {activeTab === 'store' && <StoreScreen account={account} onAccountChange={setAccount} onBack={() => goTo('settings')} />}
        </Suspense>
      </AppShell>
    </>
  );
}
