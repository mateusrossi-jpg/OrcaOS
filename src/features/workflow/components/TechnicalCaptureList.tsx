import type { CalculationCapture, MaterialSupplyMode, TechnicalItemType } from '../../../core/types/workflow';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import {
  buildMaterialSupplyPatch,
  calculateCaptureCommercialTotal,
  calculateCaptureReferenceTotal,
  isClientPurchaseMaterial,
  materialSupplyLabel,
} from '../utils/captureWorkflow';
import './TechnicalCaptureList.css';

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

const materialSupplyOptions: Array<{ value: MaterialSupplyMode; label: string; helper: string }> = [
  { value: 'professional', label: 'Profissional fornece', helper: 'Entra no valor cobrado no orçamento.' },
  { value: 'client', label: 'Cliente compra', helper: 'Vira lista orientativa para o cliente comprar.' },
  { value: 'mixed', label: 'Misto / alinhar', helper: 'Separar antes de aprovar a proposta.' },
  { value: 'undefined', label: 'A definir depois', helper: 'Responsabilidade de compra ainda pendente.' },
];

function formatCaptureTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
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
        <span className="app-icon tone-gray large-icon">IT</span>
        <strong>Nenhum item ainda</strong>
        <p>{emptyText}</p>
      </div>
    );
  }

  const clientPurchaseCaptures = captures.filter(isClientPurchaseMaterial);
  const budgetableCaptures = captures.filter((capture) => !isClientPurchaseMaterial(capture));

  function renderCaptureCard(capture: CalculationCapture) {
    const description = capture.editableDescription ?? capture.summary;
    const itemType = capture.itemType ?? 'technicalObservation';
    const quantity = capture.quantity ?? '1';
    const unitValue = capture.unitValue ?? '';
    const commercialTotal = calculateCaptureCommercialTotal(capture);
    const referenceTotal = calculateCaptureReferenceTotal(capture);
    const clientPurchase = isClientPurchaseMaterial(capture);
    const supplyMode = capture.materialSupplyMode ?? 'professional';

    return (
      <article className={clientPurchase ? 'technical-capture-card client-purchase-card' : 'technical-capture-card'} key={capture.id}>
        <header className="technical-capture-header">
          <span className={clientPurchase ? 'app-icon tone-blue' : 'app-icon tone-blue'}>{clientPurchase ? 'PC' : 'IT'}</span>
          <span>
            <strong>{capture.calculatorLabel}</strong>
            <small>{capture.moduleLabel} · {formatCaptureTime(capture.createdAt)}</small>
            {capture.itemType === 'material' && <small>Fornecimento: {materialSupplyLabel(supplyMode)}</small>}
          </span>
        </header>

        {capture.imageDataUrl && (
          <div className="technical-capture-image">
            <img src={capture.imageDataUrl} alt={`Imagem de ${description}`} />
          </div>
        )}

        <label className="technical-edit-field">
          <span>Tipo do item</span>
          <select value={itemType} onChange={(event) => onUpdate(capture.id, { itemType: event.target.value as TechnicalItemType })}>
            {itemTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        {itemType === 'material' && (
          <label className="technical-edit-field material-supply-field">
            <span>Quem compra este material?</span>
            <select value={supplyMode} onChange={(event) => onUpdate(capture.id, buildMaterialSupplyPatch(capture, event.target.value as MaterialSupplyMode))}>
              {materialSupplyOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <small>{materialSupplyOptions.find((option) => option.value === supplyMode)?.helper}</small>
          </label>
        )}

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
          <summary>Ver resultados / detalhes</summary>
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
              disabled={clientPurchase}
              onChange={(event) => onUpdate(capture.id, { shouldGenerateBudgetItem: event.target.checked })}
            />
            <span>{clientPurchase ? 'Material listado para compra do cliente, fora do total cobrado' : 'Este item pode virar serviço/material no orçamento'}</span>
          </label>
        </div>

        <div className="technical-commercial-grid">
          <label className="technical-edit-field">
            <span>Quantidade</span>
            <input inputMode="decimal" value={quantity} onFocus={handleNumericInputFocus} onChange={(event) => onUpdate(capture.id, { quantity: event.target.value })} />
          </label>
          <label className="technical-edit-field">
            <span>{clientPurchase ? 'Valor referência unitário' : 'Valor unitário'}</span>
            <input
              inputMode="decimal"
              value={clientPurchase ? (capture.materialReferenceUnitValue ?? '') : unitValue}
              placeholder="0,00"
              onFocus={handleNumericInputFocus}
              onChange={(event) => onUpdate(capture.id, clientPurchase ? { materialReferenceUnitValue: event.target.value } : { unitValue: event.target.value })}
            />
          </label>
        </div>

        <div className="technical-capture-actions">
          <strong>{clientPurchase ? `Total referência: ${formatCurrency(referenceTotal)}` : `Total opcional: ${formatCurrency(commercialTotal)}`}</strong>
          <button className="danger-action" type="button" onClick={() => onRemove(capture.id)}>Remover</button>
        </div>
      </article>
    );
  }

  return (
    <div className="technical-capture-list technical-capture-list-sectioned">
      {budgetableCaptures.length > 0 && (
        <section className="technical-capture-section">
          <header>
            <strong>Itens que entram no orçamento</strong>
            <small>Serviços, materiais fornecidos pelo profissional e observações convertíveis.</small>
          </header>
          {budgetableCaptures.map(renderCaptureCard)}
        </section>
      )}

      {clientPurchaseCaptures.length > 0 && (
        <section className="technical-capture-section client-purchase-section">
          <header>
            <strong>Lista de materiais para o cliente comprar</strong>
            <small>Esses itens não entram no total cobrado pelo profissional. Use como lista orientativa para compra.</small>
          </header>
          {clientPurchaseCaptures.map(renderCaptureCard)}
        </section>
      )}
    </div>
  );
}
