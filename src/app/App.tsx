import { Suspense, useEffect, useState } from 'react';
import type { CalculationCapture } from '../core/types/workflow';
import { AppShell } from './components/AppShell';
import { AferixIntro } from './components/AferixIntro';
import type { AppTab } from './appTypes';
// LEGACY: Storage access replaced with Dexie migration
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
import { clientProposalMigrationService } from '../services/ClientProposalMigrationService';
import { calculationCaptureMigrationService } from '../services/CalculationCaptureMigrationService';
import { AccountPlanMigrationService } from '../services/AccountPlanMigrationService';
import { SimpleFinanceMigrationService } from '../services/SimpleFinanceMigrationService';
import { useCalculationCaptures } from '../hooks/useCalculationCaptures';
import { useAccountPlan } from '../hooks/useAccountPlan';
import { useAppClients } from './hooks/useAppClients';
import { realtimeBridge } from '../core/realtime/bridge';
import { ERPToast } from '../ui/system';
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

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('pulse');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientInitialSection, setClientInitialSection] = useState<'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders'>('dashboard');
  const [clientSectionRequestKey, setClientSectionRequestKey] = useState(0);
  const [budgetResetKey, setBudgetResetKey] = useState(0);
  
  const { captures, addManyCalculationCaptures: addCaptures, refreshCaptures } = useCalculationCaptures();
  
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

  const { account, isLoading: isLoadingAccount } = useAccountPlan();

  const canNavigate = () => {
    return true;
  };

  useEffect(() => {
    async function runMigration() {
      try {
        const migrationService = new LegacyBudgetMigrationService();
        await migrationService.runIfNeeded();
        await clientMigrationService.runIfNeeded();
        await catalogMigrationService.runIfNeeded();
        await professionalProfileMigrationService.runIfNeeded();
        await clientProposalMigrationService.runIfNeeded();
        await calculationCaptureMigrationService.runIfNeeded();
        await AccountPlanMigrationService.runIfNeeded();
        await SimpleFinanceMigrationService.runIfNeeded();
        await refreshCaptures();
        await refreshClients();
        realtimeBridge.initialize();
      } catch (err) {
        console.error('Migration failed on bootstrap:', err);
      }
    }
    runMigration();
    
    return () => {
      realtimeBridge.shutdown();
    };
  }, [refreshClients]);

  if (isLoadingAccount || !account) {
    return <LazyWorkspaceFallback />;
  }

  function attachActiveWorkOrder(capture: CalculationCapture): CalculationCapture {
    return activeWorkOrderId && !capture.workOrderId ? { ...capture, workOrderId: activeWorkOrderId } : capture;
  }

  function addManyCalculationCaptures(items: CalculationCapture[]) {
    addCaptures(items.map(attachActiveWorkOrder));
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
      <ERPToast />
      <AferixIntro />
      <AppShell activeTab={activeTab} activeClient={activeClient} activeWorkOrder={activeWorkOrder} onNavigate={goTo}>
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
          {activeTab === 'settings' && <MenuScreen account={account} onAccountChange={() => {}} onNavigate={goTo} />}

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
          {activeTab === 'store' && <StoreScreen account={account} onAccountChange={() => {}} onBack={() => goTo('settings')} />}
        </Suspense>
      </AppShell>
    </>
  );
}
