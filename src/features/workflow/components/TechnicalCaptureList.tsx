import type { CalculationCapture, TechnicalItemType } from '../../../core/types/workflow';

interface TechnicalCaptureListProps {
  captures: CalculationCapture[];
  emptyText: string;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<CalculationCapture>) => void;
}

const itemTypeOptions: Array<{ value: TechnicalItemType; label: string }> = [
  { value: 'diagnostic', label: 'Diagnóstico' },
  { value: 'technicalObservation', label: 'Observação técnica' },
  { value: 'service', label: 'Serviço' },
  { value: 'material', label: 'Material' },
  { value: 'projectSpecification', label: 'Especificação de projeto' },
];

function formatCaptureTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function normalizeMoneyValue(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const normalizedValue = value.replace(',', '.').trim();
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function calculateCommercialTotal(capture: CalculationCapture): number {
  const quantity = normalizeMoneyValue(capture.quantity || '1');
  const unitValue = normalizeMoneyValue(capture.unitValue);

  return quantity * unitValue;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function TechnicalCaptureList({ captures, emptyText, onRemove, onUpdate }: TechnicalCaptureListProps) {
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
    <div className="technical-capture-list">
      {captures.map((capture) => {
        const description = capture.editableDescription ?? capture.summary;
        const itemType = capture.itemType ?? 'technicalObservation';
        const quantity = capture.quantity ?? '1';
        const unitValue = capture.unitValue ?? '';
        const commercialTotal = calculateCommercialTotal(capture);

        return (
          <article className="technical-capture-card" key={capture.id}>
            <header className="technical-capture-header">
              <span className="app-icon tone-blue">▤</span>
              <span>
                <strong>{capture.calculatorLabel}</strong>
                <small>{capture.moduleLabel} · {formatCaptureTime(capture.createdAt)}</small>
              </span>
            </header>

            <label className="technical-edit-field">
              <span>Tipo do item</span>
              <select value={itemType} onChange={(event) => onUpdate(capture.id, { itemType: event.target.value as TechnicalItemType })}>
                {itemTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="technical-edit-field">
              <span>Descrição editável</span>
              <textarea value={description} onChange={(event) => onUpdate(capture.id, { editableDescription: event.target.value })} />
            </label>

            <label className="technical-edit-field">
              <span>Observação técnica</span>
              <textarea
                value={capture.technicalNote ?? ''}
                placeholder="Ex.: revisar seção do cabo, confirmar caminho em campo, validar proteção existente..."
                onChange={(event) => onUpdate(capture.id, { technicalNote: event.target.value })}
              />
            </label>

            <details className="technical-capture-details">
              <summary>Ver resultados do cálculo</summary>
              <ul>
                {capture.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </details>

            <div className="technical-budget-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={capture.shouldGenerateBudgetItem ?? capture.destination !== 'survey'}
                  onChange={(event) => onUpdate(capture.id, { shouldGenerateBudgetItem: event.target.checked })}
                />
                <span>Este item pode virar serviço/material no orçamento</span>
              </label>
            </div>

            <div className="technical-commercial-grid">
              <label className="technical-edit-field">
                <span>Quantidade</span>
                <input inputMode="decimal" value={quantity} onChange={(event) => onUpdate(capture.id, { quantity: event.target.value })} />
              </label>
              <label className="technical-edit-field">
                <span>Valor unitário</span>
                <input inputMode="decimal" value={unitValue} placeholder="0,00" onChange={(event) => onUpdate(capture.id, { unitValue: event.target.value })} />
              </label>
            </div>

            <div className="technical-capture-actions">
              <strong>Total opcional: {formatCurrency(commercialTotal)}</strong>
              <button className="danger-action" type="button" onClick={() => onRemove(capture.id)}>Remover</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
