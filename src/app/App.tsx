import { Suspense, useEffect, useState } from 'react';
import type { CalculationCapture } from '../core/types/workflow';
import { AppShell } from './components/AppShell';
import { useRole } from '../hooks/useRole';
import { OwnerShell, FieldShell, SalesShell, ManagerShell, CustomerShell, SoloShell } from '../features/workspace/components/RoleShells';
import { FieldWorkspace } from '../features/workspace/screens/FieldWorkspace';
import { AssetsWorkspace } from '../features/workspace/screens/AssetsWorkspace';
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
import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { FinancialScreen } from './screens/FinancialScreen';
import { OperationsScreen } from './screens/OperationsScreen';
import { StoreScreen } from './screens/StoreScreen';
import { MenuScreen } from './screens/MenuScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { AttendanceListScreen } from './screens/AttendanceListScreen';
import { AttendanceDetailScreen } from './screens/AttendanceDetailScreen';
import { ClientsWorkspace } from '../features/clients/components/ClientsWorkspace';
import { ProposalGeneratorPage } from '../features/proposal/screens/ProposalGeneratorPage';
import { QuickServiceForm } from '../pages/QuickServiceForm';
import { RuntimeErrorBoundary } from './components/RuntimeErrorBoundary';
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
import { DebugPanel } from '../features/settings/components/DebugPanel';
import { multiTabProtection } from '../core/database/multiTabProtection';
import { cloudSyncService } from '../services/CloudSyncService';
import { PageShell } from './components/PageShell';
import { db } from '../storage/dexieDatabase';


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
  const [activeTab, setActiveTab] = useState<AppTab>('pulse');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [budgetResetKey, setBudgetResetKey] = useState(0);
  const [tacticalAction, setTacticalAction] = useState<string | null>(null);
  
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
      CUSTOMER: 'home',
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

  // FASE 3: Cloud Sync Background Task (Push & Pull)
  useEffect(() => {
    const interval = setInterval(() => {
      void cloudSyncService.syncLocalToCloud();
      void cloudSyncService.syncCloudToLocal();
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
    if (tab === 'new-budget') {
      const attendanceId = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      const newAttendance = {
        id: attendanceId,
        clientId: '',
        siteId: '',
        status: 'iniciado' as const,
        companyId: 'default-company',
        workspaceId: 'default-workspace',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.attendances.add(newAttendance).catch(err => {
        console.error("Erro ao iniciar atendimento inicial:", err);
      });

      localStorage.setItem('aferix_active_attendance_id', attendanceId);

      setSelectedBudgetId('new');
      setBudgetResetKey(prev => prev + 1);
      setActiveTab('budgets');
      return;
    }

    if (tab === 'new-quick-service') {
      setSelectedBudgetId('new-quick-service');
      setBudgetResetKey(prev => prev + 1);
      setActiveTab('budgets');
      return;
    }
    
    if (tab === 'budgets') {
      setSelectedBudgetId(null);
    }

    if (tab !== 'base') {
      setSelectedClientId(null);
    }

    if (tab === 'attendances') {
      setSelectedAttendanceId(null);
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

      {!hasSelectedRole && (
        <RoleSelectionScreen onComplete={() => window.dispatchEvent(new Event('aferix_role_changed'))} />
      )}
      
      {hasSelectedRole && (
        <ActiveShell activeTab={activeTab} onNavigate={goTo}>
          <Suspense fallback={<LazyWorkspaceFallback />}>
          {/* New Multi-Profile Workspaces */}
          {activeTab === 'dashboard' && (
            <HomeScreen
              account={account}
              onNavigate={goTo}
              role={role}
            />
          )}
          {activeTab === 'agenda' && <FieldWorkspace onNavigate={goTo} />}
          {activeTab === 'assets' && <AssetsWorkspace />}
          {activeTab === 'checklists' && <ChecklistsWorkspace />}
          {activeTab === 'diagnostics' && <DiagnosticsWorkspace />}
          {activeTab === 'pipeline' && <SalesWorkspace />}
          {activeTab === 'map' && <ManagerWorkspace />}
          {activeTab === 'team' && <TeamWorkspace />}
          {activeTab === 'dispatch' && <DispatchBoardPage />}
          {activeTab === 'anomalies' && <RevenueInboxPage />}
          {activeTab === 'home' && <ClientPortalPage />}
          
          {/* Fallbacks for undefined role tabs to avoid blank screens */}
          {['profile'].includes(activeTab) && (
             <div className="flex flex-col items-center justify-center h-[100dvh] text-center px-6">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/30">
                  <span className="text-2xl">🚧</span>
                </div>
                <h2 className="text-white font-bold tracking-widest uppercase mb-2">Em Construção</h2>
                <p className="text-white/40 text-sm">Este módulo ({activeTab}) será ativado nas próximas atualizações de perfil.</p>
             </div>
          )}

          {/* Legacy Fallbacks */}

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
          {activeTab === 'attendances' && (
            selectedAttendanceId ? (
              <AttendanceDetailScreen 
                id={selectedAttendanceId} 
                onBack={() => setSelectedAttendanceId(null)} 
                onNavigate={goTo}
                onOpenBudget={(budgetId) => openBudgetForEdit(budgetId)}
                onOpenWorkOrder={(workOrderId) => {
                  updateContext(clients, workOrders, workOrderId);
                  setActiveTab('base');
                }}
              />
            ) : (
              <AttendanceListScreen 
                onNavigate={goTo} 
                onSelectAttendance={(id) => setSelectedAttendanceId(id)} 
              />
            )
          )}
          {activeTab === 'settings' && <MenuScreen account={account} onAccountChange={() => {}} onNavigate={goTo} />}

          {activeTab === 'budgets' && (
            selectedBudgetId === 'new-quick-service' ? (
              <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col">
                <QuickServiceForm 
                  key={budgetResetKey} 
                  onBack={() => {
                    setSelectedBudgetId(null);
                  }} 
                />
              </div>
            ) : selectedBudgetId ? (
              <RuntimeErrorBoundary>
                <ProposalGeneratorPage 
                  key={`${selectedBudgetId}-${budgetResetKey}`}
                  id={selectedBudgetId === 'new' ? null : selectedBudgetId}
                  onBack={() => {
                    setSelectedBudgetId(null);
                  }}
                  onNavigate={goTo}
                />
              </RuntimeErrorBoundary>
            ) : (
              <BudgetsScreen 
                onNewBudget={(type) => {
                  if (type === 'quick') {
                    goTo('new-quick-service');
                  } else {
                    goTo('new-budget');
                  }
                }}
                onSelectBudget={(budget) => {
                  setSelectedBudgetId(budget.id);
                }}
              />
            )
          )}


          {activeTab === 'catalog' && <CatalogScreen onAddMany={addManyCalculationCaptures} context={context} onBack={() => goTo('settings')} />}
          {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} onBack={() => goTo('settings')} />}

          {activeTab === 'store' && <StoreScreen account={account} onAccountChange={() => {}} onBack={() => goTo('settings')} />}
        </Suspense>
        </ActiveShell>
      )}
    </>
  );
}
