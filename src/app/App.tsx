import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  loadAccountState,
  AFERIX_ACCOUNT_CHANGED_EVENT,
  type AferixAccountState,
} from '../core/access/accountPlanStorage';
import type { Client, WorkOrder } from '../core/types/business';
import type { CalculationCapture } from '../core/types/workflow';
import { loadSavedBudgets } from '../features/budgets/storage/savedBudgetsStorage';
import { loadActiveWorkOrderId, loadClients, loadWorkOrders, saveWorkOrders } from '../features/clients/storage/clientWorkOrderStorage';
import { AppShell } from './components/AppShell';
import { AferixIntro } from './components/AferixIntro';
import { navItems, userPlan } from './appData';
import type { AppTab, ActiveWorkContext } from './appTypes';
import { loadStoredCaptures, saveStoredCaptures } from './storage/calculationCapturesStorage';
import { cleanupRuntimeValidationData } from './storage/runtimeValidationCleanup';
import { HomeScreen } from './screens/HomeScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { FinancialScreen } from './screens/FinancialScreen';
import { ClientsScreen } from './screens/ClientsScreen';
import { StoreScreen } from './screens/StoreScreen';
import { MenuScreen } from './screens/MenuScreen';

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
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [clientInitialSection, setClientInitialSection] = useState<'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders'>('dashboard');
  const [clientSectionRequestKey, setClientSectionRequestKey] = useState(0);
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => {
    cleanupRuntimeValidationData();
    return loadStoredCaptures();
  });
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());
  const [account, setAccount] = useState<AferixAccountState>(() => loadAccountState());
  const activeUserPlan = account.plan ?? userPlan;

  useEffect(() => { saveStoredCaptures(captures); }, [captures]);
  useEffect(() => {
    function syncAccount() {
      setAccount(loadAccountState());
    }

    window.addEventListener(AFERIX_ACCOUNT_CHANGED_EVENT, syncAccount);
    return () => window.removeEventListener(AFERIX_ACCOUNT_CHANGED_EVENT, syncAccount);
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
    if (tab === 'new-budget') {
      setClientInitialSection('newWorkOrder');
      setClientSectionRequestKey((current) => current + 1);
    } else if (tab === 'work-orders') {
      setClientInitialSection('workOrders');
      setClientSectionRequestKey((current) => current + 1);
    } else if (tab === 'clients') {
      setClientInitialSection('clients');
      setClientSectionRequestKey((current) => current + 1);
    }
    setActiveTab(tab);
  }

  function openClientSection(section: 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders') {
    setClientInitialSection(section);
    setClientSectionRequestKey((current) => current + 1);
    if (section === 'newWorkOrder') setActiveTab('new-budget');
    else if (section === 'workOrders') setActiveTab('work-orders');
    else setActiveTab('clients');
  }

  function convertActiveBudgetToWorkOrder() {
    if (!activeWorkOrderId) return;
    setWorkOrders((current) => {
      const updatedWorkOrders = current.map((workOrder) => (
        workOrder.id === activeWorkOrderId
          ? { ...workOrder, status: 'in-progress' as const, updatedAt: new Date().toISOString() }
          : workOrder
      ));
      saveWorkOrders(updatedWorkOrders);
      return updatedWorkOrders;
    });
  }

  return (
    <>
      <AferixIntro />
      <AppShell activeTab={activeTab} navItems={navItems} activeClient={activeClient} activeWorkOrder={activeWorkOrder} onNavigate={goTo}>
        <Suspense fallback={<LazyWorkspaceFallback />}>
          {activeTab === 'home' && <HomeScreen goTo={goTo} captures={captures} clients={clients} workOrders={workOrders} savedBudgets={loadSavedBudgets()} context={context} onStartNewAttendance={() => goTo('new-budget')} />}
          
          {(activeTab === 'clients' || activeTab === 'new-budget' || activeTab === 'work-orders') && (
            <ClientsScreen 
              initialSection={clientInitialSection} 
              sectionRequestKey={clientSectionRequestKey} 
              onOpenBudgets={() => goTo('budgets')} 
              onContextChange={(nextClients, nextWorkOrders, nextActiveWorkOrderId) => { 
                setClients(nextClients); 
                setWorkOrders(nextWorkOrders); 
                setActiveWorkOrderId(nextActiveWorkOrderId); 
              }} 
            />
          )}

          {activeTab === 'financial' && <FinancialScreen context={context} />}
          {activeTab === 'settings' && <MenuScreen account={account} onAccountChange={setAccount} goTo={goTo} />}
          
          {/* Sub-telas acessadas via Menu ou fluxo direto */}
          {activeTab === 'budgets' && <BudgetsScreen captures={captures} context={context} userPlan={activeUserPlan} goTo={goTo} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} onConvertApprovedBudgetToWorkOrder={convertActiveBudgetToWorkOrder} />}
          {activeTab === 'catalog' && <CatalogScreen onAddMany={addManyCalculationCaptures} context={context} />}
          {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} />}
          {activeTab === 'store' && <StoreScreen account={account} onAccountChange={setAccount} />}
        </Suspense>
      </AppShell>
    </>
  );
}
