import { useMemo, useState } from 'react';
import type { CalculationCapture, CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';
import {
  catalogPartBrands,
  catalogPartCategories,
  searchCatalogParts,
  type CatalogPart,
} from '../../../data/parts/catalogParts';
import './GuidedBudgetCart.css';

type GuidedCartMode = 'catalog' | 'manual' | 'parts' | 'all';
type GuidedEntryKind = 'labor' | 'manual-part' | 'catalog-part' | 'kit';

interface GuidedBudgetCartProps {
  onSendToBudget: (items: CalculationCapture[]) => void;
  mode?: GuidedCartMode;
}

interface GuidedLine {
  id: string;
  kind: GuidedEntryKind;
  environment: string;
  description: string;
  quantity: number;
  unitValue: number;
  itemType: TechnicalItemType;
  destination: CalculationDestination;
  note: string;
  brand?: string;
  model?: string;
}

interface LaborTemplate {
  id: string;
  title: string;
  defaultUnitValue: number;
  unit: string;
  note: string;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const commonEnvironments = ['Sala', 'Cozinha', 'Quarto', 'Banheiro', 'Área externa', 'Garagem', 'Escritório'];

const laborTemplates: LaborTemplate[] = [
  { id: 'tomada-circuito', title: 'Lançamento de circuito de tomada', defaultUnitValue: 120, unit: 'ponto', note: 'Passagem/lançamento de circuito de tomada conforme levantamento em campo.' },
  { id: 'tomada-troca', title: 'Troca/instalação de tomada', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação ou substituição de tomada, considerar material à parte.' },
  { id: 'spot-led', title: 'Instalação de spot/lâmpada', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação de spot, luminária simples ou ponto de iluminação.' },
  { id: 'lustre', title: 'Instalação de lustre/luminária decorativa', defaultUnitValue: 120, unit: 'un.', note: 'Instalação de lustre/luminária decorativa, validar peso, altura e fixação.' },
  { id: 'interruptor', title: 'Instalação de interruptor', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação/substituição de interruptor simples, paralelo ou intermediário.' },
  { id: 'disjuntor', title: 'Instalação de disjuntor/circuito no quadro', defaultUnitValue: 95, unit: 'circuito', note: 'Serviço no quadro, validar espaço, barramentos, DR/DPS e segurança.' },
];

const kitBrands = ['Margirius', 'Tramontina', 'Schneider', 'Weg', 'Outra'];

const emptyManualPart = {
  title: '',
  brand: '',
  model: '',
  quantity: '1',
  unitValue: '',
  note: '',
  destination: 'both' as CalculationDestination,
};

function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function createId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function parseDecimal(value: string, fallback = 0): number {
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function destinationLabel(destination: CalculationDestination): string {
  if (destination === 'survey') return 'Levantamento';
  if (destination === 'budget') return 'Orçamento';
  return 'Levantamento e orçamento';
}

function kindLabel(kind: GuidedEntryKind): string {
  if (kind === 'labor') return 'Mão de obra';
  if (kind === 'manual-part') return 'Peça manual';
  if (kind === 'catalog-part') return 'Peça de catálogo';
  return 'Kit automático';
}

function lineTotal(line: GuidedLine): number {
  return line.quantity * line.unitValue;
}

function makeCapture(line: GuidedLine): CalculationCapture {
  const subtotal = lineTotal(line);
  return {
    id: createId('guided-budget'),
    module: 'orcamentoTecnico',
    moduleLabel: 'Orçamento guiado',
    calculatorLabel: `${line.environment} · ${kindLabel(line.kind)}`,
    destination: line.destination,
    createdAt: new Date().toISOString(),
    summary: `${line.environment}: ${line.description} · ${line.quantity} × ${formatCurrency(line.unitValue)}`,
    details: [
      `Ambiente: ${line.environment}`,
      `Tipo: ${kindLabel(line.kind)}`,
      `Descrição: ${line.description}`,
      line.brand ? `Marca: ${line.brand}` : 'Marca: não informada',
      line.model ? `Modelo/referência: ${line.model}` : 'Modelo/referência: não informado',
      `Quantidade: ${line.quantity}`,
      `Valor unitário: ${formatCurrency(line.unitValue)}`,
      `Subtotal: ${formatCurrency(subtotal)}`,
      `Destino: ${destinationLabel(line.destination)}`,
      line.note ? `Observação: ${line.note}` : 'Origem: orçamento guiado por ambiente',
    ],
    itemType: line.itemType,
    editableDescription: `${line.environment} - ${line.description}`,
    technicalNote: line.note || 'Item criado no orçamento guiado por ambiente.',
    quantity: String(line.quantity),
    unitValue: String(line.unitValue),
    shouldGenerateBudgetItem: line.destination !== 'survey',
    convertedToBudgetItem: false,
    reportReady: line.destination === 'survey' || line.destination === 'both',
  };
}

function partNote(part: CatalogPart): string {
  return [part.brand, part.line, part.model ? `Modelo ${part.model}` : '', part.voltage, part.current, part.application].filter(Boolean).join(' · ');
}

export function GuidedBudgetCart({ onSendToBudget, mode = 'all' }: GuidedBudgetCartProps) {
  const [environment, setEnvironment] = useState('Sala');
  const [customEnvironment, setCustomEnvironment] = useState('');
  const [lines, setLines] = useState<GuidedLine[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [laborQuantityById, setLaborQuantityById] = useState<Record<string, string>>({});
  const [laborValueById, setLaborValueById] = useState<Record<string, string>>({});

  const [manualPart, setManualPart] = useState(emptyManualPart);
  const [partQuery, setPartQuery] = useState('');
  const [partBrand, setPartBrand] = useState('');
  const [partCategory, setPartCategory] = useState('');

  const [kitDoubleOutletQty, setKitDoubleOutletQty] = useState('4');
  const [kitBrand, setKitBrand] = useState('Margirius');
  const [kitDestination, setKitDestination] = useState<CalculationDestination>('both');

  const activeEnvironment = customEnvironment.trim() || environment;
  const showManual = mode === 'manual' || mode === 'all';
  const showCatalog = mode === 'catalog' || mode === 'all';
  const showParts = mode === 'parts' || mode === 'all';
  const partResults = useMemo(() => searchCatalogParts(partQuery, partBrand, partCategory), [partBrand, partCategory, partQuery]);
  const totalValue = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  function addLine(line: Omit<GuidedLine, 'id' | 'environment'> & { environment?: string }) {
    setFeedback(null);
    setLines((current) => [{ ...line, id: createId('guided-line'), environment: line.environment || activeEnvironment }, ...current]);
  }

  function updateLineQuantity(id: string, value: string) {
    const quantity = parseDecimal(value, 0);
    setLines((current) => current.map((line) => (line.id === id ? { ...line, quantity } : line)).filter((line) => line.quantity > 0));
  }

  function updateLineUnitValue(id: string, value: string) {
    const unitValue = parseDecimal(value, 0);
    setLines((current) => current.map((line) => (line.id === id ? { ...line, unitValue } : line)));
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  function addLabor(template: LaborTemplate) {
    const quantity = parseDecimal(laborQuantityById[template.id] ?? '1', 1);
    const unitValue = parseDecimal(laborValueById[template.id] ?? String(template.defaultUnitValue), template.defaultUnitValue);
    if (quantity <= 0) return;
    addLine({
      kind: 'labor',
      description: template.title,
      quantity,
      unitValue,
      itemType: 'service',
      destination: 'budget',
      note: `${template.note} Unidade: ${template.unit}.`,
    });
  }

  function addManualPart() {
    const description = manualPart.title.trim();
    if (!description) return;
    const quantity = parseDecimal(manualPart.quantity, 1);
    const unitValue = parseDecimal(manualPart.unitValue, 0);
    if (quantity <= 0) return;
    addLine({
      kind: 'manual-part',
      description,
      quantity,
      unitValue,
      itemType: 'material',
      destination: manualPart.destination,
      note: manualPart.note.trim() || 'Peça/material criado manualmente no orçamento guiado.',
      brand: manualPart.brand.trim(),
      model: manualPart.model.trim(),
    });
    setManualPart(emptyManualPart);
  }

  function addCatalogPart(part: CatalogPart) {
    addLine({
      kind: 'catalog-part',
      description: part.title,
      quantity: 1,
      unitValue: part.estimatedPrice ?? 0,
      itemType: 'material',
      destination: 'both',
      note: partNote(part),
      brand: part.brand,
      model: part.model,
    });
  }

  function addDoubleOutletKit() {
    const outlets = parseDecimal(kitDoubleOutletQty, 0);
    if (outlets <= 0) return;
    const brand = kitBrand === 'Outra' ? '' : kitBrand;
    const kitItems: Array<Omit<GuidedLine, 'id' | 'environment'>> = [
      {
        kind: 'kit',
        description: 'Chassis/suporte 4x2 para tomada dupla',
        quantity: outlets,
        unitValue: 0,
        itemType: 'material',
        destination: kitDestination,
        note: 'Gerado automaticamente por kit de tomada dupla 4x2.',
        brand,
      },
      {
        kind: 'kit',
        description: 'Módulo de tomada 2P+T',
        quantity: outlets * 2,
        unitValue: 0,
        itemType: 'material',
        destination: kitDestination,
        note: 'Tomada dupla: 2 módulos por ponto.',
        brand,
      },
      {
        kind: 'kit',
        description: 'Placa 4x2 dupla para tomada',
        quantity: outlets,
        unitValue: 0,
        itemType: 'material',
        destination: kitDestination,
        note: 'Uma placa dupla por tomada dupla.',
        brand,
      },
    ];
    setFeedback(null);
    setLines((current) => [...kitItems.map((item) => ({ ...item, id: createId('kit-double-outlet'), environment: activeEnvironment })), ...current]);
  }

  function sendAll() {
    if (lines.length === 0) return;
    onSendToBudget(lines.map(makeCapture));
    setFeedback(`${lines.length} item(ns) enviados para o fluxo escolhido.`);
    setLines([]);
  }

  return (
    <section className="guided-cart-panel">
      <div className="guided-cart-header">
        <div>
          <h2>Orçamento guiado por ambiente</h2>
          <p>Monte mão de obra, peças e kits por cômodo. Use clique rápido, quantidade digitada e descrição livre.</p>
        </div>
        <div className="guided-cart-total">
          <span>{totalQuantity} item(ns)</span>
          <strong>{formatCurrency(totalValue)}</strong>
        </div>
      </div>

      <div className="guided-manual-block-card">
        <div>
          <strong>Ambiente atual</strong>
          <small>Escolha ou digite o cômodo/setor. Tudo que for adicionado entra vinculado a esse ambiente.</small>
        </div>
        <div className="guided-manual-grid">
          <label className="technical-edit-field"><span>Ambiente rápido</span><select value={environment} onChange={(event) => setEnvironment(event.target.value)}>{commonEnvironments.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="technical-edit-field guided-wide-field"><span>Ou digite outro ambiente</span><input value={customEnvironment} placeholder="Ex.: Corredor superior, suíte, área gourmet..." onChange={(event) => setCustomEnvironment(event.target.value)} /></label>
        </div>
      </div>

      {showCatalog && (
        <div className="guided-manual-block-card">
          <div>
            <strong>Mão de obra guiada</strong>
            <small>Clique para somar serviços. Ajuste quantidade e valor antes de adicionar.</small>
          </div>
          <div className="guided-service-grid">
            {laborTemplates.map((template) => (
              <article className="guided-service-card" key={template.id}>
                <div><strong>{template.title}</strong><small>{formatCurrency(template.defaultUnitValue)} / {template.unit}</small><small>{template.note}</small></div>
                <div className="guided-service-controls">
                  <label className="guided-typed-quantity"><span>Qtd.</span><input inputMode="decimal" value={laborQuantityById[template.id] ?? '1'} onChange={(event) => setLaborQuantityById((current) => ({ ...current, [template.id]: event.target.value }))} /></label>
                  <label className="guided-typed-quantity"><span>Valor</span><input inputMode="decimal" value={laborValueById[template.id] ?? String(template.defaultUnitValue)} onChange={(event) => setLaborValueById((current) => ({ ...current, [template.id]: event.target.value }))} /></label>
                  <button className="primary-action inline-action" type="button" onClick={() => addLabor(template)}>Adicionar</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {showParts && (
        <>
          <div className="guided-manual-block-card">
            <div>
              <strong>Kit automático: tomada dupla 4x2</strong>
              <small>Informe quantas tomadas duplas existem no ambiente. O app gera chassis, módulos e placas automaticamente.</small>
            </div>
            <div className="guided-manual-grid">
              <label className="technical-edit-field"><span>Tomadas duplas</span><input inputMode="decimal" value={kitDoubleOutletQty} onChange={(event) => setKitDoubleOutletQty(event.target.value)} /></label>
              <label className="technical-edit-field"><span>Marca desejada</span><select value={kitBrand} onChange={(event) => setKitBrand(event.target.value)}>{kitBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
              <label className="technical-edit-field"><span>Destino</span><select value={kitDestination} onChange={(event) => setKitDestination(event.target.value as CalculationDestination)}><option value="survey">Levantamento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label>
            </div>
            <button className="primary-action inline-action" type="button" onClick={addDoubleOutletKit}>Gerar kit de tomadas</button>
          </div>

          <div className="guided-manual-block-card">
            <div>
              <strong>Peça/material manual</strong>
              <small>Digite qualquer material, marca, modelo, quantidade e valor. Depois poderemos conectar com catálogos online.</small>
            </div>
            <div className="guided-manual-grid">
              <label className="technical-edit-field guided-wide-field"><span>Descrição da peça</span><input value={manualPart.title} placeholder="Ex.: chassis 4x2, tomada 20A, placa dupla, disjuntor bipolar..." onChange={(event) => setManualPart((current) => ({ ...current, title: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Marca</span><input value={manualPart.brand} placeholder="Ex.: Margirius" onChange={(event) => setManualPart((current) => ({ ...current, brand: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Modelo/ref.</span><input value={manualPart.model} placeholder="Opcional" onChange={(event) => setManualPart((current) => ({ ...current, model: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Quantidade</span><input inputMode="decimal" value={manualPart.quantity} onChange={(event) => setManualPart((current) => ({ ...current, quantity: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Valor unitário</span><input inputMode="decimal" value={manualPart.unitValue} placeholder="0,00" onChange={(event) => setManualPart((current) => ({ ...current, unitValue: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Destino</span><select value={manualPart.destination} onChange={(event) => setManualPart((current) => ({ ...current, destination: event.target.value as CalculationDestination }))}><option value="survey">Levantamento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label>
              <label className="technical-edit-field guided-wide-field"><span>Observação</span><textarea value={manualPart.note} placeholder="Ex.: cliente prefere linha branca, confirmar disponibilidade, usar 20A na cozinha..." onChange={(event) => setManualPart((current) => ({ ...current, note: event.target.value }))} /></label>
            </div>
            <button className="primary-action inline-action" type="button" onClick={addManualPart}>Adicionar peça manual</button>
          </div>

          <div className="parts-catalog-panel">
            <div className="parts-search-grid">
              <label className="technical-edit-field parts-search-wide"><span>Buscar na base interna</span><input value={partQuery} placeholder="Ex.: tomada 20A, disjuntor bipolar, contator WEG..." onChange={(event) => setPartQuery(event.target.value)} /></label>
              <label className="technical-edit-field"><span>Marca</span><select value={partBrand} onChange={(event) => setPartBrand(event.target.value)}><option value="">Todas</option>{catalogPartBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
              <label className="technical-edit-field"><span>Categoria</span><select value={partCategory} onChange={(event) => setPartCategory(event.target.value)}><option value="">Todas</option>{catalogPartCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
            </div>
            <div className="parts-results-header"><strong>{partResults.length} peça(s) encontrada(s)</strong><small>Base interna inicial. Busca online por fabricante entra em fase posterior.</small></div>
            <div className="parts-result-list">
              {partResults.map((part) => (
                <article className="part-result-card" key={part.id}>
                  <div className="part-result-main"><span>{part.brand}</span><strong>{part.title}</strong><small>{[part.line, part.category, part.subcategory, part.current, part.voltage].filter(Boolean).join(' · ')}</small>{part.description && <small>{part.description}</small>}</div>
                  <div className="part-result-controls"><button className="primary-action inline-action" type="button" onClick={() => addCatalogPart(part)}>Adicionar</button></div>
                </article>
              ))}
            </div>
          </div>
        </>
      )}

      {showManual && mode === 'manual' && (
        <div className="guided-manual-block-card">
          <div><strong>Bloco manual rápido</strong><small>Para observações livres, use a aba Peças ou Serviços com descrição personalizada nesta nova estrutura.</small></div>
        </div>
      )}

      <div className="guided-cart-summary">
        <strong>Itens montados neste ambiente/orçamento</strong>
        {lines.length === 0 ? <small>Nenhum item adicionado ainda.</small> : <div>{lines.map((line) => <span key={line.id}>{line.environment}: {line.quantity}× {line.description} · {formatCurrency(lineTotal(line))}</span>)}</div>}
      </div>

      {lines.length > 0 && (
        <div className="parts-result-list">
          {lines.map((line) => (
            <article className="part-result-card active" key={line.id}>
              <div className="part-result-main"><span>{line.environment} · {kindLabel(line.kind)}</span><strong>{line.description}</strong><small>{line.brand ? `${line.brand}${line.model ? ` · ${line.model}` : ''}` : line.note}</small></div>
              <div className="part-result-controls">
                <label className="guided-typed-quantity"><span>Qtd.</span><input inputMode="decimal" value={String(line.quantity)} onChange={(event) => updateLineQuantity(line.id, event.target.value)} /></label>
                <label className="guided-typed-quantity"><span>Valor</span><input inputMode="decimal" value={String(line.unitValue)} onChange={(event) => updateLineUnitValue(line.id, event.target.value)} /></label>
                <button className="danger-action" type="button" onClick={() => removeLine(line.id)}>Remover</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="guided-cart-actions">
        <button className="primary-action inline-action" type="button" disabled={lines.length === 0} onClick={sendAll}>Enviar itens ao fluxo</button>
        <button className="secondary-action inline-action" type="button" disabled={lines.length === 0} onClick={() => setLines([])}>Limpar itens</button>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
