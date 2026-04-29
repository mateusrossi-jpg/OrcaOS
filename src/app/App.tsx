import { calculateCurrentFromPower, roundTechnical } from '../core/calculations/electrical';
import { calculateBudgetSubtotal } from '../core/pricing/budget';
import { BudgetWorkspace } from '../features/budgets/components/BudgetWorkspace';
import { calculatorCatalog } from '../features/calculators/calculatorCatalog';
import { ElectricalCalculatorWorkspace } from '../features/calculators/components/ElectricalCalculatorWorkspace';
import { starterElectricalBudgetItems } from '../features/budgets/budgetTemplates';
import { suggestNextBreaker } from '../data/electrical-tables/commercialBreakers';
import { suggestMinimumCableSectionByCurrent } from '../data/electrical-tables/cableSections';

const demoCurrent = calculateCurrentFromPower({
  powerWatts: 2200,
  voltageVolts: 220,
  powerFactor: 1,
});

const demoBudgetSubtotal = calculateBudgetSubtotal(starterElectricalBudgetItems);

const modules = [
  {
    title: 'Calculadoras',
    description: 'Corrente, potência, consumo, queda de tensão, cabos e disjuntores.',
    status: 'Base criada',
  },
  {
    title: 'Orçamentos',
    description: 'Serviços, materiais, mão de obra, desconto e exportação futura em PDF.',
    status: 'Funcional inicial',
  },
  {
    title: 'Clientes',
    description: 'Cadastro, histórico, endereço, contatos e observações de atendimento.',
    status: 'Planejado',
  },
  {
    title: 'Relatórios',
    description: 'Diagnóstico de visita técnica com fotos, problemas e recomendações.',
    status: 'Planejado',
  },
  {
    title: 'Ordens de serviço',
    description: 'Execução, agendamento, status, retorno e manutenção preventiva.',
    status: 'Planejado',
  },
];

export function App() {
  const suggestedBreaker = suggestNextBreaker(demoCurrent);
  const suggestedCable = suggestMinimumCableSectionByCurrent(demoCurrent);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-badge">MVP Eletricista</div>
        <h1>OrçaOS</h1>
        <p>
          A base profissional para cálculos, orçamentos, relatórios e ordens de serviço de técnicos e eletricistas.
        </p>
        <div className="hero-actions">
          <a href="#calculadora-ativa" className="primary-action">
            Calcular agora
          </a>
          <a href="#orcamento-ativo" className="secondary-action">
            Montar orçamento
          </a>
        </div>
      </section>

      <section className="metric-grid" aria-label="Demonstrações técnicas">
        <article className="metric-card">
          <span>Exemplo de corrente</span>
          <strong>{roundTechnical(demoCurrent)} A</strong>
          <small>2200 W em 220 V</small>
        </article>
        <article className="metric-card">
          <span>Disjuntor sugerido</span>
          <strong>{suggestedBreaker ? `${suggestedBreaker} A` : 'Revisar'}</strong>
          <small>Sugestão comercial inicial</small>
        </article>
        <article className="metric-card">
          <span>Cabo preliminar</span>
          <strong>{suggestedCable ? `${suggestedCable} mm²` : 'Revisar'}</strong>
          <small>Pré-dimensionamento simplificado</small>
        </article>
        <article className="metric-card">
          <span>Orçamento base</span>
          <strong>R$ {roundTechnical(demoBudgetSubtotal)}</strong>
          <small>Modelo inicial de serviços</small>
        </article>
      </section>

      <section id="calculadora-ativa" className="content-section">
        <div className="section-header">
          <span>Uso prático</span>
          <h2>Calculadora elétrica ativa</h2>
          <p>Agora a tela já calcula com os valores informados, pronta para teste manual no navegador.</p>
        </div>
        <ElectricalCalculatorWorkspace />
      </section>

      <section id="orcamento-ativo" className="content-section">
        <div className="section-header">
          <span>Orçamento</span>
          <h2>Orçamento simples funcional</h2>
          <p>Monte itens de mão de obra, materiais e outros custos com subtotal, desconto e total final.</p>
        </div>
        <BudgetWorkspace />
      </section>

      <section id="calculadoras" className="content-section">
        <div className="section-header">
          <span>Ferramentas</span>
          <h2>Catálogo técnico</h2>
          <p>O catálogo continua separado da interface para facilitar testes, expansão e controle Free/Pro.</p>
        </div>

        <div className="card-grid">
          {calculatorCatalog.map((calculator) => (
            <article className="feature-card" key={calculator.id}>
              <div className="feature-card-header">
                <h3>{calculator.title}</h3>
                <span className={`pill ${calculator.plan}`}>{calculator.plan === 'free' ? 'Free' : 'Pro'}</span>
              </div>
              <p>{calculator.description}</p>
              <small>{calculator.status === 'available' ? 'Disponível na base' : 'Planejado'}</small>
            </article>
          ))}
        </div>
      </section>

      <section id="modulos" className="content-section">
        <div className="section-header">
          <span>Produto</span>
          <h2>Módulos do OrçaOS</h2>
          <p>Começamos pelo eletricista, mas a estrutura já prepara expansão para outros profissionais.</p>
        </div>

        <div className="module-list">
          {modules.map((module) => (
            <article className="module-row" key={module.title}>
              <div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <span>{module.status}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
