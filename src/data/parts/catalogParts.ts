export type CatalogPartSource = 'internal' | 'catalog' | 'manual';

export interface CatalogPart {
  id: string;
  brand: string;
  line?: string;
  category: string;
  subcategory?: string;
  title: string;
  model?: string;
  sku?: string;
  unit: string;
  description?: string;
  voltage?: string;
  current?: string;
  poles?: string;
  color?: string;
  application?: string;
  imageUrl?: string;
  source: CatalogPartSource;
  sourceUrl?: string;
  estimatedPrice?: number;
  keywords: string[];
}

export const catalogParts: CatalogPart[] = [
  {
    id: 'fabricante-a-tomada-modulo-2pt-20a-branca',
    brand: 'Fabricante A',
    line: 'Linha modular',
    category: 'Tomadas e módulos',
    subcategory: 'Tomada 2P+T',
    title: 'Módulo tomada 2P+T 20A branco',
    unit: 'un',
    description: 'Tomada modular 2P+T 20A para uso residencial e comercial leve.',
    voltage: '250 V',
    current: '20 A',
    color: 'Branco',
    application: 'Pontos de tomada de uso específico ou tomadas de maior corrente.',
    source: 'internal',
    estimatedPrice: 18.5,
    keywords: ['tomada', 'modulo', '2p+t', '20a', 'branca', 'fabricante-a'],
  },
  {
    id: 'fabricante-a-disjuntor-din-bipolar-32a',
    brand: 'Fabricante A',
    line: 'Acti9 / DIN',
    category: 'Proteção elétrica',
    subcategory: 'Disjuntor DIN',
    title: 'Disjuntor DIN bipolar 32A curva C',
    unit: 'un',
    description: 'Disjuntor bipolar para circuitos de maior potência, como chuveiros e cargas dedicadas.',
    voltage: '127/220 V',
    current: '32 A',
    poles: '2P',
    application: 'Proteção de circuito bifásico ou fase-neutro conforme projeto.',
    source: 'internal',
    estimatedPrice: 46.9,
    keywords: ['disjuntor', 'din', 'bipolar', '32a', 'curva c', 'fabricante-a'],
  },
  {
    id: 'fabricante-a-dps-classe-ii-275v',
    brand: 'Fabricante A',
    line: 'DIN',
    category: 'Proteção elétrica',
    subcategory: 'DPS',
    title: 'DPS classe II 275V',
    unit: 'un',
    description: 'Dispositivo de proteção contra surtos para quadros elétricos.',
    voltage: '275 V',
    application: 'Proteção contra surtos transitórios no quadro de distribuição.',
    source: 'internal',
    estimatedPrice: 62.0,
    keywords: ['dps', 'surto', 'proteção', 'classe ii', '275v', 'fabricante-a'],
  },
  {
    id: 'fabricante-b-interruptor-paralelo-modulo-branco',
    brand: 'Fabricante B',
    line: 'Linha modular',
    category: 'Interruptores e comandos',
    subcategory: 'Interruptor paralelo',
    title: 'Módulo interruptor paralelo branco',
    unit: 'un',
    description: 'Interruptor paralelo modular para comando de iluminação em dois pontos.',
    color: 'Branco',
    application: 'Iluminação com comando paralelo em quartos, salas e corredores.',
    source: 'internal',
    estimatedPrice: 12.9,
    keywords: ['interruptor', 'paralelo', 'modulo', 'branco', 'fabricante-b'],
  },
  {
    id: 'fabricante-b-tomada-modulo-2pt-10a-branca',
    brand: 'Fabricante B',
    line: 'Linha modular',
    category: 'Tomadas e módulos',
    subcategory: 'Tomada 2P+T',
    title: 'Módulo tomada 2P+T 10A branco',
    unit: 'un',
    description: 'Tomada modular 10A para pontos de uso geral.',
    voltage: '250 V',
    current: '10 A',
    color: 'Branco',
    application: 'Pontos de tomada de uso geral.',
    source: 'internal',
    estimatedPrice: 10.5,
    keywords: ['tomada', 'modulo', '2p+t', '10a', 'branca', 'fabricante-b'],
  },
  {
    id: 'fabricante-b-placa-4x2-dupla-branca',
    brand: 'Fabricante B',
    line: 'Linha modular',
    category: 'Acabamento',
    subcategory: 'Placa 4x2',
    title: 'Placa 4x2 para 2 módulos branca',
    unit: 'un',
    description: 'Placa de acabamento 4x2 para dois módulos.',
    color: 'Branco',
    application: 'Acabamento de tomadas e interruptores modulares.',
    source: 'internal',
    estimatedPrice: 8.9,
    keywords: ['placa', '4x2', '2 módulos', 'acabamento', 'branca', 'fabricante-b'],
  },
  {
    id: 'fabricante-c-condulete-aluminio-3-4',
    brand: 'Fabricante C',
    line: 'Conduletes',
    category: 'Infraestrutura',
    subcategory: 'Condulete',
    title: 'Condulete alumínio 3/4"',
    unit: 'un',
    description: 'Condulete de alumínio para instalações aparentes.',
    application: 'Instalação aparente em áreas técnicas, externas ou comerciais.',
    source: 'internal',
    estimatedPrice: 22.0,
    keywords: ['condulete', 'aluminio', '3/4', 'aparente', 'fabricante-c'],
  },
  {
    id: 'fabricante-c-canaleta-20x10-branca',
    brand: 'Fabricante C',
    line: 'Canaletas',
    category: 'Infraestrutura',
    subcategory: 'Canaleta',
    title: 'Canaleta PVC 20x10 branca',
    unit: 'm',
    description: 'Canaleta de PVC para passagem aparente de cabos.',
    color: 'Branco',
    application: 'Infraestrutura aparente para tomadas, iluminação e baixa tensão.',
    source: 'internal',
    estimatedPrice: 7.5,
    keywords: ['canaleta', 'pvc', '20x10', 'branca', 'fabricante-c'],
  },
  {
    id: 'fabricante-c-caixa-sobrepor-4x2-branca',
    brand: 'Fabricante C',
    line: 'Sobrepor',
    category: 'Infraestrutura',
    subcategory: 'Caixa sobrepor',
    title: 'Caixa sobrepor 4x2 branca',
    unit: 'un',
    description: 'Caixa de sobrepor para instalação aparente de módulos 4x2.',
    color: 'Branco',
    application: 'Pontos aparentes em paredes sem embutir caixinha.',
    source: 'internal',
    estimatedPrice: 9.8,
    keywords: ['caixa', 'sobrepor', '4x2', 'branca', 'fabricante-c'],
  },
  {
    id: 'fabricante-d-contator-cwb9-220v',
    brand: 'Fabricante D',
    line: 'CWB',
    category: 'Automação e comando',
    subcategory: 'Contator',
    title: 'Contator Fabricante D CWB9 bobina 220V',
    model: 'CWB9',
    unit: 'un',
    description: 'Contator compacto para comando de cargas elétricas.',
    voltage: '220 V',
    application: 'Comando de motores, bombas e cargas em painéis elétricos.',
    source: 'internal',
    estimatedPrice: 89.0,
    keywords: ['contator', 'cwb9', 'bobina', '220v', 'fabricante-d'],
  },
  {
    id: 'fabricante-d-rele-termico-rw17-1d6-2d5a',
    brand: 'Fabricante D',
    line: 'RW17',
    category: 'Automação e comando',
    subcategory: 'Relé térmico',
    title: 'Relé térmico Fabricante D RW17 1,6–2,5A',
    model: 'RW17',
    unit: 'un',
    description: 'Relé térmico para proteção de motores contra sobrecarga.',
    current: '1,6–2,5 A',
    application: 'Proteção de motores em painéis de comando.',
    source: 'internal',
    estimatedPrice: 76.0,
    keywords: ['rele termico', 'rw17', 'motor', 'sobrecarga', 'fabricante-d'],
  },
  {
    id: 'fabricante-d-disjuntor-motor-mp16-4a',
    brand: 'Fabricante D',
    line: 'MPW',
    category: 'Automação e comando',
    subcategory: 'Disjuntor motor',
    title: 'Disjuntor motor Fabricante D MPW ajuste até 4A',
    unit: 'un',
    description: 'Disjuntor motor para proteção e manobra de motores pequenos.',
    current: 'até 4 A',
    application: 'Painéis de comando e proteção de motores.',
    source: 'internal',
    estimatedPrice: 128.0,
    keywords: ['disjuntor motor', 'mpw', 'motor', '4a', 'fabricante-d'],
  },
];

export const catalogPartBrands = Array.from(new Set(catalogParts.map((part) => part.brand))).sort((a, b) => a.localeCompare(b));
export const catalogPartCategories = Array.from(new Set(catalogParts.map((part) => part.category))).sort((a, b) => a.localeCompare(b));

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchCatalogParts(query: string, brand: string, category: string): CatalogPart[] {
  const normalizedQuery = normalizeSearch(query);

  return catalogParts.filter((part) => {
    const brandMatches = !brand || part.brand === brand;
    const categoryMatches = !category || part.category === category;

    if (!brandMatches || !categoryMatches) return false;
    if (!normalizedQuery) return true;

    const searchableText = normalizeSearch([
      part.brand,
      part.line,
      part.category,
      part.subcategory,
      part.title,
      part.model,
      part.sku,
      part.description,
      part.voltage,
      part.current,
      part.poles,
      part.color,
      part.application,
      ...part.keywords,
    ].filter(Boolean).join(' '));

    return searchableText.includes(normalizedQuery);
  });
}
