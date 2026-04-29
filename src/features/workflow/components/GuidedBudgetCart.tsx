import { useMemo, useState, type ChangeEvent } from 'react';
import type { CatalogItem } from '../../../core/types/business';
import type { CalculationCapture, CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';
import { loadCatalogItems } from '../../budgets/storage/catalogStorage';
import './GuidedBudgetCart.css';

interface GuidedBudgetCartProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

interface CartLine {
  item: CatalogItem;
  quantity: number;
}

interface ManualBlockDraft {
  description: string;
  note: string;
  quantity: string;
  unitValue: string;
  itemType: TechnicalItemType;
  destination: CalculationDestination;
  imageDataUrl: string;
}

const emptyManualBlock: ManualBlockDraft = {
  description: '',
  note: '',
  quantity: '1',
  unitValue: '',
  itemType: 'service',
  destination: 'budget',
  imageDataUrl: '',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function createId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function parseDecimal(value: string, fallback = 0): number {
  const parsedValue = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function cartLineTotal(line: CartLine): number {
  return line.quantity * line.item.unitPrice;
}

function catalogCategoryToItemType(category: CatalogItem['category']): CalculationCapture['itemType'] {
  if (category === 'material') return 'material';
  if (category === 'labor') return 'service';
  return 'technicalObservation';
}

function catalogCategoryLabel(category: CatalogItem['category']): string {
  if (category === 'material') return 'Material';
  if (category === 'labor') return 'Serviço';
  return 'Outro';
}

function itemTypeLabel(itemType: TechnicalItemType): string {
  if (itemType === 'diagnostic') return 'Diagnóstico';
  if (itemType === 'technicalObservation') return 'Observação técnica';
  if (itemType === 'service') return 'Serviço';
  if (itemType === 'material') return 'Material';
  return 'Especificação de projeto';
}

function destinationLabel(destination: CalculationDestination): string {
  if (destination === 'survey') return 'Levantamento';
  if (destination === 'budget') return 'Orçamento';
  return 'Levantamento e orçamento';
}

export function GuidedBudgetCart({ onSendToBudget }: GuidedBudgetCartProps) {
  const [catalogItems] = useState<CatalogItem[]>(() => loadCatalogItems());
  const [cartLines, setCartLines] = useState<Record<string, CartLine>>({});
  const [manualBlock, setManualBlock] = useState<ManualBlockDraft>(emptyManualBlock);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedLines = useMemo(() => Object.values(cartLines).filter((line) => line.quantity > 0), [cartLines]);
  const totalQuantity = selectedLines.reduce((total, line) => total + line.quantity, 0);
  const totalValue = selectedLines.reduce((total, line) => total + cartLineTotal(line), 0);
  const manualQuantity = parseDecimal(manualBlock.quantity, 1);
  const manualUnitValue = parseDecimal(manualBlock.unitValue, 0);
  const canAddManualBlock = manualBlock.description.trim().length > 0 && manualQuantity > 0;

  function updateManualBlock<K extends keyof ManualBlockDraft>(key: K, value: ManualBlockDraft[K]) {
    setManualBlock((current) => ({ ...current, [key]: value }));
  }

  function addItem(item: CatalogItem) {
    setFeedback(null);
    setCartLines((current) => {
      const currentLine = current[item.id];
      return {
        ...current,
        [item.id]: {
          item,
          quantity: (currentLine?.quantity ?? 0) + 1,
        },
      };
    });
  }

  function setItemQuantity(item: CatalogItem, value: string) {
    setFeedback(null);
    const quantity = parseDecimal(value, 0);

    setCartLines((current) => {
      if (quantity <= 0) {
        const { [item.id]: _removed, ...remaining } = current;
        return remaining;
      }

      return {
        ...current,
        [item.id]: {
          item,
          quantity,
        },
      };
    });
  }

  function removeItem(item: CatalogItem) {
    setFeedback(null);
    setCartLines((current) => {
      const currentLine = current[item.id];

      if (!currentLine || currentLine.quantity <= 1) {
        const { [item.id]: _removed, ...remaining } = current;
        return remaining;
      }

      return {
        ...current,
        [item.id]: {
          item,
          quantity: currentLine.quantity - 1,
        },
      };
    });
  }

  function handleManualImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateManualBlock('imageDataUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function addManualBlock() {
    if (!canAddManualBlock) return;

    const total = manualQuantity * manualUnitValue;
    const capture: CalculationCapture = {
      id: createId('manual-block'),
      module: 'installations',
      moduleLabel: 'Levantamento manual',
      calculatorLabel: 'Bloco manual',
      destination: manualBlock.destination,
      createdAt: new Date().toISOString(),
      summary: `${manualBlock.description.trim()}: ${manualQuantity}${manualUnitValue > 0 ? ` × ${formatCurrency(manualUnitValue)}` : ''}`,
      details: [
        `Tipo: ${itemTypeLabel(manualBlock.itemType)}`,
        `Destino: ${destinationLabel(manualBlock.destination)}`,
        `Quantidade: ${manualQuantity}`,
        manualUnitValue > 0 ? `Valor unitário: ${formatCurrency(manualUnitValue)}` : 'Valor unitário: não informado',
        manualUnitValue > 0 ? `Subtotal: ${formatCurrency(total)}` : 'Subtotal: não calculado',
        manualBlock.note.trim() ? `Observação: ${manualBlock.note.trim()}` : 'Origem: bloco manual do levantamento guiado',
      ],
      itemType: manualBlock.itemType,
      editableDescription: manualBlock.description.trim(),
      technicalNote: manualBlock.note.trim() || 'Bloco manual criado durante o levantamento.',
      quantity: String(manualQuantity),
      unitValue: manualUnitValue > 0 ? String(manualUnitValue) : '',
      shouldGenerateBudgetItem: manualBlock.destination !== 'survey',
      convertedToBudgetItem: false,
      imageDataUrl: manualBlock.imageDataUrl,
      reportReady: manualBlock.destination === 'survey' || manualBlock.destination === 'both',
    };

    onSendToBudget([capture]);
    setManualBlock(emptyManualBlock);
    setFeedback('Bloco manual adicionado ao fluxo escolhido.');
  }

  function clearCart() {
    setCartLines({});
    setFeedback(null);
  }

  function sendToBudget() {
    if (selectedLines.length === 0) return;

    const captures: CalculationCapture[] = selectedLines.map((line) => ({
      id: createId('guided'),
      module: 'installations',
      moduleLabel: 'Levantamento guiado',
      calculatorLabel: 'Carrinho de serviços',
      destination: 'budget',
      createdAt: new Date().toISOString(),
      summary: `${line.item.description}: ${line.quantity} × ${formatCurrency(line.item.unitPrice)}`,
      details: [
        `Tipo: ${catalogCategoryLabel(line.item.category)}`,
        'Destino: Orçamento',
        `Quantidade: ${line.quantity}`,
        `Valor unitário: ${formatCurrency(line.item.unitPrice)}`,
        `Subtotal: ${formatCurrency(cartLineTotal(line))}`,
        line.item.notes ? `Notas: ${line.item.notes}` : 'Origem: levantamento guiado em campo',
      ],
      itemType: catalogCategoryToItemType(line.item.category),
      editableDescription: line.item.description,
      technicalNote: line.item.notes ?? 'Item selecionado no levantamento guiado.',
      quantity: String(line.quantity),
      unitValue: String(line.item.unitPrice),
      shouldGenerateBudgetItem: true,
      convertedToBudgetItem: false,
      reportReady: false,
    }));

    onSendToBudget(captures);
    setCartLines({});
    setFeedback(`${captures.length} item(ns) enviados para orçamento.`);
  }

  return (
    <section className="guided-cart-panel">
      <div className="guided-cart-header">
        <div>
          <h2>Levantamento guiado</h2>
          <p>Toque nos serviços/produtos, digite quantidades ou crie blocos manuais com foto para orçamento, relatório ou levantamento.</p>
        </div>
        <div className="guided-cart-total">
          <span>{totalQuantity} item(ns)</span>
          <strong>{formatCurrency(totalValue)}</strong>
        </div>
      </div>

      <div className="guided-manual-block-card">
        <div>
          <strong>Bloco manual</strong>
          <small>Use para registrar algo que não existe no catálogo: serviço, material, observação, diagnóstico ou especificação.</small>
        </div>

        <div className="guided-manual-grid">
          <label className="technical-edit-field guided-wide-field">
            <span>Descrição do bloco</span>
            <input value={manualBlock.description} placeholder="Ex.: Troca de tomadas da sala" onChange={(event) => updateManualBlock('description', event.target.value)} />
          </label>

          <label className="technical-edit-field">
            <span>Quantidade</span>
            <input inputMode="decimal" value={manualBlock.quantity} onChange={(event) => updateManualBlock('quantity', event.target.value)} />
          </label>

          <label className="technical-edit-field">
            <span>Valor unitário</span>
            <input inputMode="decimal" placeholder="0,00" value={manualBlock.unitValue} onChange={(event) => updateManualBlock('unitValue', event.target.value)} />
          </label>

          <label className="technical-edit-field">
            <span>Tipo</span>
            <select value={manualBlock.itemType} onChange={(event) => updateManualBlock('itemType', event.target.value as TechnicalItemType)}>
              <option value="service">Serviço</option>
              <option value="material">Material</option>
              <option value="diagnostic">Diagnóstico</option>
              <option value="technicalObservation">Observação técnica</option>
              <option value="projectSpecification">Especificação de projeto</option>
            </select>
          </label>

          <label className="technical-edit-field">
            <span>Destino</span>
            <select value={manualBlock.destination} onChange={(event) => updateManualBlock('destination', event.target.value as CalculationDestination)}>
              <option value="survey">Levantamento</option>
              <option value="budget">Orçamento</option>
              <option value="both">Levantamento e orçamento</option>
            </select>
          </label>

          <label className="technical-edit-field guided-wide-field">
            <span>Observação</span>
            <textarea value={manualBlock.note} placeholder="Ex.: verificar padrão existente, cliente quer tomada dupla, parede com acabamento..." onChange={(event) => updateManualBlock('note', event.target.value)} />
          </label>
        </div>

        <div className="guided-image-row">
          <div className="guided-image-preview">
            {manualBlock.imageDataUrl ? <img src={manualBlock.imageDataUrl} alt="Imagem do bloco manual" /> : <span>Sem imagem</span>}
          </div>
          <div>
            <strong>Imagem do bloco</strong>
            <small>Adicione foto, referência ou detalhe visual para futuro relatório técnico.</small>
            <div className="guided-cart-actions compact-actions">
              <label className="secondary-action inline-action file-action">
                Escolher imagem
                <input accept="image/*" type="file" onChange={handleManualImageChange} />
              </label>
              <button className="danger-action" type="button" onClick={() => updateManualBlock('imageDataUrl', '')}>Remover imagem</button>
            </div>
          </div>
        </div>

        <button className="primary-action inline-action" type="button" disabled={!canAddManualBlock} onClick={addManualBlock}>Adicionar bloco ao fluxo</button>
      </div>

      <div className="guided-service-grid">
        {catalogItems.map((item) => {
          const quantity = cartLines[item.id]?.quantity ?? 0;

          return (
            <article className={quantity > 0 ? 'guided-service-card active' : 'guided-service-card'} key={item.id}>
              <div>
                <strong>{item.description}</strong>
                <small>{catalogCategoryLabel(item.category)} · {formatCurrency(item.unitPrice)}</small>
                {item.notes && <small>{item.notes}</small>}
              </div>
              <div className="guided-service-controls">
                <div className="guided-quantity-row">
                  <button type="button" onClick={() => removeItem(item)} aria-label={`Remover ${item.description}`}>−</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => addItem(item)} aria-label={`Adicionar ${item.description}`}>+</button>
                </div>
                <label className="guided-typed-quantity">
                  <span>Qtd.</span>
                  <input inputMode="decimal" value={quantity ? String(quantity) : ''} placeholder="0" onChange={(event) => setItemQuantity(item, event.target.value)} />
                </label>
              </div>
            </article>
          );
        })}
      </div>

      {selectedLines.length > 0 && (
        <div className="guided-cart-summary">
          <strong>Itens selecionados</strong>
          <div>
            {selectedLines.map((line) => (
              <span key={line.item.id}>{line.quantity}× {line.item.description}</span>
            ))}
          </div>
        </div>
      )}

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}

      <div className="guided-cart-actions">
        <button className="primary-action inline-action" type="button" disabled={selectedLines.length === 0} onClick={sendToBudget}>Enviar catálogo para orçamento</button>
        <button className="secondary-action inline-action" type="button" disabled={selectedLines.length === 0} onClick={clearCart}>Limpar carrinho</button>
      </div>
    </section>
  );
}
