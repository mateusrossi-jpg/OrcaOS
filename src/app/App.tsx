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
import { OperationsScreen } from './screens/OperationsScreen';
import { StoreScreen } from './screens/StoreScreen';
import { MenuScreen } from './screens/MenuScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { ClientsWorkspace } from '../features/clients/components/ClientsWorkspace';
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
import { ERPToast, ERPLoader } from '../ui/system';
import { DebugPanel } from '../features/settings/components/DebugPanel';
import { multiTabProtection } from '../core/database/multiTabProtection';
import { cloudSyncService } from '../services/CloudSyncService';
import { PageShell } from './components/PageShell';


function LazyWorkspaceFallback() {
  return (
    <PageShell className="flex items-center justify-center min-h-[60vh]">
      <ERPLoader message="Carregando área de trabalho..." />
    </PageShell>
  );
}


export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('pulse');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [budgetResetKey, setBudgetResetKey] = useState(0);
  const [tacticalAction, setTacticalAction] = useState<string | null>(null);
  
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

  useEffect(() => {
    multiTabProtection.init();
    return () => multiTabProtection.destroy();
  }, []);

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

  // FASE 3: Cloud Sync Background Task
  useEffect(() => {
    const interval = setInterval(() => {
      void cloudSyncService.syncLocalToCloud();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoadingAccount || !account) {
    return <LazyWorkspaceFallback />;
  }

  function attachActiveWorkOrder(capture: CalculationCapture): CalculationCapture {
    return activeWorkOrderId && !capture.workOrderId ? { ...capture, workOrderId: activeWorkOrderId } : capture;
  }

  function addManyCalculationCaptures(items: CalculationCapture[]) {
    addCaptures(items.map(attachActiveWorkOrder));
  }

  function goTo(tab: AppTab | string) {
    if (!canNavigate()) return;
    
    // Tactical Actions Handling (Fase 4D)
    if (tab === 'new-os') {
      setTacticalAction('new-os');
      setActiveTab('base');
      return;
    }

    if (tab === 'new-budget') {
      setSelectedBudgetId('new');
      setBudgetResetKey((current) => current + 1);
      setActiveTab('budgets');
      return;
    }
    
    if (tab === 'budgets') {
      setSelectedBudgetId(null);
    }

    if (tab !== 'base') {
      setSelectedClientId(null);
    }

    setTacticalAction(null);
    setActiveTab(tab as AppTab);
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
      <DebugPanel />
      <AferixIntro />
      
      <AppShell activeTab={activeTab} onNavigate={goTo}>
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
            <OperationsScreen 
              onOpenBudgets={() => goTo('budgets')} 
              onContextChange={updateContext} 
              onNavigate={goTo}
              initialAction={tacticalAction}
              onActionConsummated={() => setTacticalAction(null)}
            />
          )}

          {activeTab === 'money' && <FinancialScreen />}
          {activeTab === 'clients' && <ClientsWorkspace onNavigate={goTo} />}
          {activeTab === 'settings' && <MenuScreen account={account} onAccountChange={() => {}} onNavigate={goTo} />}

          {activeTab === 'budgets' && (
            selectedBudgetId ? (
              <RuntimeErrorBoundary>
                <BudgetForm 
                  key={`${selectedBudgetId}-${budgetResetKey}`}
                  id={selectedBudgetId === 'new' ? null : selectedBudgetId}
                  onBack={() => {
                    setSelectedBudgetId(null);
                  }}
                />
              </RuntimeErrorBoundary>
            ) : (
              <BudgetsScreen 
                onNewBudget={() => {
                  setSelectedBudgetId('new');
                  setBudgetResetKey(prev => prev + 1);
                }}
                onSelectBudget={(budget) => {
                  setSelectedBudgetId(budget.id);
                }}
              />
            )
          )}

          {activeTab === 'work-history' && (
            <BudgetHistoryPage 
              onNewBudget={() => goTo('new-budget')}
              onOpenBudget={(budgetId) => openBudgetDetail(budgetId)}
            />
          )}
          {activeTab === 'catalog' && <CatalogScreen onAddMany={addManyCalculationCaptures} context={context} onBack={() => goTo('settings')} />}
          {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} onBack={() => goTo('settings')} />}

          {activeTab === 'store' && <StoreScreen account={account} onAccountChange={() => {}} onBack={() => goTo('settings')} />}
        </Suspense>
      </AppShell>
    </>
  );
}
