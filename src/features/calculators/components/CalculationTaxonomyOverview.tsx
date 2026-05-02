import type { CalculatorModule } from '../../../core/access/featureAccess';
import './CalculationTaxonomyOverview.css';

type ModuleTone = 'blue' | 'gray' | 'green' | 'orange' | 'muted';
type ModulePlan = 'free' | 'pro' | 'soon';

export interface TaxonomyModuleCardData {
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

interface TaxonomyGroup {
  id: string;
  title: string;
  subtitle: string;
  modules: TaxonomyModuleCardData[];
}

interface Props {
  modules: TaxonomyModuleCardData[];
  onOpenModule: (module: TaxonomyModuleCardData) => void;
}

function planLabel(plan: ModulePlan): string {
  if (plan === 'free') return 'LIVRE';
  if (plan === 'pro') return 'PRO';
  return 'EM BREVE';
}

function findModule(modules: TaxonomyModuleCardData[], id: string): TaxonomyModuleCardData | null {
  return modules.find((module) => module.id === id) ?? null;
}

function createFutureModule(id: string, title: string, description: string, icon: string, tone: ModuleTone = 'muted'): TaxonomyModuleCardData {
  return { id, title, description, icon, tone, count: 'Em breve', available: false, plan: 'soon' };
}

function buildTaxonomy(modules: TaxonomyModuleCardData[]): TaxonomyGroup[] {
  const byId = (id: string) => findModule(modules, id);
  const existing = (ids: string[]) => ids.map(byId).filter((module): module is TaxonomyModuleCardData => module !== null);

  return [
    {
      id: 'essenciais',
      title: 'Essenciais',
      subtitle: 'Base elétrica inicial para qualquer rotina técnica.',
      modules: existing(['fundamentos']),
    },
    {
      id: 'profissoes',
      title: 'Profissões',
      subtitle: 'Áreas de serviço organizadas por uso real em campo.',
      modules: [
        ...existing(['instalacoes']),
        createFutureModule('redes-seguranca-automacao', 'Redes, segurança e automação residencial', 'Infraestrutura, CFTV, automação residencial e baixa tensão.', '⌘', 'blue'),
        ...existing(['hidraulica', 'construcaoCivil', 'medicoesObra', 'pintura', 'refrigeracao']),
      ],
    },
    {
      id: 'especialidades',
      title: 'Especialidades',
      subtitle: 'Módulos técnicos avançados para uso profissional especializado.',
      modules: [
        ...existing(['automacaoIndustrial', 'eletronica', 'motores', 'transformadores', 'solar', 'rebobinagem']),
      ],
    },
    {
      id: 'orcamento-gestao',
      title: 'Orçamento e gestão',
      subtitle: 'Cálculos e ferramentas para transformar levantamento em proposta e operação.',
      modules: existing(['orcamentoTecnico', 'percentuaisComerciais', 'custosProdutividade']),
    },
    {
      id: 'conversores-tecnicos',
      title: 'Conversores técnicos',
      subtitle: 'Conversões rápidas para unidades usadas em obra, manutenção e orçamento.',
      modules: existing(['conversores']),
    },
  ];
}

function TaxonomyModuleCard({ module, onOpenModule }: { module: TaxonomyModuleCardData; onOpenModule: (module: TaxonomyModuleCardData) => void }) {
  return (
    <button className={module.available ? 'taxonomy-module-card' : 'taxonomy-module-card disabled'} type="button" onClick={() => onOpenModule(module)}>
      <span className="taxonomy-module-body">
        <strong>{module.title}</strong>
        <small>{module.description}</small>
      </span>
      <em className={`module-plan-pill ${module.plan}`}>{planLabel(module.plan)}</em>
      <span className="taxonomy-count">{module.count}</span>
    </button>
  );
}

export function CalculationTaxonomyOverview({ modules, onOpenModule }: Props) {
  const taxonomy = buildTaxonomy(modules);

  return (
    <section className="app-screen calculations-overview-screen taxonomy-overview-screen">
      <header className="screen-header">
        <span className="orca-kicker">Taxonomia V1 aprovada</span>
        <h1>Cálculos</h1>
        <p>Organização final para publicação: Essenciais, Profissões, Especialidades, Orçamento e gestão, e Conversores técnicos.</p>
      </header>

      <div className="taxonomy-group-list">
        {taxonomy.map((group) => (
          <section className="taxonomy-group-card" key={group.id}>
            <header>
              <div>
                <span>{group.title}</span>
                <h2>{group.title}</h2>
                <p>{group.subtitle}</p>
              </div>
              <em>{group.modules.length} módulo(s)</em>
            </header>
            <div className="taxonomy-module-list">
              {group.modules.map((module) => <TaxonomyModuleCard key={module.id} module={module} onOpenModule={onOpenModule} />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
