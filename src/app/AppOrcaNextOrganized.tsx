import { useEffect, useMemo, useState } from 'react';
import type { CalculatorModule } from '../core/access/featureAccess';
import type { Client, WorkOrder } from '../core/types/business';
import type { CalculationCapture } from '../core/types/workflow';
import { BudgetWorkspaceClientBridge } from '../features/budgets/components/BudgetWorkspaceClientBridge';
import { ConvertersHumanWorkspace } from '../features/calculators/components/ConvertersHumanWorkspace';
import { ElectricalCalculatorWorkspace } from '../features/calculators/components/ElectricalCalculatorWorkspace';
import { ElectricalFundamentalsHumanWorkspace } from '../features/calculators/components/ElectricalFundamentalsHumanWorkspace';
import { GeneralCalculatorWorkspace, type GeneralCalculatorModule } from '../features/calculators/components/GeneralCalculatorWorkspace';
import { GeneralFundamentalsWorkspace } from '../features/calculators/components/GeneralFundamentalsWorkspace';
import { PaintingHumanWorkspace } from '../features/calculators/components/PaintingHumanWorkspace';
import { HydraulicsCalculatorWorkspace } from '../features/calculators/components/StableHydraulicsCalculatorWorkspace';
import { CatalogHubWorkspace } from '../features/catalog/components/CatalogHubWorkspaceWithTax';
import { ClientWorkOrderWorkspace } from '../features/clients/components/ClientWorkOrderWorkspace';
import { loadActiveWorkOrderId, loadClients, loadWorkOrders } from '../features/clients/storage/clientWorkOrderStorage';
import { ReportWorkspace } from '../features/reports/components/ReportWorkspace';
import { LocalBackupWorkspace } from '../features/settings/components/LocalBackupWorkspace';
import { GuidedBudgetCartRoomAutoBridge } from '../features/workflow/components/GuidedBudgetCartRoomAutoBridge';
import { GuidedRoomManager } from '../features/workflow/components/GuidedRoomManager';
import { MaterialSupplyModeBridge } from '../features/workflow/components/MaterialSupplyModeBridge';
import { TechnicalCaptureList } from '../features/workflow/components/TechnicalCaptureList';
import { ActiveWorkContextCard } from './components/ActiveWorkContextCard';
import { AppShell } from './components/AppShell';
import { ModuleCard } from './components/ModuleCard';
import { calculationModules, calculationSectorGroups, navItems, planLabel, storePackages, userPlan } from './orcaAppData';
import type { ActiveWorkContext, AppTab, BudgetSection, CalculationSectorId, ModuleCardData, SurveySection } from './orcaAppTypes';
import { loadStoredCaptures, saveStoredCaptures } from './storage/calculationCapturesStorage';

function isGeneralCalculatorModule(module: CalculatorModule): module is GeneralCalculatorModule {
  return module === 'obras' || module === 'orcamentoTecnico';
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

function HomeScreen({ goTo, openModule, captures, clients, workOrders }: { goTo: (tab: AppTab) => void; openModule: (module: ModuleCardData) => void; captures: CalculationCapture[]; clients: Client[]; workOrders: WorkOrder[] }) {
  const openWorkOrders = workOrders.filter((workOrder) => workOrder.status !== 'done' && workOrder.status !== 'cancelled').length;
  const budgetItems = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both').length;
  const surveyItems = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both').length;
  const recentItems = captures.slice(0, 4);

  return (
    <section className="app-screen orca-dashboard-screen">
      <div className="orca-dashboard-hero">
        <div className="orca-dashboard-copy"><span className="orca-kicker">Fluxo principal</span><h1>Do atendimento ao orçamento, sem se perder no caminho.</h1><p>Comece pela OS, faça cálculos quando precisar, levante ambientes e envie os itens para a proposta.</p></div>
        <div className="orca-dashboard-value-card"><span>Hoje no app</span><strong>{captures.length + workOrders.length}</strong><small>registros técnicos e atendimentos</small><div className="mini-sparkline" aria-hidden="true"><i /><i /><i /><i /><i /></div></div>
      </div>
      <div className="orca-workflow-steps">
        <button type="button" className="orca-step-card" onClick={() => goTo('clients')}><span className="orca-step-number">1</span><strong>Cliente / OS</strong><small>Escolha o atendimento ativo.</small></button>
        <button type="button" className="orca-step-card" onClick={() => goTo('calculations')}><span className="orca-step-number">2</span><strong>Cálculos</strong><small>Abra por setor técnico.</small></button>
        <button type="button" className="orca-step-card" onClick={() => goTo('survey')}><span className="orca-step-number">3</span><strong>Levantamento</strong><small>Ambientes, serviços e materiais.</small></button>
        <button type="button" className="orca-step-card" onClick={() => goTo('budgets')}><span className="orca-step-number">4</span><strong>Orçamento</strong><small>Revise e monte a proposta.</small></button>
      </div>
      <div className="orca-kpi-grid"><article><span>Cálculos salvos</span><strong>{captures.length}</strong><small>fluxo técnico</small></article><article><span>Levantamentos</span><strong>{surveyItems}</strong><small>itens prontos</small></article><article><span>Orçamentos</span><strong>{budgetItems}</strong><small>base comercial</small></article><article><span>Clientes / OS</span><strong>{clients.length}/{openWorkOrders}</strong><small>clientes e OS abertas</small></article></div>
      <div className="orca-quick-actions"><button type="button" onClick={() => openModule(calculationModules[0])}><span className="app-icon tone-green">∑</span><span><strong>Fundamentos</strong><small>cálculos livres</small></span></button><button type="button" onClick={() => openModule(calculationModules[9])}><span className="app-icon tone-blue">≋</span><span><strong>Hidráulica</strong><small>7 cálculos novos</small></span></button><button type="button" onClick={() => goTo('survey')}><span className="app-icon tone-green">▤</span><span><strong>Levantamento</strong><small>serviços e peças</small></span></button><button type="button" onClick={() => goTo('budgets')}><span className="app-icon tone-orange">▣</span><span><strong>Orçamento</strong><small>proposta e PDF</small></span></button></div>
      <div className="orca-home-columns"><section className="orca-panel-card"><header><div><span className="orca-kicker">Atividade</span><h2>Recentes</h2></div><button type="button" onClick={() => goTo('survey')}>Abrir levantamento</button></header><div className="orca-activity-list">{recentItems.length === 0 ? <article><span className="app-icon tone-green">+</span><div><strong>Comece pelo fluxo principal</strong><small>Crie uma OS, faça um cálculo ou lance um item no levantamento.</small></div></article> : recentItems.map((capture) => <article key={capture.id}><span className="app-icon tone-green">✓</span><div><strong>{capture.calculatorLabel}</strong><small>{capture.summary}</small></div><em>{capture.destination === 'both' ? 'Ambos' : capture.destination === 'budget' ? 'Orç.' : 'Levant.'}</em></article>)}</div></section></div>
    </section>
  );
}

function CalculationsScreen({ selectedModule, openModule, activeSector, onSelectSector, goTo, onCaptureCalculation }: { selectedModule: ModuleCardData | null; openModule: (module: ModuleCardData | null) => void; activeSector: CalculationSectorId; onSelectSector: (sector: CalculationSectorId) => void; goTo: (tab: AppTab) => void; onCaptureCalculation: (capture: CalculationCapture) => void }) {
  if (selectedModule) {
    const module = selectedModule.calculatorModule;
    const selectedSector = calculationSectorGroups.find((group) => group.id === activeSector);
    return (
      <section className="app-screen">
        <button className="back-button" type="button" onClick={() => openModule(null)}>‹ Voltar para {selectedSector?.title ?? 'cálculos'}</button>
        <header className="module-detail-header"><span className={`app-icon tone-${selectedModule.tone}`}>{selectedModule.icon}</span><div><em className={`module-plan-pill ${selectedModule.plan}`}>{planLabel(selectedModule.plan)}</em><h1>{selectedModule.title}</h1><p>{selectedModule.description}</p><small>{selectedModule.count}</small></div></header>
        {module === 'fundamentosGerais' && <GeneralFundamentalsWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'fundamentals' && <ElectricalFundamentalsHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'pintura' && <PaintingHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'hidraulica' && <HydraulicsCalculatorWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'conversores' && <ConvertersHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module && isGeneralCalculatorModule(module) && <GeneralCalculatorWorkspace selectedModule={module} onCaptureCalculation={onCaptureCalculation} />}
        {module && module !== 'fundamentosGerais' && module !== 'fundamentals' && module !== 'pintura' && module !== 'hidraulica' && module !== 'conversores' && !isGeneralCalculatorModule(module) && <ElectricalCalculatorWorkspace selectedModule={module} userPlan={userPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {!module && <div className="empty-state-card"><span className={`app-icon tone-${selectedModule.tone} large-icon`}>{selectedModule.icon}</span><strong>{selectedModule.title} em breve</strong><p>Este módulo já está previsto na arquitetura do OrçaOS.</p></div>}
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
        <span className="app-icon tone-green">{selectedSector.icon}</span>
        <span><strong>{selectedSector.title}</strong><small>{selectedSector.description}</small></span>
      </div>
      <div className="module-list-app">{sectorModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}</div>
    </section>
  );
}

function SurveyScreen({ captures, context, onRemove, onUpdate, onAddMany }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void; onAddMany: (items: CalculationCapture[]) => void }) {
  const [activeSection, setActiveSection] = useState<SurveySection>('context');
  const surveyCaptures = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both');
  return (
    <section className="app-screen">
      <header className="screen-header"><span className="orca-kicker">Fluxo de campo</span><h1>Levantamento</h1><p>Registre contexto, serviços, materiais, observações técnicas e revise o que vai para orçamento ou relatório.</p></header>
      <ActiveWorkContextCard {...context} />
      <div className="section-mode-tabs survey-flow-tabs">
        <button className={activeSection === 'context' ? 'active' : ''} type="button" onClick={() => setActiveSection('context')}>Ambientes</button>
        <button className={activeSection === 'labor' ? 'active' : ''} type="button" onClick={() => setActiveSection('labor')}>Serviços</button>
        <button className={activeSection === 'materials' ? 'active' : ''} type="button" onClick={() => setActiveSection('materials')}>Materiais</button>
        <button className={activeSection === 'notes' ? 'active' : ''} type="button" onClick={() => setActiveSection('notes')}>Observações</button>
        <button className={activeSection === 'review' ? 'active' : ''} type="button" onClick={() => setActiveSection('review')}>Revisão</button>
      </div>
      {activeSection === 'context' && <><div className="survey-intro-card"><span className="app-icon tone-green">▤</span><span><strong>Ambientes são o contexto do serviço</strong><small>Defina cômodos, áreas e locais para orientar serviços, materiais e observações.</small></span></div><GuidedRoomManager /></>}
      {activeSection === 'labor' && <><div className="survey-intro-card"><span className="app-icon tone-orange">▣</span><span><strong>Serviços representam mão de obra</strong><small>Adicione tarefas, quantidades e valores que poderão compor o orçamento.</small></span></div><GuidedBudgetCartRoomAutoBridge mode="catalog" onSendToBudget={onAddMany} /></>}
      {activeSection === 'materials' && <><div className="survey-intro-card"><span className="app-icon tone-blue">▧</span><span><strong>Materiais e peças</strong><small>Separe itens fornecidos pelo profissional, pelo cliente ou em lista mista.</small></span></div><MaterialSupplyModeBridge mode="parts" onSendToBudget={onAddMany} /></>}
      {activeSection === 'notes' && <><div className="survey-intro-card"><span className="app-icon tone-gray">◌</span><span><strong>Observações técnicas</strong><small>Use este bloco para diagnóstico, recomendações, riscos, fotos e itens que precisam aparecer no relatório.</small></span></div><GuidedBudgetCartRoomAutoBridge mode="manual" onSendToBudget={onAddMany} /></>}
      {activeSection === 'review' && <><div className="survey-intro-card"><span className="app-icon tone-blue">✓</span><span><strong>Revisão do levantamento</strong><small>{surveyCaptures.length} item(ns) salvos para relatório, orçamento ou lista do cliente.</small></span></div><TechnicalCaptureList captures={surveyCaptures} emptyText="Use ambientes, serviços, materiais ou observações para montar o levantamento." onRemove={onRemove} onUpdate={onUpdate} /></>}
    </section>
  );
}

function BudgetsScreen({ captures, context, onRemove, onUpdate }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void }) {
  const [activeSection, setActiveSection] = useState<BudgetSection>('workspace');
  const budgetCaptures = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both');
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Editor de proposta</span><h1>Orçamentos</h1><p>Monte a proposta comercial a partir dos itens técnicos.</p></header><ActiveWorkContextCard {...context} /><div className="section-mode-tabs"><button className={activeSection === 'workspace' ? 'active' : ''} type="button" onClick={() => setActiveSection('workspace')}>Montar proposta</button><button className={activeSection === 'technical' ? 'active' : ''} type="button" onClick={() => setActiveSection('technical')}>Itens técnicos</button></div>{activeSection === 'technical' && <><div className="survey-intro-card"><span className="app-icon tone-orange">▣</span><span><strong>Base técnica</strong><small>{budgetCaptures.length} item(ns) enviados para orçamento.</small></span></div><TechnicalCaptureList captures={budgetCaptures} emptyText="Abra um cálculo ou use o levantamento guiado." onRemove={onRemove} onUpdate={onUpdate} /></>}{activeSection === 'workspace' && <BudgetWorkspaceClientBridge technicalCaptures={budgetCaptures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} onTechnicalCaptureConverted={(id) => onUpdate(id, { convertedToBudgetItem: true })} />}</section>;
}

function CatalogScreen({ onAddMany }: { onAddMany: (items: CalculationCapture[]) => void }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Gestão operacional</span><h1>Catálogo</h1><p>Centralize itens recorrentes, fornecedores, compras, impostos, margem e base de estoque para apoiar orçamentos.</p></header><CatalogHubWorkspace onSendToBudget={onAddMany} /></section>;
}

function ReportsScreen({ captures, context }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null } }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">PDF e diagnóstico</span><h1>Relatórios</h1><p>Gere uma prévia técnica com observações e especificações vindas do levantamento.</p></header><ActiveWorkContextCard {...context} /><ReportWorkspace captures={captures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} /></section>;
}

function ClientsScreen({ onContextChange }: { onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void }) {
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Atendimentos</span><h1>Clientes / OS</h1><p>Cadastre clientes, crie ordens de serviço e selecione o atendimento ativo.</p></header><ClientWorkOrderWorkspace onContextChange={onContextChange} /></section>;
}

function StoreScreen() {
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Recursos premium</span><h1>Loja / Pro</h1><p>Pacotes de cálculos, modelos de orçamento e recursos profissionais.</p></header><div className="settings-group"><h2>Pacotes disponíveis</h2>{storePackages.map((pack) => <article className="store-card" key={pack.title}><span className="app-icon tone-blue">{pack.icon}</span><span><strong>{pack.title}</strong><small>{pack.description}</small><b>{pack.price}</b></span><button type="button">Detalhes</button></article>)}</div></section>;
}

function SettingsScreen() {
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Preferências</span><h1>Configurações</h1><p>Conta, histórico, informações do app e roadmap.</p></header><div className="settings-group"><h2>Conta</h2><article className="settings-row"><span className="app-icon tone-gray">▣</span><span><strong>Meu plano</strong><small>Grátis · base inicial ativa</small></span><span className="chevron">›</span></article><article className="settings-row"><span className="app-icon tone-green">◇</span><span><strong>Roadmap</strong><small>OrçaOS, módulos profissionais, relatórios e OS</small></span><span className="chevron">›</span></article></div><LocalBackupWorkspace /></section>;
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleCardData | null>(null);
  const [activeSector, setActiveSector] = useState<CalculationSectorId>('electrical');
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => loadStoredCaptures());
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());

  useEffect(() => { saveStoredCaptures(captures); }, [captures]);

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
      {activeTab === 'home' && <HomeScreen goTo={goTo} openModule={openModule} captures={captures} clients={clients} workOrders={workOrders} />}
      {activeTab === 'calculations' && <CalculationsScreen selectedModule={selectedModule} openModule={openModule} activeSector={activeSector} onSelectSector={setActiveSector} goTo={goTo} onCaptureCalculation={addCalculationCapture} />}
      {activeTab === 'survey' && <SurveyScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} onAddMany={addManyCalculationCaptures} />}
      {activeTab === 'budgets' && <BudgetsScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} />}
      {activeTab === 'catalog' && <CatalogScreen onAddMany={addManyCalculationCaptures} />}
      {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} />}
      {activeTab === 'clients' && <ClientsScreen onContextChange={(nextClients, nextWorkOrders, nextActiveWorkOrderId) => { setClients(nextClients); setWorkOrders(nextWorkOrders); setActiveWorkOrderId(nextActiveWorkOrderId); }} />}
      {activeTab === 'store' && <StoreScreen />}
      {activeTab === 'settings' && <SettingsScreen />}
    </AppShell>
  );
}
