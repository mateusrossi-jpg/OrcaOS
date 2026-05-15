import type { CalculationCapture, CalculationDestination, TechnicalItemType } from '../../../core/types/workflow';
import type { CatalogPart } from '../../../data/parts/catalogParts';
import type { GuidedEntryKind, GuidedLine } from '../types/guidedBudget';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function createId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function parseDecimal(value: string, fallback = 0): number {
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeKeyPart(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

export function guidedLineKey(line: GuidedLine): string {
  return [
    normalizeKeyPart(line.environment),
    line.kind,
    line.itemType,
    line.destination,
    normalizeKeyPart(line.description),
    normalizeKeyPart(line.brand),
    normalizeKeyPart(line.model),
    String(line.unitValue),
  ].join('|');
}

export function mergeLineInto(current: GuidedLine[], incoming: GuidedLine): GuidedLine[] {
  const incomingKey = guidedLineKey(incoming);
  const existingIndex = current.findIndex((line) => guidedLineKey(line) === incomingKey);

  if (existingIndex < 0) return [incoming, ...current];

  return current.map((line, index) => index === existingIndex ? { ...line, quantity: line.quantity + incoming.quantity } : line);
}

export function kindLabel(kind: GuidedEntryKind): string {
  if (kind === 'labor') return 'Mão de obra';
  if (kind === 'manual-part') return 'Peça manual';
  if (kind === 'catalog-part') return 'Peça de catálogo';
  return 'Kit automático';
}

export function destinationLabel(destination: CalculationDestination): string {
  if (destination === 'survey') return 'Atendimento';
  if (destination === 'budget') return 'Orçamento';
  return 'Atendimento e orçamento';
}

export function lineTotal(line: GuidedLine): number {
  return line.quantity * line.unitValue;
}

export function partNote(part: CatalogPart): string {
  return [part.brand, part.line, part.model ? `Modelo ${part.model}` : '', part.voltage, part.current, part.application].filter(Boolean).join(' · ');
}

export function makeCapture(line: GuidedLine): CalculationCapture {
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
