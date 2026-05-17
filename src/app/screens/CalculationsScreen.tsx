import { lazy } from 'react';
import type { UserPlan } from '../../core/access/featureAccess';
import type { CalculationCapture } from '../../core/types/workflow';
import type { FundamentalMode } from '../../features/calculators/components/GeneralFundamentalsWorkspace';
import { ModuleCard } from '../components/ModuleCard';
import { AferixTabs } from '../components/ui';
import { calculationModules, calculationSectorGroups, planLabel } from '../appData';
import type { ActiveWorkContext, AppTab, CalculationSectorId, ModuleCardData } from '../appTypes';
import { getSectorForModule, isExpansionModule, isGeneralCalculatorModule, isProfessionalDomainModule } from '../utils/moduleHelpers';

const ElectricalCalculatorWorkspace = lazy(() => import('../../features/calculators/components/ElectricalCalculatorWorkspace').then((module) => ({ default: module.ElectricalCalculatorWorkspace })));
const ElectricalFundamentalsHumanWorkspace = lazy(() => import('../../features/calculators/components/ElectricalFundamentalsHumanWorkspace').then((module) => ({ default: module.ElectricalFundamentalsHumanWorkspace })));
const ExpansionCalculatorsWorkspace = lazy(() => import('../../features/calculators/components/ExpansionCalculatorsWorkspace').then((module) => ({ default: module.ExpansionCalculatorsWorkspace })));
const GeneralCalculatorWorkspace = lazy(() => import('../../features/calculators/components/GeneralCalculatorWorkspace').then((module) => ({ default: module.GeneralCalculatorWorkspace })));
const GeneralFundamentalsWorkspace = lazy(() => import('../../features/calculators/components/GeneralFundamentalsWorkspace').then((module) => ({ default: module.GeneralFundamentalsWorkspace })));
const PaintingHumanWorkspace = lazy(() => import('../../features/calculators/components/PaintingHumanWorkspace').then((module) => ({ default: module.PaintingHumanWorkspace })));
const ProfessionalDomainWorkspace = lazy(() => import('../../features/calculators/components/ProfessionalDomainWorkspace').then((module) => ({ default: module.ProfessionalDomainWorkspace })));
const UnifiedConstructionWorkspace = lazy(() => import('../../features/calculators/components/UnifiedConstructionWorkspace').then((module) => ({ default: module.UnifiedConstructionWorkspace })));
const UnifiedConvertersWorkspace = lazy(() => import('../../features/calculators/components/UnifiedConvertersWorkspace').then((module) => ({ default: module.UnifiedConvertersWorkspace })));
const UnifiedDiagnosticsWorkspace = lazy(() => import('../../features/calculators/components/UnifiedDiagnosticsWorkspace').then((module) => ({ default: module.UnifiedDiagnosticsWorkspace })));
const UnifiedElectricalWorkspace = lazy(() => import('../../features/calculators/components/UnifiedElectricalWorkspace').then((module) => ({ default: module.UnifiedElectricalWorkspace })));
const UnifiedFinancialWorkspace = lazy(() => import('../../features/calculators/components/UnifiedFinancialWorkspace').then((module) => ({ default: module.UnifiedFinancialWorkspace })));
const UnifiedHydraulicsWorkspace = lazy(() => import('../../features/calculators/components/UnifiedHydraulicsWorkspace').then((module) => ({ default: module.UnifiedHydraulicsWorkspace })));

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

const fundamentalModuleConfig: Record<string, { modes: FundamentalMode[]; title: string; description: string; moduleLabel: string; note: string }> = {
};

const moduleGuidance: Record<string, { title: string; text: string }> = {
  eletricaPredial: {
    title: 'Um único fluxo para elétrica predial',
    text: 'Use as abas internas para começar pela base, avançar para instalação residencial, dimensionar cabos e disjuntores, conferir iluminação ou converter sinais.',
  },
  conversores: {
    title: 'Um único lugar para conversão de unidades',
    text: 'Use a aba Rápidos para conversões comuns e a aba Técnicos para AWG, polegadas, vazão completa, pressão completa, temperatura e kWh/R$.',
  },
  diagnosticoTecnico: {
    title: 'Assistentes de campo não são cálculos',
    text: 'Use para organizar checklist, prioridade, risco e manutenção quando a saída precisa virar orientação ou relatório para o cliente.',
  },
  orcamentoTecnico: {
    title: 'Um único lugar para cobrar melhor',
    text: 'Use as abas internas para orçamento rápido, produtividade, percentuais de negociação e preço com margem.',
  },
  hidraulica: {
    title: 'Um único lugar para hidráulica',
    text: 'Use as abas internas para reservatórios e medições básicas ou para instalações como piscina, esgoto, pressão por coluna e bomba simples.',
  },
  obras: {
    title: 'Um único lugar para medir e quantificar obra',
    text: 'Use as abas internas para medições, materiais básicos e composições mais completas.',
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
    const fundamentalConfig = fundamentalModuleConfig[activeModule.id];
    return (
      <section className="app-screen">
        {selectedModule && <button className="back-button" type="button" onClick={() => openModule(defaultPricingModule)}>‹ Voltar para {selectedSector?.title ?? 'cálculos'}</button>}
        <header className="module-detail-header"><div><em className={`module-plan-pill ${activeModule.plan}`}>{planLabel(activeModule.plan)}</em><h1>{activeModule.title}</h1><p>{activeModule.description}</p><small>{activeModule.count}</small></div></header>
        <div className="calculation-context-card">
          <span>{calculationContext.label}</span>
          <strong>{calculationContext.title}</strong>
          <p>{calculationContext.description}</p>
          <small>{calculationContext.helper}</small>
        </div>
        {moduleGuidance[activeModule.id] && <div className="survey-intro-card"><span><strong>{moduleGuidance[activeModule.id].title}</strong><small>{moduleGuidance[activeModule.id].text}</small></span></div>}
        {module === 'fundamentosGerais' && fundamentalConfig && <GeneralFundamentalsWorkspace {...fundamentalConfig} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'eletricaPredial' && <UnifiedElectricalWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'fundamentals' && <ElectricalFundamentalsHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'pintura' && <PaintingHumanWorkspace onCaptureCalculation={onCaptureCalculation} />}
        {module === 'hidraulica' && <UnifiedHydraulicsWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'obras' && <UnifiedConstructionWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'conversores' && <UnifiedConvertersWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'diagnosticoTecnico' && <UnifiedDiagnosticsWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module === 'orcamentoTecnico' && <UnifiedFinancialWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module && isExpansionModule(module) && <ExpansionCalculatorsWorkspace selectedModule={module} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module && isProfessionalDomainModule(module) && <ProfessionalDomainWorkspace selectedModule={module} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module && isGeneralCalculatorModule(module) && <GeneralCalculatorWorkspace selectedModule={module} onCaptureCalculation={onCaptureCalculation} />}
        {module && module !== 'fundamentosGerais' && module !== 'eletricaPredial' && module !== 'fundamentals' && module !== 'pintura' && module !== 'hidraulica' && module !== 'obras' && module !== 'conversores' && module !== 'diagnosticoTecnico' && module !== 'orcamentoTecnico' && !isExpansionModule(module) && !isProfessionalDomainModule(module) && !isGeneralCalculatorModule(module) && <ElectricalCalculatorWorkspace selectedModule={module} userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {!module && <div className="empty-state-card"><strong>{activeModule.title} em breve</strong><p>Este módulo já está previsto na arquitetura financeira do Aferix.</p></div>}
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
          <h1>Simulador de Preços</h1>
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
      {calculationSectorGroups.length > 1 && (
        <AferixTabs
          activeId={activeSector}
          items={calculationSectorGroups.map((group) => ({ id: group.id, label: group.title }))}
          onChange={onSelectSector}
          variant="pill"
        />
      )}

      <div className="aferix-panel-card">
        <header className="section-header">
          <div>
            <span className="orca-kicker">{selectedSector.title}</span>
            <h2>Ferramentas disponíveis</h2>
            <p>{selectedSector.description}</p>
          </div>
        </header>
        <div className="module-list-app">
          {sectorModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}
        </div>
      </div>
    </section>
  );
}
