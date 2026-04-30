import { useMemo, useState, type ChangeEvent } from 'react';
import type { CatalogItem } from '../../../core/types/business';
import type { CalculationCapture, CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';
import {
  catalogPartBrands,
  catalogPartCategories,
  searchCatalogParts,
  type CatalogPart,
} from '../../../data/parts/catalogParts';
import { loadCatalogItems } from '../../budgets/storage/catalogStorage';
import './GuidedBudgetCart.css';

type GuidedCartMode = 'catalog' | 'manual' | 'parts' | 'all';

interface GuidedBudgetCartProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  mode?: GuidedCartMode;
}

interface CartLine {
  item: CatalogItem;
  quantity: number;
}

interface PartLine {
  part: CatalogPart;
  quantity: number;
  unitValue: number;
  destination: CalculationDestination;
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

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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

function partLineTotal(line: PartLine): number {
  return line.quantity * line.unitValue;
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

function partTechnicalNote(part: CatalogPart): string {
  return [
    `${part.brand}${part.line ? ` · ${part.line}` : ''}`,
    part.model ? `Modelo: ${part.model}` : null,
    part.sku ? `SKU: ${part.sku}` : null,
    part.voltage ? `Tensão: ${part.voltage}` : null,
    part.current ? `Corrente: ${part.current}` : null,
    part.application ? `Aplicação: ${part.application}` : null,
  ].filter(Boolean).join(' | ');
}

export function GuidedBudgetCart({ onSendToBudget, mode = 'all' }: GuidedBudgetCartProps) {
  const [catalogItems] = useState<CatalogItem[]>(() => loadCatalogItems());
  const [cartLines, setCartLines] = useState<Record<string, CartLine>>({});
  const [partLines, setPartLines] = useState<Record<string, PartLine>>({});
  const [partQuery, setPartQuery] = useState('');
  const [partBrand, setPartBrand] = useState('');
  const [partCategory, setPartCategory] = useState('');
  const [manualBlock, setManualBlock] = useState<ManualBlockDraft>(emptyManualBlock);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showManual = mode === 'manual' || mode === 'all';
  const showCatalog = mode === 'catalog' || mode === 'all';
  const showParts = mode === 'parts' || mode === 'all';
  const selectedLines = useMemo(() => Object.values(cartLines).filter((line) => line.quantity > 0), [cartLines]);
  const selectedPartLines = useMemo(() => Object.values(partLines).filter((line) => line.quantity > 0), [partLines]);
  const totalQuantity = selectedLines.reduce((total, line) => total + line.quantity, 0) + selectedPartLines.reduce((total, line) => total + line.quantity, 0);
  const totalValue = selectedLines.reduce((total, line) => total + cartLineTotal(line), 0) + selectedPartLines.reduce((total, line) => total + partLineTotal(line), 0);
  const manualQuantity = parseDecimal(manualBlock.quantity, 1);
  const manualUnitValue = parseDecimal(manualBlock.unitValue, 0);
  const canAddManualBlock = manualBlock.description.trim().length > 0 && manualQuantity > 0;
  const partResults = useMemo(() => searchCatalogParts(partQuery, partBrand, partCategory), [partBrand, partCategory, partQuery]);

  function updateManualBlock<K extends keyof ManualBlockDraft>(key: K, value: ManualBlockDraft[K]) {
    setManualBlock((current) => ({ ...current, [key]: value }));
  }

  function addItem(item: CatalogItem) {
    setFeedback(null);
    setCartLines((current) => ({ ...current, [item.id]: { item, quantity: (current[item.id]?.quantity ?? 0) + 1 } }));
  }

  function setItemQuantity(item: CatalogItem, value: string) {
    setFeedback(null);
    const quantity = parseDecimal(value, 0);
    setCartLines((current) => {
      if (quantity <= 0) {
        const { [item.id]: _removed, ...remaining } = current;
        return remaining;
      }
      return { ...current, [item.id]: { item, quantity } };
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
      return { ...current, [item.id]: { item, quantity: currentLine.quantity - 1 } };
    });
  }

  function addPart(part: CatalogPart) {
    setFeedback(null);
    setPartLines((current) => ({
      ...current,
      [part.id]: {
        part,
        quantity: (current[part.id]?.quantity ?? 0) + 1,
        unitValue: current[part.id]?.unitValue ?? part.estimatedPrice ?? 0,
        destination: current[part.id]?.destination ?? 'both',
      },
    }));
  }

  function removePart(part: CatalogPart) {
    setFeedback(null);
    setPartLines((current) => {
      const currentLine = current[part.id];
      if (!currentLine || currentLine.quantity <= 1) {
        const { [part.id]: _removed, ...remaining } = current;
        return remaining;
      }
      return { ...current, [part.id]: { ...currentLine, quantity: currentLine.quantity - 1 } };
    });
  }

  function updatePartQuantity(part: CatalogPart, value: string) {
    setFeedback(null);
    const quantity = parseDecimal(value, 0);
    setPartLines((current) => {
      if (quantity <= 0) {
        const { [part.id]: _removed, ...remaining } = current;
        return remaining;
      }
      return {
        ...current,
        [part.id]: {
          part,
          quantity,
          unitValue: current[part.id]?.unitValue ?? part.estimatedPrice ?? 0,
          destination: current[part.id]?.destination ?? 'both',
        },
      };
    });
  }

  function updatePartUnitValue(part: CatalogPart, value: string) {
    setFeedback(null);
    const unitValue = parseDecimal(value, 0);
    setPartLines((current) => ({
      ...current,
      [part.id]: {
        part,
        quantity: current[part.id]?.quantity ?? 1,
        unitValue,
        destination: current[part.id]?.destination ?? 'both',
      },
    }));
  }

  function updatePartDestination(part: CatalogPart, destination: CalculationDestination) {
    setFeedback(null);
    setPartLines((current) => ({
      ...current,
      [part.id]: {
        part,
        quantity: current[part.id]?.quantity ?? 1,
        unitValue: current[part.id]?.unitValue ?? part.estimatedPrice ?? 0,
        destination,
      },
    }));
  }

  function handleManualImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') updateManualBlock('imageDataUrl', reader.result);
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
    setPartLines({});
    setFeedback(null);
  }

  function sendServicesToBudget() {
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
    setFeedback(`${captures.length} serviço(s)/item(ns) enviados para orçamento.`);
  }

  function sendPartsToFlow() {
    if (selectedPartLines.length === 0) return;
    const captures: CalculationCapture[] = selectedPartLines.map((line) => ({
      id: createId('part'),
      module: 'installations',
      moduleLabel: 'Catálogo de peças',
      calculatorLabel: `${line.part.brand} · ${line.part.category}`,
      destination: line.destination,
      createdAt: new Date().toISOString(),
      summary: `${line.part.title}: ${line.quantity} ${line.part.unit} × ${formatCurrency(line.unitValue)}`,
      details: [
        `Marca: ${line.part.brand}`,
        line.part.line ? `Linha: ${line.part.line}` : 'Linha: não informada',
        `Categoria: ${line.part.category}${line.part.subcategory ? ` / ${line.part.subcategory}` : ''}`,
        line.part.model ? `Modelo: ${line.part.model}` : 'Modelo: não informado',
        line.part.voltage ? `Tensão: ${line.part.voltage}` : 'Tensão: não informada',
        line.part.current ? `Corrente: ${line.part.current}` : 'Corrente: não informada',
        `Quantidade: ${line.quantity} ${line.part.unit}`,
        `Valor unitário estimado: ${formatCurrency(line.unitValue)}`,
        `Subtotal estimado: ${formatCurrency(partLineTotal(line))}`,
        `Destino: ${destinationLabel(line.destination)}`,
      ],
      itemType: 'material',
      editableDescription: `${line.part.title} - ${line.part.brand}`,
      technicalNote: partTechnicalNote(line.part),
      quantity: String(line.quantity),
      unitValue: String(line.unitValue),
      shouldGenerateBudgetItem: line.destination !== 'survey',
      convertedToBudgetItem: false,
      reportReady: line.destination === 'survey' || line.destination === 'both',
    }));
    onSendToBudget(captures);
    setPartLines({});
    setFeedback(`${captures.length} peça(s) adicionada(s) ao fluxo escolhido.`);
  }

  return (
    <section className="guided-cart-panel">
      <div className="guided-cart-header">
        <div>
          <h2>{showParts && !showCatalog && !showManual ? 'Peças e materiais' : showCatalog && !showManual && !showParts ? 'Levantamento guiado' : showManual && !showCatalog && !showParts ? 'Bloco manual' : 'Levantamento de campo'}</h2>
          <p>{showParts && !showCatalog && !showManual ? 'Busque peças por marca, categoria ou descrição e envie para levantamento, orçamento ou ambos.' : showCatalog && !showManual && !showParts ? 'Use o catálogo como carrinho rápido de serviços e materiais.' : showManual && !showCatalog && !showParts ? 'Registre blocos manuais com foto, observação, destino e quantidade.' : 'Escolha entre serviços, peças e blocos manuais para organizar a visita.'}</p>
        </div>
        {(showCatalog || showParts) && (
          <div className="guided-cart-total">
            <span>{totalQuantity} item(ns)</span>
            <strong>{formatCurrency(totalValue)}</strong>
          </div>
        )}
      </div>

      {showManual && (
        <div className="guided-manual-block-card">
          <div><strong>Bloco manual</strong><small>Use para registrar algo que não existe no catálogo: serviço, material, observação, diagnóstico ou especificação.</small></div>
          <div className="guided-manual-grid">
            <label className="technical-edit-field guided-wide-field"><span>Descrição do bloco</span><input value={manualBlock.description} placeholder="Ex.: Troca de tomadas da sala" onChange={(event) => updateManualBlock('description', event.target.value)} /></label>
            <label className="technical-edit-field"><span>Quantidade</span><input inputMode="decimal" value={manualBlock.quantity} onChange={(event) => updateManualBlock('quantity', event.target.value)} /></label>
            <label className="technical-edit-field"><span>Valor unitário</span><input inputMode="decimal" placeholder="0,00" value={manualBlock.unitValue} onChange={(event) => updateManualBlock('unitValue', event.target.value)} /></label>
            <label className="technical-edit-field"><span>Tipo</span><select value={manualBlock.itemType} onChange={(event) => updateManualBlock('itemType', event.target.value as TechnicalItemType)}><option value="service">Serviço</option><option value="material">Material</option><option value="diagnostic">Diagnóstico</option><option value="technicalObservation">Observação técnica</option><option value="projectSpecification">Especificação de projeto</option></select></label>
            <label className="technical-edit-field"><span>Destino</span><select value={manualBlock.destination} onChange={(event) => updateManualBlock('destination', event.target.value as CalculationDestination)}><option value="survey">Levantamento</option><option value="budget">Orçamento</option><option value="both">Levantamento e orçamento</option></select></label>
            <label className="technical-edit-field guided-wide-field"><span>Observação</span><textarea value={manualBlock.note} placeholder="Ex.: verificar padrão existente, cliente quer tomada dupla, parede com acabamento..." onChange={(event) => updateManualBlock('note', event.target.value)} /></label>
          </div>
          <div className="guided-image-row">
            <div className="guided-image-preview">{manualBlock.imageDataUrl ? <img src={manualBlock.imageDataUrl} alt="Imagem do bloco manual" /> : <span>Sem imagem</span>}</div>
            <div><strong>Imagem do bloco</strong><small>Adicione foto, referência ou detalhe visual para futuro relatório técnico.</small><div className="guided-cart-actions compact-actions"><label className="secondary-action inline-action file-action">Escolher imagem<input accept="image/*" type="file" onChange={handleManualImageChange} /></label><button className="danger-action" type="button" onClick={() => updateManualBlock('imageDataUrl', '')}>Remover imagem</button></div></div>
          </div>
          <button className="primary-action inline-action" type="button" disabled={!canAddManualBlock} onClick={addManualBlock}>Adicionar bloco ao fluxo</button>
        </div>
      )}

      {showCatalog && (
        <>
          <div className="guided-service-grid">
            {catalogItems.map((item) => {
              const quantity = cartLines[item.id]?.quantity ?? 0;
              return (
                <article className={quantity > 0 ? 'guided-service-card active' : 'guided-service-card'} key={item.id}>
                  <div><strong>{item.description}</strong><small>{catalogCategoryLabel(item.category)} · {formatCurrency(item.unitPrice)}</small>{item.notes && <small>{item.notes}</small>}</div>
                  <div className="guided-service-controls"><div className="guided-quantity-row"><button type="button" onClick={() => removeItem(item)} aria-label={`Remover ${item.description}`}>−</button><span>{quantity}</span><button type="button" onClick={() => addItem(item)} aria-label={`Adicionar ${item.description}`}>+</button></div><label className="guided-typed-quantity"><span>Qtd.</span><input inputMode="decimal" value={quantity ? String(quantity) : ''} placeholder="0" onChange={(event) => setItemQuantity(item, event.target.value)} /></label></div>
                </article>
              );
            })}
          </div>
          {selectedLines.length > 0 && <div className="guided-cart-summary"><strong>Serviços selecionados</strong><div>{selectedLines.map((line) => <span key={line.item.id}>{line.quantity}× {line.item.description}</span>)}</div></div>}
          <div className="guided-cart-actions"><button className="primary-action inline-action" type="button" disabled={selectedLines.length === 0} onClick={sendServicesToBudget}>Enviar serviços para orçamento</button><button className="secondary-action inline-action" type="button" disabled={selectedLines.length === 0 && selectedPartLines.length === 0} onClick={clearCart}>Limpar carrinho</button></div>
        </>
      )}

      {showParts && (
        <div className="parts-catalog-panel">
          <div className="parts-search-grid">
            <label className="technical-edit-field parts-search-wide"><span>Buscar peça</span><input value={partQuery} placeholder="Ex.: tomada 20A, disjuntor bipolar, contator WEG..." onChange={(event) => setPartQuery(event.target.value)} /></label>
            <label className="technical-edit-field"><span>Marca</span><select value={partBrand} onChange={(event) => setPartBrand(event.target.value)}><option value="">Todas</option>{catalogPartBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
            <label className="technical-edit-field"><span>Categoria</span><select value={partCategory} onChange={(event) => setPartCategory(event.target.value)}><option value="">Todas</option>{catalogPartCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          </div>

          <div className="parts-results-header"><strong>{partResults.length} peça(s) encontrada(s)</strong><small>Base interna inicial. Adaptadores online por fabricante ficam preparados para uma próxima fase.</small></div>

          <div className="parts-result-list">
            {partResults.map((part) => {
              const selectedPart = partLines[part.id];
              const quantity = selectedPart?.quantity ?? 0;
              const unitValue = selectedPart?.unitValue ?? part.estimatedPrice ?? 0;
              const destination = selectedPart?.destination ?? 'both';
              return (
                <article className={quantity > 0 ? 'part-result-card active' : 'part-result-card'} key={part.id}>
                  <div className="part-result-main">
                    <span>{part.brand}</span>
                    <strong>{part.title}</strong>
                    <small>{[part.line, part.category, part.subcategory, part.current, part.voltage].filter(Boolean).join(' · ')}</small>
                    {part.description && <small>{part.description}</small>}
                  </div>
                  <div className="part-result-controls">
                    <div className="guided-quantity-row"><button type="button" onClick={() => removePart(part)} aria-label={`Remover ${part.title}`}>−</button><span>{quantity}</span><button type="button" onClick={() => addPart(part)} aria-label={`Adicionar ${part.title}`}>+</button></div>
                    <label className="guided-typed-quantity"><span>Qtd.</span><input inputMode="decimal" value={quantity ? String(quantity) : ''} placeholder="0" onChange={(event) => updatePartQuantity(part, event.target.value)} /></label>
                    <label className="guided-typed-quantity"><span>Valor</span><input inputMode="decimal" value={unitValue ? String(unitValue) : ''} placeholder="0,00" onChange={(event) => updatePartUnitValue(part, event.target.value)} /></label>
                    <label className="guided-typed-quantity"><span>Destino</span><select value={destination} onChange={(event) => updatePartDestination(part, event.target.value as CalculationDestination)}><option value="survey">Levantamento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label>
                  </div>
                </article>
              );
            })}
          </div>

          {selectedPartLines.length > 0 && <div className="guided-cart-summary"><strong>Peças selecionadas</strong><div>{selectedPartLines.map((line) => <span key={line.part.id}>{line.quantity}× {line.part.title}</span>)}</div></div>}
          <div className="guided-cart-actions"><button className="primary-action inline-action" type="button" disabled={selectedPartLines.length === 0} onClick={sendPartsToFlow}>Enviar peças ao fluxo</button><button className="secondary-action inline-action" type="button" disabled={selectedPartLines.length === 0 && selectedLines.length === 0} onClick={clearCart}>Limpar peças</button></div>
        </div>
      )}

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
