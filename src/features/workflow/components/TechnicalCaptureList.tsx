import { useMemo, useState } from 'react';
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

const TECHNICAL_CAPTURE_VISIBLE_LIMIT = 5;

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
  const [query, setQuery] = useState('');
  const filteredCaptures = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return captures.filter((capture) => [capture.summary, capture.editableDescription, capture.moduleLabel, capture.calculatorLabel, capture.technicalNote, capture.details.join(' ')].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [captures, query]);

  if (captures.length === 0) {
    return (
      <div className="survey-empty-state">
        <span className="app-icon tone-gray large-icon">IT</span>
        <strong>Nenhum item ainda</strong>
        <p>{emptyText}</p>
      </div>
    );
  }

  const clientPurchaseCaptures = filteredCaptures.filter(isClientPurchaseMaterial);
  const budgetableCaptures = filteredCaptures.filter((capture) => !isClientPurchaseMaterial(capture));

  function confirmRemoveCapture(capture: CalculationCapture) {
    const confirmed = window.confirm(`Remover "${capture.editableDescription ?? capture.summary}" da base técnica deste orçamento?`);
    if (!confirmed) return;
    onRemove(capture.id);
  }

  function renderCaptureCard(capture: CalculationCapture) {
    const description = capture.editableDescription ?? capture.summary;
    const itemType = capture.itemType ?? 'technicalObservation';
    const quantity = capture.quantity ?? '1';
    const unitValue = capture.unitValue ?? '';
    const commercialTotal = calculateCaptureCommercialTotal(capture);
    const referenceTotal = calculateCaptureReferenceTotal(capture);
    const clientPurchase = isClientPurchaseMaterial(capture);
    const supplyMode = capture.materialSupplyMode ?? 'professional';
    const totalLabel = clientPurchase ? `Referência ${formatCurrency(referenceTotal)}` : `Orçamento ${formatCurrency(commercialTotal)}`;

    return (
      <article className={clientPurchase ? 'technical-capture-card client-purchase-card' : 'technical-capture-card'} key={capture.id}>
        <header className="technical-capture-header">
          <span>
            <strong>{capture.calculatorLabel}</strong>
            <small>{capture.moduleLabel} · {formatCaptureTime(capture.createdAt)}</small>
            {capture.itemType === 'material' && <small>Fornecimento: {materialSupplyLabel(supplyMode)}</small>}
          </span>
          <em>{totalLabel}</em>
        </header>

        <div className="technical-capture-row-summary">
          <span>{description}</span>
          <small>{itemTypeOptions.find((option) => option.value === itemType)?.label ?? 'Item'} · Qtd. {quantity}</small>
        </div>

        <details className="technical-capture-editor-details">
          <summary>Editar item e valores</summary>

          <div className="technical-capture-editor-body">
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
              <label className={capture.shouldGenerateBudgetItem ?? capture.destination !== 'survey' ? 'enabled' : ''}>
                <input
                  type="checkbox"
                  checked={capture.shouldGenerateBudgetItem ?? capture.destination !== 'survey'}
                  disabled={clientPurchase}
                  onChange={(event) => onUpdate(capture.id, { shouldGenerateBudgetItem: event.target.checked })}
                />
                <span>{clientPurchase ? 'Material listado para compra do cliente, fora do total cobrado' : 'Enviar este item para o orçamento'}</span>
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
              <button className="danger-action" type="button" onClick={() => confirmRemoveCapture(capture)}>Remover</button>
            </div>
          </div>
        </details>
      </article>
    );
  }

  return (
    <div className="technical-capture-list technical-capture-list-sectioned">
      <label className="technical-capture-search"><span>Buscar item técnico</span><input value={query} placeholder="Descrição, cálculo, observação ou detalhe" onChange={(event) => setQuery(event.target.value)} /></label>
      {!query.trim() ? <div className="technical-capture-empty">Há {captures.length} item(ns) salvo(s). Pesquise para exibir e editar.</div> : filteredCaptures.length === 0 && <div className="technical-capture-empty">Nenhum item encontrado com essa busca.</div>}
      {budgetableCaptures.length > 0 && (
        <section className="technical-capture-section">
          <header>
            <strong>Itens que entram no orçamento</strong>
            <small>Serviços, materiais fornecidos pelo profissional e observações convertíveis.</small>
          </header>
          {budgetableCaptures.slice(0, TECHNICAL_CAPTURE_VISIBLE_LIMIT).map(renderCaptureCard)}
          {budgetableCaptures.length > TECHNICAL_CAPTURE_VISIBLE_LIMIT && <div className="technical-capture-empty">Mais {budgetableCaptures.length - TECHNICAL_CAPTURE_VISIBLE_LIMIT} item(ns) oculto(s). Use a busca para refinar.</div>}
        </section>
      )}

      {clientPurchaseCaptures.length > 0 && (
        <section className="technical-capture-section client-purchase-section">
          <header>
            <strong>Lista de materiais para o cliente comprar</strong>
            <small>Esses itens não entram no total cobrado pelo profissional. Use como lista orientativa para compra.</small>
          </header>
          {clientPurchaseCaptures.slice(0, TECHNICAL_CAPTURE_VISIBLE_LIMIT).map(renderCaptureCard)}
          {clientPurchaseCaptures.length > TECHNICAL_CAPTURE_VISIBLE_LIMIT && <div className="technical-capture-empty">Mais {clientPurchaseCaptures.length - TECHNICAL_CAPTURE_VISIBLE_LIMIT} material(is) oculto(s). Use a busca para refinar.</div>}
        </section>
      )}
    </div>
  );
}
