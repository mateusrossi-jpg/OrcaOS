import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  loadAccountState,
  ORCA_ACCOUNT_CHANGED_EVENT,
  setLocalUserPlan,
  signInEmailAccount,
  signInGoogleAccount,
  signInLocalAccount,
  signOutLocalAccount,
  type OrcaAccountState,
} from '../core/access/accountPlanStorage';
import { getBillingReadiness } from '../core/access/billingReadiness';
import { buildProCheckoutUrl, buildProManageUrl, isProCheckoutConfigured, isProManageConfigured } from '../core/access/commercialCheckout';
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from '../core/access/googleAccountAuth';
import { getGooglePlayBillingSetup, purchaseGooglePlayPro, restoreGooglePlayPurchases, syncGooglePlayPurchaseEntitlement } from '../core/access/googlePlayBilling';
import { isPlanEntitlementSyncConfigured, refreshPlanEntitlement } from '../core/access/planEntitlements';
import { freePlanBenefits, futureProBacklog, proPlanBenefits, proV1Priorities } from '../core/access/planStrategy';
import type { CalculatorModule, UserPlan } from '../core/access/featureAccess';
import { isDevToolsEnabled } from '../core/runtime/devTools';
import type { Client, WorkOrder } from '../core/types/business';
import type { CalculationCapture } from '../core/types/workflow';
import type { GeneralCalculatorModule } from '../features/calculators/components/GeneralCalculatorWorkspace';
import type { FundamentalMode } from '../features/calculators/components/GeneralFundamentalsWorkspace';
import { loadSavedBudgets, type SavedBudgetRecord } from '../features/budgets/storage/savedBudgetsStorage';
import { loadActiveWorkOrderId, loadClients, loadWorkOrders, saveWorkOrders } from '../features/clients/storage/clientWorkOrderStorage';
import { ActiveWorkContextCard } from './components/ActiveWorkContextCard';
import { AppShell } from './components/AppShell';
import { ModuleCard } from './components/ModuleCard';
import { calculationModules, calculationSectorGroups, navItems, planLabel, storePackages, userPlan } from './orcaAppData';
import type { ActiveWorkContext, AppTab, CalculationSectorId, ModuleCardData, SurveySection } from './orcaAppTypes';
import { loadStoredCaptures, saveStoredCaptures } from './storage/calculationCapturesStorage';
import { cleanupRuntimeValidationData } from './storage/runtimeValidationCleanup';
import { LegalCompliancePanel } from '../features/settings/components/LegalCompliancePanel';

const BudgetWorkspaceClientBridge = lazy(() => import('../features/budgets/components/BudgetWorkspaceClientBridge').then((module) => ({ default: module.BudgetWorkspaceClientBridge })));
const ElectricalCalculatorWorkspace = lazy(() => import('../features/calculators/components/ElectricalCalculatorWorkspace').then((module) => ({ default: module.ElectricalCalculatorWorkspace })));
const ElectricalFundamentalsHumanWorkspace = lazy(() => import('../features/calculators/components/ElectricalFundamentalsHumanWorkspace').then((module) => ({ default: module.ElectricalFundamentalsHumanWorkspace })));
const ExpansionCalculatorsWorkspace = lazy(() => import('../features/calculators/components/ExpansionCalculatorsWorkspace').then((module) => ({ default: module.ExpansionCalculatorsWorkspace })));
const GeneralCalculatorWorkspace = lazy(() => import('../features/calculators/components/GeneralCalculatorWorkspace').then((module) => ({ default: module.GeneralCalculatorWorkspace })));
const GeneralFundamentalsWorkspace = lazy(() => import('../features/calculators/components/GeneralFundamentalsWorkspace').then((module) => ({ default: module.GeneralFundamentalsWorkspace })));
const PaintingHumanWorkspace = lazy(() => import('../features/calculators/components/PaintingHumanWorkspace').then((module) => ({ default: module.PaintingHumanWorkspace })));
const ProfessionalDomainWorkspace = lazy(() => import('../features/calculators/components/ProfessionalDomainWorkspace').then((module) => ({ default: module.ProfessionalDomainWorkspace })));
const UnifiedConstructionWorkspace = lazy(() => import('../features/calculators/components/UnifiedConstructionWorkspace').then((module) => ({ default: module.UnifiedConstructionWorkspace })));
const UnifiedConvertersWorkspace = lazy(() => import('../features/calculators/components/UnifiedConvertersWorkspace').then((module) => ({ default: module.UnifiedConvertersWorkspace })));
const UnifiedDiagnosticsWorkspace = lazy(() => import('../features/calculators/components/UnifiedDiagnosticsWorkspace').then((module) => ({ default: module.UnifiedDiagnosticsWorkspace })));
const UnifiedElectricalWorkspace = lazy(() => import('../features/calculators/components/UnifiedElectricalWorkspace').then((module) => ({ default: module.UnifiedElectricalWorkspace })));
const UnifiedFinancialWorkspace = lazy(() => import('../features/calculators/components/UnifiedFinancialWorkspace').then((module) => ({ default: module.UnifiedFinancialWorkspace })));
const UnifiedHydraulicsWorkspace = lazy(() => import('../features/calculators/components/UnifiedHydraulicsWorkspace').then((module) => ({ default: module.UnifiedHydraulicsWorkspace })));
const CatalogHubWorkspace = lazy(() => import('../features/catalog/components/CatalogHubWorkspaceWithTax').then((module) => ({ default: module.CatalogHubWorkspace })));
const ClientWorkOrderWorkspace = lazy(() => import('../features/clients/components/ClientWorkOrderWorkspace').then((module) => ({ default: module.ClientWorkOrderWorkspace })));
const SimpleFinanceWorkspace = lazy(() => import('../features/finance/components/SimpleFinanceWorkspace').then((module) => ({ default: module.SimpleFinanceWorkspace })));
const ReportWorkspace = lazy(() => import('../features/reports/components/ReportWorkspace').then((module) => ({ default: module.ReportWorkspace })));
const AppSecurityPanel = lazy(() => import('../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const LocalBackupWorkspace = lazy(() => import('../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const GuidedBudgetCartRoomAutoBridge = lazy(() => import('../features/workflow/components/GuidedBudgetCartRoomAutoBridge').then((module) => ({ default: module.GuidedBudgetCartRoomAutoBridge })));
const GuidedRoomManager = lazy(() => import('../features/workflow/components/GuidedRoomManager').then((module) => ({ default: module.GuidedRoomManager })));
const MaterialSupplyModeBridge = lazy(() => import('../features/workflow/components/MaterialSupplyModeBridge').then((module) => ({ default: module.MaterialSupplyModeBridge })));
const ClientPurchaseListWorkspace = lazy(() => import('../features/workflow/components/ClientPurchaseListWorkspace').then((module) => ({ default: module.ClientPurchaseListWorkspace })));
const TechnicalCaptureList = lazy(() => import('../features/workflow/components/TechnicalCaptureList').then((module) => ({ default: module.TechnicalCaptureList })));

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

function isGeneralCalculatorModule(module: CalculatorModule): module is GeneralCalculatorModule {
  return false;
}

function isProfessionalDomainModule(module: CalculatorModule): boolean {
  return module === 'refrigeration' || module === 'motors' || module === 'rewinding' || module === 'transformadores' || module === 'solar';
}

function isExpansionModule(module: CalculatorModule): boolean {
  return module === 'eletricaResidencial' || module === 'financeiroAvancado' || module === 'construcaoAvancada' || module === 'hidraulicaAvancada' || module === 'conversoresAvancados';
}

function getScreenTitle(activeTab: AppTab, selectedModule: ModuleCardData | null): string {
  if (activeTab === 'calculations' && selectedModule) return selectedModule.title;
  if (activeTab === 'survey') return 'Itens técnicos';
  if (activeTab === 'catalog') return 'Estoque';
  if (activeTab === 'purchaseList') return 'Lista de compra';
  if (activeTab === 'reports') return 'Relatórios';
  if (activeTab === 'financial') return 'Financeiro';
  if (activeTab === 'beta') return 'Beta';
  if (activeTab === 'settings') return 'Configurações';
  if (activeTab === 'store') return 'Loja / Pro';
  return navItems.find((item) => item.id === activeTab)?.label ?? 'Aferix';
}

function getScreenSubtitle(activeTab: AppTab, selectedModule: ModuleCardData | null): string {
  if (activeTab === 'calculations' && selectedModule) return selectedModule.description;
  if (activeTab === 'survey') return 'Registro opcional';
  if (activeTab === 'catalog') return 'Itens e serviços';
  if (activeTab === 'purchaseList') return 'Lista de compra';
  if (activeTab === 'reports') return 'Prévia do documento';
  if (activeTab === 'financial') return 'Receitas e custos';
  if (activeTab === 'beta') return 'Validação final';
  if (activeTab === 'settings') return 'Perfil e backup';
  if (activeTab === 'store') return 'Planos e acesso';
  return navItems.find((item) => item.id === activeTab)?.description ?? 'Gestão de campo';
}

function getSectorForModule(moduleId: string): CalculationSectorId {
  return calculationSectorGroups.find((group) => group.moduleIds.includes(moduleId))?.id ?? 'financial';
}

const fundamentalModuleConfig: Record<string, { modes: FundamentalMode[]; title: string; description: string; moduleLabel: string; note: string }> = {
};

const moduleGuidance: Record<string, { title: string; text: string }> = {
  eletricaPredial: {
    title: 'Um único fluxo para elétrica predial',
    text: 'Use as abas internas para começar pela base, avançar para instalação residencial, dimensionar cabos e disjuntores, conferir iluminação ou converter sinais.',
  },
  conversores: {
    title: 'Um único lugar para conversão de unidades',
    text: 'Use a aba Rápidos para conversões comuns e a aba Técnicos para AWG, polegadas, vazão completa, pressão completa, temperatura e kWh/R$.',
  },
  diagnosticoTecnico: {
    title: 'Assistentes de campo não são cálculos',
    text: 'Use para organizar checklist, prioridade, risco e manutenção quando a saída precisa virar orientação ou relatório para o cliente.',
  },
  orcamentoTecnico: {
    title: 'Um único lugar para cobrar melhor',
    text: 'Use as abas internas para orçamento rápido, produtividade, percentuais de negociação e preço com margem.',
  },
  hidraulica: {
    title: 'Um único lugar para hidráulica',
    text: 'Use as abas internas para reservatórios e medições básicas ou para instalações como piscina, esgoto, pressão por coluna e bomba simples.',
  },
  obras: {
    title: 'Um único lugar para medir e quantificar obra',
    text: 'Use as abas internas para medições, materiais básicos e composições mais completas.',
  },
};

const surveyFlowSteps: Array<{ id: SurveySection; label: string; title: string; text: string }> = [
  {
    id: 'context',
    label: 'Ambientes',
    title: 'Ambientes',
    text: 'Organize o local do serviço.',
  },
  {
    id: 'labor',
    label: 'Serviços',
    title: 'Serviços',
    text: 'Liste mão de obra e quantidades.',
  },
  {
    id: 'materials',
    label: 'Materiais',
    title: 'Materiais',
    text: 'Separe itens da proposta e da compra do cliente.',
  },
  {
    id: 'measurements',
    label: 'Medições',
    title: 'Medições',
    text: 'Registre dados de campo importantes.',
  },
  {
    id: 'notes',
    label: 'Observações',
    title: 'Observações',
    text: 'Guarde recomendações e restrições.',
  },
  {
    id: 'review',
    label: 'Revisão',
    title: 'Revisão',
    text: 'Confira antes de avançar.',
  },
];

function HomeScreen({ goTo, openModule, captures, clients, workOrders, savedBudgets, context, onStartNewAttendance }: { goTo: (tab: AppTab) => void; openModule: (module: ModuleCardData) => void; captures: CalculationCapture[]; clients: Client[]; workOrders: WorkOrder[]; savedBudgets: SavedBudgetRecord[]; context: ActiveWorkContext; onStartNewAttendance: () => void }) {
  const openWorkOrders = workOrders.filter((workOrder) => workOrder.status !== 'done' && workOrder.status !== 'cancelled').length;
  const pendingBudgets = savedBudgets.filter((budget) => budget.status === 'draft' || budget.status === 'sent').length;
  const approvedBudgets = savedBudgets.filter((budget) => budget.status === 'approved').length;
  const currentMonthBudgets = savedBudgets.filter(isBudgetFromCurrentMonth);
  const monthlyBudgetTotal = currentMonthBudgets.reduce((total, budget) => total + calculateSavedBudgetValue(budget), 0);
  const accountsReceivable = currentMonthBudgets.filter((budget) => budget.status === 'sent' || budget.status === 'approved').reduce((total, budget) => total + calculateSavedBudgetValue(budget), 0);
  const monthlyExpenses = currentMonthBudgets.reduce((total, budget) => {
    const materialEstimate = budget.materialCost ?? budget.items.filter((item) => item.category === 'material').reduce((itemTotal, item) => itemTotal + item.quantity * item.unitPrice, 0);
    return total + materialEstimate + (budget.operationalCost ?? 0) + budget.travelCost + budget.additionalFees;
  }, 0);
  const monthlyCashFlow = monthlyBudgetTotal - monthlyExpenses;
  const monthlyNetProfit = Math.max(monthlyCashFlow, 0);
  const budgetItems = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both').length;
  const recentItems = captures.slice(0, 3);
  const pricingModule = calculationModules.find((module) => module.id === 'orcamentoTecnico') ?? calculationModules[0];

  return (
    <section className="app-screen orca-dashboard-screen">
      <div className="home-action-toolbar">
        <button type="button" className="ghost-action" onClick={onStartNewAttendance}>Novo atendimento</button>
        <button type="button" className="ghost-action" onClick={() => goTo('budgets')}>Orçamento rápido</button>
        <button type="button" className="ghost-action" onClick={() => openModule(pricingModule)}>Precificar</button>
      </div>
      <ActiveWorkContextCard {...context} />

      <div className="dashboard-finance-tiles" aria-label="Resumo financeiro do mês">
        <article className="finance-tile net">
          <span>Lucro líquido do mês</span>
          <strong className="premium-accent">{formatCompactCurrency(monthlyNetProfit)}</strong>
        </article>
        <article className="finance-tile revenue">
          <span>Fluxo de caixa</span>
          <strong>{formatCompactCurrency(monthlyCashFlow)}</strong>
        </article>
        <article className="finance-tile pending">
          <span>Contas a receber</span>
          <strong>{formatCompactCurrency(accountsReceivable)}</strong>
        </article>
        <article className="finance-tile expense">
          <span>Despesas</span>
          <strong>{formatCompactCurrency(monthlyExpenses)}</strong>
        </article>
      </div>
      <section className="orca-panel-card home-command-panel">
        <header><div><h2>Atendimentos em andamento</h2></div></header>
        <div className="home-recent-strip">
          <div className="continuous-list">
            {workOrders.filter(w => w.status !== 'done' && w.status !== 'cancelled').length === 0 ? (
              <div className="continuous-list-empty">Nenhum atendimento em aberto para hoje.</div>
            ) : (
              workOrders.filter(w => w.status !== 'done' && w.status !== 'cancelled').slice(0, 5).map(order => {
                const orderClient = clients.find(c => c.id === order.clientId);
                const orderBudget = savedBudgets.find(b => b.workOrderId === order.id);
                const budgetValue = orderBudget ? orderBudget.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0) : 0;
                const createdAtDate = new Date(order.createdAt || Date.now());
                const timeString = isNaN(createdAtDate.getTime()) ? '--:--' : createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <article key={order.id} className="continuous-list-item">
                    <span className="time-col">{timeString}</span>
                    <div className="client-col">
                      <strong>{orderClient?.name ?? 'Cliente Avulso'}</strong>
                      <small>{order.title}</small>
                    </div>
                    <em className="value-col">{formatCompactCurrency(budgetValue)}</em>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

function calculateSavedBudgetValue(budget: SavedBudgetRecord): number {
  const subtotal = budget.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  return Math.max(0, subtotal + budget.travelCost + budget.additionalFees - budget.discount);
}

function isBudgetFromCurrentMonth(budget: SavedBudgetRecord): boolean {
  const referenceDate = new Date(budget.updatedAt);
  const now = new Date();
  return referenceDate.getFullYear() === now.getFullYear() && referenceDate.getMonth() === now.getMonth();
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: Math.abs(value) >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(value) >= 10000 ? 1 : 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function createAppId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function workOrderStatusText(status?: WorkOrder['status']): string {
  if (status === 'scheduled') return 'Agendada';
  if (status === 'in-progress') return 'Execução autorizada';
  if (status === 'done') return 'Concluída';
  if (status === 'cancelled') return 'Cancelada';
  return 'Em orçamento';
}

function workOrderPriorityText(priority?: WorkOrder['priority']): string {
  if (priority === 'low') return 'Baixa';
  if (priority === 'high') return 'Alta';
  if (priority === 'urgent') return 'Urgente';
  return 'Normal';
}

function CalculationsScreen({ selectedModule, openModule, activeSector, onSelectSector, goTo, userPlan: activeUserPlan, onCaptureCalculation, context, captures }: { selectedModule: ModuleCardData | null; openModule: (module: ModuleCardData | null) => void; activeSector: CalculationSectorId; onSelectSector: (sector: CalculationSectorId) => void; goTo: (tab: AppTab) => void; userPlan: UserPlan; onCaptureCalculation: (capture: CalculationCapture) => void; context: ActiveWorkContext; captures: CalculationCapture[] }) {
  const linkedCalculationCount = context.activeWorkOrder
    ? captures.filter((capture) => capture.workOrderId === context.activeWorkOrder?.id).length
    : 0;
  const calculationContextText = context.activeWorkOrder
    ? `Resultados adicionados serão vinculados ao atendimento "${context.activeWorkOrder.title}".`
    : 'Sem atendimento ativo: os cálculos funcionam como consulta avulsa e podem ser usados sem cliente.';
  const defaultPricingModule = calculationModules.find((module) => module.id === 'orcamentoTecnico') ?? calculationModules[0] ?? null;
  const activeModule = selectedModule ?? defaultPricingModule;

  if (activeModule) {
    const module = activeModule.calculatorModule;
    const selectedSector = calculationSectorGroups.find((group) => group.id === activeSector);
    const fundamentalConfig = fundamentalModuleConfig[activeModule.id];
    return (
      <section className="app-screen">
        {selectedModule && <button className="back-button" type="button" onClick={() => openModule(defaultPricingModule)}>‹ Voltar para {selectedSector?.title ?? 'cálculos'}</button>}
        <header className="module-detail-header"><div><em className={`module-plan-pill ${activeModule.plan}`}>{planLabel(activeModule.plan)}</em><h1>{activeModule.title}</h1><p>{activeModule.description}</p><small>{activeModule.count}</small></div></header>
        <div className="calculation-context-card">
          <span>{context.activeWorkOrder ? 'Cálculo vinculado' : 'Cálculo avulso'}</span>
          <strong>{calculationContextText}</strong>
          <small>Depois do resultado, escolha adicionar ao atendimento, ao orçamento ou usar apenas como consulta.</small>
        </div>
        {moduleGuidance[activeModule.id] && <div className="survey-intro-card"><span><strong>{moduleGuidance[activeModule.id].title}</strong><small>{moduleGuidance[activeModule.id].text}</small></span></div>}
        {module === 'fundamentosGerais' && fundamentalConfig && <GeneralFundamentalsWorkspace {...fundamentalConfig} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'eletricaPredial' && <UnifiedElectricalWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'fundamentals' && <ElectricalFundamentalsHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'pintura' && <PaintingHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'hidraulica' && <UnifiedHydraulicsWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'obras' && <UnifiedConstructionWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'conversores' && <UnifiedConvertersWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'diagnosticoTecnico' && <UnifiedDiagnosticsWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'orcamentoTecnico' && <UnifiedFinancialWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module && isExpansionModule(module) && <ExpansionCalculatorsWorkspace selectedModule={module} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module && isProfessionalDomainModule(module) && <ProfessionalDomainWorkspace selectedModule={module} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module && isGeneralCalculatorModule(module) && <GeneralCalculatorWorkspace selectedModule={module} onCaptureCalculation={onCaptureCalculation} />}
        {module && module !== 'fundamentosGerais' && module !== 'eletricaPredial' && module !== 'fundamentals' && module !== 'pintura' && module !== 'hidraulica' && module !== 'obras' && module !== 'conversores' && module !== 'diagnosticoTecnico' && module !== 'orcamentoTecnico' && !isExpansionModule(module) && !isProfessionalDomainModule(module) && !isGeneralCalculatorModule(module) && <ElectricalCalculatorWorkspace selectedModule={module} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {!module && <div className="empty-state-card"><strong>{activeModule.title} em breve</strong><p>Este módulo já está previsto na arquitetura financeira do Aferix.</p></div>}
      </section>
    );
  }

  const selectedSector = calculationSectorGroups.find((group) => group.id === activeSector) ?? calculationSectorGroups[0];
  const sectorModules = selectedSector.moduleIds
    .map((moduleId) => calculationModules.find((module) => module.id === moduleId))
    .filter((module): module is ModuleCardData => Boolean(module));

  return (
    <section className="app-screen calculations-overview-screen">
      <header className="screen-header"><h1>Cálculos</h1><p>Use cálculos comerciais para decidir quanto cobrar, simular margem, estimar tempo, deslocamento, materiais, taxas e parcelamento.</p></header>
      <div className="calculation-context-card">
        <span>{context.activeWorkOrder ? 'Atendimento ativo detectado' : 'Modo avulso'}</span>
        <strong>{calculationContextText}</strong>
        <small>{context.activeWorkOrder ? `${linkedCalculationCount} resultado(s) já ligados a este atendimento.` : 'Quando existir atendimento ativo, o app oferece vínculo com atendimento e orçamento.'}</small>
      </div>
      {calculationSectorGroups.length > 1 && (
        <div className="section-mode-tabs calculation-profession-tabs">
          {calculationSectorGroups.map((group) => (
            <button className={activeSector === group.id ? 'active' : ''} key={group.id} type="button" onClick={() => onSelectSector(group.id)}>
              {group.title}
            </button>
          ))}
        </div>
      )}
      <div className="survey-intro-card">
        <span><strong>{selectedSector.title}</strong><small>{selectedSector.description}</small></span>
      </div>
      <div className="module-list-heading">
        <strong>Finalidade principal</strong>
        <small>O Aferix prioriza cálculos que ajudam a formar preço, negociar e entender lucro real.</small>
      </div>
      <div className="module-list-app">{sectorModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}</div>
    </section>
  );
}

function SurveyScreen({ captures, context, onRemove, onUpdate, onAddMany, goTo }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void; onAddMany: (items: CalculationCapture[]) => void; goTo: (tab: AppTab) => void }) {
  const [activeSection, setActiveSection] = useState<SurveySection>('context');
  const [measurementDraft, setMeasurementDraft] = useState({ description: '', value: '', unit: '', note: '' });
  const [surveySavedMessage, setSurveySavedMessage] = useState('');
  const surveyCaptures = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both');
  const surveyServices = surveyCaptures.filter((capture) => capture.itemType === 'service');
  const surveyMaterials = surveyCaptures.filter((capture) => capture.itemType === 'material');
  const surveyMeasurements = surveyCaptures.filter((capture) => capture.calculatorLabel === 'Medição de campo');
  const surveyNotes = surveyCaptures.filter((capture) => (capture.itemType ?? 'technicalObservation') === 'technicalObservation' && capture.calculatorLabel !== 'Medição de campo');
  const surveyCalculations = surveyCaptures.filter((capture) => capture.calculatorLabel !== 'Medição de campo' && capture.moduleLabel !== 'Itens técnicos');
  const budgetReadyItems = surveyCaptures.filter((capture) => capture.shouldGenerateBudgetItem ?? capture.destination !== 'survey');
  const activeStepIndex = Math.max(0, surveyFlowSteps.findIndex((step) => step.id === activeSection));
  const activeStep = surveyFlowSteps[activeStepIndex] ?? surveyFlowSteps[0];
  const previousStep = surveyFlowSteps[activeStepIndex - 1];
  const nextStep = surveyFlowSteps[activeStepIndex + 1];
  const hasActiveAttendance = Boolean(context.activeWorkOrder);

  function advanceSurvey() {
    if (nextStep) {
      setActiveSection(nextStep.id);
      return;
    }
    goTo('budgets');
  }

  function addMeasurementCapture() {
    const description = measurementDraft.description.trim();
    const value = measurementDraft.value.trim();
    const unit = measurementDraft.unit.trim();
    const note = measurementDraft.note.trim();
    if (!description) return;

    const measuredValue = [value, unit].filter(Boolean).join(' ');
    const summary = measuredValue ? `${description}: ${measuredValue}` : description;
    onAddMany([
      {
        id: createAppId('survey-measurement'),
        module: 'diagnosticoTecnico',
        moduleLabel: 'Itens técnicos',
        calculatorLabel: 'Medição de campo',
        destination: 'survey',
        createdAt: new Date().toISOString(),
        summary,
        details: [
          `Medição: ${description}`,
          measuredValue ? `Valor: ${measuredValue}` : 'Valor: conferir em campo',
          note ? `Observação: ${note}` : 'Observação: registro manual feito durante a visita técnica.',
        ],
        itemType: 'technicalObservation',
        editableDescription: summary,
        quantity: '1',
        unitValue: '',
        shouldGenerateBudgetItem: false,
        convertedToBudgetItem: false,
        technicalNote: note || 'Medição registrada nos itens técnicos. Validar com instrumento adequado quando depender de norma, tabela ou condição real da instalação.',
        reportReady: true,
      },
    ]);
    setMeasurementDraft({ description: '', value: '', unit: '', note: '' });
  }

  function saveSurveyReview() {
    setSurveySavedMessage(`Itens técnicos salvos localmente com ${surveyCaptures.length} item(ns).`);
  }

  return (
    <section className="app-screen">
      <header className="screen-header"><h1>Base técnica</h1></header>
      {hasActiveAttendance ? <ActiveWorkContextCard {...context} /> : (
        <div className="survey-empty-state survey-quiet-empty">
          <strong>Nenhum atendimento ativo</strong>
          <p>Inicie ou selecione um atendimento para vincular dados técnicos.</p>
        </div>
      )}
      <div className="survey-step-guide" aria-label="Etapas dos itens técnicos">
        {surveyFlowSteps.map((step) => (
          <button className={activeSection === step.id ? 'active' : ''} key={step.id} type="button" onClick={() => setActiveSection(step.id)}>
            <strong>{step.label}</strong>
          </button>
        ))}
      </div>
      <div className="survey-intro-card"><span><strong>{activeStep.title}</strong><small>{activeStep.text}</small></span></div>
      {activeSection === 'context' && <GuidedRoomManager />}
      {activeSection === 'labor' && <GuidedBudgetCartRoomAutoBridge mode="catalog" onSendToBudget={onAddMany} />}
      {activeSection === 'materials' && <MaterialSupplyModeBridge mode="parts" onSendToBudget={onAddMany} />}
      {activeSection === 'measurements' && (
        <section className="survey-measurement-panel">
          <header>
            <div>
              <span className="orca-kicker">Medições de campo</span>
              <h2>Registre dados que normalmente ficariam no papel</h2>
            </div>
            <button className="secondary-action inline-action" type="button" onClick={() => goTo('calculations')}>Abrir calculadoras</button>
          </header>
          <div className="survey-measurement-grid">
            <label>
              <span>O que foi medido</span>
              <input value={measurementDraft.description} placeholder="Ex.: distancia do quadro ate o quarto" onChange={(event) => setMeasurementDraft((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label>
              <span>Valor</span>
              <input value={measurementDraft.value} placeholder="Ex.: 12" inputMode="decimal" onChange={(event) => setMeasurementDraft((current) => ({ ...current, value: event.target.value }))} />
            </label>
            <label>
              <span>Unidade</span>
              <input value={measurementDraft.unit} placeholder="m, A, W, mm, pontos" onChange={(event) => setMeasurementDraft((current) => ({ ...current, unit: event.target.value }))} />
            </label>
            <label className="survey-measurement-wide">
              <span>Observação técnica</span>
              <textarea value={measurementDraft.note} placeholder="Ex.: passagem por canaleta aparente; confirmar trajeto antes da execução." onChange={(event) => setMeasurementDraft((current) => ({ ...current, note: event.target.value }))} />
            </label>
          </div>
          <div className="survey-measurement-actions">
            <small>Medições entram no atendimento e no relatório. Use calculadoras quando o dado precisar virar dimensionamento, custo ou orçamento.</small>
            <button className="primary-action inline-action" type="button" disabled={!measurementDraft.description.trim()} onClick={addMeasurementCapture}>Adicionar medição</button>
          </div>
        </section>
      )}
      {activeSection === 'notes' && <GuidedBudgetCartRoomAutoBridge mode="manual" onSendToBudget={onAddMany} />}
      {activeSection === 'review' && (
        <>
          <section className="survey-review-panel">
            <header>
              <div>
                <span className="orca-kicker">Revisão do atendimento</span>
                <h2>Confira antes de gerar orçamento</h2>
              </div>
              <strong>{budgetReadyItems.length} item(ns) irão para orçamento</strong>
            </header>
            <div className="survey-review-grid">
              <article><span>Cliente</span><strong>{context.activeClient?.name ?? 'Cliente não vinculado'}</strong><small>{context.activeClient?.phone || 'WhatsApp não informado'}</small></article>
              <article><span>Endereço</span><strong>{context.activeWorkOrder?.address || context.activeClient?.address || 'Endereço não informado'}</strong><small>Confirme antes da visita ou execução.</small></article>
              <article><span>Atendimento</span><strong>{context.activeWorkOrder?.title ?? 'Sem atendimento ativo'}</strong><small>{workOrderStatusText(context.activeWorkOrder?.status)} · Prioridade {workOrderPriorityText(context.activeWorkOrder?.priority)}</small></article>
              <article><span>Descrição</span><strong>{context.activeWorkOrder?.description || 'Descrição inicial não preenchida'}</strong><small>Use observações para detalhar diagnóstico e restrições.</small></article>
            </div>
            <div className="survey-review-counts">
              <article><span>Serviços</span><strong>{surveyServices.length}</strong></article>
              <article><span>Materiais</span><strong>{surveyMaterials.length}</strong></article>
              <article><span>Medições</span><strong>{surveyMeasurements.length}</strong></article>
              <article><span>Observações</span><strong>{surveyNotes.length}</strong></article>
              <article><span>Cálculos usados</span><strong>{surveyCalculations.length}</strong></article>
            </div>
            <div className="survey-review-next-actions">
              <button className="primary-action inline-action" type="button" onClick={() => goTo('budgets')}>Gerar orçamento</button>
              <button className="secondary-action inline-action" type="button" onClick={() => setActiveSection('materials')}>Voltar e ajustar</button>
              <button className="secondary-action inline-action" type="button" onClick={saveSurveyReview}>Salvar itens técnicos</button>
            </div>
            {surveySavedMessage && <p className="survey-review-saved">{surveySavedMessage}</p>}
          </section>
          <TechnicalCaptureList captures={surveyCaptures} emptyText="Use ambientes, serviços, materiais, medições ou observações para montar os itens técnicos." onRemove={onRemove} onUpdate={onUpdate} />
        </>
      )}
      <div className="survey-step-actions">
        <button className="secondary-action inline-action" type="button" disabled={!previousStep} onClick={() => previousStep && setActiveSection(previousStep.id)}>Voltar</button>
        <span>{activeStepIndex + 1} de {surveyFlowSteps.length} · {surveyCaptures.length} item(ns) salvos</span>
        <button className="primary-action inline-action" type="button" onClick={advanceSurvey}>{nextStep ? `Próximo: ${nextStep.label}` : 'Ir para orçamento'}</button>
      </div>
    </section>
  );
}

function BudgetsScreen({ captures, context, userPlan: activeUserPlan, goTo, onRemove, onUpdate, onConvertApprovedBudgetToWorkOrder }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }; userPlan: UserPlan; goTo: (tab: AppTab) => void; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void; onConvertApprovedBudgetToWorkOrder: () => void }) {
  const budgetCaptures = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both');
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Propostas</h1></header>
      <ActiveWorkContextCard {...context} />
      {budgetCaptures.length > 0 && (
        <details className="budget-technical-drawer">
          <summary>
            <span><strong>Base técnica do orçamento</strong><small>{budgetCaptures.length} item(ns) vindos de cálculos ou itens técnicos.</small></span>
            <em>Revisar</em>
          </summary>
          <TechnicalCaptureList captures={budgetCaptures} emptyText="Abra um cálculo ou adicione itens diretamente no orçamento para montar a base técnica." onRemove={onRemove} onUpdate={onUpdate} />
        </details>
      )}
      <BudgetWorkspaceClientBridge technicalCaptures={budgetCaptures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onTechnicalCaptureConverted={(id) => onUpdate(id, { convertedToBudgetItem: true })} onConvertApprovedBudgetToWorkOrder={onConvertApprovedBudgetToWorkOrder} />
    </section>
  );
}

function CatalogScreen({ onAddMany, context }: { onAddMany: (items: CalculationCapture[]) => void; context: ActiveWorkContext }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><h1>Estoque e catálogo</h1><p>Catálogo local para apoiar proposta e compra.</p></header><ActiveWorkContextCard {...context} /><CatalogHubWorkspace onSendToBudget={onAddMany} /></section>;
}

function MoreScreen({ goTo }: { goTo: (tab: AppTab) => void }) {
  return (
    <section className="app-screen more-screen">
      <header className="screen-header"><h1>Mais recursos</h1></header>
      <div className="more-resource-grid">
        <article className="resource-action-card"><strong>Backup e segurança</strong><small>Proteja seus dados e acesso local.</small><button type="button" onClick={() => goTo('settings')}>Abrir</button></article>
        <article className="resource-action-card"><strong>Perfil profissional</strong><small>Atualize dados usados em proposta e relatório.</small><button type="button" onClick={() => goTo('settings')}>Abrir</button></article>
        <article className="resource-action-card"><strong>Beta e publicação</strong><small>Checklist final antes de liberar build.</small><button type="button" onClick={() => goTo('beta')}>Abrir</button></article>
        <article className="resource-action-card"><strong>Licença e planos</strong><small>Compare Free, Pro e recursos planejados.</small><button type="button" onClick={() => goTo('store')}>Abrir</button></article>
      </div>
      <details className="orca-panel-card roadmap-panel">
        <summary><span><strong>Evolução planejada</strong></span><em>Abrir</em></summary>
        <div className="roadmap-list">
          <article><strong>Fase 1</strong><small>Atendimento, cálculo, orçamento e relatório simples.</small></article>
          <article><strong>Fase 2</strong><small>Financeiro gerencial com receitas, custos e lucro real.</small></article>
          <article><strong>Fase 3</strong><small>Catálogo, serviços, materiais, estoque leve e lista de compra.</small></article>
          <article><strong>Fase 4</strong><small>Relatórios técnicos e empresariais.</small></article>
          <article><strong>Fase 5</strong><small>Web, nuvem, multiusuário, fiscal e integrações.</small></article>
        </div>
      </details>
    </section>
  );
}

function ReportsScreen({ captures, context }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null } }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><h1>Relatórios</h1></header><ActiveWorkContextCard {...context} /><ReportWorkspace captures={captures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} /></section>;
}

function PurchaseListScreen({ captures, onUpdate, context }: { captures: CalculationCapture[]; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void; context: ActiveWorkContext }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><h1>Lista de compra do cliente</h1><p>Materiais que o cliente compra.</p></header><ActiveWorkContextCard {...context} /><ClientPurchaseListWorkspace captures={captures} onUpdate={onUpdate} /></section>;
}

function FinancialScreen({ context }: { context: ActiveWorkContext }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><h1>Financeiro</h1><p>Receitas, custos e lucro real.</p></header><ActiveWorkContextCard {...context} /><SimpleFinanceWorkspace /></section>;
}

const betaFlowChecks = [
  { title: 'Primeira abertura', text: 'Intro curta aparece uma vez, sem som, e depois o app entra direto na Home.' },
  { title: 'Atendimento simples', text: 'Novo usuário consegue criar cliente, atendimento e orçamento sem assistente longo.' },
  { title: 'Orçamento manual', text: 'Técnico consegue montar proposta rápida em fluxo direto.' },
  { title: 'Cálculos essenciais', text: 'Resultados mostram unidade, fórmula, exemplo, aviso técnico e opção de vincular ao atendimento.' },
  { title: 'Materiais', text: 'Cadastro manual e catálogo local funcionam offline; busca online entra apenas como referência revisável.' },
  { title: 'Aprovação', text: 'A interface só oferece converter em OS depois que o orçamento está aprovado.' },
  { title: 'Relatório', text: 'Resumo técnico usa cliente, atendimento, materiais, serviços, cálculos e recomendações.' },
  { title: 'Backup', text: 'Testador encontra backup local ou Drive antes de trocar navegador, aparelho ou build.' },
];

const betaStoreChecks = [
  'Ícone adaptativo Android centralizado e sem fundo branco.',
  'Splash nativa curta e intro exibida somente na primeira abertura.',
  'Home mobile-first respondendo “o que fazer agora?”.',
  'Login não bloqueia uso básico local.',
  'Pro apresentado como validação assistida, sem cobrança falsa.',
  'Nenhuma chave sensível exposta no front-end.',
  'Fluxos principais testados em navegador antes de gerar build Android.',
  'Comandos npm run dev, npm run build e npm run rc:check passando antes da entrega.',
];

function BetaReadinessScreen() {
  return (
    <section className="app-screen wide-screen beta-readiness-screen">
      <header className="screen-header"><h1>Beta</h1><p>Validação fechada antes da publicação.</p></header>
      <section className="beta-status-hero">
        <article><span>Status</span><strong>Beta fechado</strong><small>Fluxos principais em validação.</small></article>
        <article><span>Escopo</span><strong>Produto financeiro</strong><small>Atendimento, proposta, relatório e lucro.</small></article>
        <article><span>Próximo</span><strong>Publicação</strong><small>Build Android após checklist.</small></article>
      </section>
      <section className="orca-panel-card beta-check-panel">
        <header><div><h2>Fluxos de teste</h2></div></header>
        <div className="beta-check-grid">
          {betaFlowChecks.map((item) => <article key={item.title}><strong>{item.title}</strong><small>{item.text}</small></article>)}
        </div>
      </section>
      <section className="orca-panel-card beta-release-panel">
        <header><div><h2>Publicação</h2></div></header>
        <div className="beta-release-list">
          {betaStoreChecks.map((item) => <article key={item}><span /> <small>{item}</small></article>)}
        </div>
      </section>
      <section className="orca-panel-card beta-future-panel">
        <header><div><h2>Pendências futuras</h2></div></header>
        <div className="beta-future-list">
          {futureProBacklog.slice(0, 4).map((benefit) => <article key={benefit.title}><strong>{benefit.title}</strong><small>{benefit.description}</small></article>)}
        </div>
      </section>
    </section>
  );
}

function ClientsScreen({ initialSection, sectionRequestKey, onContextChange, onOpenBudgets, onStartSurvey }: { initialSection?: 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders'; sectionRequestKey?: number; onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void; onOpenBudgets: () => void; onStartSurvey: () => void }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><h1>Atendimentos</h1><p>Vincule um cliente agora ou continue sem cliente, levante dados e gere orçamento antes de converter em OS.</p></header><ClientWorkOrderWorkspace initialSection={initialSection} sectionRequestKey={sectionRequestKey} onContextChange={onContextChange} onOpenBudgets={onOpenBudgets} onStartSurvey={onStartSurvey} /></section>;
}

function planStatusTitle(account: OrcaAccountState): string {
  if (account.plan === 'pro' && account.planStatus === 'trial') return 'Pro em teste';
  if (account.plan === 'pro') return 'Pro ativo';
  if (account.planStatus === 'expired') return 'Liberação expirada';
  if (account.planStatus === 'past_due') return 'Liberação pendente';
  if (account.planStatus === 'inactive') return 'Nenhuma liberação Pro encontrada';
  return 'Plano grátis';
}

function planStatusDescription(account: OrcaAccountState, planSourceLabel: string): string {
  if (account.plan === 'pro' && account.planStatus === 'trial') return `Teste Pro liberado por ${planSourceLabel}.`;
  if (account.plan === 'pro') return `Recursos Pro liberados por ${planSourceLabel}.`;
  if (account.planStatus === 'expired') return 'A liberação Pro foi encontrada, mas expirou. Recursos Pro permanecem bloqueados.';
  if (account.planStatus === 'past_due') return 'Existe pendência na assinatura Pro. Regularize no checkout/portal e verifique novamente.';
  if (account.planStatus === 'inactive') return 'Nenhuma liberação Pro ativa foi encontrada para a conta/e-mail usado.';
  return 'Free ativo. Assine Pro para liberar modelos profissionais, limites maiores e recursos de lucro real.';
}

function StoreScreen({ account, onAccountChange }: { account: OrcaAccountState; onAccountChange: (account: OrcaAccountState) => void }) {
  const activeUserPlan = account.plan;
  const devToolsEnabled = isDevToolsEnabled();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCheckingPlan, setIsCheckingPlan] = useState(false);
  const [isGooglePlayBusy, setIsGooglePlayBusy] = useState(false);
  const canCheckPlan = isPlanEntitlementSyncConfigured() && Boolean(account.userId);
  const checkoutConfigured = isProCheckoutConfigured();
  const manageConfigured = isProManageConfigured();
  const billingReadiness = getBillingReadiness();
  const googlePlaySetup = getGooglePlayBillingSetup();
  const googlePlayMode = billingReadiness.channel === 'google-play';
  const planSourceLabel = account.planSource === 'subscription'
    ? 'verificação Pro'
    : account.planSource === 'local-test' && devToolsEnabled
      ? 'teste local'
      : 'verificação local';

  async function checkSubscription() {
    setIsCheckingPlan(true);
    setFeedback(null);
    try {
      const result = await refreshPlanEntitlement(account);
      onAccountChange(result.account);
      setFeedback(planStatusDescription(result.account, 'verificação Pro'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível verificar a liberação Pro.');
    } finally {
      setIsCheckingPlan(false);
    }
  }

  function openCheckout() {
    setFeedback(null);
    try {
      window.open(buildProCheckoutUrl(account), '_blank', 'noopener,noreferrer');
      setFeedback('Checkout aberto. Depois do pagamento, volte aqui e clique em Verificar assinatura.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível abrir o checkout Pro.');
    }
  }

  function openSubscriptionPortal() {
    setFeedback(null);
    try {
      window.open(buildProManageUrl(account), '_blank', 'noopener,noreferrer');
      setFeedback('Portal de assinatura aberto. Depois de alterar o plano, clique em Verificar assinatura.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível abrir o portal de assinatura.');
    }
  }

  async function buyWithGooglePlay() {
    setIsGooglePlayBusy(true);
    setFeedback(null);
    try {
      const purchase = await purchaseGooglePlayPro();
      const result = await syncGooglePlayPurchaseEntitlement(account, purchase, 'purchase');
      onAccountChange(result.account);
      setFeedback(planStatusDescription(result.account, 'Google Play'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível concluir a compra pelo Google Play.');
    } finally {
      setIsGooglePlayBusy(false);
    }
  }

  async function restoreWithGooglePlay() {
    setIsGooglePlayBusy(true);
    setFeedback(null);
    try {
      const purchases = await restoreGooglePlayPurchases();
      if (purchases.length === 0) {
        setFeedback('Nenhuma compra Pro restaurável foi encontrada nesta conta Google Play.');
        return;
      }
      const result = await syncGooglePlayPurchaseEntitlement(account, purchases[0], 'restore');
      onAccountChange(result.account);
      setFeedback(planStatusDescription(result.account, 'restauração Google Play'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível restaurar compras pelo Google Play.');
    } finally {
      setIsGooglePlayBusy(false);
    }
  }

  return (
    <section className="app-screen wide-screen store-screen">
      <header className="screen-header"><h1>Licença</h1><p>Free para começar. Pro para vender com mais margem e apresentação.</p></header>
      <section className="store-summary-grid">
        <article><span>Free</span><strong>Grátis</strong><small>Básico</small></article>
        <article className="featured"><span>Pro</span><strong>Em validação</strong><small>Profissional</small></article>
        <article className="featured"><span>Pacote vitalício</span><strong>R$ 29,90 sugerido</strong><small>Recursos planejados</small></article>
      </section>
      <section className="orca-panel-card store-comparison-card">
        <header><div><h2>Comparativo de planos</h2></div></header>
        <div className="store-comparison-table">
          <div className="row head"><span>Plano</span><span>Posicionamento</span><span>Status</span></div>
          <div className="row"><strong>Free</strong><span>Básico</span><span>Disponível</span></div>
          <div className="row featured"><strong>Pro</strong><span>Profissional</span><span>Em validação</span></div>
          <div className="row"><strong>Vitalício</strong><span>Recursos planejados</span><span>R$ 29,90 sugerido</span></div>
        </div>
      </section>
      <div className="settings-group account-settings-panel billing-readiness-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Pagamentos</span>
          <h2>{billingReadiness.statusTitle}</h2>
          </div>
        <div className="billing-readiness-grid">
          <article><span>Canal</span><strong>{billingReadiness.channelLabel}</strong><small>{billingReadiness.channel === 'beta-assisted' ? 'Sem cobrança automática no beta.' : 'Canal configurável por ambiente.'}</small></article>
          <article><span>Endpoint Pro</span><strong>{billingReadiness.entitlementEndpointConfigured ? 'Configurado' : 'Pendente'}</strong><small>Responsável por liberar, expirar ou bloquear Pro.</small></article>
          <article><span>Android package</span><strong>{billingReadiness.packageName || 'Pendente'}</strong><small>Necessário para Google Play Billing.</small></article>
          <article><span>Produto Pro</span><strong>{billingReadiness.proProductId || 'Pendente'}</strong><small>ID da assinatura/produto no Play Console.</small></article>
          <article><span>Bridge Android</span><strong>{billingReadiness.googlePlayBridgeName}</strong><small>{googlePlaySetup.bridgeAvailable ? 'Disponível neste app.' : 'Aguardando plugin nativo.'}</small></article>
        </div>
        <div className="billing-release-list">
          {billingReadiness.releaseChecklist.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
      {googlePlayMode && <div className="settings-group account-settings-panel commercial-checkout-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Google Play</span>
          <h2>Compra pela conta Google</h2>
          </div>
        <div className="billing-readiness-grid">
          <article><span>Produto</span><strong>{googlePlaySetup.productId || 'Pendente'}</strong><small>Assinatura/produto Pro no Play Console.</small></article>
          <article><span>Pacote</span><strong>{googlePlaySetup.packageName || 'Pendente'}</strong><small>Deve bater com o app publicado.</small></article>
          <article><span>Backend</span><strong>{googlePlaySetup.entitlementEndpoint ? 'Configurado' : 'Pendente'}</strong><small>Valida token com Google, não no front-end.</small></article>
        </div>
        <div className="general-capture-actions">
          <button type="button" disabled={!billingReadiness.isGooglePlayReady || !account.userId || isGooglePlayBusy || activeUserPlan === 'pro'} onClick={buyWithGooglePlay}>{isGooglePlayBusy ? 'Processando...' : 'Comprar com Google Play'}</button>
          <button type="button" className="secondary-action" disabled={!billingReadiness.isGooglePlayReady || !account.userId || isGooglePlayBusy} onClick={restoreWithGooglePlay}>Restaurar compra</button>
        </div>
        {!account.userId && <p className="general-helper-text">Entre com e-mail ou Google antes de comprar/restaurar Pro.</p>}
        {!googlePlaySetup.bridgeAvailable && <p className="general-helper-text">Bridge nativo pendente no Android/Capacitor antes da venda real.</p>}
      </div>}
      <div className="orca-panel-card">
        <header>
          <div>
            <span className="orca-kicker">Assinatura</span>
            <h2>{activeUserPlan === 'pro' ? 'Aferix Pro Ativo' : 'Plano Aferix Pro'}</h2>
          </div>
        </header>
        <div className="dashboard-finance-tiles" style={{ padding: '1rem' }}>
          <article className="finance-tile"><span>Status</span><strong>{planStatusTitle(account)}</strong></article>
          <article className="finance-tile"><span>ID</span><strong>{account.installationId.slice(0, 8)}</strong></article>
        </div>
        <div className="local-backup-actions" style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button className="ghost-action" type="button" onClick={openCheckout} disabled={activeUserPlan === 'pro'}>Assinar Pro</button>
          <button className="ghost-action" type="button" onClick={checkSubscription}>Verificar</button>
        </div>
      </div>
      <div className="settings-group account-settings-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Estratégia Free / Pro</span>
          <h2>Grátis para usar, Pro para profissionalizar</h2>
        </div>
        {storePackages.map((pack) => <article className="store-card" key={pack.title}><span><strong>{pack.title}</strong><small>{pack.description}</small><b>{pack.price}</b></span><em className="store-card-status">Planejado</em></article>)}
      </div>
      <div className="orca-panel-card">
        <header>
          <div>
            <h2>Comparativo de Planos</h2>
          </div>
        </header>
        <div className="dashboard-finance-tiles" style={{ padding: '1rem' }}>
          <article className="finance-tile"><span>Free</span><strong>Básico</strong></article>
          <article className="finance-tile" style={{ borderLeft: '3px solid #f59e0b' }}><span>Pro</span><strong>Profissional</strong></article>
        </div>
        <div className="continuous-list">
          {proPlanBenefits.map((benefit) => (
            <article className="continuous-list-item" key={benefit.title}>
              <div className="client-col">
                <strong>{benefit.title}</strong>
                <small>{benefit.description}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="settings-group account-settings-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Prioridade V1 Pro</span>
          <h2>O que vem primeiro</h2>
        </div>
        <div className="plan-priority-grid">
          {proV1Priorities.map((benefit, index) => <article key={benefit.title}><span>{index + 1}</span><strong>{benefit.title}</strong><small>{benefit.description}</small></article>)}
        </div>
        <div className="plan-future-list">
          {futureProBacklog.map((benefit) => <span key={benefit.title}><strong>{benefit.title}</strong><small>{benefit.description}</small></span>)}
        </div>
      </div>
    </section>
  );
}

function SettingsScreen({ account, onAccountChange }: { account: OrcaAccountState; onAccountChange: (account: OrcaAccountState) => void }) {
  const [settingsSection, setSettingsSection] = useState<'profile' | 'security' | 'backup' | 'preferences' | 'about'>('profile');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailDraft, setEmailDraft] = useState(account.email);
  const [nameDraft, setNameDraft] = useState(account.displayName === 'Visitante' ? '' : account.displayName);
  const googleReady = isGoogleAccountLoginConfigured();
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const accountDescription = account.status === 'google' ? `${account.email || 'E-mail não informado'} · Google vinculado` : account.status === 'email' ? `${account.email} · cadastro por e-mail` : account.status === 'local' ? 'Conta local deste dispositivo' : 'Modo visitante local-first';

  function registerEmailAccount() {
    try {
      const nextAccount = signInEmailAccount(emailDraft, nameDraft);
      onAccountChange(nextAccount);
      setFeedback('Conta por e-mail cadastrada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível cadastrar e-mail.');
    }
  }

  async function connectGoogle() {
    setIsSigningIn(true);
    setFeedback(null);
    try {
      const profile = await requestGoogleAccountProfile();
      const nextAccount = signInGoogleAccount(profile);
      onAccountChange(nextAccount);
      setFeedback('Conta Google conectada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível entrar com Google.');
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Configurações</h1>
        <p>Conta, perfil, backup e segurança.</p>
      </header>

      <section className="settings-readiness-grid">
        <article><span>Local-first</span><strong>Funciona sem conta</strong><small>Clientes, atendimentos, cálculos e orçamentos continuam no dispositivo.</small></article>
        <article><span>Conta opcional</span><strong>Identificação do acesso</strong><small>Use e-mail ou Google para vincular testador, Pro assistido e backup no Drive.</small></article>
        <article><span>Backup</span><strong>Local e Drive</strong><small>Exporte seus dados ou salve uma cópia privada no Google Drive.</small></article>
      </section>

      <nav className="settings-section-tabs" aria-label="Seções de configurações">
        <button className={settingsSection === 'profile' ? 'active' : ''} type="button" onClick={() => setSettingsSection('profile')}>Perfil profissional</button>
        <button className={settingsSection === 'security' ? 'active' : ''} type="button" onClick={() => setSettingsSection('security')}>Segurança e acesso</button>
        <button className={settingsSection === 'backup' ? 'active' : ''} type="button" onClick={() => setSettingsSection('backup')}>Backup local</button>
        <button className={settingsSection === 'preferences' ? 'active' : ''} type="button" onClick={() => setSettingsSection('preferences')}>Preferências do app</button>
        <button className={settingsSection === 'about' ? 'active' : ''} type="button" onClick={() => setSettingsSection('about')}>Sobre o Aferix</button>
      </nav>

      {settingsSection === 'profile' && <div className="settings-group account-settings-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Perfil profissional</span>
          <h2>Identidade e acesso</h2>
          <p>Use um e-mail principal quando quiser vincular cadastro, Google, liberação Pro assistida e backup no Drive. Para atendimento local, não precisa entrar.</p>
        </div>

        <div className="account-status-grid">
          <article className="settings-row">
            <span><strong>{accountLabel}</strong><small>{accountDescription}</small></span>
          </article>
          <article className="settings-row">
            <span><strong>{planStatusTitle(account)}</strong><small>{planStatusDescription(account, account.planSource === 'subscription' ? 'verificação Pro' : 'verificação local')}</small></span>
          </article>
          <article className="settings-row">
            <span><strong>ID da instalação</strong><small>{account.installationId}</small></span>
          </article>
        </div>

        <section className="account-email-card">
          <div>
            <strong>Vincular e-mail opcional</strong>
            <small>Informe o nome profissional e o e-mail que poderão ser usados para beta, backup no Drive e liberação Pro assistida.</small>
          </div>
          <div className="settings-form-grid">
            <label className="general-form-field"><span>Nome profissional</span><input value={nameDraft} placeholder="Ex.: Profissional técnico" onChange={(event) => setNameDraft(event.target.value)} /></label>
            <label className="general-form-field"><span>E-mail de acesso</span><input type="email" value={emailDraft} placeholder="profissional@email.com" onChange={(event) => setEmailDraft(event.target.value)} /></label>
          </div>
          <div className="settings-actions-row">
            <button type="button" onClick={registerEmailAccount}>Cadastrar e-mail</button>
            <button type="button" disabled={!googleReady || isSigningIn} onClick={connectGoogle}>{isSigningIn ? 'Conectando...' : 'Vincular Google'}</button>
            <button className="secondary-action" type="button" onClick={() => onAccountChange(signInLocalAccount())}>Entrar localmente</button>
            <button className="secondary-action" type="button" onClick={() => onAccountChange(signOutLocalAccount())}>Sair</button>
          </div>
          {!googleReady && <p className="general-helper-text">Login Google indisponível neste ambiente. O app continua funcionando com acesso local e e-mail opcional.</p>}
          {feedback && <p className="general-added-message">{feedback}</p>}
        </section>
      </div>}

      {settingsSection === 'security' && <AppSecurityPanel />}
      {settingsSection === 'backup' && (
        <>
          <LocalBackupWorkspace includeLinkedSettings={false} />
          <GoogleDriveBackupPanel />
        </>
      )}
      {settingsSection === 'preferences' && (
        <>
          <ProfessionalProfileWorkspace />
        </>
      )}
      {settingsSection === 'about' && <LegalCompliancePanel />}
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleCardData | null>(null);
  const [activeSector, setActiveSector] = useState<CalculationSectorId>('financial');
  const [clientInitialSection, setClientInitialSection] = useState<'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders'>('dashboard');
  const [clientSectionRequestKey, setClientSectionRequestKey] = useState(0);
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => {
    cleanupRuntimeValidationData();
    return loadStoredCaptures();
  });
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());
  const [account, setAccount] = useState<OrcaAccountState>(() => loadAccountState());
  const activeUserPlan = account.plan ?? userPlan;

  useEffect(() => { saveStoredCaptures(captures); }, [captures]);
  useEffect(() => {
    function syncAccount() {
      setAccount(loadAccountState());
    }

    window.addEventListener(ORCA_ACCOUNT_CHANGED_EVENT, syncAccount);
    return () => window.removeEventListener(ORCA_ACCOUNT_CHANGED_EVENT, syncAccount);
  }, []);

  const activeWorkOrder = useMemo(() => workOrders.find((workOrder) => workOrder.id === activeWorkOrderId) ?? null, [activeWorkOrderId, workOrders]);
  const activeClient = useMemo(() => (activeWorkOrder?.clientId ? clients.find((client) => client.id === activeWorkOrder.clientId) ?? null : null), [activeWorkOrder?.clientId, clients]);
  const context = useMemo(() => ({ activeClient, activeWorkOrder }), [activeClient, activeWorkOrder]);

  function attachActiveWorkOrder(capture: CalculationCapture): CalculationCapture {
    return activeWorkOrderId && !capture.workOrderId ? { ...capture, workOrderId: activeWorkOrderId } : capture;
  }

  function addCalculationCapture(capture: CalculationCapture) {
    setCaptures((current) => [{ itemType: 'technicalObservation', editableDescription: capture.summary, quantity: '1', unitValue: '', shouldGenerateBudgetItem: capture.destination !== 'survey', convertedToBudgetItem: false, ...attachActiveWorkOrder(capture) }, ...current]);
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
    setActiveTab(tab);
    if (tab !== 'calculations') setSelectedModule(null);
  }

  function openClientSection(section: 'dashboard' | 'newClient' | 'newWorkOrder' | 'clients' | 'workOrders') {
    setClientInitialSection(section);
    setClientSectionRequestKey((current) => current + 1);
    setActiveTab('clients');
    setSelectedModule(null);
  }

  function openModule(module: ModuleCardData | null) {
    setSelectedModule(module);
    if (module) setActiveSector(getSectorForModule(module.id));
    setActiveTab('calculations');
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
    <AppShell activeTab={activeTab} navItems={navItems} activeClient={activeClient} activeWorkOrder={activeWorkOrder} onNavigate={goTo}>
      <Suspense fallback={<LazyWorkspaceFallback />}>
        {activeTab === 'home' && <HomeScreen goTo={goTo} openModule={openModule} captures={captures} clients={clients} workOrders={workOrders} savedBudgets={loadSavedBudgets()} context={context} onStartNewAttendance={() => openClientSection('newWorkOrder')} />}
        {activeTab === 'calculations' && <CalculationsScreen selectedModule={selectedModule} openModule={openModule} activeSector={activeSector} onSelectSector={setActiveSector} goTo={goTo} userPlan={activeUserPlan} onCaptureCalculation={addCalculationCapture} context={context} captures={captures} />}
        {activeTab === 'survey' && <SurveyScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} onAddMany={addManyCalculationCaptures} goTo={goTo} />}
        {activeTab === 'budgets' && <BudgetsScreen captures={captures} context={context} userPlan={activeUserPlan} goTo={goTo} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} onConvertApprovedBudgetToWorkOrder={convertActiveBudgetToWorkOrder} />}
        {activeTab === 'more' && <MoreScreen goTo={goTo} />}
        {activeTab === 'catalog' && <CatalogScreen onAddMany={addManyCalculationCaptures} context={context} />}
        {activeTab === 'purchaseList' && <PurchaseListScreen captures={captures} onUpdate={updateCalculationCapture} context={context} />}
        {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} />}
        {activeTab === 'financial' && <FinancialScreen context={context} />}
        {activeTab === 'beta' && <BetaReadinessScreen />}
        {activeTab === 'clients' && <ClientsScreen initialSection={clientInitialSection} sectionRequestKey={clientSectionRequestKey} onOpenBudgets={() => goTo('budgets')} onStartSurvey={() => goTo('survey')} onContextChange={(nextClients, nextWorkOrders, nextActiveWorkOrderId) => { setClients(nextClients); setWorkOrders(nextWorkOrders); setActiveWorkOrderId(nextActiveWorkOrderId); }} />}
        {activeTab === 'store' && <StoreScreen account={account} onAccountChange={setAccount} />}
        {activeTab === 'settings' && <SettingsScreen account={account} onAccountChange={setAccount} />}
      </Suspense>
    </AppShell>
  );
}
