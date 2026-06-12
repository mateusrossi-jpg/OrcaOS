import { generateUUID } from '../core/utils/idGenerator';
import { Suspense, useEffect, useState, lazy, useCallback } from 'react';
import type { CalculationCapture } from '../core/types/workflow';
import { AppShell } from './components/AppShell';
import { RuntimeErrorBoundary } from './components/RuntimeErrorBoundary';
import { useRole } from '../hooks/useRole';
import { OwnerShell, FieldShell, SalesShell, ManagerShell, CustomerShell, SoloShell } from '../features/workspace/components/RoleShells';
import { FieldWorkspace } from '../features/workspace/screens/FieldWorkspace';
import { AssetsExperience } from '../features/assets/screens/AssetsExperience';
import { ChecklistManagerScreen } from '../features/execution/screens/ChecklistManagerScreen';
import { ChecklistsWorkspace } from '../features/workspace/screens/ChecklistsWorkspace';
import { DiagnosticsWorkspace } from '../features/workspace/screens/DiagnosticsWorkspace';
import { OwnerWorkspace } from '../features/workspace/screens/OwnerWorkspace';
import { SalesWorkspace } from '../features/workspace/screens/SalesWorkspace';
import { ManagerWorkspace } from '../features/workspace/screens/ManagerWorkspace';
import { TeamWorkspace } from '../features/workspace/screens/TeamWorkspace';
import { DispatchBoardPage } from '../features/dispatch/screens/DispatchBoardPage';
import { RevenueInboxPage } from '../features/revenue/screens/RevenueInboxPage';
import { ClientPortalPage } from '../features/clientPortal/screens/ClientPortalPage';
import { AferixIntro } from './components/AferixIntro';
import type { AppTab } from './appTypes';
// LEGACY: Storage access replaced with Dexie migration
import { HomePage } from '../pages/HomePage';
import { AgendaPage } from '../pages/AgendaPage';
import { CatalogScreen } from './screens/CatalogScreen';
import { InventoryDashboard } from '../features/inventory/screens/InventoryDashboard';
import { ReportsScreen } from './screens/ReportsScreen';
import { FinancialScreen } from './screens/FinancialScreen';
import { OperationsScreen } from './screens/OperationsScreen';
import { StoreScreen } from './screens/StoreScreen';
import { MenuScreen } from './screens/MenuScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AttendanceListScreen } from './screens/AttendanceListScreen';
import { AttendanceDetailScreen } from './screens/AttendanceDetailScreen';
import { ClientsWorkspace } from '../features/clients/components/ClientsWorkspace';
const RevenueWorkspaceV2 = lazy(() => import('../features/revenue/components/RevenueWorkspaceV2').then((module) => ({ default: module.RevenueWorkspaceV2 })));
const OperationsWorkspaceV2 = lazy(() => import('../features/operations/components/OperationsWorkspaceV2').then((module) => ({ default: module.OperationsWorkspaceV2 })));
const RelationshipWorkspaceV2 = lazy(() => import('../features/relationships/components/RelationshipWorkspaceV2').then((module) => ({ default: module.RelationshipWorkspaceV2 })));
const AdminWorkspaceV2 = lazy(() => import('../features/admin/components/AdminWorkspaceV2').then((module) => ({ default: module.AdminWorkspaceV2 })));
const SystemAtlasWorkspace = lazy(() => import('../features/system/components/SystemAtlasWorkspace').then((module) => ({ default: module.SystemAtlasWorkspace })));
const ReputationWorkspace = lazy(() => import('../features/intelligence/components/ReputationWorkspace').then((module) => ({ default: module.ReputationWorkspace })));
const NextMoneyWorkspace = lazy(() => import('../features/intelligence/components/NextMoneyWorkspace').then((module) => ({ default: module.NextMoneyWorkspace })));

import { ProposalGeneratorPage } from '../features/proposal/screens/ProposalGeneratorPage';
import { QuickServiceForm } from '../pages/QuickServiceForm';
import { OperationsHubWorkspace } from '../features/clients/components/OperationsHubWorkspace';
import { Modal, PrimaryButton } from './components/ui';
import { Target, Zap } from 'lucide-react';
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
import { WOWCelebrationOverlay } from './components/WOWCelebrationOverlay';
import { DebugPanel } from '../features/settings/components/DebugPanel';
import { multiTabProtection } from '../core/database/multiTabProtection';
import { cloudSyncService } from '../services/CloudSyncService';
import { PageShell } from './components/PageShell';
import { db } from '../storage/dexieDatabase';
import { trustLayer } from '../core/trust/TrustLayer';


import { CommandPalette } from '../components/CommandPalette';
import { FirstRunExperience } from '../features/system/components/FirstRunExperience';

function LazyWorkspaceFallback() {
  return (
    <PageShell className="flex items-center justify-center min-h-[60vh]">
      <ERPLoader message="Carregando área de trabalho..." />
    </PageShell>
  );
}

import { RoleSelectionScreen } from '../features/auth/components/RoleSelectionScreen';


export function App() {
  const { role, hasSelectedRole } = useRole();
  const [activeTab, setActiveTab] = useState<AppTab>('clients');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [budgetResetKey, setBudgetResetKey] = useState(0);
  const [tacticalAction, setTacticalAction] = useState<string | null>(null);
  const [showFirstRun, setShowFirstRun] = useState(() => !localStorage.getItem('aferix_first_run_complete'));
  
  const ActiveShell = {
    OWNER: OwnerShell,
    FIELD: FieldShell,
    SALES: SalesShell,
    MANAGER: ManagerShell,
    CUSTOMER: CustomerShell,
    SOLO: SoloShell,
  }[role] || OwnerShell;

  useEffect(() => {
    // Role-based default tab routing (Always enforce when role changes)
    const defaultTabs: Record<string, string> = {
      OWNER: 'dashboard',
      FIELD: 'base',
      SALES: 'pipeline',
      MANAGER: 'map',
      CUSTOMER: 'clients',
      SOLO: 'dashboard'
    };
    if (defaultTabs[role]) {
      setActiveTab(defaultTabs[role] as AppTab);
    }
  }, [role]);

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

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ type?: 'success' | 'info' | 'warning' | 'error'; message: string; title?: string; undo?: () => void }>;
      if (customEvent.detail) {
        const { type, message, title, undo } = customEvent.detail;
        trustLayer.emit({
          type: type || 'info',
          title: title || (type === 'success' ? 'Sucesso' : type === 'error' ? 'Erro' : type === 'warning' ? 'Atenção' : 'Informação'),
          description: message,
          onUndo: undo,
          status: 'local'
        });
      }
    };
    window.addEventListener('aferix_toast', handleToast);
    return () => window.removeEventListener('aferix_toast', handleToast);
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

        // CHECK AND SEED REALISTIC DEMO DATA IF DB IS EMPTY
        const clientCount = await db.clients.count();
        if (clientCount === 0) {
          console.log("No clients found in IndexedDB. Seeding Aferix high-fidelity dataset...");
          const { seedRealisticDemoData } = await import('./utils/AferixDemoDataset');
          await seedRealisticDemoData();
          await refreshClients();
        }

        // CHECK AND EMIT OPERATIONAL NOTIFICATIONS IN TRUST LAYER
        if (trustLayer.getEvents().length === 0) {
          trustLayer.emit({
            type: 'success',
            title: 'Sincronização Concluída',
            description: 'Banco de dados local do Aferix sincronizado.',
            status: 'synced',
            silent: true
          });
          trustLayer.emit({
            type: 'warning',
            title: 'PMOC Pendente',
            description: 'Inspeção PMOC agendada para hoje às 17:00.',
            status: 'local',
            silent: true
          });
          trustLayer.emit({
            type: 'error',
            title: 'Fatura Vencida',
            description: 'Parcela Shopping RP vencida há 5 dias.',
            status: 'local',
            silent: true
          });
          trustLayer.emit({
            type: 'success',
            title: 'Orçamento Aprovado',
            description: 'Vale Verde aprovou proposta de R$ 4.500.',
            status: 'synced',
            silent: true
          });
        }
      } catch (err) {
        console.error('Migration failed on bootstrap:', err);
      }
    }
    runMigration();
    
    return () => {
      realtimeBridge.shutdown();
    };
  }, [refreshClients, refreshCaptures]);

  // FASE 3: Cloud Sync Background Task (Push & Pull)
  useEffect(() => {
    const interval = setInterval(() => {
      void cloudSyncService.syncLocalToCloud();
      void cloudSyncService.syncCloudToLocal();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, []);


  function attachActiveWorkOrder(capture: CalculationCapture): CalculationCapture {
    return activeWorkOrderId && !capture.workOrderId ? { ...capture, workOrderId: activeWorkOrderId } : capture;
  }

  function addManyCalculationCaptures(items: CalculationCapture[]) {
    addCaptures(items.map(attachActiveWorkOrder));
  }

  const goTo = useCallback((tab: AppTab | string | { tab: AppTab | string; clientId?: string | null; budgetId?: string | null; workOrderId?: string | null }) => {
    if (!canNavigate()) return;

    let targetTab: string;
    let clientId: string | null = null;
    let budgetId: string | null = null;
    let workOrderId: string | null = null;

    if (typeof tab === 'object' && tab !== null) {
      targetTab = tab.tab;
      clientId = tab.clientId || null;
      budgetId = tab.budgetId || null;
      workOrderId = tab.workOrderId || null;
    } else {
      targetTab = tab;
    }
    
    // Tactical Actions Handling (Fase 4D)
    if (targetTab === 'new-budget') {
      const attendanceId = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
        ? generateUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      const newAttendance = {
        id: attendanceId,
        clientId: '',
        siteId: '',
        status: 'iniciado' as const,
        companyId: 'default-company',
        workspaceId: 'default-workspace',
        syncStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.attendances.add(newAttendance).catch(err => {
        console.error("Erro ao iniciar atendimento inicial:", err);
      });

      localStorage.setItem('aferix_active_attendance_id', attendanceId);

      setSelectedBudgetId('new');
      setBudgetResetKey(prev => prev + 1);
      setActiveTab('revenue' as AppTab);
      return;
    }

    if (targetTab === 'new-quick-service') {
      setSelectedBudgetId('new-quick-service');
      setBudgetResetKey(prev => prev + 1);
      setActiveTab('revenue' as AppTab);
      return;
    }
    
    if (targetTab === 'revenue') {
      setSelectedBudgetId(budgetId);
    } else if (budgetId) {
      setSelectedBudgetId(budgetId);
    }

    if (targetTab === 'operations') {
      if (workOrderId) {
        updateContext(clients, workOrders, workOrderId);
      }
    } else {
      if (workOrderId) {
        updateContext(clients, workOrders, workOrderId);
      } else {
        updateContext(clients, workOrders, null);
      }
    }

    if (targetTab === 'relationships') {
      if (clientId) {
        setSelectedClientId(clientId);
      }
    } else {
      if (clientId) {
        setSelectedClientId(clientId);
      } else {
        setSelectedClientId(null);
      }
    }

    setTacticalAction(null);
    setActiveTab(targetTab as AppTab);
  }, [clients, workOrders, updateContext]);

  const openBudgetForEdit = useCallback((budgetId: string, workOrderId?: string | null) => {
    if (!canNavigate()) return;
    setSelectedBudgetId(budgetId);
    if (workOrderId) {
      updateContext(clients, workOrders, workOrderId);
    }
    setActiveTab('revenue');
  }, [clients, workOrders, updateContext]);

  // Open detail view (hidden tab) – does not appear in navigation menu
  const openBudgetDetail = useCallback((budgetId: string) => {
    if (!canNavigate()) return;
    openBudgetForEdit(budgetId);
  }, [openBudgetForEdit]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string; id?: string; clientId?: string; budgetId?: string; workOrderId?: string }>;
      if (!customEvent.detail) return;
      const { tab, id, clientId, budgetId, workOrderId } = customEvent.detail;
      
      if (tab === 'clients') {
        if (id) {
          setSelectedClientId(id);
        }
        setActiveTab('clients');
      } else if (tab === 'budgets') {
        if (id) {
          openBudgetForEdit(id);
        } else {
          setActiveTab('budgets');
        }
      } else if (tab === 'base') {
        if (id) {
          goTo({ tab: 'operations', workOrderId: id });
        } else {
          setActiveTab('base');
        }
      } else {
        goTo({
          tab: tab as any,
          clientId: clientId || null,
          budgetId: budgetId || null,
          workOrderId: workOrderId || null
        });
      }
    };

    window.addEventListener('aferix_navigate', handleNavigate);
    return () => {
      window.removeEventListener('aferix_navigate', handleNavigate);
    };
  }, [goTo, openBudgetForEdit]);

  if (isLoadingAccount || !account) {
    return <LazyWorkspaceFallback />;
  }

  return (
    <>
      {showFirstRun && (
        <FirstRunExperience onComplete={() => {
           localStorage.setItem('aferix_first_run_complete', 'true');
           setShowFirstRun(false);
        }} />
      )}
      <ERPToast />
      <WOWCelebrationOverlay />
      <CommandPalette />
      <DebugPanel />
      <AferixIntro />

      {!hasSelectedRole && (
        <RoleSelectionScreen onComplete={() => window.dispatchEvent(new Event('aferix_role_changed'))} />
      )}
      
      {hasSelectedRole && (
        <ActiveShell activeTab={activeTab} onNavigate={goTo}>
          <Suspense fallback={<LazyWorkspaceFallback />}>
          {/* ━━━ MULTI-PROFILE WORKSPACES ━━━ */}
          <RuntimeErrorBoundary>
            {/* ZONE: HOME (Intent: O que merece minha atenção agora?) */}
            {(activeTab === 'dashboard' || activeTab === 'home' || activeTab === 'pulse') && (
              <ClientsWorkspace
                activeTab={activeTab}
                onNavigate={goTo}
                goTo={goTo}
                onClose={() => setActiveTab('dashboard')}
                selectClient={setSelectedClientId}
              />
            )}

            {/* ZONE: RECEITA (Intent: Como ganho dinheiro hoje?) */}
            {(activeTab === 'revenue' || activeTab === 'budgets') && (
              selectedBudgetId === 'new-quick-service' ? (
                <div className="absolute inset-0 z-50 bg-aferix-bg flex flex-col">
                  <QuickServiceForm key={budgetResetKey} onBack={() => setSelectedBudgetId(null)} />
                </div>
              ) : selectedBudgetId ? (
                <ProposalGeneratorPage 
                  key={`${selectedBudgetId}-${budgetResetKey}`}
                  id={selectedBudgetId === 'new' ? null : selectedBudgetId}
                  onBack={() => setSelectedBudgetId(null)}
                  onNavigate={goTo}
                />
              ) : (
                <RevenueWorkspaceV2 onNavigate={goTo} />
              )
            )}

            {/* ZONE: OPERAÇÕES (Intent: O que preciso executar hoje?) */}
            {(activeTab === 'operations' || activeTab === 'base') && (
              activeWorkOrderId ? (
                <OperationsHubWorkspace 
                  activeWorkOrderId={activeWorkOrderId}
                  onContextChange={updateContext} 
                  onOpenBudgets={() => goTo('revenue')} 
                  onNavigate={goTo} 
                />
              ) : (
                <AgendaPage onNavigate={goTo} />
              )
            )}

            {/* ZONE: RELACIONAMENTOS (Intent: Quem são meus clientes?) */}
            {activeTab === 'relationships' && (
              selectedClientId ? (
                <ClientsWorkspace onNavigate={goTo} initialClientId={selectedClientId} />
              ) : (
                <RelationshipWorkspaceV2 onNavigate={goTo} />
              )
            )}

            {activeTab === 'clients' && (
              <ClientsWorkspace onNavigate={goTo} initialClientId={selectedClientId} />
            )}

            {/* ZONE: ADMINISTRAÇÃO (Intent: Como configuro minha empresa?) */}
            {(activeTab === 'admin' || activeTab === 'settings') && (
              <MenuScreen account={account} onNavigate={goTo} />
            )}

            {/* Miscellaneous/Misc Tabs */}
            {activeTab === 'agenda' && <AgendaPage onNavigate={goTo} />}
            {activeTab === 'atlas' && <SystemAtlasWorkspace />}
            {activeTab === 'money' && <FinancialScreen />}
            {activeTab === 'reports' && (
              <ReportsScreen captures={captures} context={context} onBack={() => goTo('pulse')} />
            )}
            {activeTab === 'catalog' && (
              <CatalogScreen onAddMany={addManyCalculationCaptures} context={context} onBack={() => goTo('pulse')} />
            )}
            {activeTab === 'inventory' && <InventoryDashboard />}
            {activeTab === 'store' && <StoreScreen account={account} onBack={() => goTo('pulse')} />}
            {activeTab === 'budgets' && (
              <BudgetsScreen 
                onSelectBudget={(b) => openBudgetForEdit(b.id)} 
                onNewBudget={(type) => type === 'quick' ? goTo('new-quick-service') : goTo('new-budget')} 
              />
            )}
            {activeTab === 'assets' && <AssetsExperience onNavigate={goTo} />}
            {activeTab === 'checklists' && <ChecklistsWorkspace />}
            {activeTab === 'diagnostics' && <DiagnosticsWorkspace />}
            {activeTab === 'checklist-manager' && <ChecklistManagerScreen onBack={() => goTo('pulse')} />}
            {activeTab === 'pipeline' && <SalesWorkspace />}
            {activeTab === 'map' && <ManagerWorkspace />}
            {activeTab === 'team' && <TeamWorkspace />}
            {activeTab === 'dispatch' && <DispatchBoardPage />}

            {activeTab === 'reputation' && <ReputationWorkspace onNavigate={goTo} />}
            {activeTab === 'next-money' && <NextMoneyWorkspace onNavigate={goTo} />}
            {activeTab === 'attendances' && (
              selectedAttendanceId ? (
                <AttendanceDetailScreen 
                  id={selectedAttendanceId} 
                  onBack={() => setSelectedAttendanceId(null)} 
                  onNavigate={goTo} 
                  onOpenBudget={(bid) => openBudgetForEdit(bid)} 
                  onOpenWorkOrder={(woid) => goTo({ tab: 'operations', workOrderId: woid })} 
                />
              ) : (
                <AttendanceListScreen onNavigate={goTo} onSelectAttendance={(id) => setSelectedAttendanceId(id)} />
              )
            )}
          </RuntimeErrorBoundary>

          {/* ━━━ BLACK SCREEN PROTECTOR (FASE 3 - FALLBACK) ━━━ */}
          {(() => {
            const VALID_TABS = [
              'dashboard', 'agenda', 'assets', 'checklists', 'diagnostics', 'pipeline',
              'map', 'team', 'dispatch', 'anomalies', 'home', 'profile', 'base',
              'money', 'clients', 'attendances', 'settings', 'budgets', 'new-quick-service',
              'new-budget', 'catalog', 'inventory', 'reports', 'store', 'checklist-manager',
              'next-money', 'reputation', 'atlas', 'revenue', 'operations', 'relationships', 'admin', 'pulse'
            ];
            if (!VALID_TABS.includes(activeTab)) {
              console.warn(`[Aferix Guard] Rota de workspace "${activeTab}" não encontrada. Prevenindo black screen. Forçando redirecionamento para SOLO -> pulse.`);
              // Need to clear the execution stack to avoid React update conflicts
              setTimeout(() => goTo('pulse'), 0);
              return null;
            }
            return null;
          })()}

        </Suspense>
        </ActiveShell>
      )}
    </>
  );
}
