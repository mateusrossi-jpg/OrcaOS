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
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from '../core/access/googleAccountAuth';
import { isPlanEntitlementSyncConfigured, refreshPlanEntitlement } from '../core/access/planEntitlements';
import { isDevToolsEnabled } from '../core/runtime/devTools';
import type { CalculatorModule, UserPlan } from '../core/access/featureAccess';
import type { Client, WorkOrder } from '../core/types/business';
import type { CalculationCapture } from '../core/types/workflow';
import type { GeneralCalculatorModule } from '../features/calculators/components/GeneralCalculatorWorkspace';
import type { FundamentalMode } from '../features/calculators/components/GeneralFundamentalsWorkspace';
import { loadActiveWorkOrderId, loadClients, loadWorkOrders } from '../features/clients/storage/clientWorkOrderStorage';
import { ActiveWorkContextCard } from './components/ActiveWorkContextCard';
import { AppShell } from './components/AppShell';
import { ModuleCard } from './components/ModuleCard';
import { calculationModules, calculationSectorGroups, navItems, planLabel, storePackages, userPlan } from './orcaAppData';
import type { ActiveWorkContext, AppTab, CalculationSectorId, ModuleCardData, SurveySection } from './orcaAppTypes';
import { loadStoredCaptures, saveStoredCaptures } from './storage/calculationCapturesStorage';

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
const ReportWorkspace = lazy(() => import('../features/reports/components/ReportWorkspace').then((module) => ({ default: module.ReportWorkspace })));
const LocalBackupWorkspace = lazy(() => import('../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const GuidedBudgetCartRoomAutoBridge = lazy(() => import('../features/workflow/components/GuidedBudgetCartRoomAutoBridge').then((module) => ({ default: module.GuidedBudgetCartRoomAutoBridge })));
const GuidedRoomManager = lazy(() => import('../features/workflow/components/GuidedRoomManager').then((module) => ({ default: module.GuidedRoomManager })));
const MaterialSupplyModeBridge = lazy(() => import('../features/workflow/components/MaterialSupplyModeBridge').then((module) => ({ default: module.MaterialSupplyModeBridge })));
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
  return navItems.find((item) => item.id === activeTab)?.label ?? 'OrçaOS';
}

function getScreenSubtitle(activeTab: AppTab, selectedModule: ModuleCardData | null): string {
  if (activeTab === 'calculations' && selectedModule) return selectedModule.description;
  return navItems.find((item) => item.id === activeTab)?.description ?? 'Ferramenta profissional de campo';
}

function getSectorForModule(moduleId: string): CalculationSectorId {
  return calculationSectorGroups.find((group) => group.moduleIds.includes(moduleId))?.id ?? 'electrical';
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
    title: 'Diagnóstico vira relatório, risco ou manutenção',
    text: 'Escolha primeiro a intenção: gerar texto técnico, classificar risco/urgência ou justificar manutenção preventiva.',
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
    title: '1. Ambientes',
    text: 'Comece pelo local do serviço. O ambiente selecionado orienta os próximos serviços, peças e observações.',
  },
  {
    id: 'labor',
    label: 'Serviços',
    title: '2. Serviços',
    text: 'Lance mão de obra, quantidade e valor previsto para montar a base técnica do orçamento.',
  },
  {
    id: 'materials',
    label: 'Materiais',
    title: '3. Materiais',
    text: 'Defina quem compra os materiais e envie peças para proposta, lista do cliente ou revisão.',
  },
  {
    id: 'notes',
    label: 'Observações',
    title: '4. Observações',
    text: 'Registre diagnóstico, recomendações, riscos e informações que precisam aparecer no relatório.',
  },
  {
    id: 'review',
    label: 'Revisão',
    title: '5. Revisão',
    text: 'Confira tudo que foi salvo antes de avançar para orçamento ou relatório.',
  },
];

function HomeScreen({ goTo, openModule, captures, clients, workOrders }: { goTo: (tab: AppTab) => void; openModule: (module: ModuleCardData) => void; captures: CalculationCapture[]; clients: Client[]; workOrders: WorkOrder[] }) {
  const openWorkOrders = workOrders.filter((workOrder) => workOrder.status !== 'done' && workOrder.status !== 'cancelled').length;
  const budgetItems = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both').length;
  const surveyItems = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both').length;
  const recentItems = captures.slice(0, 3);
  const electricalModule = calculationModules.find((module) => module.id === 'eletricaPredial') ?? calculationModules[0];
  const hydraulicModule = calculationModules.find((module) => module.id === 'hidraulica') ?? calculationModules[0];

  return (
    <section className="app-screen orca-dashboard-screen">
      <div className="orca-dashboard-hero operational-home-hero">
        <div className="orca-dashboard-copy"><span className="orca-kicker">Fluxo principal</span><h1>Continue o atendimento e avance para a proposta.</h1><p>Use a ordem natural do serviço: cliente e OS, cálculo quando necessário, levantamento em campo e orçamento para envio.</p></div>
        <div className="home-primary-actions">
          <button type="button" className="primary-action inline-action" onClick={() => goTo(openWorkOrders > 0 ? 'survey' : 'clients')}>{openWorkOrders > 0 ? 'Continuar atendimento' : 'Criar atendimento'}</button>
          <button type="button" className="secondary-action inline-action" onClick={() => goTo('budgets')}>Abrir orçamento</button>
        </div>
      </div>
      <div className="orca-workflow-steps">
        <button type="button" className="orca-step-card" onClick={() => goTo('clients')}><span className="orca-step-number">1</span><strong>Atendimento</strong><small>Escolha cliente e OS.</small></button>
        <button type="button" className="orca-step-card" onClick={() => goTo('calculations')}><span className="orca-step-number">2</span><strong>Cálculos</strong><small>Abra por setor técnico.</small></button>
        <button type="button" className="orca-step-card" onClick={() => goTo('survey')}><span className="orca-step-number">3</span><strong>Levantamento</strong><small>Ambientes, serviços e materiais.</small></button>
        <button type="button" className="orca-step-card" onClick={() => goTo('budgets')}><span className="orca-step-number">4</span><strong>Orçamento</strong><small>Revise e monte a proposta.</small></button>
      </div>
      <div className="home-operational-grid">
        <section className="orca-panel-card home-focus-panel">
          <header><div><span className="orca-kicker">Ações rápidas</span><h2>O que fazer agora?</h2></div></header>
          <div className="home-action-list">
            <button type="button" onClick={() => goTo('clients')}><strong>Novo cliente / OS</strong><small>Crie ou selecione o atendimento ativo.</small></button>
            <button type="button" onClick={() => openModule(electricalModule)}><strong>Cálculo elétrico</strong><small>Ohm, potência, corrente e consumo.</small></button>
            <button type="button" onClick={() => openModule(hydraulicModule)}><strong>Cálculo hidráulico</strong><small>Reservatório, consumo, vazão e pressão.</small></button>
            <button type="button" onClick={() => goTo('catalog')}><strong>Catálogo e fornecedores</strong><small>Itens reais para referência de orçamento.</small></button>
          </div>
        </section>
        <section className="orca-panel-card home-status-panel">
          <header><div><span className="orca-kicker">Resumo</span><h2>Hoje</h2></div></header>
          <div className="home-status-list">
            <article><span>Atendimentos</span><strong>{clients.length}/{openWorkOrders}</strong><small>clientes e OS abertas</small></article>
            <article><span>Levantamento</span><strong>{surveyItems}</strong><small>itens prontos</small></article>
            <article><span>Orçamento</span><strong>{budgetItems}</strong><small>itens comerciais</small></article>
          </div>
        </section>
      </div>
      <section className="orca-panel-card home-recent-panel">
        <header><div><span className="orca-kicker">Atividade</span><h2>Recentes</h2></div><button type="button" onClick={() => goTo('survey')}>Abrir levantamento</button></header>
        <div className="orca-activity-list">{recentItems.length === 0 ? <article><div><strong>Comece pelo atendimento</strong><small>Crie uma OS e avance para cálculos, levantamento e orçamento.</small></div></article> : recentItems.map((capture) => <article key={capture.id}><div><strong>{capture.calculatorLabel}</strong><small>{capture.summary}</small></div><em>{capture.destination === 'both' ? 'Ambos' : capture.destination === 'budget' ? 'Orç.' : 'Levant.'}</em></article>)}</div>
      </section>
    </section>
  );
}

function CalculationsScreen({ selectedModule, openModule, activeSector, onSelectSector, goTo, userPlan: activeUserPlan, onCaptureCalculation }: { selectedModule: ModuleCardData | null; openModule: (module: ModuleCardData | null) => void; activeSector: CalculationSectorId; onSelectSector: (sector: CalculationSectorId) => void; goTo: (tab: AppTab) => void; userPlan: UserPlan; onCaptureCalculation: (capture: CalculationCapture) => void }) {
  if (selectedModule) {
    const module = selectedModule.calculatorModule;
    const selectedSector = calculationSectorGroups.find((group) => group.id === activeSector);
    const fundamentalConfig = fundamentalModuleConfig[selectedModule.id];
    return (
      <section className="app-screen">
        <button className="back-button" type="button" onClick={() => openModule(null)}>‹ Voltar para {selectedSector?.title ?? 'cálculos'}</button>
        <header className="module-detail-header"><div><em className={`module-plan-pill ${selectedModule.plan}`}>{planLabel(selectedModule.plan)}</em><h1>{selectedModule.title}</h1><p>{selectedModule.description}</p><small>{selectedModule.count}</small></div></header>
        {moduleGuidance[selectedModule.id] && <div className="survey-intro-card"><span><strong>{moduleGuidance[selectedModule.id].title}</strong><small>{moduleGuidance[selectedModule.id].text}</small></span></div>}
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
        {!module && <div className="empty-state-card"><strong>{selectedModule.title} em breve</strong><p>Este módulo já está previsto na arquitetura do OrçaOS.</p></div>}
      </section>
    );
  }

  const selectedSector = calculationSectorGroups.find((group) => group.id === activeSector) ?? calculationSectorGroups[0];
  const sectorModules = selectedSector.moduleIds
    .map((moduleId) => calculationModules.find((module) => module.id === moduleId))
    .filter((module): module is ModuleCardData => Boolean(module));

  return (
    <section className="app-screen calculations-overview-screen">
      <header className="screen-header"><span className="orca-kicker">Setores técnicos</span><h1>Cálculos</h1><p>Escolha o setor primeiro. Depois abra os cálculos técnicos daquela rotina de trabalho.</p></header>
      <div className="section-mode-tabs calculation-profession-tabs">
        {calculationSectorGroups.map((group) => (
          <button className={activeSector === group.id ? 'active' : ''} key={group.id} type="button" onClick={() => onSelectSector(group.id)}>
            {group.title}
          </button>
        ))}
      </div>
      <div className="survey-intro-card">
        <span><strong>{selectedSector.title}</strong><small>{selectedSector.description}</small></span>
      </div>
      <div className="module-list-app">{sectorModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}</div>
    </section>
  );
}

function SurveyScreen({ captures, context, onRemove, onUpdate, onAddMany, goTo }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void; onAddMany: (items: CalculationCapture[]) => void; goTo: (tab: AppTab) => void }) {
  const [activeSection, setActiveSection] = useState<SurveySection>('context');
  const surveyCaptures = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both');
  const activeStepIndex = Math.max(0, surveyFlowSteps.findIndex((step) => step.id === activeSection));
  const activeStep = surveyFlowSteps[activeStepIndex] ?? surveyFlowSteps[0];
  const previousStep = surveyFlowSteps[activeStepIndex - 1];
  const nextStep = surveyFlowSteps[activeStepIndex + 1];

  function advanceSurvey() {
    if (nextStep) {
      setActiveSection(nextStep.id);
      return;
    }
    goTo('budgets');
  }

  return (
    <section className="app-screen">
      <header className="screen-header"><span className="orca-kicker">Fluxo de campo</span><h1>Levantamento</h1><p>Registre contexto, serviços, materiais, observações técnicas e revise o que vai para orçamento ou relatório.</p></header>
      <ActiveWorkContextCard {...context} />
      <div className="survey-step-guide" aria-label="Etapas do levantamento">
        {surveyFlowSteps.map((step, index) => (
          <button className={activeSection === step.id ? 'active' : index < activeStepIndex ? 'completed' : ''} key={step.id} type="button" onClick={() => setActiveSection(step.id)}>
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
          </button>
        ))}
      </div>
      <div className="survey-intro-card"><span><strong>{activeStep.title}</strong><small>{activeStep.text}</small></span></div>
      {activeSection === 'context' && <GuidedRoomManager />}
      {activeSection === 'labor' && <GuidedBudgetCartRoomAutoBridge mode="catalog" onSendToBudget={onAddMany} />}
      {activeSection === 'materials' && <MaterialSupplyModeBridge mode="parts" onSendToBudget={onAddMany} />}
      {activeSection === 'notes' && <GuidedBudgetCartRoomAutoBridge mode="manual" onSendToBudget={onAddMany} />}
      {activeSection === 'review' && <TechnicalCaptureList captures={surveyCaptures} emptyText="Use ambientes, serviços, materiais ou observações para montar o levantamento." onRemove={onRemove} onUpdate={onUpdate} />}
      <div className="survey-step-actions">
        <button className="secondary-action inline-action" type="button" disabled={!previousStep} onClick={() => previousStep && setActiveSection(previousStep.id)}>Voltar</button>
        <span>{activeStepIndex + 1} de {surveyFlowSteps.length} · {surveyCaptures.length} item(ns) salvos</span>
        <button className="primary-action inline-action" type="button" onClick={advanceSurvey}>{nextStep ? `Próximo: ${nextStep.label}` : 'Ir para orçamento'}</button>
      </div>
    </section>
  );
}

function BudgetsScreen({ captures, context, onRemove, onUpdate }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void }) {
  const budgetCaptures = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both');
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><span className="orca-kicker">Editor de proposta</span><h1>Orçamentos</h1><p>Revise a base técnica, monte os itens comerciais, confira e envie a proposta.</p></header>
      <ActiveWorkContextCard {...context} />
      <details className="budget-technical-drawer" open={budgetCaptures.length > 0}>
        <summary>
          <span><strong>Base técnica do orçamento</strong><small>{budgetCaptures.length} item(ns) vindos de cálculos ou levantamento.</small></span>
          <em>Revisar</em>
        </summary>
        <TechnicalCaptureList captures={budgetCaptures} emptyText="Abra um cálculo ou use o levantamento guiado para montar a base técnica." onRemove={onRemove} onUpdate={onUpdate} />
      </details>
      <BudgetWorkspaceClientBridge technicalCaptures={budgetCaptures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} onTechnicalCaptureConverted={(id) => onUpdate(id, { convertedToBudgetItem: true })} />
    </section>
  );
}

function CatalogScreen({ onAddMany }: { onAddMany: (items: CalculationCapture[]) => void }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Gestão operacional</span><h1>Catálogo</h1><p>Escolha entre catálogo, busca online, fornecedores, compras/estoque e preço com margem.</p></header><CatalogHubWorkspace onSendToBudget={onAddMany} /></section>;
}

function ReportsScreen({ captures, context }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null } }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Documento técnico</span><h1>Relatórios</h1><p>Transforme diagnósticos, fotos, observações e itens do levantamento em um documento técnico para o cliente.</p></header><ActiveWorkContextCard {...context} /><ReportWorkspace captures={captures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} /></section>;
}

function ClientsScreen({ onContextChange }: { onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Início do serviço</span><h1>Atendimentos</h1><p>Escolha o cliente e a OS ativa antes de calcular, levantar campo, orçar ou gerar relatório.</p></header><ClientWorkOrderWorkspace onContextChange={onContextChange} /></section>;
}

function StoreScreen({ account, onAccountChange }: { account: OrcaAccountState; onAccountChange: (account: OrcaAccountState) => void }) {
  const activeUserPlan = account.plan;
  const devToolsEnabled = isDevToolsEnabled();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCheckingPlan, setIsCheckingPlan] = useState(false);
  const canCheckPlan = isPlanEntitlementSyncConfigured() && Boolean(account.userId);
  const planSourceLabel = account.planSource === 'subscription'
    ? 'assinatura'
    : account.planSource === 'local-test' && devToolsEnabled
      ? 'teste local'
      : 'verificação local';

  async function checkSubscription() {
    setIsCheckingPlan(true);
    setFeedback(null);
    try {
      const result = await refreshPlanEntitlement(account);
      onAccountChange(result.account);
      setFeedback(result.account.plan === 'pro' ? 'Assinatura Pro confirmada.' : 'Nenhuma assinatura Pro ativa para esta conta.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível verificar assinatura.');
    } finally {
      setIsCheckingPlan(false);
    }
  }

  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><span className="orca-kicker">Recursos premium</span><h1>Loja / Pro</h1><p>Pacotes de cálculos, modelos de orçamento e recursos profissionais.</p></header>
      <div className="settings-group">
        <h2>Plano atual</h2>
        {devToolsEnabled && <div className="dev-tools-badge">Modo desenvolvimento ativo</div>}
        <article className="settings-row"><span><strong>{activeUserPlan === 'pro' ? 'Pro ativo' : 'Grátis ativo'}</strong><small>{activeUserPlan === 'pro' ? `Liberado por ${planSourceLabel}.` : 'Cálculos livres liberados. Recursos Pro abrem a tela de upgrade.'}</small></span></article>
        <div className="general-capture-actions">
          <button type="button" disabled={!canCheckPlan || isCheckingPlan} onClick={checkSubscription}>{isCheckingPlan ? 'Verificando...' : 'Verificar assinatura'}</button>
          {devToolsEnabled && <button className="secondary-action" type="button" onClick={() => onAccountChange(setLocalUserPlan('pro'))}>Ativar Pro de teste</button>}
          {devToolsEnabled && <button className="secondary-action" type="button" onClick={() => onAccountChange(setLocalUserPlan('free'))}>Voltar ao grátis</button>}
        </div>
        {!isPlanEntitlementSyncConfigured() && <p className="general-helper-text">Configure VITE_ORCAOS_ENTITLEMENTS_ENDPOINT para verificar assinaturas reais.</p>}
        {isPlanEntitlementSyncConfigured() && !account.userId && <p className="general-helper-text">Entre com uma conta antes de verificar assinatura.</p>}
        {feedback && <p className="general-added-message">{feedback}</p>}
      </div>
      <div className="settings-group"><h2>Pacotes disponíveis</h2>{storePackages.map((pack) => <article className="store-card" key={pack.title}><span><strong>{pack.title}</strong><small>{pack.description}</small><b>{pack.price}</b></span><button type="button">Detalhes</button></article>)}</div>
    </section>
  );
}

function SettingsScreen({ account, onAccountChange }: { account: OrcaAccountState; onAccountChange: (account: OrcaAccountState) => void }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailDraft, setEmailDraft] = useState(account.email);
  const [nameDraft, setNameDraft] = useState(account.displayName === 'Visitante' ? '' : account.displayName);
  const googleReady = isGoogleAccountLoginConfigured();
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const accountDescription = account.status === 'google' ? `${account.email || 'E-mail não informado'} · Google vinculado` : account.status === 'email' ? `${account.email} · cadastro por e-mail` : account.status === 'local' ? 'Conta local de teste preparada para login real depois' : 'Modo visitante local-first';

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
        <span className="orca-kicker">Preferências</span>
        <h1>Configurações</h1>
        <p>Conta, plano, perfil profissional e backup do app.</p>
      </header>

      <div className="settings-group account-settings-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Conta</span>
          <h2>Acesso e assinatura</h2>
          <p>Use um e-mail principal para vincular cadastro, Google e liberação Pro.</p>
        </div>

        <div className="account-status-grid">
          <article className="settings-row">
            <span><strong>{accountLabel}</strong><small>{accountDescription}</small></span>
          </article>
          <article className="settings-row">
            <span><strong>{account.plan === 'pro' ? 'Pro ativo' : 'Plano grátis'}</strong><small>{account.plan === 'pro' ? 'Recursos Pro liberados neste ambiente.' : 'Base inicial ativa. Verifique assinatura na Loja / Pro.'}</small></span>
          </article>
        </div>

        <section className="account-email-card">
          <div>
            <strong>Cadastro por e-mail</strong>
            <small>Informe o nome usado no atendimento e o e-mail que será usado para liberar assinatura.</small>
          </div>
          <div className="settings-form-grid">
            <label className="general-form-field"><span>Nome profissional</span><input value={nameDraft} placeholder="Ex.: Mateus Rossi" onChange={(event) => setNameDraft(event.target.value)} /></label>
            <label className="general-form-field"><span>E-mail de acesso</span><input type="email" value={emailDraft} placeholder="seu@email.com" onChange={(event) => setEmailDraft(event.target.value)} /></label>
          </div>
          <div className="settings-actions-row">
            <button type="button" onClick={registerEmailAccount}>Cadastrar e-mail</button>
            <button type="button" disabled={!googleReady || isSigningIn} onClick={connectGoogle}>{isSigningIn ? 'Conectando...' : 'Vincular Google'}</button>
            <button className="secondary-action" type="button" onClick={() => onAccountChange(signInLocalAccount())}>Entrar localmente</button>
            <button className="secondary-action" type="button" onClick={() => onAccountChange(signOutLocalAccount())}>Sair</button>
          </div>
          {!googleReady && <p className="general-helper-text">Configure VITE_GOOGLE_CLIENT_ID para ativar login Google neste ambiente.</p>}
          {feedback && <p className="general-added-message">{feedback}</p>}
        </section>
      </div>

      <LocalBackupWorkspace />
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleCardData | null>(null);
  const [activeSector, setActiveSector] = useState<CalculationSectorId>('electrical');
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => loadStoredCaptures());
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

  function openModule(module: ModuleCardData | null) {
    setSelectedModule(module);
    if (module) setActiveSector(getSectorForModule(module.id));
    setActiveTab('calculations');
  }

  return (
    <AppShell activeTab={activeTab} title={getScreenTitle(activeTab, selectedModule)} subtitle={getScreenSubtitle(activeTab, selectedModule)} navItems={navItems} activeClient={activeClient} activeWorkOrder={activeWorkOrder} onNavigate={goTo}>
      <Suspense fallback={<LazyWorkspaceFallback />}>
        {activeTab === 'home' && <HomeScreen goTo={goTo} openModule={openModule} captures={captures} clients={clients} workOrders={workOrders} />}
        {activeTab === 'calculations' && <CalculationsScreen selectedModule={selectedModule} openModule={openModule} activeSector={activeSector} onSelectSector={setActiveSector} goTo={goTo} userPlan={activeUserPlan} onCaptureCalculation={addCalculationCapture} />}
        {activeTab === 'survey' && <SurveyScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} onAddMany={addManyCalculationCaptures} goTo={goTo} />}
        {activeTab === 'budgets' && <BudgetsScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} />}
        {activeTab === 'catalog' && <CatalogScreen onAddMany={addManyCalculationCaptures} />}
        {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} />}
        {activeTab === 'clients' && <ClientsScreen onContextChange={(nextClients, nextWorkOrders, nextActiveWorkOrderId) => { setClients(nextClients); setWorkOrders(nextWorkOrders); setActiveWorkOrderId(nextActiveWorkOrderId); }} />}
        {activeTab === 'store' && <StoreScreen account={account} onAccountChange={setAccount} />}
        {activeTab === 'settings' && <SettingsScreen account={account} onAccountChange={setAccount} />}
      </Suspense>
    </AppShell>
  );
}
