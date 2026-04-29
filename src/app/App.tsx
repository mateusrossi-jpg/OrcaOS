import { useState } from 'react';
import { calculateCurrentFromPower, roundTechnical } from '../core/calculations/electrical';
import type { CalculatorModule, UserPlan } from '../core/access/featureAccess';
import type { CalculationCapture } from '../core/types/workflow';
import { getFreeCalculatorCount, getProCalculatorCount } from '../core/access/featureAccess';
import { BudgetWorkspace } from '../features/budgets/components/BudgetWorkspace';
import { ElectricalCalculatorWorkspace } from '../features/calculators/components/ElectricalCalculatorWorkspace';
import { suggestNextBreaker } from '../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../data/electrical-tables/cableSections';

type AppTab = 'home' | 'modules' | 'survey' | 'budgets' | 'more';

type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';

type ModulePlan = 'free' | 'pro' | 'soon';

type ModuleId =
  | 'fundamentos'
  | 'instalacoes'
  | 'iluminacao'
  | 'refrigeracao'
  | 'motores'
  | 'rebobinagem'
  | 'automacaoIndustrial';

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

const demoCurrent = calculateCurrentFromPower({
  powerWatts: 2200,
  voltageVolts: 220,
  powerFactor: 1,
});

const suggestedBreaker = suggestNextBreaker(demoCurrent);
const suggestedCable = suggestMinimumCableSectionByCurrent(demoCurrent);
const freeCalculatorCount = getFreeCalculatorCount();
const proCalculatorCount = getProCalculatorCount();

const calculationModules: ModuleCardData[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos',
    description: 'Ohm, corrente, potência, resistores, VA e consumo',
    icon: 'ϟ',
    tone: 'blue',
    count: '7 cálculos livres',
    available: true,
    plan: 'free',
    calculatorModule: 'fundamentals',
  },
  {
    id: 'instalacoes',
    title: 'Instalações elétricas',
    description: 'Queda, distância, transformador, AWG, disjuntor, cabo e eletroduto',
    icon: '⌁',
    tone: 'gray',
    count: '7 cálculos Pro',
    available: true,
    plan: 'pro',
    calculatorModule: 'installations',
  },
  {
    id: 'iluminacao',
    title: 'Iluminação',
    description: 'Lúmens, lux e quantidade de luminárias',
    icon: '☀',
    tone: 'green',
    count: '1 cálculo Pro',
    available: true,
    plan: 'pro',
    calculatorModule: 'lighting',
  },
  {
    id: 'refrigeracao',
    title: 'Refrigeração',
    description: 'BTU/h, climatização e carga térmica inicial',
    icon: '❄',
    tone: 'blue',
    count: '1 cálculo Pro',
    available: true,
    plan: 'pro',
    calculatorModule: 'refrigeration',
  },
  {
    id: 'motores',
    title: 'Motores',
    description: 'Corrente, rotação, escorregamento e relação de polias',
    icon: '↻',
    tone: 'orange',
    count: '3 cálculos Pro',
    available: true,
    plan: 'pro',
    calculatorModule: 'motors',
  },
  {
    id: 'automacaoIndustrial',
    title: 'Automação industrial',
    description: 'Escalas 4–20 mA, 0–10 V e valor de engenharia',
    icon: '≋',
    tone: 'green',
    count: '2 cálculos Pro',
    available: true,
    plan: 'pro',
    calculatorModule: 'industrialAutomation',
  },
  {
    id: 'rebobinagem',
    title: 'Rebobinagem',
    description: 'Bobinas, fechamento, tensão de trabalho e rotação',
    icon: '⟳',
    tone: 'muted',
    count: 'Em breve',
    available: false,
    plan: 'soon',
  },
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
  {
    title: 'Fundamentos grátis',
    description: 'Lei de Ohm, corrente, potência, resistores, W/VA/A e consumo liberados sem assinatura.',
    price: 'R$ 0',
    action: 'Já incluso',
  },
  {
    title: 'Pacote Instalações Pro',
    description: 'Queda de tensão, distância máxima, transformador, AWG, cabo/disjuntor e eletroduto.',
    price: 'R$ 12,90',
    action: 'Detalhes',
  },
  {
    title: 'Pacote Refrigeração Pro',
    description: 'BTU/h e estimativas iniciais para climatização.',
    price: 'R$ 9,90',
    action: 'Detalhes',
  },
  {
    title: 'Pacote Motores Pro',
    description: 'Corrente estimada, rotação síncrona, escorregamento e relação de polias.',
    price: 'R$ 12,90',
    action: 'Detalhes',
  },
  {
    title: 'Pacote Automação Industrial Pro',
    description: 'Escalonamento de sinais 4–20 mA e 0–10 V para valores de engenharia.',
    price: 'R$ 9,90',
    action: 'Detalhes',
  },
  {
    title: 'Pacote Orçamentos Pro',
    description: 'Modelos avançados, identidade profissional, PDF e recursos comerciais.',
    price: 'R$ 12,90',
    action: 'Detalhes',
  },
];

const navItems: Array<{ id: AppTab; label: string; icon: string }> = [
  { id: 'home', label: 'Início', icon: '⌂' },
  { id: 'modules', label: 'Cálculos', icon: '▦' },
  { id: 'survey', label: 'Levant.', icon: '▤' },
  { id: 'budgets', label: 'Orçam.', icon: '▣' },
  { id: 'more', label: 'Mais', icon: '•••' },
];

function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
}

function formatCaptureTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function ModuleCard({ module, compact = false, onOpen }: { module: ModuleCardData; compact?: boolean; onOpen?: () => void }) {
  return (
    <button className={module.available ? 'module-app-card' : 'module-app-card disabled'} type="button" onClick={onOpen}>
      <span className={`app-icon tone-${module.tone}`}>{module.icon}</span>
      <span className="module-card-body">
        <strong>{module.title}</strong>
        <small>{compact ? module.count : module.description}</small>
      </span>
      <em className={`module-plan-pill ${module.plan}`}>{planLabel(module.plan)}</em>
      {compact && <span className="chevron">›</span>}
    </button>
  );
}

function CalculatorRow({ title, module, badge, icon }: { title: string; module: string; badge: string; icon: string }) {
  return (
    <article className="calculator-row">
      <span className="app-icon tone-blue">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{module}</small>
      </span>
      <em className={badge === 'PRO' ? 'badge-pro' : 'badge-free'}>{badge}</em>
      <span className="chevron">›</span>
    </article>
  );
}

function CaptureList({ captures, emptyText }: { captures: CalculationCapture[]; emptyText: string }) {
  if (captures.length === 0) {
    return (
      <div className="survey-empty-state">
        <span className="app-icon tone-gray large-icon">⌁</span>
        <strong>Nenhum item ainda</strong>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="calculator-list">
      {captures.map((capture) => (
        <article className="calculator-row" key={capture.id}>
          <span className="app-icon tone-blue">▤</span>
          <span>
            <strong>{capture.calculatorLabel}</strong>
            <small>{capture.moduleLabel} · {formatCaptureTime(capture.createdAt)}</small>
            <small>{capture.summary}</small>
          </span>
          <em className="badge-free">SALVO</em>
        </article>
      ))}
    </div>
  );
}

function HomeScreen({ goTo, openModule }: { goTo: (tab: AppTab) => void; openModule: (module: ModuleCardData) => void }) {
  return (
    <section className="app-screen">
      <div className="home-hero">
        <span>Olá, profissional</span>
        <h1>Orça<span>OS</span></h1>
        <p>Calculadoras, levantamentos, orçamentos e relatórios técnicos para campo. O essencial fica livre; os módulos profissionais entram no Pro.</p>
      </div>

      <button className="free-plan-card" type="button" onClick={() => openModule(calculationModules[0])}>
        <span className="app-icon tone-blue">ϟ</span>
        <span>
          <strong>Fundamentos 100% livres</strong>
          <small>{freeCalculatorCount} cálculos essenciais liberados para todos, sem limitar o uso geral.</small>
        </span>
        <em>Usar</em>
      </button>

      <div className="pro-teaser-card">
        <span className="app-icon tone-orange">◆</span>
        <span>
          <strong>OrçaOS Pro</strong>
          <small>Desbloqueia {proCalculatorCount} cálculos avançados, módulos técnicos e recursos profissionais.</small>
        </span>
        <button type="button" onClick={() => goTo('more')}>Ver planos</button>
      </div>

      <div className="section-title-row">
        <h2>Cálculos</h2>
        <button type="button" onClick={() => goTo('modules')}>Ver todos</button>
      </div>

      <div className="home-module-grid">
        {calculationModules.slice(0, 6).map((module) => <ModuleCard key={module.id} module={module} onOpen={() => openModule(module)} />)}
      </div>

      <div className="section-title-row"><h2>Cálculos em destaque</h2></div>
      <div className="calculator-list">
        {featuredCalculators.slice(0, 5).map((calculator) => <CalculatorRow key={calculator.title} {...calculator} />)}
      </div>

      <div className="section-title-row"><h2>Resumo rápido</h2></div>
      <div className="quick-summary-grid">
        <article><span>Corrente</span><strong>{roundTechnical(demoCurrent)} A</strong></article>
        <article><span>Disjuntor</span><strong>{suggestedBreaker ? `${suggestedBreaker} A` : 'Revisar'}</strong></article>
        <article><span>Cabo</span><strong>{suggestedCable ? `${suggestedCable} mm²` : 'Revisar'}</strong></article>
        <article><span>Cálculos Pro</span><strong>{proCalculatorCount}</strong></article>
      </div>
    </section>
  );
}

function ModuleDetailScreen({
  module,
  goBack,
  goTo,
  onCaptureCalculation,
}: {
  module: ModuleCardData;
  goBack: () => void;
  goTo: (tab: AppTab) => void;
  onCaptureCalculation: (capture: CalculationCapture) => void;
}) {
  return (
    <section className="app-screen">
      <button className="back-button" type="button" onClick={goBack}>‹ Voltar aos cálculos</button>

      <header className="module-detail-header">
        <span className={`app-icon tone-${module.tone}`}>{module.icon}</span>
        <div>
          <em className={`module-plan-pill ${module.plan}`}>{planLabel(module.plan)}</em>
          <h1>{module.title}</h1>
          <p>{module.description}</p>
          <small>{module.count}</small>
        </div>
      </header>

      {module.calculatorModule ? (
        <ElectricalCalculatorWorkspace selectedModule={module.calculatorModule} userPlan={userPlan} onUpgradeRequest={() => goTo('more')} onCaptureCalculation={onCaptureCalculation} />
      ) : (
        <div className="empty-state-card">
          <span className={`app-icon tone-${module.tone} large-icon`}>{module.icon}</span>
          <strong>{module.title} em breve</strong>
          <p>Este módulo já está previsto na arquitetura do OrçaOS e será implementado depois.</p>
        </div>
      )}
    </section>
  );
}

function ModulesScreen({
  openModule,
  selectedModule,
  goTo,
  onCaptureCalculation,
}: {
  openModule: (module: ModuleCardData | null) => void;
  selectedModule: ModuleCardData | null;
  goTo: (tab: AppTab) => void;
  onCaptureCalculation: (capture: CalculationCapture) => void;
}) {
  if (selectedModule) {
    return <ModuleDetailScreen module={selectedModule} goBack={() => openModule(null)} goTo={goTo} onCaptureCalculation={onCaptureCalculation} />;
  }

  return (
    <section className="app-screen">
      <header className="screen-header">
        <h1>Cálculos</h1>
        <p>Escolha uma categoria técnica. Aqui ficam somente calculadoras; orçamento, levantamento e configurações ficam em abas próprias.</p>
      </header>
      <div className="module-list-app">
        {calculationModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}
      </div>
    </section>
  );
}

function SurveyScreen({ captures }: { captures: CalculationCapture[] }) {
  const surveyCaptures = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both');

  return (
    <section className="app-screen">
      <header className="screen-header">
        <h1>Levantamento</h1>
        <p>Resultados técnicos dos cálculos, observações de campo e especificações antes de virar orçamento ou relatório.</p>
      </header>

      <div className="survey-intro-card">
        <span className="app-icon tone-blue">▤</span>
        <span>
          <strong>Levantamento técnico da OS</strong>
          <small>Use esta aba para guardar especificações técnicas de projeto, visita e relatório.</small>
        </span>
      </div>

      <CaptureList captures={surveyCaptures} emptyText="Abra um cálculo e toque em Adicionar ao levantamento para começar a montar o projeto técnico." />
    </section>
  );
}

function BudgetsScreen({ captures }: { captures: CalculationCapture[] }) {
  const budgetCaptures = captures.filter((capture) => capture.destination === 'budget' || capture.destination === 'both');

  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Orçamentos</h1>
        <p>Monte propostas, salve rascunhos locais e gere uma prévia para imprimir ou salvar em PDF.</p>
      </header>

      <div className="survey-intro-card">
        <span className="app-icon tone-orange">▣</span>
        <span>
          <strong>Itens técnicos enviados ao orçamento</strong>
          <small>Os cálculos enviados para orçamento aparecem aqui como base técnica. Depois eles serão convertidos em serviço, material ou observação comercial.</small>
        </span>
      </div>
      <CaptureList captures={budgetCaptures} emptyText="Abra um cálculo e toque em Adicionar ao orçamento para usar o resultado como base comercial." />

      <BudgetWorkspace />
    </section>
  );
}

function MoreScreen() {
  return (
    <section className="app-screen">
      <header className="screen-header">
        <h1>Mais</h1>
        <p>Configurações, pacotes e informações do OrçaOS.</p>
      </header>

      <div className="settings-group">
        <h2>Conta</h2>
        <article className="settings-row"><span className="app-icon tone-blue">▤</span><span><strong>Dados da OS / Cliente</strong><small>Aparece no cabeçalho dos relatórios</small></span><span className="chevron">›</span></article>
        <article className="settings-row"><span className="app-icon tone-gray">▣</span><span><strong>Meu plano</strong><small>{userPlan === 'pro' ? 'Pro ativo' : 'Grátis · Fundamentos livres'}</small></span><span className="chevron">›</span></article>
        <article className="settings-row"><span className="app-icon tone-green">◷</span><span><strong>Histórico</strong><small>Orçamentos, levantamentos e cálculos recentes</small></span><span className="chevron">›</span></article>
      </div>

      <div className="settings-group">
        <h2>Loja</h2>
        {storePackages.map((pack) => (
          <article className="store-card" key={pack.title}>
            <span className="app-icon tone-blue">▣</span>
            <span><strong>{pack.title}</strong><small>{pack.description}</small><b>{pack.price}</b></span>
            <button type="button">{pack.action}</button>
          </article>
        ))}
      </div>

      <div className="settings-group">
        <h2>Sobre</h2>
        <article className="settings-row"><span className="app-icon tone-blue">i</span><span><strong>Sobre o app</strong><small>Versão 0.1.0</small></span><span className="chevron">›</span></article>
        <article className="settings-row"><span className="app-icon tone-green">◇</span><span><strong>Roadmap</strong><small>OrçaOS, levantamentos, relatórios, OS e mais módulos</small></span><span className="chevron">›</span></article>
      </div>
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleCardData | null>(null);
  const [captures, setCaptures] = useState<CalculationCapture[]>([]);

  function addCalculationCapture(capture: CalculationCapture) {
    setCaptures((current) => [capture, ...current]);
  }

  function goTo(tab: AppTab) {
    setActiveTab(tab);
    if (tab !== 'modules') {
      setSelectedModule(null);
    }
  }

  function openModule(module: ModuleCardData | null) {
    setSelectedModule(module);
    setActiveTab('modules');
  }

  return (
    <main className="mobile-app-shell">
      <div className="mobile-app-content">
        {activeTab === 'home' && <HomeScreen goTo={goTo} openModule={openModule} />}
        {activeTab === 'modules' && <ModulesScreen openModule={openModule} selectedModule={selectedModule} goTo={goTo} onCaptureCalculation={addCalculationCapture} />}
        {activeTab === 'survey' && <SurveyScreen captures={captures} />}
        {activeTab === 'budgets' && <BudgetsScreen captures={captures} />}
        {activeTab === 'more' && <MoreScreen />}
      </div>

      <nav className="bottom-nav" aria-label="Navegação principal">
        {navItems.map((item) => (
          <button className={activeTab === item.id ? 'active' : ''} key={item.id} type="button" onClick={() => goTo(item.id)}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}
