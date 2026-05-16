import { lazy } from 'react';
import type { UserPlan } from '../../core/access/featureAccess';
import type { CalculationCapture } from '../../core/types/workflow';
import { ModuleCard } from '../components/ModuleCard';
import { calculationModules, planLabel } from '../appData';
import type { ActiveWorkContext, AppTab, CalculationSectorId, ModuleCardData, CalculationSectorGroup } from '../appTypes';
import { isGeneralCalculatorModule } from '../utils/moduleHelpers';

const calculationSectorGroups: CalculationSectorGroup[] = [
  {
    id: 'financial',
    title: 'Precificação',
    description: 'Cálculos voltados a preço, financeiro, margem/lucro, tempo, deslocamento, materiais, impostos/taxas e parcelamento/juros.',
    icon: 'R$',
    moduleIds: ['orcamentoTecnico'],
  },
];

const GeneralCalculatorWorkspace = lazy(() => import('../../features/calculators/components/GeneralCalculatorWorkspace').then((module) => ({ default: module.GeneralCalculatorWorkspace })));
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
  
  const calculationContextText = context.activeWorkOrder
    ? `Resultados adicionados serão vinculados ao atendimento "${context.activeWorkOrder.title}".`
    : 'Sem atendimento ativo: os cálculos funcionam como consulta avulsa e podem ser usados sem cliente.';
  
  const defaultPricingModule = calculationModules.find((module) => module.id === 'orcamentoTecnico') ?? calculationModules[0] ?? null;
  const activeModule = selectedModule ?? defaultPricingModule;

  if (activeModule) {
    const module = activeModule.calculatorModule;
    const selectedSector = calculationSectorGroups.find((group) => group.id === activeSector);
    return (
      <section className="app-screen">
        {selectedModule && <button className="back-button" type="button" onClick={() => openModule(defaultPricingModule)}>‹ Voltar para {selectedSector?.title ?? 'cálculos'}</button>}
        <header className="module-detail-header"><div><em className={`module-plan-pill ${activeModule.plan}`}>{planLabel(activeModule.plan)}</em><h1>{activeModule.title}</h1><p>{activeModule.description}</p><small>{activeModule.count}</small></div></header>
        <div className="calculation-context-card">
          <span>{context.activeWorkOrder ? 'Cálculo vinculado' : 'Cálculo avulso'}</span>
          <strong>{calculationContextText}</strong>
          <small>Depois do resultado, escolha adicionar ao atendimento, ao orçamento ou usar apenas como consulta.</small>
        </div>
        {moduleGuidance[activeModule.id] && <div className="survey-intro-card"><span><strong>{moduleGuidance[activeModule.id].title}</strong><small>{moduleGuidance[activeModule.id].text}</small></span></div>}
        {module === 'orcamentoTecnico' && <UnifiedFinancialWorkspace userPlan={activeUserPlan} onUpgradeRequest={() => goTo('store')} onCaptureCalculation={onCaptureCalculation} />}
        {module && isGeneralCalculatorModule(module) && <GeneralCalculatorWorkspace selectedModule={module} onCaptureCalculation={onCaptureCalculation} />}
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
      <header className="screen-header"><h1>Simulador</h1><p>Use cálculos comerciais para decidir quanto cobrar, simular margem, estimar tempo, deslocamento, materiais, taxas e parcelamento.</p></header>
      <div className="calculation-context-card">
        <span>{context.activeWorkOrder ? 'Atendimento ativo detectado' : 'Modo avulso'}</span>
        <strong>{calculationContextText}</strong>
        <small>{context.activeWorkOrder ? `${linkedCalculationCount} resultado(s) ya ligados a este atendimento.` : 'Quando existir atendimento ativo, o app oferece vínculo com atendimento e orçamento.'}</small>
      </div>
      {calculationSectorGroups.length > 1 && (
        <div className="section-mode-tabs calculation-profession-tabs">
          {calculationSectorGroups.map((group) => (
            <button className={activeSector === group.id ? 'active' : ''} key={group.id} type="button" onClick={() => onSelectSector(group.id)}>
              {group.title}
            </button>
          ))}
        </div>
      )}
      <div className="survey-intro-card">
        <span><strong>{selectedSector.title}</strong><small>{selectedSector.description}</small></span>
      </div>
      <div className="module-list-heading">
        <strong>Finalidade principal</strong>
        <small>O Aferix prioriza cálculos que ajudam a formar preço, negociar e entender lucro real.</small>
      </div>
      <div className="module-list-app">{sectorModules.map((module) => <ModuleCard key={module.id} module={module} compact onOpen={() => openModule(module)} />)}</div>
    </section>
  );
}

