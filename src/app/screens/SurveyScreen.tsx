import { useState } from 'react';
import type { CalculationCapture } from '../../core/types/workflow';
import type { ActiveWorkContext, AppTab, SurveySection } from '../appTypes';
import { PageHeader, PageShell, SectionHeader } from '../components/designSystem';
import { GuidedBudgetCart } from '../../features/workflow/components/GuidedBudgetCart';
import { statusLabel, priorityLabel } from '../utils/workOrderLabels';

interface SurveyScreenProps {
  captures: CalculationCapture[];
  context: ActiveWorkContext;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<CalculationCapture>) => void;
  onAddMany: (items: CalculationCapture[]) => void;
  goTo: (tab: AppTab) => void;
}

const surveySections: Array<{ id: SurveySection; label: string; title: string; text: string }> = [
  {
    id: 'context',
    label: 'Contexto',
    title: 'Informações base',
    text: 'Confirme o cliente e o serviço.',
  },
  {
    id: 'measurements',
    label: 'Medições',
    title: 'Medidas de campo',
    text: 'Registre áreas, volumes e distâncias.',
  },
  {
    id: 'labor',
    label: 'Serviços',
    title: 'Mão de obra',
    text: 'Defina o que será executado.',
  },
  {
    id: 'materials',
    label: 'Materiais',
    title: 'Componentes',
    text: 'Liste o que será necessário.',
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

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function SurveyScreen({ context, onAddMany, goTo }: SurveyScreenProps) {
  const [activeSection, setActiveSection] = useState<SurveySection>('measurements');
  const [measurementDraft, setMeasurementDraft] = useState({ description: '', value: '', unit: 'm' });

  function handleAddMeasurement() {
    const { description, value, unit } = measurementDraft;
    if (!description.trim()) return;

    const measuredValue = [value, unit].filter(Boolean).join(' ');
    const summary = measuredValue ? `${description}: ${measuredValue}` : description;
    onAddMany([
      {
        id: createId('survey-measurement'),
        module: 'orcamentoTecnico',
        moduleLabel: 'Itens técnicos',
        calculatorLabel: 'Medição de campo',
        destination: 'survey',
        createdAt: new Date().toISOString(),
        summary,
        details: [`Medição registrada: ${summary}`],
        itemType: 'technicalObservation',
        editableDescription: summary,
        quantity: value || '1',
        unitValue: '0',
        shouldGenerateBudgetItem: false,
        convertedToBudgetItem: false,
        reportReady: true,
      },
    ]);
    setMeasurementDraft({ description: '', value: '', unit: 'm' });
  }

  return (
    <PageShell className="survey-screen">
      <PageHeader title="Levantamento" description="Checklist e coleta de dados em campo para compor o orçamento." action={<button className="secondary-action" type="button" onClick={() => goTo('budgets')}>Ver Orçamento</button>} />

      <nav className="section-mode-tabs" style={{ marginBottom: '1.5rem' }}>
        {surveySections.map((section) => (
          <button key={section.id} className={activeSection === section.id ? 'active' : ''} type="button" onClick={() => setActiveSection(section.id)}>
            {section.label}
          </button>
        ))}
      </nav>

      <div className="survey-content-area">
        {activeSection === 'context' && (
          <div className="aferix-panel-card">
            <SectionHeader title="Dados do serviço" eyebrow="Contexto" />
            <div className="account-status-grid">
              <article>
                <span>Cliente</span>
                <strong>{context.activeClient?.name ?? 'Cliente Avulso'}</strong>
                <small>{context.activeClient?.phone || 'Sem telefone'}</small>
              </article>
              <article>
                <span>Serviço</span>
                <strong>{context.activeWorkOrder?.title ?? 'Sem serviço ativo'}</strong>
                <small>
                  {context.activeWorkOrder ? statusLabel(context.activeWorkOrder.status) : 'Nenhum'} · Prioridade {context.activeWorkOrder ? priorityLabel(context.activeWorkOrder.priority) : 'Normal'}
                </small>
              </article>
            </div>
            <button className="ghost-action" style={{ marginTop: '1rem' }} onClick={() => goTo('clients')}>Trocar serviço</button>
          </div>
        )}

        {activeSection === 'measurements' && (
          <div className="aferix-panel-card">
            <SectionHeader title="Medidas de campo" eyebrow="Checklist" />
            <div className="settings-form-grid">
              <label className="general-form-field">
                <span>O que medir?</span>
                <input value={measurementDraft.description} placeholder="Ex.: Parede sala, Cabo principal" onChange={(e) => {
                  const val = e.target.value;
                  setMeasurementDraft((d) => ({ ...d, description: val }));
                }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px' }}>
                <label className="general-form-field">
                  <span>Valor</span>
                  <input inputMode="decimal" value={measurementDraft.value} placeholder="0.00" onChange={(e) => {
                    const val = e.target.value;
                    setMeasurementDraft((d) => ({ ...d, value: val }));
                  }} />
                </label>
                <label className="general-form-field">
                  <span>Unid.</span>
                  <select value={measurementDraft.unit} onChange={(e) => {
                    const val = e.target.value;
                    setMeasurementDraft((d) => ({ ...d, unit: val }));
                  }}>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="un">un</option>
                    <option value="kg">kg</option>
                  </select>
                </label>
              </div>
            </div>
            <button className="primary-action inline-action" style={{ marginTop: '1rem' }} onClick={handleAddMeasurement}>Adicionar Medida</button>
          </div>
        )}

        {(activeSection === 'labor' || activeSection === 'materials') && (
           <div className="aferix-panel-card">
             <SectionHeader title={activeSection === 'labor' ? 'Serviços' : 'Materiais'} eyebrow="Levantamento" />
             <p>Aponte itens do catálogo ou descreva novos itens para o orçamento.</p>
             <button className="primary-action" onClick={() => goTo('catalog')}>Abrir Catálogo</button>
           </div>
        )}

        {activeSection === 'notes' && (
          <div className="aferix-panel-card">
            <SectionHeader title="Anotações técnicas" eyebrow="Extras" />
            <p>Use para registrar observações que devem constar no relatório.</p>
          </div>
        )}

        {activeSection === 'review' && (
          <div className="aferix-panel-card">
            <SectionHeader title="Carrinho de Itens" eyebrow="Resumo" />
            <GuidedBudgetCart onSendToBudget={() => goTo('budgets')} />
          </div>
        )}
      </div>
    </PageShell>
  );
}
