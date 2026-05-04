import { useMemo, useState } from 'react';
import {
  calculateAreaWithLoss,
  calculateBlocks,
  calculateConcreteVolume,
  calculateTiles,
  calculateWallArea,
} from '../../../core/calculations/trade';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import './GeneralCalculatorWorkspace.css';

type ConstructionMode = 'wall-area' | 'floor-area' | 'concrete-volume' | 'blocks-quantity' | 'floor-tiles';

interface Props {
  onCaptureCalculation?: (capture: CalculationCapture) => void;
}

interface ConstructionRule {
  mode: ConstructionMode;
  label: string;
  description: string;
  icon: string;
}

interface ResultCardData {
  label: string;
  value: string;
  helper?: string;
}

interface ConstructionResult {
  error: string | null;
  summary: string;
  details: string[];
  orientation: string;
  formula: string[];
  cards: ResultCardData[];
}

const rules: ConstructionRule[] = [
  { mode: 'wall-area', label: 'Área de parede', description: 'Calcule área líquida de parede com descontos de portas e janelas.', icon: '▥' },
  { mode: 'floor-area', label: 'Área de piso/teto', description: 'Calcule área retangular com perda para compra e orçamento.', icon: '▭' },
  { mode: 'concrete-volume', label: 'Volume de concreto', description: 'Calcule volume em m³ e sacos de cimento estimados.', icon: '◧' },
  { mode: 'blocks-quantity', label: 'Tijolos/blocos', description: 'Estime quantidade de blocos por área de parede.', icon: '▦' },
  { mode: 'floor-tiles', label: 'Piso/revestimento', description: 'Estime peças, caixas e perda para piso ou parede.', icon: '◫' },
];

const defaultValues: Record<string, string> = {
  width: '3',
  length: '4',
  height: '2.8',
  wallsQuantity: '4',
  discountArea: '2',
  lossPercent: '10',
  thicknessCm: '8',
  cementBagsPerM3: '7',
  blockWidthCm: '39',
  blockHeightCm: '19',
  tileWidthCm: '60',
  tileHeightCm: '60',
  piecesPerBox: '4',
};

function parseNumber(value: string): number {
  const normalizedValue = value.trim().replace(',', '.');
  return normalizedValue ? Number(normalizedValue) : Number.NaN;
}

function requirePositive(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Informe um valor maior que zero para ${label}.`);
  return value;
}

function requireNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Informe um valor válido para ${label}.`);
  return value;
}

function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function emptyResult(): ConstructionResult {
  return { error: null, summary: '', details: [], orientation: '', formula: [], cards: [] };
}

function result(summary: string, cards: ResultCardData[], details: string[], orientation: string, formula: string[]): ConstructionResult {
  return { error: null, summary, cards, details, orientation, formula };
}

function NumberField({ label, value, suffix, step = 0.01, onChange }: { label: string; value: string; suffix?: string; step?: number; onChange: (value: string) => void }) {
  return (
    <label className="general-form-field">
      <span>{label}</span>
      <div>
        <input type="number" inputMode="decimal" min="0" step={step} value={value} placeholder="Digite o valor" onFocus={handleNumericInputFocus} onChange={(event) => onChange(event.target.value)} />
        {suffix && <small className="technical-unit">{suffix}</small>}
      </div>
    </label>
  );
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return <article className="general-result-card"><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</article>;
}

export function ConstructionHumanWorkspace({ onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<ConstructionMode | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function n(key: string, label: string): number {
    return requirePositive(parseNumber(values[key] ?? ''), label);
  }

  function optionalN(key: string, label: string): number {
    const rawValue = values[key] ?? '';
    if (!rawValue.trim()) return 0;
    return requireNonNegative(parseNumber(rawValue), label);
  }

  const calculated = useMemo<ConstructionResult>(() => {
    if (!activeRule) return emptyResult();

    try {
      if (activeRule.mode === 'wall-area') {
        const width = n('width', 'largura da parede');
        const height = n('height', 'altura');
        const walls = n('wallsQuantity', 'quantidade de paredes');
        const discount = optionalN('discountArea', 'descontos');
        const { grossAreaM2: grossArea, netAreaM2: netArea } = calculateWallArea({ widthM: width, heightM: height, walls, discountAreaM2: discount });
        return result(
          `Área líquida de parede: ${round(netArea)} m²`,
          [
            { label: 'Área bruta', value: `${round(grossArea)} m²`, helper: 'largura × altura × paredes' },
            { label: 'Área líquida', value: `${round(netArea)} m²`, helper: 'descontando portas/janelas' },
          ],
          [`Largura: ${round(width)} m`, `Altura: ${round(height)} m`, `Paredes: ${round(walls)}`, `Área bruta: ${round(grossArea)} m²`, `Descontos: ${round(discount)} m²`, `Área líquida: ${round(netArea)} m²`],
          'Use a área líquida para pintura, revestimento ou orçamento. Desconte aberturas grandes e confira paredes com medidas diferentes separadamente.',
          ['Área bruta = largura × altura × quantidade de paredes', 'Área líquida = área bruta - descontos', 'O resultado mínimo considerado é 0 m² para evitar área negativa'],
        );
      }

      if (activeRule.mode === 'floor-area') {
        const width = n('width', 'largura');
        const length = n('length', 'comprimento');
        const loss = optionalN('lossPercent', 'perda');
        const { areaM2: area, totalAreaM2: purchaseArea } = calculateAreaWithLoss({ widthM: width, lengthM: length, lossPercent: loss });
        return result(
          `Área base: ${round(area)} m²`,
          [
            { label: 'Área base', value: `${round(area)} m²`, helper: 'largura × comprimento' },
            { label: 'Com perda', value: `${round(purchaseArea)} m²`, helper: `${round(loss)}% de perda` },
          ],
          [`Largura: ${round(width)} m`, `Comprimento: ${round(length)} m`, `Área base: ${round(area)} m²`, `Perda: ${round(loss)}%`, `Área com perda: ${round(purchaseArea)} m²`],
          'Use a área com perda para compra de material. Aumente a perda em recortes, paginação diagonal ou ambiente irregular.',
          ['Área base = largura × comprimento', 'Área com perda = área base × (1 + perda ÷ 100)'],
        );
      }

      if (activeRule.mode === 'concrete-volume') {
        const width = n('width', 'largura');
        const length = n('length', 'comprimento');
        const thicknessCm = n('thicknessCm', 'espessura');
        const bagsPerM3 = n('cementBagsPerM3', 'sacos por m³');
        const { cubicMeters: volume, bags } = calculateConcreteVolume({ widthM: width, lengthM: length, thicknessCm, bagsPerM3 });
        return result(
          `Volume de concreto: ${round(volume, 3)} m³`,
          [
            { label: 'Volume', value: `${round(volume, 3)} m³`, helper: 'área × espessura' },
            { label: 'Cimento', value: `${bags} saco(s)`, helper: `${round(bagsPerM3)} sacos/m³` },
          ],
          [`Largura: ${round(width)} m`, `Comprimento: ${round(length)} m`, `Espessura: ${round(thicknessCm)} cm`, `Volume: ${round(volume, 3)} m³`, `Sacos estimados: ${bags}`],
          'Use como estimativa inicial. Traço, brita, areia, perda, transporte e resistência exigida devem ser definidos conforme o serviço.',
          ['Espessura em metros = espessura em cm ÷ 100', 'Volume = largura × comprimento × espessura em metros', 'Sacos estimados = arredondar para cima(volume × sacos por m³)'],
        );
      }

      if (activeRule.mode === 'blocks-quantity') {
        const width = n('width', 'largura da parede');
        const height = n('height', 'altura');
        const walls = n('wallsQuantity', 'quantidade de paredes');
        const discount = optionalN('discountArea', 'descontos');
        const loss = optionalN('lossPercent', 'perda');
        const blockWidthCm = n('blockWidthCm', 'largura do bloco');
        const blockHeightCm = n('blockHeightCm', 'altura do bloco');
        const { netAreaM2: netArea } = calculateWallArea({ widthM: width, heightM: height, walls, discountAreaM2: discount });
        const { blockAreaM2: blockArea, pieces: totalBlocks } = calculateBlocks({ wallAreaM2: netArea, blockWidthCm, blockHeightCm, lossPercent: loss });
        return result(
          `Blocos estimados: ${totalBlocks} un.`,
          [
            { label: 'Área líquida', value: `${round(netArea)} m²`, helper: 'parede descontada' },
            { label: 'Blocos', value: `${totalBlocks} un.`, helper: `${round(loss)}% de perda` },
          ],
          [`Área líquida: ${round(netArea)} m²`, `Bloco: ${round(blockWidthCm)} × ${round(blockHeightCm)} cm`, `Perda: ${round(loss)}%`, `Quantidade: ${totalBlocks} un.`],
          'Use para estimativa rápida. Juntas de argamassa, quebras, amarração e vãos podem alterar a quantidade real.',
          ['Área líquida = largura × altura × paredes - descontos', 'Área do bloco = largura do bloco × altura do bloco', 'Blocos base = área líquida ÷ área do bloco', 'Blocos finais = arredondar para cima(blocos base × (1 + perda ÷ 100))'],
        );
      }

      const width = n('width', 'largura');
      const length = n('length', 'comprimento');
      const loss = optionalN('lossPercent', 'perda');
      const tileWidth = n('tileWidthCm', 'largura da peça') / 100;
      const tileHeight = n('tileHeightCm', 'altura da peça') / 100;
      const piecesPerBox = n('piecesPerBox', 'peças por caixa');
      const area = width * length;
      const { tileAreaM2: tileArea, pieces, boxes } = calculateTiles({ areaM2: area, tileWidthCm: tileWidth * 100, tileHeightCm: tileHeight * 100, piecesPerBox, lossPercent: loss });
      const purchaseArea = area * (1 + loss / 100);
      return result(
        `Piso/revestimento: ${boxes} caixa(s)`,
        [
          { label: 'Área com perda', value: `${round(purchaseArea)} m²`, helper: `${round(loss)}% de perda` },
          { label: 'Peças', value: `${pieces} un.`, helper: `${round(tileWidth * 100)} × ${round(tileHeight * 100)} cm` },
          { label: 'Caixas', value: `${boxes}`, helper: `${round(piecesPerBox)} peças/caixa` },
        ],
        [`Área base: ${round(area)} m²`, `Área com perda: ${round(purchaseArea)} m²`, `Peça: ${round(tileWidth * 100)} × ${round(tileHeight * 100)} cm`, `Peças: ${pieces}`, `Caixas: ${boxes}`],
        'Confira a quantidade de peças por caixa do fabricante. Compre caixas fechadas e preserve sobra para manutenção futura.',
        ['Área base = largura × comprimento', 'Área com perda = área base × (1 + perda ÷ 100)', 'Área da peça = largura da peça × altura da peça', 'Peças = arredondar para cima(área com perda ÷ área da peça)', 'Caixas = arredondar para cima(peças ÷ peças por caixa)'],
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', summary: '', details: [], orientation: '', formula: [], cards: [] };
    }
  }, [activeRule, values]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || calculated.error || calculated.cards.length === 0) return;

    const capture: CalculationCapture = {
      id: createId('construction-calc'),
      module: 'obras',
      moduleLabel: 'Construção civil',
      calculatorLabel: activeRule.label,
      destination,
      createdAt: new Date().toISOString(),
      summary: calculated.summary,
      details: [...calculated.details, ...calculated.formula.map((item) => `Fórmula: ${item}`), `Orientação: ${calculated.orientation}`],
    };

    onCaptureCalculation?.(capture);
    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no atendimento.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no atendimento e no orçamento.`);
  }

  function closeCalculator() {
    setActiveMode(null);
    setAddedMessage(null);
    setShowAdvanced(false);
  }

  function openCalculator(mode: ConstructionMode) {
    setActiveMode(mode);
    setAddedMessage(null);
    setShowAdvanced(false);
  }

  const showAdvancedFields = activeRule !== undefined;
  const showLossField = activeRule?.mode === 'floor-area' || activeRule?.mode === 'blocks-quantity' || activeRule?.mode === 'floor-tiles';

  return (
    <div className="general-calculator-workspace">
      <div className="general-plan-banner">
        <div>
          <strong>Construção civil</strong>
          <span>Medições rápidas para área, concreto, blocos e revestimento com poucos campos obrigatórios.</span>
        </div>
        <em>{rules.length} cálculos</em>
      </div>

      <div className="general-picker-list">
        {rules.map((rule) => (
          <button className="general-picker-card" key={rule.mode} type="button" onClick={() => openCalculator(rule.mode)}>
            <span>
              <strong>{rule.label}</strong>
              <small>{rule.description}</small>
            </span>
            <em>LIVRE</em>
          </button>
        ))}
      </div>

      {activeRule && (
        <div className="general-calculator-overlay" role="dialog" aria-modal="true" aria-label={activeRule.label}>
          <div className="general-overlay-backdrop" onClick={closeCalculator} />
          <section className="general-overlay-panel">
            <header className="general-overlay-header">
              <button type="button" onClick={closeCalculator}>‹</button>
              <div>
                <span>Construção civil</span>
                <h2>{activeRule.label}</h2>
                <p>{activeRule.description}</p>
              </div>
              <em>LIVRE</em>
            </header>

            <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>
              {activeRule.mode === 'wall-area' && (
                <>
                  <NumberField label="Largura da parede" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Altura" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} />
                  <NumberField label="Quantidade de paredes" value={values.wallsQuantity} suffix="un." step={1} onChange={(value) => setValue('wallsQuantity', value)} />
                </>
              )}

              {activeRule.mode === 'floor-area' && (
                <>
                  <NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Comprimento" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} />
                </>
              )}

              {activeRule.mode === 'concrete-volume' && (
                <>
                  <NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Comprimento" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} />
                  <NumberField label="Espessura" value={values.thicknessCm} suffix="cm" onChange={(value) => setValue('thicknessCm', value)} />
                </>
              )}

              {activeRule.mode === 'blocks-quantity' && (
                <>
                  <NumberField label="Largura da parede" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Altura" value={values.height} suffix="m" onChange={(value) => setValue('height', value)} />
                  <NumberField label="Quantidade de paredes" value={values.wallsQuantity} suffix="un." step={1} onChange={(value) => setValue('wallsQuantity', value)} />
                </>
              )}

              {activeRule.mode === 'floor-tiles' && (
                <>
                  <NumberField label="Largura" value={values.width} suffix="m" onChange={(value) => setValue('width', value)} />
                  <NumberField label="Comprimento" value={values.length} suffix="m" onChange={(value) => setValue('length', value)} />
                  <NumberField label="Peças por caixa" value={values.piecesPerBox} suffix="un." step={1} onChange={(value) => setValue('piecesPerBox', value)} />
                </>
              )}

              {showAdvancedFields && (
                <div className="general-advanced-block">
                  <button type="button" onClick={() => setShowAdvanced((current) => !current)}>{showAdvanced ? 'Ocultar ajustes avançados' : 'Mostrar ajustes avançados'}</button>
                  {showAdvanced && (
                    <div className="general-advanced-grid">
                      {(activeRule.mode === 'wall-area' || activeRule.mode === 'blocks-quantity') && <NumberField label="Descontos" value={values.discountArea} suffix="m²" onChange={(value) => setValue('discountArea', value)} />}
                      {showLossField && <NumberField label="Perda" value={values.lossPercent} suffix="%" onChange={(value) => setValue('lossPercent', value)} />}
                      {activeRule.mode === 'concrete-volume' && <NumberField label="Sacos de cimento por m³" value={values.cementBagsPerM3} suffix="sacos/m³" onChange={(value) => setValue('cementBagsPerM3', value)} />}
                      {activeRule.mode === 'blocks-quantity' && <NumberField label="Largura do bloco" value={values.blockWidthCm} suffix="cm" onChange={(value) => setValue('blockWidthCm', value)} />}
                      {activeRule.mode === 'blocks-quantity' && <NumberField label="Altura do bloco" value={values.blockHeightCm} suffix="cm" onChange={(value) => setValue('blockHeightCm', value)} />}
                      {activeRule.mode === 'floor-tiles' && <NumberField label="Largura da peça" value={values.tileWidthCm} suffix="cm" onChange={(value) => setValue('tileWidthCm', value)} />}
                      {activeRule.mode === 'floor-tiles' && <NumberField label="Altura da peça" value={values.tileHeightCm} suffix="cm" onChange={(value) => setValue('tileHeightCm', value)} />}
                    </div>
                  )}
                </div>
              )}
            </form>

            {calculated.error && <p className="general-error-message">{calculated.error}</p>}
            {calculated.cards.length > 0 && <div className="general-result-grid">{calculated.cards.map((item) => <ResultCard key={item.label} {...item} />)}</div>}
            {calculated.formula.length > 0 && <div className="general-formula-box"><strong>Como este cálculo é feito</strong>{calculated.formula.map((item) => <span key={item}>{item}</span>)}</div>}
            {calculated.orientation && <p className="general-helper-text">{calculated.orientation}</p>}
            {addedMessage && <p className="general-added-message">{addedMessage}</p>}

            <div className="general-capture-actions">
              <button type="button" onClick={() => includeResult('survey')}>Adicionar ao atendimento</button>
              <button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button>
              <button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button>
              <button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button>
            </div>

            <small className="general-technical-note">Cálculo preliminar. Valide perdas, medidas reais, paginação e especificação do material antes da compra.</small>
          </section>
        </div>
      )}
    </div>
  );
}
