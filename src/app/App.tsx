import { useEffect, useState } from 'react';
import { calculateCurrentFromPower, roundTechnical } from '../core/calculations/electrical';
import type { CalculatorModule, UserPlan } from '../core/access/featureAccess';
import type { CalculationCapture, CalculationDestination } from '../core/types/workflow';
import { getFreeCalculatorCount, getProCalculatorCount } from '../core/access/featureAccess';
import { BudgetWorkspace } from '../features/budgets/components/BudgetWorkspace';
import { ClientWorkOrderWorkspace } from '../features/clients/components/ClientWorkOrderWorkspace';
import { ElectricalCalculatorWorkspace } from '../features/calculators/components/ElectricalCalculatorWorkspace';
import { ReportWorkspace } from '../features/reports/components/ReportWorkspace';
import { GuidedBudgetCart } from '../features/workflow/components/GuidedBudgetCart';
import { TechnicalCaptureList } from '../features/workflow/components/TechnicalCaptureList';
import { suggestNextBreaker } from '../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../data/electrical-tables/cableSections';

type AppTab = 'home' | 'calculations' | 'survey' | 'budgets' | 'reports' | 'more';
type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
type ModulePlan = 'free' | 'pro' | 'soon';
type ModuleId = 'fundamentos' | 'instalacoes' | 'iluminacao' | 'refrigeracao' | 'motores' | 'rebobinagem' | 'automacaoIndustrial';

interface ModuleCardData {
  id: ModuleId;
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

const demoCurrent = calculateCurrentFromPower({ powerWatts: 2200, voltageVolts: 220, powerFactor: 1 });
const suggestedBreaker = suggestNextBreaker(demoCurrent);
const suggestedCable = suggestMinimumCableSectionByCurrent(demoCurrent);
const freeCalculatorCount = getFreeCalculatorCount();
const proCalculatorCount = getProCalculatorCount();

const calculationModules: ModuleCardData[] = [
  { id: 'fundamentos', title: 'Fundamentos', description: 'Ohm, corrente, potência, resistores, VA e consumo', icon: 'ϟ', tone: 'blue', count: '7 cálculos livres', available: true, plan: 'free', calculatorModule: 'fundamentals' },
  { id: 'instalacoes', title: 'Instalações elétricas', description: 'Queda, distância, transformador, AWG, disjuntor, cabo e eletroduto', icon: '⌁', tone: 'gray', count: '7 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'installations' },
  { id: 'iluminacao', title: 'Iluminação', description: 'Lúmens, lux e quantidade de luminárias', icon: '☀', tone: 'green', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'lighting' },
  { id: 'refrigeracao', title: 'Refrigeração', description: 'BTU/h, climatização e carga térmica inicial', icon: '❄', tone: 'blue', count: '1 cálculo Pro', available: true, plan: 'pro', calculatorModule: 'refrigeration' },
  { id: 'motores', title: 'Motores', description: 'Corrente, rotação, escorregamento e relação de polias', icon: '↻', tone: 'orange', count: '3 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'motors' },
  { id: 'automacaoIndustrial', title: 'Automação industrial', description: 'Escalas 4–20 mA, 0–10 V e valor de engenharia', icon: '≋', tone: 'green', count: '2 cálculos Pro', available: true, plan: 'pro', calculatorModule: 'industrialAutomation' },
  { id: 'rebobinagem', title: 'Rebobinagem', description: 'Bobinas, fechamento, tensão de trabalho e rotação', icon: '⟳', tone: 'muted', count: 'Em breve', available: false, plan: 'soon' },
];

const featuredCalculators = [
  { title: 'Lei de Ohm', module: 'Fundamentos', badge: 'LIVRE', icon: 'ϟ' },
  { title: 'Corrente por potência', module: 'Fundamentos', badge: 'LIVRE', icon: 'ϟ' },
  { title: 'Transformador em kVA', module: 'Instalações elétricas', badge: 'PRO', icon: '⌁' },
  { title: 'BTU ar-condicionado', module: 'Refrigeração', badge: 'PRO', icon: '❄' },
  { title: 'Corrente de motor', module: 'Motores', badge: 'PRO', icon: '↻' },
  { title: 'Escala 4–20 mA', module: 'Automação industrial', badge: 'PRO', icon: '≋' },
];

const storePackages = [
  { title: 'Fundamentos grátis', description: 'Lei de Ohm, corrente, potência, resistores, W/VA/A e consumo liberados sem assinatura.', price: 'R$ 0', action: 'Já incluso' },
  { title: 'Pacote Instalações Pro', description: 'Queda de tensão, distância máxima, transformador, AWG, cabo/disjuntor e eletroduto.', price: 'R$ 12,90', action: 'Detalhes' },
  { title: 'Pacote Refrigeração Pro', description: 'BTU/h e estimativas iniciais para climatização.', price: 'R$ 9,90', action: 'Detalhes' },
  { title: 'Pacote Motores Pro', description: 'Corrente estimada, rotação síncrona, escorregamento e relação de polias.', price: 'R$ 12,90', action: 'Detalhes' },
  { title: 'Pacote Automação Industrial Pro', description: 'Escalonamento de sinais 4–20 mA e 0–10 V para valores de engenharia.', price: 'R$ 9,90', action: 'Detalhes' },
  { title: 'Pacote Orçamentos Pro', description: 'Modelos avançados, identidade profissional, PDF e recursos comerciais.', price: 'R$ 12,90', action: 'Detalhes' },
];

const navItems: Array<{ id: AppTab; label: string; icon: string }> = [
  { id: 'home', label: 'Início', icon: '⌂' },
  { id: 'calculations', label: 'Cálc.', icon: '▦' },
  { id: 'survey', label: 'Levant.', icon: '▤' },
  { id: 'budgets', label: 'Orçam.', icon: '▣' },
  { id: 'reports', label: 'Relat.', icon: '◫' },
  { id: 'more', label: 'Mais', icon: '•••' },
];

function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
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

function CalculatorRow({ title, module, badge, icon }: { title: string; module: string; badge: string; icon: string }) {
  return (
    <article className="calculator-row">
      <span className="app-icon tone-blue">{icon}</span>
      <span><strong>{title}</strong><small>{module}</small></span>
      <em className={badge === 'PRO' ? 'badge-pro' : 'badge-free'}>{badge}</em>
      <span className="chevron">›</span>
    </article>
  );
}

function HomeScreen({ goTo, openModule }: { goTo: (tab: AppTab) => void; openModule: (module: ModuleCardData) => void }) {
  return (
    <section className="app-screen">
      <div className="home-hero"><span>Olá, profissional</span><h1>Orça<span>OS</span></h1><p>Calculadoras, levantamentos, orçamentos e relatórios técnicos para campo. O essencial fica livre; os módulos profissionais entram no Pro.</p></div>
      <button className="free-plan-card" type="button" onClick={() => openModule(calculationModules[0])}><span className="app-icon tone-blue">ϟ</span><span><strong>Fundamentos 100% livres</strong><small>{freeCalculatorCount} cálculos essenciais liberados para todos, sem limitar o uso geral.</small></span><em>Usar</em></button>
      <div className="pro-teaser-card"><span className="app-icon tone-orange">◆</span><span><strong>OrçaOS Pro</strong><small>Desbloqueia {proCalculatorCount} cálculos avançados, módulos técnicos e recursos profissionais.</small></span><button type="button" onClick={() => goTo('more')}>Ver planos</button></div>
      <div className="section-title-row"><h2>Cálculos</h2><button type="button" onClick={() => goTo('calculations')}>Ver todos</button></div>
      <div className="home-module-grid">{calculationModules.slice(0, 6).map((module) => <ModuleCard key={module.id} module={module} onOpen={() => openModule(module)} />)}</div>
      <div className="section-title-row"><h2>Cálculos em destaque</h2></div>
      <div className="calculator-list">{featuredCalculators.slice(0, 5).map((calculator) => <CalculatorRow key={calculator.title} {...calculator} />)}</div>
      <div className="section-title-row"><h2>Resumo rápido</h2></div>
      <div className="quick-summary-grid"><article><span>Corrente</span><strong>{roundTechnical(demoCurrent)} A</strong></article><article><span>Disjuntor</span><strong>{suggestedBreaker ? `${suggestedBreaker} A` : 'Revisar'}</strong></article><article><span>Cabo</span><strong>{suggestedCable ? `${suggestedCable} mm²` : 'Revisar'}</strong></article><article><span>Cálculos Pro</span><strong>{proCalculatorCount}</strong></article></div>
    </section>
  );
}

function CalculationsScreen({ selectedModule, openModule, goTo, onCaptureCalculation }: { selectedModule: ModuleCardData | null; openModule: (module: ModuleCardData | null) => void; goTo: (tab: AppTab) => void; onCaptureCalculation: (capture: CalculationCapture) => void }) {
  if (selectedModule) {
    return (
      <section className="app-screen">
        <button className="back-button" type="button" onClick={() => openModule(null)}>‹ Voltar aos cálculos</button>
        <header className="module-detail-header"><span className={`app-icon tone-${selectedModule.tone}`}>{selectedModule.icon}</span><div><em className={`module-plan-pill ${selectedModule.plan}`}>{planLabel(selectedModule.plan)}</em><h1>{selectedModule.title}</h1><p>{selectedModule.description}</p><small>{selectedModule.count}</small></div></header>
        {selectedModule.calculatorModule ? <ElectricalCalculatorWorkspace selectedModule={selectedModule.calculatorModule} userPlan={userPlan} onUpgradeRequest={() => goTo('more')} onCaptureCalculation={onCaptureCalculation} /> : <div className="empty-state-card"><span className={`app-icon tone-${selectedModule.tone} large-icon`}>{selectedModule.icon}</span><strong>{selectedModule.title} em breve</strong><p>Este módulo já está previsto na arquitetura do OrçaOS e será implementado depois.</p></div>}
      </section>
    );
  }

  return <section className="app-screen"><header className="screen-header"><h1>Cálculos</h1><p>Escolha uma categoria técnica. Aqui ficam somente calculadoras; orçamento, levantamento e configurações ficam em abas próprias.</p></header><div className="module-list-app">{calculationModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}</div></section>;
}

function SurveyScreen({ captures, onRemove, onUpdate, onAddMany }: { captures: CalculationCapture[]; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void; onAddMany: (items: CalculationCapture[]) => void }) {
  const surveyCaptures = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both');

  return (
    <section className="app-screen">
      <header className="screen-header"><h1>Levantamento</h1><p>Resultados técnicos dos cálculos, observações de campo, carrinho guiado e especificações antes de virar orçamento ou relatório.</p></header>
      <GuidedBudgetCart onSendToBudget={onAddMany} />
      <div className="survey-intro-card"><span className="app-icon tone-blue">▤</span><span><strong>Levantamento técnico da OS</strong><small>{surveyCaptures.length} item(ns) técnicos salvos localmente neste navegador.</small></span></div>
      <TechnicalCaptureList captures={surveyCaptures} emptyText="Abra um cálculo e toque em Adicionar ao levantamento para começar a montar o projeto técnico." onRemove={onRemove} onUpdate={onUpdate} />
    </section>
  );
}

function BudgetsScreen({ captures, onRemove, onUpdate }: { captures: CalculationCapture[]; onRemove: (id: string) => void; onUpdate: (id: string, patch: Partial<CalculationCapture>) => void }) {
  const budgetCaptures = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both');
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Orçamentos</h1><p>Monte propostas, salve rascunhos locais e gere uma prévia para imprimir ou salvar em PDF.</p></header>
      <div className="survey-intro-card"><span className="app-icon tone-orange">▣</span><span><strong>Itens técnicos enviados ao orçamento</strong><small>{budgetCaptures.length} item(ns) técnicos salvos localmente como base comercial.</small></span></div>
      <TechnicalCaptureList captures={budgetCaptures} emptyText="Abra um cálculo ou use o levantamento guiado para enviar itens ao orçamento." onRemove={onRemove} onUpdate={onUpdate} />
      <BudgetWorkspace technicalCaptures={budgetCaptures} onTechnicalCaptureConverted={(id) => onUpdate(id, { convertedToBudgetItem: true })} />
    </section>
  );
}

function ReportsScreen({ captures }: { captures: CalculationCapture[] }) {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Relatórios</h1><p>Gere uma prévia técnica com fotos, diagnósticos, observações e especificações vindas do levantamento.</p></header>
      <ReportWorkspace captures={captures} />
    </section>
  );
}

function MoreScreen() {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header"><h1>Mais</h1><p>Clientes, ordens de serviço, configurações, pacotes e informações do OrçaOS.</p></header>
      <ClientWorkOrderWorkspace />
      <div className="settings-group"><h2>Conta</h2><article className="settings-row"><span className="app-icon tone-gray">▣</span><span><strong>Meu plano</strong><small>{userPlan === 'pro' ? 'Pro ativo' : 'Grátis · Fundamentos livres'}</small></span><span className="chevron">›</span></article><article className="settings-row"><span className="app-icon tone-green">◷</span><span><strong>Histórico</strong><small>Orçamentos, levantamentos, relatórios e cálculos recentes</small></span><span className="chevron">›</span></article></div>
      <div className="settings-group"><h2>Loja</h2>{storePackages.map((pack) => <article className="store-card" key={pack.title}><span className="app-icon tone-blue">▣</span><span><strong>{pack.title}</strong><small>{pack.description}</small><b>{pack.price}</b></span><button type="button">{pack.action}</button></article>)}</div>
      <div className="settings-group"><h2>Sobre</h2><article className="settings-row"><span className="app-icon tone-blue">i</span><span><strong>Sobre o app</strong><small>Versão 0.1.0</small></span><span className="chevron">›</span></article><article className="settings-row"><span className="app-icon tone-green">◇</span><span><strong>Roadmap</strong><small>OrçaOS, levantamentos, relatórios, OS e mais módulos</small></span><span className="chevron">›</span></article></div>
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleCardData | null>(null);
  const [captures, setCaptures] = useState<CalculationCapture[]>(() => loadStoredCaptures());

  useEffect(() => { saveStoredCaptures(captures); }, [captures]);

  function addCalculationCapture(capture: CalculationCapture) {
    setCaptures((current) => [{ itemType: 'technicalObservation', editableDescription: capture.summary, quantity: '1', unitValue: '', shouldGenerateBudgetItem: capture.destination !== 'survey', convertedToBudgetItem: false, ...capture }, ...current]);
  }

  function addManyCalculationCaptures(items: CalculationCapture[]) {
    setCaptures((current) => [...items, ...current]);
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
    <main className="mobile-app-shell">
      <div className="mobile-app-content">
        {activeTab === 'home' && <HomeScreen goTo={goTo} openModule={openModule} />}
        {activeTab === 'calculations' && <CalculationsScreen selectedModule={selectedModule} openModule={openModule} goTo={goTo} onCaptureCalculation={addCalculationCapture} />}
        {activeTab === 'survey' && <SurveyScreen captures={captures} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} onAddMany={addManyCalculationCaptures} />}
        {activeTab === 'budgets' && <BudgetsScreen captures={captures} onRemove={removeCalculationCapture} onUpdate={updateCalculationCapture} />}
        {activeTab === 'reports' && <ReportsScreen captures={captures} />}
        {activeTab === 'more' && <MoreScreen />}
      </div>
      <nav className="bottom-nav" aria-label="Navegação principal">{navItems.map((item) => <button className={activeTab === item.id ? 'active' : ''} key={item.id} type="button" onClick={() => goTo(item.id)}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>
    </main>
  );
}
