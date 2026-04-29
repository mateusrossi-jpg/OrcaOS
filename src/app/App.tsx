import { useState } from 'react';
import { calculateCurrentFromPower, roundTechnical } from '../core/calculations/electrical';
import { calculateBudgetSubtotal } from '../core/pricing/budget';
import type { CalculatorModule, UserPlan } from '../core/access/featureAccess';
import { getFreeCalculatorCount, getProCalculatorCount } from '../core/access/featureAccess';
import { BudgetWorkspace } from '../features/budgets/components/BudgetWorkspace';
import { ElectricalCalculatorWorkspace } from '../features/calculators/components/ElectricalCalculatorWorkspace';
import { starterElectricalBudgetItems } from '../features/budgets/budgetTemplates';
import { suggestNextBreaker } from '../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../data/electrical-tables/cableSections';

type AppTab = 'home' | 'modules' | 'favorites' | 'budgets' | 'more';

type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';

type ModulePlan = 'free' | 'pro' | 'soon';

type ModuleId = 'fundamentos' | 'instalacoes' | 'ambientes' | 'orcamentos' | 'motores' | 'automacao';

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

const demoBudgetSubtotal = calculateBudgetSubtotal(starterElectricalBudgetItems);
const suggestedBreaker = suggestNextBreaker(demoCurrent);
const suggestedCable = suggestMinimumCableSectionByCurrent(demoCurrent);
const freeCalculatorCount = getFreeCalculatorCount();
const proCalculatorCount = getProCalculatorCount();

const modules: ModuleCardData[] = [
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
    title: 'Instalações',
    description: 'Queda, seção por queda, AWG, disjuntor, cabo e eletroduto',
    icon: '⌁',
    tone: 'gray',
    count: '5 cálculos Pro',
    available: true,
    plan: 'pro',
    calculatorModule: 'installations',
  },
  {
    id: 'ambientes',
    title: 'Ambientes',
    description: 'Iluminação e ar-condicionado',
    icon: '☀',
    tone: 'green',
    count: '2 cálculos Pro',
    available: true,
    plan: 'pro',
    calculatorModule: 'environments',
  },
  {
    id: 'orcamentos',
    title: 'Orçamentos',
    description: 'Cliente, itens, PDF e histórico local',
    icon: '▣',
    tone: 'orange',
    count: 'Base grátis inicial',
    available: true,
    plan: 'free',
  },
  {
    id: 'motores',
    title: 'Motores',
    description: 'Corrente, potência, rotação e bobinagem',
    icon: '↻',
    tone: 'muted',
    count: 'Em breve',
    available: false,
    plan: 'soon',
  },
  {
    id: 'automacao',
    title: 'Automação',
    description: '4–20 mA, 0–10 V e sensores',
    icon: '≋',
    tone: 'muted',
    count: 'Em breve',
    available: false,
    plan: 'soon',
  },
];

const featuredCalculators = [
  { title: 'Lei de Ohm', module: 'Fundamentos', badge: 'LIVRE', icon: 'ϟ' },
  { title: 'Corrente por potência', module: 'Fundamentos', badge: 'LIVRE', icon: 'ϟ' },
  { title: 'Resistores série/paralelo', module: 'Fundamentos', badge: 'LIVRE', icon: 'ϟ' },
  { title: 'Consumo em kWh', module: 'Fundamentos', badge: 'LIVRE', icon: 'ϟ' },
  { title: 'Seção por queda', module: 'Instalações', badge: 'PRO', icon: '⌁' },
  { title: 'AWG ↔ mm²', module: 'Instalações', badge: 'PRO', icon: '⌁' },
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
    description: 'Queda de tensão, seção por queda, AWG, cabo/disjuntor e ocupação de eletroduto.',
    price: 'R$ 12,90',
    action: 'Detalhes',
  },
  {
    title: 'Pacote Ambientes Pro',
    description: 'Iluminação por ambiente e estimativa de ar-condicionado.',
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
  { id: 'modules', label: 'Módulos', icon: '▦' },
  { id: 'favorites', label: 'Favoritos', icon: '☆' },
  { id: 'budgets', label: 'Orçamentos', icon: '▣' },
  { id: 'more', label: 'Mais', icon: '•••' },
];

function planLabel(plan: ModulePlan): string {
  if (plan === 'free') {
    return 'LIVRE';
  }

  if (plan === 'pro') {
    return 'PRO';
  }

  return 'EM BREVE';
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

function HomeScreen({ goTo, openModule }: { goTo: (tab: AppTab) => void; openModule: (module: ModuleCardData) => void }) {
  return (
    <section className="app-screen">
      <div className="home-hero">
        <span>Olá, profissional</span>
        <h1>
          Orça<span>OS</span>
        </h1>
        <p>Calculadoras, orçamentos e relatórios técnicos para campo. O essencial fica livre; os módulos profissionais entram no Pro.</p>
      </div>

      <button className="free-plan-card" type="button" onClick={() => openModule(modules[0])}>
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
        <h2>Módulos</h2>
        <button type="button" onClick={() => goTo('modules')}>Ver todos</button>
      </div>

      <div className="home-module-grid">
        {modules.slice(0, 4).map((module) => (
          <ModuleCard key={module.id} module={module} onOpen={() => openModule(module)} />
        ))}
      </div>

      <div className="section-title-row">
        <h2>Cálculos em destaque</h2>
      </div>

      <div className="calculator-list">
        {featuredCalculators.slice(0, 5).map((calculator) => (
          <CalculatorRow key={calculator.title} {...calculator} />
        ))}
      </div>

      <div className="section-title-row">
        <h2>Resumo rápido</h2>
      </div>

      <div className="quick-summary-grid">
        <article>
          <span>Corrente</span>
          <strong>{roundTechnical(demoCurrent)} A</strong>
        </article>
        <article>
          <span>Disjuntor</span>
          <strong>{suggestedBreaker ? `${suggestedBreaker} A` : 'Revisar'}</strong>
        </article>
        <article>
          <span>Cabo</span>
          <strong>{suggestedCable ? `${suggestedCable} mm²` : 'Revisar'}</strong>
        </article>
        <article>
          <span>Orçamento</span>
          <strong>R$ {roundTechnical(demoBudgetSubtotal)}</strong>
        </article>
      </div>
    </section>
  );
}

function ModuleDetailScreen({ module, goBack, goTo }: { module: ModuleCardData; goBack: () => void; goTo: (tab: AppTab) => void }) {
  return (
    <section className={module.id === 'orcamentos' ? 'app-screen wide-screen' : 'app-screen'}>
      <button className="back-button" type="button" onClick={goBack}>‹ Voltar aos módulos</button>

      <header className="module-detail-header">
        <span className={`app-icon tone-${module.tone}`}>{module.icon}</span>
        <div>
          <em className={`module-plan-pill ${module.plan}`}>{planLabel(module.plan)}</em>
          <h1>{module.title}</h1>
          <p>{module.description}</p>
          <small>{module.count}</small>
        </div>
      </header>

      {module.id === 'orcamentos' ? (
        <BudgetWorkspace />
      ) : module.calculatorModule ? (
        <ElectricalCalculatorWorkspace selectedModule={module.calculatorModule} userPlan={userPlan} onUpgradeRequest={() => goTo('more')} />
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

function ModulesScreen({ openModule, selectedModule, goTo }: { openModule: (module: ModuleCardData | null) => void; selectedModule: ModuleCardData | null; goTo: (tab: AppTab) => void }) {
  if (selectedModule) {
    return <ModuleDetailScreen module={selectedModule} goBack={() => openModule(null)} goTo={goTo} />;
  }

  return (
    <section className="app-screen">
      <header className="screen-header">
        <h1>Módulos</h1>
        <p>Abra um módulo para acessar apenas os cálculos daquele grupo. Fundamentos ficam livres; módulos profissionais entram como Pro.</p>
      </header>

      <div className="module-list-app">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />
        ))}
      </div>
    </section>
  );
}

function FavoritesScreen() {
  return (
    <section className="app-screen">
      <header className="screen-header">
        <h1>Favoritos</h1>
        <p>Acesso rápido aos cálculos que você mais usa.</p>
      </header>

      <div className="empty-state-card">
        <span className="app-icon tone-blue large-icon">☆</span>
        <strong>Nenhum favorito ainda</strong>
        <p>Depois vamos permitir tocar na estrela em qualquer cálculo para salvá-lo aqui.</p>
      </div>

      <div className="section-title-row">
        <h2>Recentes</h2>
      </div>

      <div className="calculator-list">
        <CalculatorRow title="Lei de Ohm" module="Fundamentos · Resultado: 22 Ω" badge="LIVRE" icon="ϟ" />
      </div>
    </section>
  );
}

function BudgetsScreen() {
  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Orçamentos</h1>
        <p>Monte propostas, salve rascunhos locais e gere uma prévia para imprimir ou salvar em PDF.</p>
      </header>
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
        <article className="settings-row">
          <span className="app-icon tone-blue">▤</span>
          <span>
            <strong>Dados da OS / Cliente</strong>
            <small>Aparece no cabeçalho dos relatórios</small>
          </span>
          <span className="chevron">›</span>
        </article>
        <article className="settings-row">
          <span className="app-icon tone-gray">▣</span>
          <span>
            <strong>Meu plano</strong>
            <small>{userPlan === 'pro' ? 'Pro ativo' : 'Grátis · Fundamentos livres'}</small>
          </span>
          <span className="chevron">›</span>
        </article>
        <article className="settings-row">
          <span className="app-icon tone-green">◷</span>
          <span>
            <strong>Histórico</strong>
            <small>Orçamentos e cálculos recentes</small>
          </span>
          <span className="chevron">›</span>
        </article>
      </div>

      <div className="settings-group">
        <h2>Loja</h2>
        {storePackages.map((pack) => (
          <article className="store-card" key={pack.title}>
            <span className="app-icon tone-blue">▣</span>
            <span>
              <strong>{pack.title}</strong>
              <small>{pack.description}</small>
              <b>{pack.price}</b>
            </span>
            <button type="button">{pack.action}</button>
          </article>
        ))}
      </div>

      <div className="settings-group">
        <h2>Sobre</h2>
        <article className="settings-row">
          <span className="app-icon tone-blue">i</span>
          <span>
            <strong>Sobre o app</strong>
            <small>Versão 0.1.0</small>
          </span>
          <span className="chevron">›</span>
        </article>
        <article className="settings-row">
          <span className="app-icon tone-green">◇</span>
          <span>
            <strong>Roadmap</strong>
            <small>OrçaOS, relatórios, OS e mais módulos</small>
          </span>
          <span className="chevron">›</span>
        </article>
      </div>
    </section>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleCardData | null>(null);

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
        {activeTab === 'modules' && <ModulesScreen openModule={openModule} selectedModule={selectedModule} goTo={goTo} />}
        {activeTab === 'favorites' && <FavoritesScreen />}
        {activeTab === 'budgets' && <BudgetsScreen />}
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
