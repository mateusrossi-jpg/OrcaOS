export interface GuidedLaborTemplate {
  id: string;
  title: string;
  defaultUnitValue: number;
  unit: string;
  note: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  custom?: boolean;
}

export interface GuidedLaborTemplateInput {
  title: string;
  defaultUnitValue: number;
  unit: string;
  note: string;
  visible?: boolean;
}

const STORAGE_KEY = 'orcaos:guided-labor-templates:v1';
const STARTER_TIMESTAMP = '2026-01-01T00:00:00.000Z';

export const starterGuidedLaborTemplates: GuidedLaborTemplate[] = [
  { id: 'tomada-circuito', title: 'Lançamento de circuito de tomada', defaultUnitValue: 120, unit: 'ponto', note: 'Passagem/lançamento de circuito de tomada conforme levantamento em campo.', visible: true, createdAt: STARTER_TIMESTAMP, updatedAt: STARTER_TIMESTAMP },
  { id: 'tomada-troca', title: 'Troca/instalação de tomada', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação ou substituição de tomada, considerar material à parte.', visible: true, createdAt: STARTER_TIMESTAMP, updatedAt: STARTER_TIMESTAMP },
  { id: 'spot-led', title: 'Instalação de spot/lâmpada', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação de spot, luminária simples ou ponto de iluminação.', visible: true, createdAt: STARTER_TIMESTAMP, updatedAt: STARTER_TIMESTAMP },
  { id: 'lustre', title: 'Instalação de lustre/luminária decorativa', defaultUnitValue: 120, unit: 'un.', note: 'Instalação de lustre/luminária decorativa, validar peso, altura e fixação.', visible: true, createdAt: STARTER_TIMESTAMP, updatedAt: STARTER_TIMESTAMP },
  { id: 'interruptor', title: 'Instalação de interruptor', defaultUnitValue: 45, unit: 'ponto', note: 'Instalação/substituição de interruptor simples, paralelo ou intermediário.', visible: true, createdAt: STARTER_TIMESTAMP, updatedAt: STARTER_TIMESTAMP },
  { id: 'disjuntor', title: 'Instalação de disjuntor/circuito no quadro', defaultUnitValue: 95, unit: 'circuito', note: 'Serviço no quadro, validar espaço, barramentos, DR/DPS e segurança.', visible: true, createdAt: STARTER_TIMESTAMP, updatedAt: STARTER_TIMESTAMP },
  { id: 'canaleta', title: 'Instalação de canaleta aparente', defaultUnitValue: 18, unit: 'm', note: 'Instalação aparente por metro linear, sem considerar material.', visible: true, createdAt: STARTER_TIMESTAMP, updatedAt: STARTER_TIMESTAMP },
  { id: 'ponto-rede', title: 'Ponto de rede/baixa tensão', defaultUnitValue: 95, unit: 'ponto', note: 'Instalação de ponto de rede/baixa tensão, validar cabo, conector e teste.', visible: true, createdAt: STARTER_TIMESTAMP, updatedAt: STARTER_TIMESTAMP },
];

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createGuidedLaborTemplateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `labor-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function normalizeTemplate(template: Partial<GuidedLaborTemplate>): GuidedLaborTemplate | null {
  if (typeof template.id !== 'string' || !template.id.trim()) return null;
  if (typeof template.title !== 'string' || !template.title.trim()) return null;
  if (typeof template.unit !== 'string' || !template.unit.trim()) return null;
  if (typeof template.note !== 'string') return null;
  if (typeof template.defaultUnitValue !== 'number' || !Number.isFinite(template.defaultUnitValue) || template.defaultUnitValue < 0) return null;

  const createdAt = typeof template.createdAt === 'string' ? template.createdAt : new Date().toISOString();
  const updatedAt = typeof template.updatedAt === 'string' ? template.updatedAt : createdAt;

  return {
    id: template.id.trim(),
    title: template.title.trim(),
    defaultUnitValue: template.defaultUnitValue,
    unit: template.unit.trim(),
    note: template.note.trim(),
    visible: typeof template.visible === 'boolean' ? template.visible : true,
    createdAt,
    updatedAt,
    custom: template.custom === true,
  };
}

function safeParseTemplates(value: string | null): GuidedLaborTemplate[] {
  if (!value) return starterGuidedLaborTemplates;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return starterGuidedLaborTemplates;
    const templates = parsed.map((item) => normalizeTemplate(item as Partial<GuidedLaborTemplate>)).filter((item): item is GuidedLaborTemplate => Boolean(item));
    return templates.length > 0 ? templates : starterGuidedLaborTemplates;
  } catch {
    return starterGuidedLaborTemplates;
  }
}

export function loadGuidedLaborTemplates(): GuidedLaborTemplate[] {
  if (!hasStorage()) return starterGuidedLaborTemplates;
  return safeParseTemplates(window.localStorage.getItem(STORAGE_KEY));
}

export function saveGuidedLaborTemplates(templates: GuidedLaborTemplate[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.map((template) => normalizeTemplate(template)).filter(Boolean)));
}

export function createGuidedLaborTemplate(input: GuidedLaborTemplateInput): GuidedLaborTemplate {
  const now = new Date().toISOString();
  return {
    id: createGuidedLaborTemplateId(),
    title: input.title.trim(),
    defaultUnitValue: Math.max(0, input.defaultUnitValue),
    unit: input.unit.trim() || 'un.',
    note: input.note.trim(),
    visible: input.visible ?? true,
    createdAt: now,
    updatedAt: now,
    custom: true,
  };
}
