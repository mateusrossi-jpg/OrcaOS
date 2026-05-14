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
type KitId = 'simple-outlet-4x2' | 'double-outlet-4x2' | 'simple-switch-4x2' | 'lighting-point' | 'spot-led' | 'ac-dedicated-circuit' | 'external-outlet';

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

interface KitTemplate {
  id: KitId;
  title: string;
  description: string;
  defaultQuantity: string;
  generate: (quantity: number, brand: string, destination: CalculationDestination) => Array<Omit<GuidedLine, 'id' | 'environment'>>;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const commonEnvironments = ['Sala', 'Cozinha', 'Quarto', 'Banheiro', 'Área externa', 'Garagem', 'Escritório'];
const kitBrands = ['Fabricante B', 'Fabricante C', 'Fabricante A', 'Fabricante D', 'Fabricante E', 'Fabricante F', 'Outra'];

const laborTemplates: LaborTemplate[] = [
  { id: 'tomada-circuito', title: 'Lançamento de circuito de tomada', defaultUnitValue: 120, unit: 'ponto', note: 'Passagem/lançamento de circuito de tomada conforme campo.' },
  { id: 'tomada-troca', title: 'Troca/instalação de tomada', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação ou substituição de tomada, considerar material à parte.' },
  { id: 'spot-led', title: 'Instalação de spot/lâmpada', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação de spot, luminária simples ou ponto de iluminação.' },
  { id: 'lustre', title: 'Instalação de lustre/luminária decorativa', defaultUnitValue: 120, unit: 'un.', note: 'Instalação de lustre/luminária decorativa, validar peso, altura e fixação.' },
  { id: 'interruptor', title: 'Instalação de interruptor', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação/substituição de interruptor simples, paralelo ou intermediário.' },
  { id: 'disjuntor', title: 'Instalação de disjuntor/circuito no quadro', defaultUnitValue: 95, unit: 'circuito', note: 'Serviço no quadro, validar espaço, barramentos, DR/DPS e segurança.' },
  { id: 'canaleta', title: 'Instalação de canaleta aparente', defaultUnitValue: 18, unit: 'm', note: 'Instalação aparente por metro linear, sem considerar material.' },
  { id: 'ponto-rede', title: 'Ponto de infraestrutura técnica', defaultUnitValue: 95, unit: 'ponto', note: 'Instalação de ponto de infraestrutura, validar cabo, conector e teste.' },
];

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
  if (destination === 'survey') return 'Atendimento';
  if (destination === 'budget') return 'Orçamento';
  return 'Atendimento e orçamento';
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

function material(description: string, quantity: number, destination: CalculationDestination, note: string, brand?: string): Omit<GuidedLine, 'id' | 'environment'> {
  return { kind: 'kit', description, quantity, unitValue: 0, itemType: 'material', destination, note, brand };
}

function service(description: string, quantity: number, unitValue: number, destination: CalculationDestination, note: string): Omit<GuidedLine, 'id' | 'environment'> {
  return { kind: 'kit', description, quantity, unitValue, itemType: 'service', destination, note };
}

const kitTemplates: KitTemplate[] = [
  {
    id: 'simple-outlet-4x2',
    title: 'Tomada simples 4x2',
    description: 'Gera suporte/chassis, 1 módulo de tomada e 1 placa simples por ponto.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      material('Chassis/suporte 4x2 para tomada simples', q, destination, 'Gerado por kit de tomada simples 4x2.', brand),
      material('Módulo de tomada 2P+T', q, destination, 'Tomada simples: 1 módulo por ponto.', brand),
      material('Placa 4x2 simples para tomada', q, destination, 'Uma placa simples por tomada.', brand),
      service('Mão de obra: instalação de tomada simples', q, 45, destination, 'Serviço sugerido pelo kit. Ajuste valor conforme obra.'),
    ],
  },
  {
    id: 'double-outlet-4x2',
    title: 'Tomada dupla 4x2',
    description: 'Gera suporte/chassis, 2 módulos de tomada e 1 placa dupla por ponto.',
    defaultQuantity: '4',
    generate: (q, brand, destination) => [
      material('Chassis/suporte 4x2 para tomada dupla', q, destination, 'Gerado por kit de tomada dupla 4x2.', brand),
      material('Módulo de tomada 2P+T', q * 2, destination, 'Tomada dupla: 2 módulos por ponto.', brand),
      material('Placa 4x2 dupla para tomada', q, destination, 'Uma placa dupla por tomada dupla.', brand),
      service('Mão de obra: instalação de tomada dupla', q, 55, destination, 'Serviço sugerido pelo kit. Ajuste valor conforme obra.'),
    ],
  },
  {
    id: 'simple-switch-4x2',
    title: 'Interruptor simples 4x2',
    description: 'Gera suporte/chassis, módulo interruptor simples e placa.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      material('Chassis/suporte 4x2 para interruptor', q, destination, 'Gerado por kit de interruptor simples.', brand),
      material('Módulo interruptor simples', q, destination, 'Um módulo interruptor simples por ponto.', brand),
      material('Placa 4x2 para interruptor simples', q, destination, 'Uma placa por ponto de interruptor.', brand),
      service('Mão de obra: instalação de interruptor simples', q, 45, destination, 'Serviço sugerido pelo kit. Ajuste valor conforme obra.'),
    ],
  },
  {
    id: 'lighting-point',
    title: 'Ponto de iluminação',
    description: 'Gera serviço de ponto de luz, conector e observação para luminária/lâmpada.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      service('Mão de obra: instalação de ponto de iluminação', q, 65, destination, 'Serviço para ponto de luz. Confirmar fiação, interruptor e acabamento.'),
      material('Conector de emenda para iluminação', q, destination, 'Conector sugerido para ligação segura do ponto.', brand),
      material('Lâmpada/luminária a definir', q, destination, 'Item placeholder: definir modelo com o cliente.', brand),
    ],
  },
  {
    id: 'spot-led',
    title: 'Spot LED',
    description: 'Gera spot, conector e serviço de instalação por unidade.',
    defaultQuantity: '4',
    generate: (q, brand, destination) => [
      material('Spot LED de embutir/sobrepor a definir', q, destination, 'Definir potência, cor da luz e modelo do spot.', brand),
      material('Conector de emenda para spot LED', q, destination, 'Conector sugerido para ligação do spot.', brand),
      service('Mão de obra: instalação de spot LED', q, 45, destination, 'Serviço sugerido pelo kit. Ajuste valor conforme acesso e acabamento.'),
    ],
  },
  {
    id: 'ac-dedicated-circuit',
    title: 'Circuito dedicado ar-condicionado',
    description: 'Gera serviço, disjuntor, tomada/isolador e placeholders de cabo/infra.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      service('Mão de obra: circuito dedicado para ar-condicionado', q, 180, destination, 'Validar potência, distância, bitola, disjuntor, DR e padrão do fabricante.'),
      material('Disjuntor para circuito dedicado de ar-condicionado', q, destination, 'Definir corrente/polos após dimensionamento.', brand),
      material('Tomada/isolador para ar-condicionado', q, destination, 'Definir padrão conforme equipamento e instalação.', brand),
      material('Cabo elétrico para circuito dedicado', q, destination, 'Placeholder: calcular metragem e seção pelo projeto.', brand),
      material('Infraestrutura aparente/embutida para circuito', q, destination, 'Placeholder: definir eletroduto/canaleta/conduíte conforme local.', brand),
    ],
  },
  {
    id: 'external-outlet',
    title: 'Tomada externa aparente',
    description: 'Gera caixa externa/sobrepor, tomada, placa/tampa e serviço.',
    defaultQuantity: '1',
    generate: (q, brand, destination) => [
      material('Caixa/tomada externa aparente com proteção', q, destination, 'Escolher grau de proteção conforme exposição à água/sol.', brand),
      material('Módulo de tomada 2P+T para área externa', q, destination, 'Definir 10A ou 20A conforme uso.', brand),
      material('Tampa/placa para tomada externa', q, destination, 'Acabamento com proteção adequada ao ambiente.', brand),
      service('Mão de obra: instalação de tomada externa', q, 75, destination, 'Validar vedação, altura, percurso dos cabos e proteção do circuito.'),
    ],
  },
];

function makeCapture(line: GuidedLine): CalculationCapture {
  const subtotal = lineTotal(line);
  return {
    id: createId('guided-budget'),
    module: 'orcamentoTecnico',
    moduleLabel: 'Orçamento',
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
      line.note ? `Observação: ${line.note}` : 'Origem: orçamento por ambiente',
    ],
    itemType: line.itemType,
    editableDescription: `${line.environment} - ${line.description}`,
    technicalNote: line.note || 'Item criado no orçamento por ambiente.',
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
  const [selectedKitId, setSelectedKitId] = useState<KitId>('double-outlet-4x2');
  const [kitQuantity, setKitQuantity] = useState('4');
  const [kitBrand, setKitBrand] = useState('Fabricante B');
  const [kitDestination, setKitDestination] = useState<CalculationDestination>('both');

  const activeEnvironment = customEnvironment.trim() || environment;
  const showManual = mode === 'manual' || mode === 'all';
  const showCatalog = mode === 'catalog' || mode === 'all';
  const showParts = mode === 'parts' || mode === 'all';
  const partResults = useMemo(() => searchCatalogParts(partQuery, partBrand, partCategory), [partBrand, partCategory, partQuery]);
  const selectedKit = kitTemplates.find((kit) => kit.id === selectedKitId) ?? kitTemplates[0];
  const totalValue = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  function addLine(line: Omit<GuidedLine, 'id' | 'environment'> & { environment?: string }) {
    setFeedback(null);
    setLines((current) => [{ ...line, id: createId('guided-line'), environment: line.environment || activeEnvironment }, ...current]);
  }

  function addLines(nextLines: Array<Omit<GuidedLine, 'id' | 'environment'>>) {
    setFeedback(null);
    setLines((current) => [
      ...nextLines.map((line) => ({ ...line, id: createId('guided-kit-line'), environment: activeEnvironment })),
      ...current,
    ]);
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

  function duplicateLine(line: GuidedLine) {
    setLines((current) => [{ ...line, id: createId('copy-guided-line') }, ...current]);
  }

  function addLabor(template: LaborTemplate) {
    const quantity = parseDecimal(laborQuantityById[template.id] ?? '1', 1);
    const unitValue = parseDecimal(laborValueById[template.id] ?? String(template.defaultUnitValue), template.defaultUnitValue);
    if (quantity <= 0) return;
    addLine({ kind: 'labor', description: template.title, quantity, unitValue, itemType: 'service', destination: 'budget', note: `${template.note} Unidade: ${template.unit}.` });
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
      note: manualPart.note.trim() || 'Peça/material criado manualmente no orçamento.',
      brand: manualPart.brand.trim(),
      model: manualPart.model.trim(),
    });
    setManualPart(emptyManualPart);
  }

  function addCatalogPart(part: CatalogPart) {
    addLine({ kind: 'catalog-part', description: part.title, quantity: 1, unitValue: part.estimatedPrice ?? 0, itemType: 'material', destination: 'both', note: partNote(part), brand: part.brand, model: part.model });
  }

  function addSelectedKit() {
    const quantity = parseDecimal(kitQuantity, parseDecimal(selectedKit.defaultQuantity, 1));
    if (quantity <= 0) return;
    const brand = kitBrand === 'Outra' ? '' : kitBrand;
    addLines(selectedKit.generate(quantity, brand, kitDestination));
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
          <h2>Orçamento por ambiente</h2>
          <p>Monte mão de obra, peças e kits por cômodo. Use clique rápido, quantidade digitada, catálogo e descrição livre.</p>
        </div>
        <div className="guided-cart-total"><span>{totalQuantity} item(ns)</span><strong>{formatCurrency(totalValue)}</strong></div>
      </div>

      <div className="guided-manual-block-card">
        <div><strong>Ambiente atual</strong><small>Escolha ou digite o cômodo/setor. Tudo que for adicionado entra vinculado a esse ambiente.</small></div>
        <div className="guided-manual-grid">
          <label className="technical-edit-field"><span>Ambiente rápido</span><select value={environment} onChange={(event) => setEnvironment(event.target.value)}>{commonEnvironments.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="technical-edit-field guided-wide-field"><span>Ou digite outro ambiente</span><input value={customEnvironment} placeholder="Ex.: Corredor superior, suíte, área gourmet..." onChange={(event) => setCustomEnvironment(event.target.value)} /></label>
        </div>
      </div>

      {showCatalog && (
        <div className="guided-manual-block-card">
          <div><strong>Mão de obra</strong><small>Clique para somar serviços. Ajuste quantidade e valor antes de adicionar.</small></div>
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
            <div><strong>Kits automáticos</strong><small>Escolha o kit, informe a quantidade e gere materiais + serviços sugeridos por ambiente.</small></div>
            <div className="guided-manual-grid">
              <label className="technical-edit-field guided-wide-field"><span>Kit</span><select value={selectedKitId} onChange={(event) => { const id = event.target.value as KitId; setSelectedKitId(id); setKitQuantity(kitTemplates.find((kit) => kit.id === id)?.defaultQuantity ?? '1'); }}>{kitTemplates.map((kit) => <option key={kit.id} value={kit.id}>{kit.title}</option>)}</select></label>
              <label className="technical-edit-field"><span>Quantidade</span><input inputMode="decimal" value={kitQuantity} onChange={(event) => setKitQuantity(event.target.value)} /></label>
              <label className="technical-edit-field"><span>Marca desejada</span><select value={kitBrand} onChange={(event) => setKitBrand(event.target.value)}>{kitBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
              <label className="technical-edit-field"><span>Destino</span><select value={kitDestination} onChange={(event) => setKitDestination(event.target.value as CalculationDestination)}><option value="survey">Atendimento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label>
            </div>
            <div className="guided-cart-summary"><strong>{selectedKit.title}</strong><small>{selectedKit.description}</small></div>
            <button className="primary-action inline-action" type="button" onClick={addSelectedKit}>Gerar kit selecionado</button>
          </div>

          <div className="guided-manual-block-card">
            <div><strong>Peça/material manual</strong><small>Digite qualquer material, marca, modelo, quantidade e valor. Depois poderemos conectar com catálogos online.</small></div>
            <div className="guided-manual-grid">
              <label className="technical-edit-field guided-wide-field"><span>Descrição da peça</span><input value={manualPart.title} placeholder="Ex.: chassis 4x2, tomada 20A, placa dupla, disjuntor bipolar..." onChange={(event) => setManualPart((current) => ({ ...current, title: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Marca</span><input value={manualPart.brand} placeholder="Ex.: Fabricante B" onChange={(event) => setManualPart((current) => ({ ...current, brand: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Modelo/ref.</span><input value={manualPart.model} placeholder="Opcional" onChange={(event) => setManualPart((current) => ({ ...current, model: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Quantidade</span><input inputMode="decimal" value={manualPart.quantity} onChange={(event) => setManualPart((current) => ({ ...current, quantity: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Valor unitário</span><input inputMode="decimal" value={manualPart.unitValue} placeholder="0,00" onChange={(event) => setManualPart((current) => ({ ...current, unitValue: event.target.value }))} /></label>
              <label className="technical-edit-field"><span>Destino</span><select value={manualPart.destination} onChange={(event) => setManualPart((current) => ({ ...current, destination: event.target.value as CalculationDestination }))}><option value="survey">Atendimento</option><option value="budget">Orçamento</option><option value="both">Ambos</option></select></label>
              <label className="technical-edit-field guided-wide-field"><span>Observação</span><textarea value={manualPart.note} placeholder="Ex.: cliente prefere linha branca, confirmar disponibilidade, usar 20A na cozinha..." onChange={(event) => setManualPart((current) => ({ ...current, note: event.target.value }))} /></label>
            </div>
            <button className="primary-action inline-action" type="button" onClick={addManualPart}>Adicionar peça manual</button>
          </div>

          <div className="parts-catalog-panel">
            <div className="parts-search-grid">
              <label className="technical-edit-field parts-search-wide"><span>Buscar na base interna</span><input value={partQuery} placeholder="Ex.: tomada 20A, disjuntor bipolar, contator Fabricante D..." onChange={(event) => setPartQuery(event.target.value)} /></label>
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

      {showManual && mode === 'manual' && <div className="guided-manual-block-card"><div><strong>Bloco manual rápido</strong><small>Para observações livres, use a aba Peças ou Serviços com descrição personalizada nesta estrutura.</small></div></div>}

      <div className="guided-cart-summary"><strong>Itens montados neste ambiente/orçamento</strong>{lines.length === 0 ? <small>Nenhum item adicionado ainda.</small> : <div>{lines.map((line) => <span key={line.id}>{line.environment}: {line.quantity}× {line.description} · {formatCurrency(lineTotal(line))}</span>)}</div>}</div>

      {lines.length > 0 && (
        <div className="parts-result-list">
          {lines.map((line) => (
            <article className="part-result-card active" key={line.id}>
              <div className="part-result-main"><span>{line.environment} · {kindLabel(line.kind)}</span><strong>{line.description}</strong><small>{line.brand ? `${line.brand}${line.model ? ` · ${line.model}` : ''}` : line.note}</small></div>
              <div className="part-result-controls">
                <label className="guided-typed-quantity"><span>Qtd.</span><input inputMode="decimal" value={String(line.quantity)} onChange={(event) => updateLineQuantity(line.id, event.target.value)} /></label>
                <label className="guided-typed-quantity"><span>Valor</span><input inputMode="decimal" value={String(line.unitValue)} onChange={(event) => updateLineUnitValue(line.id, event.target.value)} /></label>
                <button className="secondary-action inline-action" type="button" onClick={() => duplicateLine(line)}>Duplicar</button>
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
