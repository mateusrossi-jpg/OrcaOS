import { useState } from 'react';
import { calculateCurrentFromPower, roundTechnical } from '../core/calculations/electrical';
import { calculateBudgetSubtotal } from '../core/pricing/budget';
import { BudgetWorkspace } from '../features/budgets/components/BudgetWorkspace';
import { calculatorCatalog } from '../features/calculators/calculatorCatalog';
import { ElectricalCalculatorWorkspace } from '../features/calculators/components/ElectricalCalculatorWorkspace';
import { starterElectricalBudgetItems } from '../features/budgets/budgetTemplates';
import { suggestNextBreaker } from '../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../data/electrical-tables/cableSections';

type AppTab = 'home' | 'modules' | 'favorites' | 'budgets' | 'more';

type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';

interface ModuleCardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: ModuleTone;
  count: string;
  available: boolean;
}

const demoCurrent = calculateCurrentFromPower({
  powerWatts: 2200,
  voltageVolts: 220,
  powerFactor: 1,
});

const demoBudgetSubtotal = calculateBudgetSubtotal(starterElectricalBudgetItems);
const suggestedBreaker = suggestNextBreaker(demoCurrent);
const suggestedCable = suggestMinimumCableSectionByCurrent(demoCurrent);

const modules: ModuleCardData[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos',
    description: 'Ohm, potência, VA e consumo',
    icon: 'ϟ',
    tone: 'blue',
    count: '5 cálculos · 4 grátis',
    available: true,
  },
  {
    id: 'instalacoes',
    title: 'Instalações',
    description: 'Bitola, queda, disjuntor e eletroduto',
    icon: '⌁',
    tone: 'gray',
    count: '5 cálculos · 2 grátis',
    available: true,
  },
  {
    id: 'ambientes',
    title: 'Ambientes',
    description: 'Iluminação e ar-condicionado',
    icon: '☀',
    tone: 'green',
    count: '2 cálculos · 2 grátis',
    available: true,
  },
  {
    id: 'orcamentos',
    title: 'Orçamentos',
    description: 'Cliente, itens, PDF e histórico local',
    icon: '▣',
    tone: 'orange',
    count: 'Funcional inicial',
    available: true,
  },
  {
    id: 'motores',
    title: 'Motores',
    description: 'Corrente, potência, rotação e bobinagem',
    icon: '↻',
    tone: 'muted',
    count: 'Em breve',
    available: false,
  },
  {
    id: 'automacao',
    title: 'Automação',
    description: '4–20 mA, 0–10 V e sensores',
    icon: '≋',
    tone: 'muted',
    count: 'Em breve',
    available: false,
  },
];

const featuredCalculators = [
  { title: 'Corrente por potência', module: 'Fundamentos', badge: 'GRÁTIS', icon: 'ϟ' },
  { title: 'Potência elétrica', module: 'Fundamentos', badge: 'GRÁTIS', icon: 'ϟ' },
  { title: 'Consumo em kWh', module: 'Fundamentos', badge: 'GRÁTIS', icon: 'ϟ' },
  { title: 'Queda de tensão', module: 'Instalações', badge: 'PRO', icon: '⌁' },
  { title: 'Iluminação', module: 'Ambientes', badge: 'GRÁTIS', icon: '☀' },
];

const storePackages = [
  {
    title: 'Pacote Fundamentos',
    description: 'Desbloqueia todos os cálculos básicos e histórico completo.',
    price: 'R$ 9,90',
  },
  {
    title: 'Pacote Instalações',
    description: 'Bitola, disjuntor, queda de tensão, AWG e eletroduto.',
    price: 'R$ 12,90',
  },
  {
    title: 'Pacote Orçamentos',
    description: 'Modelos, impressão, PDFs e recursos profissionais.',
    price: 'R$ 12,90',
  },
];

const navItems: Array<{ id: AppTab; label: string; icon: string }> = [
  { id: 'home', label: 'Início', icon: '⌂' },
  { id: 'modules', label: 'Módulos', icon: '▦' },
  { id: 'favorites', label: 'Favoritos', icon: '☆' },
  { id: 'budgets', label: 'Orçamentos', icon: '▣' },
  { id: 'more', label: 'Mais', icon: '•••' },
];

function ModuleCard({ module, compact = false, onOpen }: { module: ModuleCardData; compact?: boolean; onOpen?: () => void }) {
  return (
    <button className={module.available ? 'module-app-card' : 'module-app-card disabled'} type="button" onClick={onOpen}>
      <span className={`app-icon tone-${module.tone}`}>{module.icon}</span>
      <span className="module-card-body">
        <strong>{module.title}</strong>
        <small>{compact ? module.count : module.description}</small>
      </span>
      {!compact && !module.available && <em>Em breve</em>}
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

function HomeScreen({ goTo }: { goTo: (tab: AppTab) => void }) {
  return (
    <section className="app-screen">
      <div className="home-hero">
        <span>Olá, profissional</span>
        <h1>
          Orça<span>OS</span>
        </h1>
        <p>Calculadoras, orçamentos e relatórios técnicos para campo. Rápido, confiável e evoluindo com você.</p>
      </div>

      <button className="free-plan-card" type="button" onClick={() => goTo('modules')}>
        <span className="app-icon tone-blue">ϟ</span>
        <span>
          <strong>Versão gratuita</strong>
          <small>Cálculos essenciais já liberados em cada módulo.</small>
        </span>
        <em>Ver</em>
      </button>

      <div className="section-title-row">
        <h2>Módulos</h2>
        <button type="button" onClick={() => goTo('modules')}>Ver todos</button>
      </div>

      <div className="home-module-grid">
        {modules.slice(0, 4).map((module) => (
          <ModuleCard key={module.id} module={module} onOpen={() => goTo(module.id === 'orcamentos' ? 'budgets' : 'modules')} />
        ))}
      </div>

      <div className="section-title-row">
        <h2>Cálculos em destaque</h2>
      </div>

      <div className="calculator-list">
        {featuredCalculators.slice(0, 4).map((calculator) => (
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

function ModulesScreen({ goTo }: { goTo: (tab: AppTab) => void }) {
  return (
    <section className="app-screen">
      <header className="screen-header">
        <h1>Módulos</h1>
        <p>Toque em um módulo para ver os cálculos e ferramentas disponíveis.</p>
      </header>

      <div className="module-list-app">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} compact onOpen={() => goTo(module.id === 'orcamentos' ? 'budgets' : 'modules')} />
        ))}
      </div>

      <div className="section-title-row calculator-section-title">
        <h2>Calculadora ativa</h2>
      </div>

      <ElectricalCalculatorWorkspace />
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
        <CalculatorRow title="Corrente por potência" module="Resultado: 10 A" badge="GRÁTIS" icon="ϟ" />
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
            <strong>Meus pacotes</strong>
            <small>0 ativo(s)</small>
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
            <button type="button">Detalhes</button>
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

  return (
    <main className="mobile-app-shell">
      <div className="mobile-app-content">
        {activeTab === 'home' && <HomeScreen goTo={setActiveTab} />}
        {activeTab === 'modules' && <ModulesScreen goTo={setActiveTab} />}
        {activeTab === 'favorites' && <FavoritesScreen />}
        {activeTab === 'budgets' && <BudgetsScreen />}
        {activeTab === 'more' && <MoreScreen />}
      </div>

      <nav className="bottom-nav" aria-label="Navegação principal">
        {navItems.map((item) => (
          <button className={activeTab === item.id ? 'active' : ''} key={item.id} type="button" onClick={() => setActiveTab(item.id)}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}
