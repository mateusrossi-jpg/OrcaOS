import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BadgeInfo,
  Bolt,
  BriefcaseBusiness,
  Cable,
  Calculator,
  ClipboardCheck,
  ClipboardList,
  ClipboardPenLine,
  Cog,
  Factory,
  FileSearch,
  FileText,
  Gem,
  History,
  House,
  Lightbulb,
  PackageSearch,
  PlugZap,
  ReceiptText,
  RotateCcw,
  Settings,
  ShoppingBag,
  Snowflake,
  Sparkles,
  UsersRound,
  Wrench,
} from './components/InlineIcons';
import type { CalculatorModule, UserPlan } from '../core/access/featureAccess';
import type { Client, WorkOrder } from '../core/types/business';
import type { CalculationCapture, CalculationDestination } from '../core/types/workflow';
import { getFreeCalculatorCount, getProCalculatorCount } from '../core/access/featureAccess';
import { BudgetWorkspace } from '../features/budgets/components/BudgetWorkspace';
import { ClientWorkOrderWorkspace } from '../features/clients/components/ClientWorkOrderWorkspace';
import { loadActiveWorkOrderId, loadClients, loadWorkOrders } from '../features/clients/storage/clientWorkOrderStorage';
import { ElectricalCalculatorWorkspace } from '../features/calculators/components/ElectricalCalculatorWorkspace';
import { ReportWorkspace } from '../features/reports/components/ReportWorkspace';
import { GuidedBudgetCart } from '../features/workflow/components/GuidedBudgetCart';
import { TechnicalCaptureList } from '../features/workflow/components/TechnicalCaptureList';
import { AppShell } from './components/AppShell';

type AppTab = 'home' | 'calculations' | 'survey' | 'budgets' | 'reports' | 'clients' | 'store' | 'settings';
type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
type ModulePlan = 'free' | 'pro' | 'soon';
type ModuleId = 'fundamentos' | 'instalacoes' | 'iluminacao' | 'refrigeracao' | 'motores' | 'rebobinagem' | 'automacaoIndustrial';
type SurveySection = 'guided' | 'parts' | 'manual' | 'items';
type BudgetSection = 'technical' | 'workspace';

interface ModuleCardData {
  id: ModuleId;
  title: string;
  description: string;
  icon: ReactNode;
  tone: ModuleTone;
  count: string;
  available: boolean;
  plan: ModulePlan;
  calculatorModule?: CalculatorModule;
}

interface ActiveWorkContext {
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

const userPlan: UserPlan = 'free';
const CAPTURES_STORAGE_KEY = 'orcaos:calculation-captures:v1';
const freeCalculatorCount = getFreeCalculatorCount();
const proCalculatorCount = getProCalculatorCount();
const iconProps = { size: 22, strokeWidth: 2.2 };
const largeIconProps = { size: 28, strokeWidth: 2.1 };

const calculationModules: ModuleCardData[] = [
  { id: 'fundamentos', title: 'Fundamentos', description: 'Ohm, corrente, potência, resistores, VA e consumo', icon: <Bolt {...largeIconProps} />, tone: 'blue', count: '7 cálculos livres', available: true, plan: 'free', calculatorModule: 'fundamentals' },
  { id: 'instalacoes', title: 'Instalações elétricas', description: 'Queda, distância, transformador, AWG, disjuntor, cabo e eletroduto', icon: <PlugZap {...largeIconProps} />, tone: 'gray', count: '7 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'installations' },
  { id: 'iluminacao', title: 'Iluminação', description: 'Lúmens, lux e quantidade de luminárias', icon: <Lightbulb {...largeIconProps} />, tone: 'green', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'lighting' },
  { id: 'refrigeracao', title: 'Refrigeração', description: 'BTU/h, climatização e carga térmica inicial', icon: <Snowflake {...largeIconProps} />, tone: 'blue', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'refrigeration' },
  { id: 'motores', title: 'Motores', description: 'Corrente, rotação, escorregamento e relação de polias', icon: <Cog {...largeIconProps} />, tone: 'orange', count: '3 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'motors' },
  { id: 'automacaoIndustrial', title: 'Automação industrial', description: 'Escalas 4–20 mA, 0–10 V e valor de engenharia', icon: <Factory {...largeIconProps} />, tone: 'green', count: '2 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'industrialAutomation' },
  { id: 'rebobinagem', title: 'Rebobinagem', description: 'Bobinas, fechamento, tensão de trabalho e rotação', icon: <RotateCcw {...largeIconProps} />, tone: 'muted', count: 'Em breve', available: false, plan: 'soon' },
];

const storePackages = [
  { title: 'Fundamentos grátis', description: 'Lei de Ohm, corrente, potência, resistores, W/VA/A e consumo liberados sem assinatura.', price: 'R$ 0', action: 'Já incluso', icon: <Bolt {...iconProps} /> },
  { title: 'Pacote Instalações Pro', description: 'Queda de tensão, distância máxima, transformador, AWG, cabo/disjuntor e eletroduto.', price: 'R$ 12,90', action: 'Detalhes', icon: <Cable {...iconProps} /> },
  { title: 'Pacote Refrigeração Pro', description: 'BTU/h e estimativas iniciais para climatização.', price: 'R$ 9,90', action: 'Detalhes', icon: <Snowflake {...iconProps} /> },
  { title: 'Pacote Motores Pro', description: 'Corrente estimada, rotação síncrona e escorregamento e relação de polias.', price: 'R$ 12,90', action: 'Detalhes', icon: <Cog {...iconProps} /> },
  { title: 'Pacote Automação Industrial Pro', description: 'Escalonamento de sinais 4–20 mA e 0–10 V para valores de engenharia.', price: 'R$ 9,90', action: 'Detalhes', icon: <Factory {...iconProps} /> },
  { title: 'Pacote Orçamentos Pro', description: 'Modelos avançados, identidade profissional, PDF e recursos comerciais.', price: 'R$ 12,90', action: 'Detalhes', icon: <ReceiptText {...iconProps} /> },
];

const navItems: Array<{ id: AppTab; label: string; description: string; icon: ReactNode }> = [
  { id: 'home', label: 'Início', description: 'Atalhos principais', icon: <House {...iconProps} /> },
  { id: 'calculations', label: 'Cálculos', description: 'Módulos técnicos', icon: <Calculator {...iconProps} /> },
  { id: 'survey', label: 'Levantamento', description: 'Campo, peças e blocos', icon: <ClipboardList {...iconProps} /> },
  { id: 'budgets', label: 'Orçamentos', description: 'Proposta comercial', icon: <ReceiptText {...iconProps} /> },
  { id: 'reports', label: 'Relatórios', description: 'Diagnóstico e fotos', icon: <FileSearch {...iconProps} /> },
  { id: 'clients', label: 'Clientes / OS', description: 'Atendimentos e histórico', icon: <UsersRound {...iconProps} /> },
  { id: 'store', label: 'Loja / Pro', description: 'Pacotes e planos', icon: <Gem {...iconProps} /> },
  { id: 'settings', label: 'Configurações', description: 'Conta, histórico e sobre', icon: <Settings {...iconProps} /> },
];

function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
}

function statusLabel(status: WorkOrder['status']): string {
  const labels: Record<WorkOrder['status'], string> = {
    open: 'Aberta',
    scheduled: 'Agendada',
    'in-progress': 'Em execução',
    done: 'Concluída',
    cancelled: 'Cancelada',
  };
  return labels[status];
}

function priorityLabel(priority?: WorkOrder['priority']): string {
  const labels: Record<NonNullable<WorkOrder['priority']>, string> = {
    low: 'Baixa',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
  };
  return labels[priority ?? 'normal'];
}

function formatWorkOrderDate(value?: string): string {
  if (!value) return 'Sem data agendada';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function isCalculationDestination(value: unknown): value is CalculationDestination {
  return value === 'survey' || value === 'budget' || value === 'both';
}

function isCalculationCapture(value: unknown): value is CalculationCapture {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CalculationCapture>;
  return (
    typeof item.id === 'string' &&
    typeof item.module === 'string' &&
    typeof item.moduleLabel === 'string' &&
    typeof item.calculatorLabel === 'string' &&
    isCalculationDestination(item.destination) &&
    typeof item.createdAt === 'string' &&
    typeof item.summary === 'string' &&
    Array.isArray(item.details) &&
    item.details.every((detail) => typeof detail === 'string')
  );
}

function loadStoredCaptures(): CalculationCapture[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedValue = window.localStorage.getItem(CAPTURES_STORAGE_KEY);
    if (!storedValue) return [];
    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(isCalculationCapture) : [];
  } catch {
    return [];
  }
}

function saveStoredCaptures(captures: CalculationCapture[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CAPTURES_STORAGE_KEY, JSON.stringify(captures));
}

function getScreenTitle(activeTab: AppTab, selectedModule: ModuleCardData | null): string {
  if (activeTab === 'calculations' && selectedModule) return selectedModule.title;
  return navItems.find((item) => item.id === activeTab)?.label ?? 'OrçaOS';
}

function getScreenSubtitle(activeTab: AppTab, selectedModule: ModuleCardData | null): string {
  if (activeTab === 'calculations' && selectedModule) return selectedModule.description;
  return navItems.find((item) => item.id === activeTab)?.description ?? 'Ferramenta profissional de campo';
}

function ModuleCard({ module, compact = false, onOpen }: { module: ModuleCardData; compact?: boolean; onOpen?: () => void }) {
  return (
    <button className={module.available ? 'module-app-card' : 'module-app-card disabled'} type="button" onClick={onOpen}>
      <span className={`app-icon tone-${module.tone}`}>{module.icon}</span>
      <span className="module-card-body"><strong>{module.title}</strong><small>{compact ? module.count : module.description}</small></span>
      <em className={`module-plan-pill ${module.plan}`}>{planLabel(module.plan)}</em>
      {compact && <span className="chevron">›</span>}
    </button>
  );
}

function ActiveWorkContextCard({ activeClient, activeWorkOrder }: ActiveWorkContext) {
  if (!activeWorkOrder) {
    return (
      <aside className="active-work-context-card empty-context">
        <span className="app-icon tone-gray"><BriefcaseBusiness {...iconProps} /></span>
        <div>
          <strong>Nenhuma OS ativa</strong>
          <small>Crie ou ative uma OS em Clientes / OS para vincular o atendimento atual.</small>
        </div>
      </aside>
    );
  }

  return (
    <aside className="active-work-context-card">
      <span className="app-icon tone-blue"><BriefcaseBusiness {...iconProps} /></span>
      <div>
        <strong>{activeWorkOrder.title}</strong>
        <small>{activeClient?.name ?? 'Cliente não vinculado'} · {statusLabel(activeWorkOrder.status)} · Prioridade {priorityLabel(activeWorkOrder.priority)}</small>
        <small>{activeWorkOrder.address || activeClient?.address || 'Sem endereço'} · {formatWorkOrderDate(activeWorkOrder.scheduledDate)}</small>
      </div>
    </aside>
  );
}

function HomeScreen({ goTo, openModule }: { goTo: (tab: AppTab) => void; openModule: (module: ModuleCardData) => void }) {
  return (
    <section className="app-screen">
      <div className="home-hero">
        <span>Olá, profissional</span>
        <h1>Orça<span>OS</span></h1>
        <p>Ferramenta de bolso para cálculo, levantamento, orçamento, relatório técnico e OS.</p>
      </div>

      <div className="home-action-grid">
        <button className="home-action-card primary" type="button" onClick={() => openModule(calculationModules[0])}>
          <span className="app-icon tone-blue"><Calculator {...iconProps} /></span>
          <strong>Começar pelos cálculos</strong>
          <small>{freeCalculatorCount} cálculos essenciais livres.</small>
        </button>
        <button className="home-action-card" type="button" onClick={() => goTo('survey')}>
          <span className="app-icon tone-green"><ClipboardPenLine {...iconProps} /></span>
          <strong>Fazer levantamento</strong>
          <small>Serviços, peças, blocos e itens salvos.</small>
        </button>
        <button className="home-action-card" type="button" onClick={() => goTo('budgets')}>
          <span className="app-icon tone-orange"><ReceiptText {...iconProps} /></span>
          <strong>Montar orçamento</strong>
          <small>Proposta, catálogo e PDF.</small>
        </button>
        <button className="home-action-card" type="button" onClick={() => goTo('reports')}>
          <span className="app-icon tone-gray"><FileText {...iconProps} /></span>
          <strong>Gerar relatório</strong>
          <small>Diagnóstico, fotos e observações.</small>
        </button>
      </div>

      <div className="pro-teaser-card compact-home-card">
        <span className="app-icon tone-orange"><Sparkles {...iconProps} /></span>
        <span><strong>OrçaOS Pro</strong><small>{proCalculatorCount} cálculos avançados, modelos profissionais e módulos técnicos.</small></span>
        <button type="button" onClick={() => goTo('store')}>Ver planos</button>
      </div>
    </section>
  );
}

function CalculationsScreen({ selectedModule, openModule, goTo, onCaptureCalculation }: { selectedModule: ModuleCardData | null; openModule: (module: ModuleCardData | null) => void; goTo: (tab: AppTab) => void; onCaptureCalculation: (capture: CalculationCapture) => void }) {
  if (selectedModule) {
    return (
      <section className="app-screen">
        <button className="back-button" type="button" onClick={() => openModule(null)}>‹ Voltar aos cálculos</button>
        <header className="module-detail-header"><span className={`app-icon tone-${selectedModule.tone}`}>{selectedModule.icon}</span><div><em className={`module-plan-pill ${selectedModule.plan}`}>{planLabel(selectedModule.plan)}</em><h1>{selectedModule.title}</h1><p>{selectedModule.description}</p><small>{selectedModule.count}</small></div></header>
        {selectedModule.calculatorModule ? <ElectricalCalculatorWorkspace selectedModule={selectedModule.calculatorModule} userPlan={userPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} /> : <div className="empty-state-card"><span className={`app-icon tone-${selectedModule.tone} large-icon`}>{selectedModule.icon}</span><strong>{selectedModule.title} em breve</strong><p>Este módulo já está previsto na arquitetura do OrçaOS e será implementado depois.</p></div>}
      </section>
    );
  }

  return <section className="app-screen"><header className="screen-header"><h1>Cálculos</h1><p>Escolha uma categoria técnica. Orçamento, levantamento e relatórios ficam em áreas próprias.</p></header><div className="module-list-app">{calculationModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}</div></section>;
}

function SurveyScreen({ captures, context, onRemove, onUpdate, onAddMany }: { captures: CalculationCapture[]; context: ActiveWorkContext; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void; onAddMany: (items: CalculationCapture[]) => void }) {
  const [activeSection, setActiveSection] = useState<SurveySection>('guided');
  const surveyCaptures = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both');

  return (
    <section className="app-screen">
      <header className="screen-header"><h1>Levantamento</h1><p>Escolha o modo de trabalho para a visita técnica atual.</p></header>
      <ActiveWorkContextCard {...context} />
      <div className="section-mode-tabs">
        <button className={activeSection === 'guided' ? 'active' : ''} type="button" onClick={() => setActiveSection('guided')}>Serviços</button>
        <button className={activeSection === 'parts' ? 'active' : ''} type="button" onClick={() => setActiveSection('parts')}>Peças</button>
        <button className={activeSection === 'manual' ? 'active' : ''} type="button" onClick={() => setActiveSection('manual')}>Bloco manual</button>
        <button className={activeSection === 'items' ? 'active' : ''} type="button" onClick={() => setActiveSection('items')}>Itens salvos</button>
      </div>

      {activeSection === 'guided' && <GuidedBudgetCart mode="catalog" onSendToBudget={onAddMany} />}
      {activeSection === 'parts' && <GuidedBudgetCart mode="parts" onSendToBudget={onAddMany} />}
      {activeSection === 'manual' && <GuidedBudgetCart mode="manual" onSendToBudget={onAddMany} />}
      {activeSection === 'items' && (
        <>
          <div className="survey-intro-card"><span className="app-icon tone-blue"><ClipboardCheck {...iconProps} /></span><span><strong>Itens do levantamento</strong><small>{surveyCaptures.length} item(ns) salvos para relatório, projeto ou orçamento.</small></span></div>
          <TechnicalCaptureList captures={surveyCaptures} emptyText="Use serviços, peças, bloco manual ou envie um cálculo para o levantamento." onRemove={onRemove} onUpdate={onUpdate} />
        </>
      )}
    </section>
  );
}

function BudgetsScreen({ captures, context, onRemove, onUpdate }: { captures: CalculationCapture[]; context: ActiveWorkContext; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void }) {
  const [activeSection, setActiveSection] = useState<BudgetSection>('workspace');
  const budgetCaptures = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both');
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Orçamentos</h1><p>Separe os itens técnicos da montagem da proposta comercial.</p></header>
      <ActiveWorkContextCard {...context} />
      <div className="section-mode-tabs">
        <button className={activeSection === 'workspace' ? 'active' : ''} type="button" onClick={() => setActiveSection('workspace')}>Montar proposta</button>
        <button className={activeSection === 'technical' ? 'active' : ''} type="button" onClick={() => setActiveSection('technical')}>Itens técnicos</button>
      </div>
      {activeSection === 'technical' && (
        <>
          <div className="survey-intro-card"><span className="app-icon tone-orange"><PackageSearch {...iconProps} /></span><span><strong>Base técnica do orçamento</strong><small>{budgetCaptures.length} item(ns) enviados para orçamento.</small></span></div>
          <TechnicalCaptureList captures={budgetCaptures} emptyText="Abra um cálculo ou use o levantamento guiado para enviar itens ao orçamento." onRemove={onRemove} onUpdate={onUpdate} />
        </>
      )}
      {activeSection === 'workspace' && <BudgetWorkspace technicalCaptures={budgetCaptures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} onTechnicalCaptureConverted={(id) => onUpdate(id, { convertedToBudgetItem: true })} />}
    </section>
  );
}

function ReportsScreen({ captures, context }: { captures: CalculationCapture[]; context: ActiveWorkContext }) {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Relatórios</h1><p>Gere uma prévia técnica com fotos, diagnósticos, observações e especificações vindas do levantamento.</p></header>
      <ActiveWorkContextCard {...context} />
      <ReportWorkspace captures={captures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} />
    </section>
  );
}

function ClientsScreen({ onContextChange }: { onContextChange: (clients: Client[], workOrders: WorkOrder[], activeWorkOrderId: string | null) => void }) {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Clientes / OS</h1><p>Cadastre clientes, crie ordens de serviço e selecione o atendimento ativo.</p></header>
      <ClientWorkOrderWorkspace onContextChange={onContextChange} />
    </section>
  );
}

function StoreScreen() {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Loja / Pro</h1><p>Pacotes de cálculos, modelos de orçamento e recursos profissionais.</p></header>
      <div className="settings-group"><h2>Pacotes disponíveis</h2>{storePackages.map((pack) => <article className="store-card" key={pack.title}><span className="app-icon tone-blue">{pack.icon}</span><span><strong>{pack.title}</strong><small>{pack.description}</small><b>{pack.price}</b></span><button type="button">{pack.action}</button></article>)}</div>
    </section>
  );
}

function SettingsScreen() {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Configurações</h1><p>Conta, histórico, informações do app e roadmap.</p></header>
      <div className="settings-group"><h2>Conta</h2><article className="settings-row"><span className="app-icon tone-gray"><ShoppingBag {...iconProps} /></span><span><strong>Meu plano</strong><small>{userPlan === 'pro' ? 'Pro ativo' : 'Grátis · Fundamentos livres'}</small></span><span className="chevron">›</span></article><article className="settings-row"><span className="app-icon tone-green"><History {...iconProps} /></span><span><strong>Histórico</strong><small>Orçamentos, levantamentos, relatórios e cálculos recentes</small></span><span className="chevron">›</span></article></div>
      <div className="settings-group"><h2>Sobre</h2><article className="settings-row"><span className="app-icon tone-blue"><BadgeInfo {...iconProps} /></span><span><strong>Sobre o app</strong><small>Versão 0.1.0</small></span><span className="chevron">›</span></article><article className="settings-row"><span className="app-icon tone-green"><Wrench {...iconProps} /></span><span><strong>Roadmap</strong><small>OrçaOS, levantamentos, relatórios, OS e mais módulos</small></span><span className="chevron">›</span></article></div>
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleCardData | null>(null);
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => loadStoredCaptures());
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => loadWorkOrders());
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(() => loadActiveWorkOrderId());

  useEffect(() => { saveStoredCaptures(captures); }, [captures]);

  const activeWorkOrder = useMemo(
    () => workOrders.find((workOrder) => workOrder.id === activeWorkOrderId) ?? null,
    [activeWorkOrderId, workOrders],
  );
  const activeClient = useMemo(
    () => (activeWorkOrder?.clientId ? clients.find((client) => client.id === activeWorkOrder.clientId) ?? null : null),
    [activeWorkOrder?.clientId, clients],
  );
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

  const handleContextChange = useCallback((nextClients: Client[], nextWorkOrders: WorkOrder[], nextActiveWorkOrderId: string | null) => {
    setClients(nextClients);
    setWorkOrders(nextWorkOrders);
    setActiveWorkOrderId(nextActiveWorkOrderId);
  }, []);

  function goTo(tab: AppTab) {
    setActiveTab(tab);
    if (tab !== 'calculations') setSelectedModule(null);
  }

  function openModule(module: ModuleCardData | null) {
    setSelectedModule(module);
    setActiveTab('calculations');
  }

  return (
    <AppShell
      activeTab={activeTab}
      title={getScreenTitle(activeTab, selectedModule)}
      subtitle={getScreenSubtitle(activeTab, selectedModule)}
      navItems={navItems}
      activeClient={activeClient}
      activeWorkOrder={activeWorkOrder}
      onNavigate={goTo}
    >
      {activeTab === 'home' && <HomeScreen goTo={goTo} openModule={openModule} />}
      {activeTab === 'calculations' && <CalculationsScreen selectedModule={selectedModule} openModule={openModule} goTo={goTo} onCaptureCalculation={addCalculationCapture} />}
      {activeTab === 'survey' && <SurveyScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} onAddMany={addManyCalculationCaptures} />}
      {activeTab === 'budgets' && <BudgetsScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} />}
      {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} />}
      {activeTab === 'clients' && <ClientsScreen onContextChange={handleContextChange} />}
      {activeTab === 'store' && <StoreScreen />}
      {activeTab === 'settings' && <SettingsScreen />}
    </AppShell>
  );
}
