import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  loadAccountState,
  AFERIX_ACCOUNT_CHANGED_EVENT,
  type AferixAccountState,
} from '../core/access/accountPlanStorage';
import type { Client, WorkOrder } from '../core/types/business';
import type { CalculationCapture } from '../core/types/workflow';
import { loadActiveWorkOrderId, loadClients, loadWorkOrders } from '../features/clients/storage/clientWorkOrderStorage';
import { AppShell } from './components/AppShell';
import { AferixIntro } from './components/AferixIntro';
import { navItems, userPlan } from './appData';
import type { AppTab, ActiveWorkContext } from './appTypes';
import { loadStoredCaptures, saveStoredCaptures } from './storage/calculationCapturesStorage';
import { cleanupRuntimeValidationData } from './storage/runtimeValidationCleanup';
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
import { LegacyBudgetMigrationService } from '../services/LegacyBudgetMigrationService';

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
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => {
    // cleanupRuntimeValidationData(); // Desativado para segurança operacional (Beta)
    return loadStoredCaptures();
  });
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());
  const [account, setAccount] = useState<AferixAccountState>(() => loadAccountState());
  const activeUserPlan = account.plan ?? userPlan;

  const lastMenuActionAtRef = useRef(0);

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
      } catch (err) {
        console.error('Legacy budget migration failed on bootstrap:', err);
      }
    }
    runMigration();
  }, []);

  const activeWorkOrder = useMemo(() => workOrders.find((workOrder) => workOrder.id === activeWorkOrderId) ?? null, [activeWorkOrderId, workOrders]);
  const activeClient = useMemo(() => (activeWorkOrder?.clientId ? clients.find((client) => client.id === activeWorkOrder.clientId) ?? null : null), [activeWorkOrder?.clientId, clients]);
  const context: ActiveWorkContext = useMemo(() => ({ activeClient, activeWorkOrder }), [activeClient, activeWorkOrder]);

  function attachActiveWorkOrder(capture: CalculationCapture): CalculationCapture {
    return activeWorkOrderId && !capture.workOrderId ? { ...capture, workOrderId: activeWorkOrderId } : capture;
  }

  function addCalculationCapture(capture: CalculationCapture) {
    setCaptures((current) => [attachActiveWorkOrder(capture), ...current]);
  }

  function addManyCalculationCaptures(items: CalculationCapture[]) {
    setCaptures((current) => [...items.map(attachActiveWorkOrder), ...current]);
  }

  function updateCalculationCapture(id: string, patch: Partial<CalculationCapture>) {
    setCaptures((current) => current.map((capture) => (capture.id === id ? { ...capture, ...patch } : capture)));
  }

  function removeCalculationCapture(id: string) {
    setCaptures((current) => current.filter((capture) => capture.id !== id));
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
      setActiveWorkOrderId(workOrderId);
    }
    setActiveTab('budgets');
  }

  // Open detail view (hidden tab) – does not appear in navigation menu
  function openBudgetDetail(budgetId: string) {
    if (!canNavigate()) return;
    openBudgetForEdit(budgetId);
  }

  function openClientSection(section: 'dashboard' | 'newClient' | 'clients') {
    if (!canNavigate()) return;
    setClientInitialSection(section);
    setClientSectionRequestKey((current) => current + 1);
    setActiveTab('base');
  }

  function viewClientProfile(clientId: string) {
    if (!canNavigate()) return;
    setSelectedClientId(clientId);
    setClientInitialSection('newClient'); 
    setClientSectionRequestKey((current) => current + 1);
    setActiveTab('base');
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
              initialSection={clientInitialSection as any} 
              initialClientId={selectedClientId}
              sectionRequestKey={clientSectionRequestKey} 
              onOpenBudgets={() => goTo('budgets')} 
              onContextChange={(nextClients, nextWorkOrders, nextActiveWorkOrderId) => { 
                setClients(nextClients); 
                setWorkOrders(nextWorkOrders); 
                setActiveWorkOrderId(nextActiveWorkOrderId); 
              }} 
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
