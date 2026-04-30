import { useEffect, useMemo, useState } from 'react';
import type { CalculatorModule, UserPlan } from '../core/access/featureAccess';
import type { Client, WorkOrder } from '../core/types/business';
import type { CalculationCapture, CalculationDestination } from '../core/types/workflow';
import { BudgetWorkspace } from '../features/budgets/components/BudgetWorkspace';
import { ElectricalCalculatorWorkspace } from '../features/calculators/components/ElectricalCalculatorWorkspace';
import { GeneralCalculatorWorkspace, type GeneralCalculatorModule } from '../features/calculators/components/GeneralCalculatorWorkspace';
import { GeneralFundamentalsWorkspace } from '../features/calculators/components/GeneralFundamentalsWorkspace';
import { HydraulicsCalculatorWorkspace } from '../features/calculators/components/HydraulicsCalculatorWorkspace';
import { ClientWorkOrderWorkspace } from '../features/clients/components/ClientWorkOrderWorkspace';
import { loadActiveWorkOrderId, loadClients, loadWorkOrders } from '../features/clients/storage/clientWorkOrderStorage';
import { ReportWorkspace } from '../features/reports/components/ReportWorkspace';
import { GuidedBudgetCart } from '../features/workflow/components/GuidedBudgetCart';
import { TechnicalCaptureList } from '../features/workflow/components/TechnicalCaptureList';
import { AppShell } from './components/AppShell';

type AppTab = 'home' | 'calculations' | 'survey' | 'budgets' | 'reports' | 'clients' | 'store' | 'settings';
type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
type ModulePlan = 'free' | 'pro' | 'soon';
type SurveySection = 'guided' | 'parts' | 'manual' | 'items';
type BudgetSection = 'workspace' | 'technical';

interface ModuleCardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: ModuleTone;
  count: string;
  available: boolean;
  plan: ModulePlan;
  calculatorModule?: CalculatorModule;
}

const userPlan: UserPlan = 'free';
const CAPTURES_STORAGE_KEY = 'orcaos:calculation-captures:v1';

const navItems: Array<{ id: AppTab; label: string; description: string; icon: string }> = [
  { id: 'home', label: 'Início', description: 'Visão do dia e ações rápidas', icon: '⌂' },
  { id: 'calculations', label: 'Cálculos', description: 'Módulos e calculadoras', icon: '▦' },
  { id: 'survey', label: 'Levantamento', description: 'Guia de campo e peças', icon: '▤' },
  { id: 'budgets', label: 'Orçamentos', description: 'Proposta comercial', icon: '▣' },
  { id: 'reports', label: 'Relatórios', description: 'PDFs e diagnósticos', icon: '◫' },
  { id: 'clients', label: 'Clientes / OS', description: 'Atendimentos e histórico', icon: '◉' },
  { id: 'store', label: 'Loja / Pro', description: 'Pacotes e planos', icon: '◆' },
  { id: 'settings', label: 'Configurações', description: 'Conta, histórico e sobre', icon: '⚙' },
];

const calculationModules: ModuleCardData[] = [
  { id: 'fundamentosGerais', title: 'Fundamentos gerais', description: 'Regra de três, porcentagem, áreas, volumes, custos e produtividade', icon: '∑', tone: 'green', count: '17 cálculos livres', available: true, plan: 'free', calculatorModule: 'fundamentosGerais' },
  { id: 'fundamentos', title: 'Fundamentos elétricos', description: 'Ohm, corrente, potência, resistores, VA e consumo', icon: 'ϟ', tone: 'blue', count: '7 cálculos livres', available: true, plan: 'free', calculatorModule: 'fundamentals' },
  { id: 'instalacoes', title: 'Instalações elétricas', description: 'Queda, distância, transformador, AWG, disjuntor, cabo e eletroduto', icon: '⌁', tone: 'gray', count: '7 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'installations' },
  { id: 'iluminacao', title: 'Iluminação', description: 'Lúmens, lux, luminárias e iluminação de ambiente', icon: '☼', tone: 'green', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'lighting' },
  { id: 'refrigeracao', title: 'Refrigeração', description: 'BTU/h, climatização e carga térmica inicial', icon: '❄', tone: 'blue', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'refrigeration' },
  { id: 'motores', title: 'Motores', description: 'Corrente, rotação, escorregamento e relação de polias', icon: '⚙', tone: 'orange', count: '3 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'motors' },
  { id: 'automacaoIndustrial', title: 'Automação industrial', description: 'Escalas 4–20 mA, 0–10 V e valor de engenharia', icon: '▥', tone: 'green', count: '2 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'industrialAutomation' },
  { id: 'construcaoCivil', title: 'Construção civil', description: 'Medições, concreto, alvenaria, piso, revestimento e telhado', icon: '▧', tone: 'gray', count: '10 cálculos', available: true, plan: 'free', calculatorModule: 'obras' },
  { id: 'pintura', title: 'Pintura e acabamento', description: 'Tinta, selador, massa, tempo e orçamento por cômodo', icon: '▨', tone: 'green', count: '7 cálculos', available: true, plan: 'free', calculatorModule: 'pintura' },
  { id: 'hidraulica', title: 'Hidráulica', description: 'Reservatório, consumo, autonomia, vazão, enchimento e pressão', icon: '≋', tone: 'blue', count: '7 cálculos livres', available: true, plan: 'free', calculatorModule: 'hidraulica' },
  { id: 'conversores', title: 'Conversores', description: 'm³/litros, pressão, potência, BTU/h, medidas, temperatura e vazão', icon: '⇄', tone: 'blue', count: '7 cálculos', available: true, plan: 'free', calculatorModule: 'conversores' },
  { id: 'orcamentoTecnico', title: 'Orçamento técnico', description: 'Mão de obra, diária, hora técnica, parcelamento, sinal e preço final', icon: 'R$', tone: 'orange', count: '6 cálculos', available: true, plan: 'free', calculatorModule: 'orcamentoTecnico' },
  { id: 'eletronica', title: 'Eletrônica aplicada', description: 'LED, divisor de tensão, RC, PWM, ADC, bateria e fontes', icon: '◌', tone: 'green', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'transformadores', title: 'Transformadores', description: 'VA, espiras por volt, primário, secundário e fio preliminar', icon: '▤', tone: 'orange', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'solar', title: 'Solar fotovoltaico', description: 'Placas, inversor, cabos, geração, bateria e payback', icon: '☉', tone: 'green', count: 'Em breve', available: false, plan: 'soon' },
  { id: 'rebobinagem', title: 'Rebobinagem', description: 'Bobinas, fechamento, tensão de trabalho e rotação', icon: '⟳', tone: 'muted', count: 'Em breve', available: false, plan: 'soon' },
];

const storePackages = [
  { title: 'Base gratuita', description: 'Fundamentos gerais, hidráulica inicial, construção civil básica, pintura, conversores e orçamento simples.', price: 'R$ 0', icon: '∑' },
  { title: 'Pacote Instalações Pro', description: 'Queda de tensão, distância máxima, cabo/disjuntor, transformador, AWG e eletroduto.', price: 'R$ 12,90', icon: '⌁' },
  { title: 'Pacote Construção Civil Pro', description: 'Alvenaria, revestimento, telhado, argamassa, concreto, listas e composições avançadas.', price: 'R$ 12,90', icon: '▧' },
  { title: 'Pacote Hidráulica Pro', description: 'Bombas, perda de carga, conexões, esgoto, drenagem, reservatórios e lista de materiais.', price: 'R$ 12,90', icon: '≋' },
  { title: 'Pacote Orçamentos Pro', description: 'Modelos avançados, identidade profissional, PDF e recursos comerciais.', price: 'R$ 12,90', icon: '▣' },
];

function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
}

function isGeneralCalculatorModule(module: CalculatorModule): module is GeneralCalculatorModule {
  return module === 'obras' || module === 'pintura' || module === 'conversores' || module === 'orcamentoTecnico';
}

function isCalculationDestination(value: unknown): value is CalculationDestination {
  return value === 'survey' || value === 'budget' || value === 'both';
}

function isCalculationCapture(value: unknown): value is CalculationCapture {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CalculationCapture>;
  return typeof item.id === 'string' && typeof item.summary === 'string' && typeof item.module === 'string' && typeof item.moduleLabel === 'string' && typeof item.calculatorLabel === 'string' && isCalculationDestination(item.destination) && typeof item.createdAt === 'string' && Array.isArray(item.details);
}

function loadStoredCaptures(): CalculationCapture[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(CAPTURES_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isCalculationCapture) : [];
  } catch {
    return [];
  }
}

function saveStoredCaptures(captures: CalculationCapture[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CAPTURES_STORAGE_KEY, JSON.stringify(captures));
}

function statusLabel(status: WorkOrder['status']): string {
  const labels: Record<WorkOrder['status'], string> = { open: 'Aberta', scheduled: 'Agendada', 'in-progress': 'Em execução', done: 'Concluída', cancelled: 'Cancelada' };
  return labels[status];
}

function priorityLabel(priority?: WorkOrder['priority']): string {
  const labels: Record<NonNullable<WorkOrder['priority']>, string> = { low: 'Baixa', normal: 'Normal', high: 'Alta', urgent: 'Urgente' };
  return labels[priority ?? 'normal'];
}

function formatWorkOrderDate(value?: string): string {
  if (!value) return 'Sem data agendada';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
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

function ActiveWorkContextCard({ activeClient, activeWorkOrder }: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }) {
  if (!activeWorkOrder) {
    return <aside className="active-work-context-card empty-context"><span className="app-icon tone-gray">▣</span><div><strong>Nenhuma OS ativa</strong><small>Crie ou ative uma OS em Clientes / OS para vincular o atendimento atual.</small></div></aside>;
  }

  return (
    <aside className="active-work-context-card">
      <span className="app-icon tone-blue">▣</span>
      <div>
        <strong>{activeWorkOrder.title}</strong>
        <small>{activeClient?.name ?? 'Cliente não vinculado'} · {statusLabel(activeWorkOrder.status)} · Prioridade {priorityLabel(activeWorkOrder.priority)}</small>
        <small>{activeWorkOrder.address || activeClient?.address || 'Sem endereço'} · {formatWorkOrderDate(activeWorkOrder.scheduledDate)}</small>
      </div>
    </aside>
  );
}

function HomeScreen({ goTo, openModule, captures, clients, workOrders }: { goTo: (tab: AppTab) => void; openModule: (module: ModuleCardData) => void; captures: CalculationCapture[]; clients: Client[]; workOrders: WorkOrder[] }) {
  const openWorkOrders = workOrders.filter((workOrder) => workOrder.status !== 'done' && workOrder.status !== 'cancelled').length;
  const budgetItems = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both').length;
  const surveyItems = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both').length;
  const recentItems = captures.slice(0, 4);

  return (
    <section className="app-screen orca-dashboard-screen">
      <div className="orca-dashboard-hero">
        <div className="orca-dashboard-copy"><span className="orca-kicker">OrçaOS · publicação inicial</span><h1>Ferramenta de bolso para serviço técnico.</h1><p>Agora com núcleo transversal, elétrica, construção civil, pintura, hidráulica, conversores e orçamento técnico.</p></div>
        <div className="orca-dashboard-value-card"><span>Resumo</span><strong>{captures.length + workOrders.length}</strong><small>registros técnicos no app</small><div className="mini-sparkline" aria-hidden="true"><i /><i /><i /><i /><i /></div></div>
      </div>
      <div className="orca-kpi-grid"><article><span>Cálculos salvos</span><strong>{captures.length}</strong><small>fluxo técnico</small></article><article><span>Levantamentos</span><strong>{surveyItems}</strong><small>itens prontos</small></article><article><span>Orçamentos</span><strong>{budgetItems}</strong><small>base comercial</small></article><article><span>Clientes / OS</span><strong>{clients.length}/{openWorkOrders}</strong><small>clientes e OS abertas</small></article></div>
      <div className="orca-quick-actions"><button type="button" onClick={() => openModule(calculationModules[0])}><span className="app-icon tone-green">∑</span><strong>Fundamentos</strong><small>cálculos livres</small></button><button type="button" onClick={() => openModule(calculationModules[9])}><span className="app-icon tone-blue">≋</span><strong>Hidráulica</strong><small>7 cálculos novos</small></button><button type="button" onClick={() => goTo('survey')}><span className="app-icon tone-green">▤</span><strong>Levantamento</strong><small>serviços e peças</small></button><button type="button" onClick={() => goTo('budgets')}><span className="app-icon tone-orange">▣</span><strong>Orçamento</strong><small>proposta e PDF</small></button></div>
      <div className="orca-home-columns"><section className="orca-panel-card"><header><div><span className="orca-kicker">Módulos</span><h2>Cálculos técnicos</h2></div><button type="button" onClick={() => goTo('calculations')}>Ver todos</button></header><div className="orca-compact-module-list">{calculationModules.slice(0, 10).map((module) => <button key={module.id} type="button" onClick={() => openModule(module)}><span className={`app-icon tone-${module.tone}`}>{module.icon}</span><span><strong>{module.title}</strong><small>{module.description}</small></span><em>{module.count}</em></button>)}</div></section><section className="orca-panel-card"><header><div><span className="orca-kicker">Atividade</span><h2>Recentes</h2></div><button type="button" onClick={() => goTo('survey')}>Abrir</button></header><div className="orca-activity-list">{recentItems.length === 0 ? <article><span className="app-icon tone-green">+</span><div><strong>Comece seu primeiro fluxo</strong><small>Faça um cálculo para aparecer aqui.</small></div></article> : recentItems.map((capture) => <article key={capture.id}><span className="app-icon tone-green">✓</span><div><strong>{capture.calculatorLabel}</strong><small>{capture.summary}</small></div><em>{capture.destination === 'both' ? 'Ambos' : capture.destination === 'budget' ? 'Orç.' : 'Levant.'}</em></article>)}</div></section></div>
    </section>
  );
}

function CalculationsScreen({ selectedModule, openModule, goTo, onCaptureCalculation }: { selectedModule: ModuleCardData | null; openModule: (module: ModuleCardData | null) => void; goTo: (tab: AppTab) => void; onCaptureCalculation: (capture: CalculationCapture) => void }) {
  if (selectedModule) {
    const module = selectedModule.calculatorModule;
    return (
      <section className="app-screen">
        <button className="back-button" type="button" onClick={() => openModule(null)}>‹ Voltar aos cálculos</button>
        <header className="module-detail-header"><span className={`app-icon tone-${selectedModule.tone}`}>{selectedModule.icon}</span><div><em className={`module-plan-pill ${selectedModule.plan}`}>{planLabel(selectedModule.plan)}</em><h1>{selectedModule.title}</h1><p>{selectedModule.description}</p><small>{selectedModule.count}</small></div></header>
        {module === 'fundamentosGerais' && <GeneralFundamentalsWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'hidraulica' && <HydraulicsCalculatorWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module && isGeneralCalculatorModule(module) && <GeneralCalculatorWorkspace selectedModule={module} onCaptureCalculation={onCaptureCalculation} />}
        {module && module !== 'fundamentosGerais' && module !== 'hidraulica' && !isGeneralCalculatorModule(module) && <ElectricalCalculatorWorkspace selectedModule={module} userPlan={userPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {!module && <div className="empty-state-card"><span className={`app-icon tone-${selectedModule.tone} large-icon`}>{selectedModule.icon}</span><strong>{selectedModule.title} em breve</strong><p>Este módulo já está previsto na arquitetura do OrçaOS.</p></div>}
      </section>
    );
  }

  return <section className="app-screen calculations-overview-screen"><header className="screen-header"><span className="orca-kicker">Famílias e módulos</span><h1>Cálculos</h1><p>Escolha o setor profissional ou o núcleo transversal.</p></header><div className="module-list-app">{calculationModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}</div></section>;
}

function SurveyScreen({ captures, context, onRemove, onUpdate, onAddMany }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void; onAddMany: (items: CalculationCapture[]) => void }) {
  const [activeSection, setActiveSection] = useState<SurveySection>('guided');
  const surveyCaptures = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both');
  return <section className="app-screen"><header className="screen-header"><span className="orca-kicker">Guia de campo</span><h1>Levantamento</h1><p>Escolha o modo de trabalho para a visita técnica atual.</p></header><ActiveWorkContextCard {...context} /><div className="section-mode-tabs"><button className={activeSection === 'guided' ? 'active' : ''} type="button" onClick={() => setActiveSection('guided')}>Serviços</button><button className={activeSection === 'parts' ? 'active' : ''} type="button" onClick={() => setActiveSection('parts')}>Peças</button><button className={activeSection === 'manual' ? 'active' : ''} type="button" onClick={() => setActiveSection('manual')}>Bloco manual</button><button className={activeSection === 'items' ? 'active' : ''} type="button" onClick={() => setActiveSection('items')}>Itens salvos</button></div>{activeSection === 'guided' && <GuidedBudgetCart mode="catalog" onSendToBudget={onAddMany} />}{activeSection === 'parts' && <GuidedBudgetCart mode="parts" onSendToBudget={onAddMany} />}{activeSection === 'manual' && <GuidedBudgetCart mode="manual" onSendToBudget={onAddMany} />}{activeSection === 'items' && <><div className="survey-intro-card"><span className="app-icon tone-blue">▤</span><span><strong>Itens do levantamento</strong><small>{surveyCaptures.length} item(ns) salvos.</small></span></div><TechnicalCaptureList captures={surveyCaptures} emptyText="Use serviços, peças, bloco manual ou envie um cálculo para o levantamento." onRemove={onRemove} onUpdate={onUpdate} /></>}</section>;
}

function BudgetsScreen({ captures, context, onRemove, onUpdate }: { captures: CalculationCapture[]; context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null }; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void }) {
  const [activeSection, setActiveSection] = useState<BudgetSection>('workspace');
  const budgetCaptures = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both');
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Editor de proposta</span><h1>Orçamentos</h1><p>Monte a proposta comercial a partir dos itens técnicos.</p></header><ActiveWorkContextCard {...context} /><div className="section-mode-tabs"><button className={activeSection === 'workspace' ? 'active' : ''} type="button" onClick={() => setActiveSection('workspace')}>Montar proposta</button><button className={activeSection === 'technical' ? 'active' : ''} type="button" onClick={() => setActiveSection('technical')}>Itens técnicos</button></div>{activeSection === 'technical' && <><div className="survey-intro-card"><span className="app-icon tone-orange">▣</span><span><strong>Base técnica</strong><small>{budgetCaptures.length} item(ns) enviados para orçamento.</small></span></div><TechnicalCaptureList captures={budgetCaptures} emptyText="Abra um cálculo ou use o levantamento guiado." onRemove={onRemove} onUpdate={onUpdate} /></>}{activeSection === 'workspace' && <BudgetWorkspace technicalCaptures={budgetCaptures} activeClient={context.activeClient} activeWorkOrder={context.activeWorkOrder} onTechnicalCaptureConverted={(id) => onUpdate(id, { convertedToBudgetItem: true })} />}</section>;
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
  return <section className="app-screen wide-screen"><header className="screen-header"><span className="orca-kicker">Preferências</span><h1>Configurações</h1><p>Conta, histórico, informações do app e roadmap.</p></header><div className="settings-group"><h2>Conta</h2><article className="settings-row"><span className="app-icon tone-gray">▣</span><span><strong>Meu plano</strong><small>Grátis · base inicial ativa</small></span><span className="chevron">›</span></article><article className="settings-row"><span className="app-icon tone-green">◇</span><span><strong>Roadmap</strong><small>OrçaOS, módulos profissionais, relatórios e OS</small></span><span className="chevron">›</span></article></div></section>;
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleCardData | null>(null);
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
    setActiveTab('calculations');
  }

  return (
    <AppShell activeTab={activeTab} title={getScreenTitle(activeTab, selectedModule)} subtitle={getScreenSubtitle(activeTab, selectedModule)} navItems={navItems} activeClient={activeClient} activeWorkOrder={activeWorkOrder} onNavigate={goTo}>
      {activeTab === 'home' && <HomeScreen goTo={goTo} openModule={openModule} captures={captures} clients={clients} workOrders={workOrders} />}
      {activeTab === 'calculations' && <CalculationsScreen selectedModule={selectedModule} openModule={openModule} goTo={goTo} onCaptureCalculation={addCalculationCapture} />}
      {activeTab === 'survey' && <SurveyScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} onAddMany={addManyCalculationCaptures} />}
      {activeTab === 'budgets' && <BudgetsScreen captures={captures} context={context} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} />}
      {activeTab === 'reports' && <ReportsScreen captures={captures} context={context} />}
      {activeTab === 'clients' && <ClientsScreen onContextChange={(nextClients, nextWorkOrders, nextActiveWorkOrderId) => { setClients(nextClients); setWorkOrders(nextWorkOrders); setActiveWorkOrderId(nextActiveWorkOrderId); }} />}
      {activeTab === 'store' && <StoreScreen />}
      {activeTab === 'settings' && <SettingsScreen />}
    </AppShell>
  );
}
