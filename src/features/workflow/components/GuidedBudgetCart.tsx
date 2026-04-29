import { useMemo, useState } from 'react';
import type { CatalogItem } from '../../../core/types/business';
import type { CalculationCapture } from '../../../core/types/workflow';
import { loadCatalogItems } from '../../budgets/storage/catalogStorage';

interface GuidedBudgetCartProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
}

interface CartLine {
  item: CatalogItem;
  quantity: number;
}

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

export function GuidedBudgetCart({ onSendToBudget }: GuidedBudgetCartProps) {
  const [catalogItems] = useState<CatalogItem[]>(() => loadCatalogItems());
  const [cartLines, setCartLines] = useState<Record<string, CartLine>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedLines = useMemo(() => Object.values(cartLines).filter((line) => line.quantity > 0), [cartLines]);
  const totalQuantity = selectedLines.reduce((total, line) => total + line.quantity, 0);
  const totalValue = selectedLines.reduce((total, line) => total + cartLineTotal(line), 0);

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

  function clearCart() {
    setCartLines({});
    setFeedback(null);
  }

  function sendToBudget() {
    if (selectedLines.length === 0) {
      return;
    }

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
          <p>Toque nos serviços/produtos para acumular quantidades como um carrinho de orçamento.</p>
        </div>
        <div className="guided-cart-total">
          <span>{totalQuantity} item(ns)</span>
          <strong>{formatCurrency(totalValue)}</strong>
        </div>
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
              <div className="guided-quantity-row">
                <button type="button" onClick={() => removeItem(item)} aria-label={`Remover ${item.description}`}>−</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => addItem(item)} aria-label={`Adicionar ${item.description}`}>+</button>
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
        <button className="primary-action inline-action" type="button" disabled={selectedLines.length === 0} onClick={sendToBudget}>Enviar para orçamento</button>
        <button className="secondary-action inline-action" type="button" disabled={selectedLines.length === 0} onClick={clearCart}>Limpar carrinho</button>
      </div>
    </section>
  );
}
