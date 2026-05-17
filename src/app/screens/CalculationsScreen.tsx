import { lazy } from 'react';
import type { UserPlan } from '../../core/access/featureAccess';
import type { CalculationCapture } from '../../core/types/workflow';
import { calculationModules, calculationSectorGroups, planLabel } from '../appData';
import type { ActiveWorkContext, AppTab, CalculationSectorId, ModuleCardData } from '../appTypes';
import { isExpansionModule, isGeneralCalculatorModule, isProfessionalDomainModule } from '../utils/moduleHelpers';

const ExpansionCalculatorsWorkspace = lazy(() => import('../../features/calculators/components/ExpansionCalculatorsWorkspace').then((module) => ({ default: module.ExpansionCalculatorsWorkspace })));
const GeneralCalculatorWorkspace = lazy(() => import('../../features/calculators/components/GeneralCalculatorWorkspace').then((module) => ({ default: module.GeneralCalculatorWorkspace })));
const GeneralFundamentalsWorkspace = lazy(() => import('../../features/calculators/components/GeneralFundamentalsWorkspace').then((module) => ({ default: module.GeneralFundamentalsWorkspace })));
const ProfessionalDomainWorkspace = lazy(() => import('../../features/calculators/components/ProfessionalDomainWorkspace').then((module) => ({ default: module.ProfessionalDomainWorkspace })));
const UnifiedFinancialWorkspace = lazy(() => import('../../features/calculators/components/UnifiedFinancialWorkspace').then((module) => ({ default: module.UnifiedFinancialWorkspace })));

interface CalculationsScreenProps {
  selectedModule: ModuleCardData | null;
  openModule: (module: ModuleCardData | null) => void;
  activeSector: CalculationSectorId;
  onSelectSector: (sector: CalculationSectorId) => void;
  goTo: (tab: AppTab) => void;
  userPlan: UserPlan;
  onCaptureCalculation: (capture: CalculationCapture) => void;
  context: ActiveWorkContext;
  captures: CalculationCapture[];
}

const moduleGuidance: Record<string, { title: string; text: string }> = {
  orcamentoTecnico: {
    title: 'Um único lugar para cobrar melhor',
    text: 'Use as abas internas para orçamento rápido, produtividade, percentuais de negociação e preço com margem.',
  },
};

export function CalculationsScreen({
  selectedModule,
  openModule,
  activeSector,
  onSelectSector,
  goTo,
  userPlan: activeUserPlan,
  onCaptureCalculation,
  context,
  captures
}: CalculationsScreenProps) {
  const linkedCalculationCount = context.activeWorkOrder
    ? captures.filter((capture) => capture.workOrderId === context.activeWorkOrder?.id).length
    : 0;
  
  const calculationContext = context.activeWorkOrder
    ? {
        label: 'Cálculo vinculado',
        title: context.activeWorkOrder.title,
        description: 'Resultados adicionados serão vinculados ao atendimento ativo.',
        helper: 'Depois do resultado, escolha adicionar ao atendimento, ao orçamento ou usar apenas como consulta.',
      }
    : {
        label: 'Cálculo avulso',
        title: 'Sem atendimento ativo',
        description: 'Os cálculos funcionam como consulta avulsa e podem ser usados sem cliente.',
        helper: 'Depois do resultado, escolha adicionar ao atendimento, ao orçamento ou usar apenas como consulta.',
      };
  
  const defaultPricingModule = calculationModules.find((module) => module.id === 'orcamentoTecnico') ?? calculationModules[0] ?? null;
  const activeModule = selectedModule ?? defaultPricingModule;

  if (activeModule) {
    const module = activeModule.calculatorModule;
    const selectedSector = calculationSectorGroups.find((group) => group.id === activeSector);
    return (
      <section className="app-screen">
        {selectedModule && selectedModule.id !== 'orcamentoTecnico' && (
          <button className="back-button" type="button" onClick={() => openModule(defaultPricingModule)}>
            ‹ Voltar para {selectedSector?.title ?? 'cálculos'}
          </button>
        )}
        <header className="module-detail-header">
          <div>
            <em className={`module-plan-pill ${activeModule.plan}`}>{planLabel(activeModule.plan)}</em>
            <h1>{activeModule.title}</h1>
            <p>{activeModule.description}</p>
            <small>{activeModule.count}</small>
          </div>
        </header>
        <div className="calculation-context-card">
          <span>{calculationContext.label}</span>
          <strong>{calculationContext.title}</strong>
          <p>{calculationContext.description}</p>
          <small>{calculationContext.helper}</small>
        </div>
        {moduleGuidance[activeModule.id] && (
          <div className="survey-intro-card">
            <span>
              <strong>{moduleGuidance[activeModule.id].title}</strong>
              <small>{moduleGuidance[activeModule.id].text}</small>
            </span>
          </div>
        )}
        
        {module === 'orcamentoTecnico' && (
          <UnifiedFinancialWorkspace 
            userPlan={activeUserPlan} 
            onUpgradeRequest={() => goTo('store')} 
            onCaptureCalculation={onCaptureCalculation} 
          />
        )}
        {module && isExpansionModule(module) && module !== 'orcamentoTecnico' && (
          <ExpansionCalculatorsWorkspace 
            selectedModule={module} 
            userPlan={activeUserPlan} 
            onUpgradeRequest={() => goTo('store')} 
            onCaptureCalculation={onCaptureCalculation} 
          />
        )}
        {module && isProfessionalDomainModule(module) && (
          <ProfessionalDomainWorkspace 
            selectedModule={module} 
            userPlan={activeUserPlan} 
            onUpgradeRequest={() => goTo('store')} 
            onCaptureCalculation={onCaptureCalculation} 
          />
        )}
        {module && isGeneralCalculatorModule(module) && (
          <GeneralCalculatorWorkspace 
            selectedModule={module} 
            onCaptureCalculation={onCaptureCalculation} 
          />
        )}
        
        {!module && (
          <div className="empty-state-card">
            <strong>{activeModule.title} em breve</strong>
            <p>Este módulo já está previsto na arquitetura financeira do Aferix.</p>
          </div>
        )}
      </section>
    );
  }

  const selectedSector = calculationSectorGroups.find((group) => group.id === activeSector) ?? calculationSectorGroups[0];
  const sectorModules = selectedSector.moduleIds
    .map((moduleId) => calculationModules.find((module) => module.id === moduleId))
    .filter((module): module is ModuleCardData => Boolean(module));

  return (
    <section className="app-screen calculations-overview-screen">
      <header className="page-header">
        <div>
          <h1>Precificação</h1>
          <p>Cálculos comerciais para formar preço, calcular margem e entender seu lucro real.</p>
        </div>
      </header>

      <div className="metric-grid compact-metric-grid">
        <article className="metric-card">
          <span>Modo de uso</span>
          <strong>{context.activeWorkOrder ? 'Vinculado' : 'Consulta avulsa'}</strong>
          <small>{calculationContext.title}</small>
        </article>
        <article className="metric-card">
          <span>Resultados</span>
          <strong>{context.activeWorkOrder ? linkedCalculationCount : 0}</strong>
          <small>{context.activeWorkOrder ? 'No atendimento atual' : 'Nenhum atendimento ativo'}</small>
        </article>
      </div>

      <div className="aferix-panel-card">
        <header className="section-header">
          <div>
            <span className="orca-kicker">{selectedSector.title}</span>
            <h2>Ferramentas disponíveis</h2>
            <p>{selectedSector.description}</p>
          </div>
        </header>
        <div className="module-list-app">
          {sectorModules.map((module) => (
            <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />
          ))}
        </div>
      </div>
    </section>
  );
}
