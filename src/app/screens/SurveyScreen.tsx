import { useState, lazy } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { Client, WorkOrder } from '../../core/types/business';
import type { AppTab, SurveySection } from '../appTypes';
import { ActiveWorkContextCard } from '../components/ActiveWorkContextCard';
import { createAppId } from '../utils/idHelpers';
import { statusLabel, priorityLabel } from '../utils/workOrderLabels';

const GuidedBudgetCartRoomAutoBridge = lazy(() => import('../../features/workflow/components/GuidedBudgetCartRoomAutoBridge').then((module) => ({ default: module.GuidedBudgetCartRoomAutoBridge })));
const GuidedRoomManager = lazy(() => import('../../features/workflow/components/GuidedRoomManager').then((module) => ({ default: module.GuidedRoomManager })));
const MaterialSupplyModeBridge = lazy(() => import('../../features/workflow/components/MaterialSupplyModeBridge').then((module) => ({ default: module.MaterialSupplyModeBridge })));
const TechnicalCaptureList = lazy(() => import('../../features/workflow/components/TechnicalCaptureList').then((module) => ({ default: module.TechnicalCaptureList })));

const surveyFlowSteps: Array<{ id: SurveySection; label: string; title: string; text: string }> = [
  {
    id: 'context',
    label: 'Ambientes',
    title: 'Ambientes',
    text: 'Organize o local do serviço.',
  },
  {
    id: 'labor',
    label: 'Serviços',
    title: 'Serviços',
    text: 'Liste mão de obra e quantidades.',
  },
  {
    id: 'materials',
    label: 'Materiais',
    title: 'Materiais',
    text: 'Separe itens da proposta e da compra do cliente.',
  },
  {
    id: 'measurements',
    label: 'Medições',
    title: 'Medições',
    text: 'Registre dados de campo importantes.',
  },
  {
    id: 'notes',
    label: 'Observações',
    title: 'Observações',
    text: 'Guarde recomendações e restrições.',
  },
  {
    id: 'review',
    label: 'Revisão',
    title: 'Revisão',
    text: 'Confira antes de avançar.',
  },
];

interface SurveyScreenProps {
  captures: CalculationCapture[];
  context: { activeClient: Client | null; activeWorkOrder: WorkOrder | null };
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<CalculationCapture>) => void;
  onAddMany: (items: CalculationCapture[]) => void;
  goTo: (tab: AppTab) => void;
}

export function SurveyScreen({
  captures,
  context,
  onRemove,
  onUpdate,
  onAddMany,
  goTo
}: SurveyScreenProps) {
  const [activeSection, setActiveSection] = useState<SurveySection>('context');
  const [measurementDraft, setMeasurementDraft] = useState({ description: '', value: '', unit: '', note: '' });
  const [surveySavedMessage, setSurveySavedMessage] = useState('');
  
  const surveyCaptures = captures.filter((capture) => capture.destination === 'survey' || capture.destination === 'both');
  const surveyServices = surveyCaptures.filter((capture) => capture.itemType === 'service');
  const surveyMaterials = surveyCaptures.filter((capture) => capture.itemType === 'material');
  const surveyMeasurements = surveyCaptures.filter((capture) => capture.calculatorLabel === 'Medição de campo');
  const surveyNotes = surveyCaptures.filter((capture) => (capture.itemType ?? 'technicalObservation') === 'technicalObservation' && capture.calculatorLabel !== 'Medição de campo');
  const surveyCalculations = surveyCaptures.filter((capture) => capture.calculatorLabel !== 'Medição de campo' && capture.moduleLabel !== 'Itens técnicos');
  const budgetReadyItems = surveyCaptures.filter((capture) => capture.shouldGenerateBudgetItem ?? capture.destination !== 'survey');
  
  const activeStepIndex = Math.max(0, surveyFlowSteps.findIndex((step) => step.id === activeSection));
  const activeStep = surveyFlowSteps[activeStepIndex] ?? surveyFlowSteps[0];
  const previousStep = surveyFlowSteps[activeStepIndex - 1];
  const nextStep = surveyFlowSteps[activeStepIndex + 1];
  const hasActiveAttendance = Boolean(context.activeWorkOrder);

  function advanceSurvey() {
    if (nextStep) {
      setActiveSection(nextStep.id);
      return;
    }
    goTo('budgets');
  }

  function addMeasurementCapture() {
    const description = measurementDraft.description.trim();
    const value = measurementDraft.value.trim();
    const unit = measurementDraft.unit.trim();
    const note = measurementDraft.note.trim();
    if (!description) return;

    const measuredValue = [value, unit].filter(Boolean).join(' ');
    const summary = measuredValue ? `${description}: ${measuredValue}` : description;
    onAddMany([
      {
        id: createAppId('survey-measurement'),
        module: 'diagnosticoTecnico',
        moduleLabel: 'Itens técnicos',
        calculatorLabel: 'Medição de campo',
        destination: 'survey',
        createdAt: new Date().toISOString(),
        summary,
        details: [
          `Medição: ${description}`,
          measuredValue ? `Valor: ${measuredValue}` : 'Valor: conferir em campo',
          note ? `Observação: ${note}` : 'Observação: registro manual feito durante a visita técnica.',
        ],
        itemType: 'technicalObservation',
        editableDescription: summary,
        quantity: '1',
        unitValue: '',
        shouldGenerateBudgetItem: false,
        convertedToBudgetItem: false,
        technicalNote: note || 'Medição registrada nos itens técnicos. Validar com instrumento adequado quando depender de norma, tabela ou condição real da instalação.',
        reportReady: true,
      },
    ]);
    setMeasurementDraft({ description: '', value: '', unit: '', note: '' });
  }

  function saveSurveyReview() {
    setSurveySavedMessage(`Itens técnicos salvos localmente com ${surveyCaptures.length} item(ns).`);
  }

  return (
    <section className="app-screen">
      <header className="screen-header"><h1>Base técnica</h1></header>
      {hasActiveAttendance ? <ActiveWorkContextCard {...context} /> : (
        <div className="survey-empty-state survey-quiet-empty">
          <strong>Nenhum atendimento ativo</strong>
          <p>Inicie ou selecione um atendimento para vincular dados técnicos.</p>
        </div>
      )}
      <div className="survey-step-guide" aria-label="Etapas dos itens técnicos">
        {surveyFlowSteps.map((step) => (
          <button className={activeSection === step.id ? 'active' : ''} key={step.id} type="button" onClick={() => setActiveSection(step.id)}>
            <strong>{step.label}</strong>
          </button>
        ))}
      </div>
      <div className="survey-intro-card"><span><strong>{activeStep.title}</strong><small>{activeStep.text}</small></span></div>
      {activeSection === 'context' && <GuidedRoomManager />}
      {activeSection === 'labor' && <GuidedBudgetCartRoomAutoBridge mode="catalog" onSendToBudget={onAddMany} />}
      {activeSection === 'materials' && <MaterialSupplyModeBridge mode="parts" onSendToBudget={onAddMany} />}
      {activeSection === 'measurements' && (
        <section className="survey-measurement-panel">
          <header>
            <div>
              <span className="orca-kicker">Medições de campo</span>
              <h2>Registre dados que normalmente ficariam no papel</h2>
            </div>
            <button className="secondary-action inline-action" type="button" onClick={() => goTo('calculations')}>Abrir calculadoras</button>
          </header>
          <div className="survey-measurement-grid">
            <label>
              <span>O que foi medido</span>
              <input value={measurementDraft.description} placeholder="Ex.: distancia do quadro ate o quarto" onChange={(event) => setMeasurementDraft((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label>
              <span>Valor</span>
              <input value={measurementDraft.value} placeholder="Ex.: 12" inputMode="decimal" onChange={(event) => setMeasurementDraft((current) => ({ ...current, value: event.target.value }))} />
            </label>
            <label>
              <span>Unidade</span>
              <input value={measurementDraft.unit} placeholder="m, A, W, mm, pontos" onChange={(event) => setMeasurementDraft((current) => ({ ...current, unit: event.target.value }))} />
            </label>
            <label className="survey-measurement-wide">
              <span>Observação técnica</span>
              <textarea value={measurementDraft.note} placeholder="Ex.: passagem por canaleta aparente; confirmar trajeto antes da execução." onChange={(event) => setMeasurementDraft((current) => ({ ...current, note: event.target.value }))} />
            </label>
          </div>
          <div className="survey-measurement-actions">
            <small>Medições entram no atendimento e no relatório. Use calculadoras quando o dado precisar virar dimensionamento, custo ou orçamento.</small>
            <button className="primary-action inline-action" type="button" disabled={!measurementDraft.description.trim()} onClick={addMeasurementCapture}>Adicionar medição</button>
          </div>
        </section>
      )}
      {activeSection === 'notes' && <GuidedBudgetCartRoomAutoBridge mode="manual" onSendToBudget={onAddMany} />}
      {activeSection === 'review' && (
        <>
          <section className="survey-review-panel">
            <header>
              <div>
                <span className="orca-kicker">Revisão do atendimento</span>
                <h2>Confira antes de gerar orçamento</h2>
              </div>
              <strong>{budgetReadyItems.length} item(ns) irão para orçamento</strong>
            </header>
            <div className="survey-review-grid">
              <article><span>Cliente</span><strong>{context.activeClient?.name ?? 'Cliente não vinculado'}</strong><small>{context.activeClient?.phone || 'WhatsApp não informado'}</small></article>
              <article><span>Endereço</span><strong>{context.activeWorkOrder?.address || context.activeClient?.address || 'Endereço não informado'}</strong><small>Confirme antes da visita ou execução.</small></article>
              <article><span>Atendimento</span><strong>{context.activeWorkOrder?.title ?? 'Sem atendimento ativo'}</strong><small>{statusLabel(context.activeWorkOrder?.status ?? 'open')} · Prioridade {priorityLabel(context.activeWorkOrder?.priority)}</small></article>
              <article><span>Descrição</span><strong>{context.activeWorkOrder?.description || 'Descrição inicial não preenchida'}</strong><small>Use observações para detalhar diagnóstico e restrições.</small></article>
            </div>
            <div className="survey-review-counts">
              <article><span>Serviços</span><strong>{surveyServices.length}</strong></article>
              <article><span>Materiais</span><strong>{surveyMaterials.length}</strong></article>
              <article><span>Medições</span><strong>{surveyMeasurements.length}</strong></article>
              <article><span>Observações</span><strong>{surveyNotes.length}</strong></article>
              <article><span>Cálculos usados</span><strong>{surveyCalculations.length}</strong></article>
            </div>
            <div className="survey-review-next-actions">
              <button className="primary-action inline-action" type="button" onClick={() => goTo('budgets')}>Gerar orçamento</button>
              <button className="secondary-action inline-action" type="button" onClick={() => setActiveSection('materials')}>Voltar e ajustar</button>
              <button className="secondary-action inline-action" type="button" onClick={saveSurveyReview}>Salvar itens técnicos</button>
            </div>
            {surveySavedMessage && <p className="survey-review-saved">{surveySavedMessage}</p>}
          </section>
          <TechnicalCaptureList captures={surveyCaptures} emptyText="Use ambientes, serviços, materiais, medições ou observações para montar os itens técnicos." onRemove={onRemove} onUpdate={onUpdate} />
        </>
      )}
      <div className="survey-step-actions">
        <button className="secondary-action inline-action" type="button" disabled={!previousStep} onClick={() => previousStep && setActiveSection(previousStep.id)}>Voltar</button>
        <span>{activeStepIndex + 1} de {surveyFlowSteps.length} · {surveyCaptures.length} item(ns) salvos</span>
        <button className="primary-action inline-action" type="button" onClick={advanceSurvey}>{nextStep ? `Próximo: ${nextStep.label}` : 'Ir para orçamento'}</button>
      </div>
    </section>
  );
}
