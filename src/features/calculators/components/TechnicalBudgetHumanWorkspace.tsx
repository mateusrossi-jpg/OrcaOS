import { useMemo, useState } from 'react';
import {
  calculateDailyRate,
  calculateFinalPrice,
  calculateHourlyRate,
  calculateInstallments,
  calculateLabor,
  calculateUpfront,
} from '../../../core/calculations/trade';
import type { CalculationCapture, CalculationDestination } from '../../../core/types/workflow';
import { handleNumericInputFocus } from '../../../core/ui/numericInputFocus';
import './GeneralCalculatorWorkspace.css';

type BudgetMode = 'labor' | 'final-price' | 'daily' | 'hourly' | 'installments' | 'upfront';
type MarginMode = 'markup-cost' | 'margin-sale';
type FieldKey = 'quantity' | 'unitValue' | 'material' | 'labor' | 'travel' | 'profitPercent' | 'taxPercent' | 'discountPercent' | 'days' | 'dailyValue' | 'helperDailyValue' | 'hours' | 'hourlyValue' | 'total' | 'installments' | 'interestPercent' | 'upfrontPercent';

interface Props { onCaptureCalculation?: (capture: CalculationCapture) => void; }
interface BudgetRule { mode: BudgetMode; label: string; description: string; icon: string; }
interface FieldConfig { key: FieldKey; label: string; suffix?: string; step?: number; }
interface ResultCardData { label: string; value: string; helper?: string; }
interface BudgetResult { error: string | null; summary: string; details: string[]; orientation: string; cards: ResultCardData[]; formula: string[]; }

const rules: BudgetRule[] = [
  { mode: 'labor', label: 'Mão de obra', description: 'Calcule serviço por quantidade e valor unitário.', icon: 'R$' },
  { mode: 'final-price', label: 'Preço final', description: 'Soma material, mão de obra, margem/markup, impostos e desconto.', icon: 'Σ' },
  { mode: 'daily', label: 'Diária', description: 'Estime trabalho por dias de serviço e ajudante.', icon: 'D' },
  { mode: 'hourly', label: 'Hora técnica', description: 'Calcule atendimento por horas trabalhadas.', icon: 'h' },
  { mode: 'installments', label: 'Parcelamento', description: 'Divida o valor final em parcelas com ou sem acréscimo.', icon: '÷' },
  { mode: 'upfront', label: 'Sinal / entrada', description: 'Calcule entrada e saldo restante para o cliente.', icon: '%' },
];

const defaultValues: Record<FieldKey, string> = {
  quantity: '10', unitValue: '45', material: '300', labor: '500', travel: '50', profitPercent: '25', taxPercent: '0', discountPercent: '0', days: '2', dailyValue: '250', helperDailyValue: '120', hours: '6', hourlyValue: '80', total: '900', installments: '3', interestPercent: '0', upfrontPercent: '30',
};

const primaryFields: Record<BudgetMode, FieldConfig[]> = {
  labor: [{ key: 'quantity', label: 'Quantidade', step: 1 }, { key: 'unitValue', label: 'Valor unitário', suffix: 'R$' }],
  'final-price': [{ key: 'material', label: 'Material', suffix: 'R$' }, { key: 'labor', label: 'Mão de obra', suffix: 'R$' }],
  daily: [{ key: 'days', label: 'Dias', suffix: 'dias', step: 1 }, { key: 'dailyValue', label: 'Diária profissional', suffix: 'R$/dia' }],
  hourly: [{ key: 'hours', label: 'Horas', suffix: 'h' }, { key: 'hourlyValue', label: 'Hora técnica', suffix: 'R$/h' }],
  installments: [{ key: 'total', label: 'Valor total', suffix: 'R$' }, { key: 'installments', label: 'Parcelas', suffix: 'x', step: 1 }],
  upfront: [{ key: 'total', label: 'Valor total', suffix: 'R$' }, { key: 'upfrontPercent', label: 'Entrada', suffix: '%' }],
};

const advancedFields: Record<BudgetMode, FieldConfig[]> = {
  labor: [{ key: 'travel', label: 'Deslocamento', suffix: 'R$' }],
  'final-price': [{ key: 'travel', label: 'Deslocamento', suffix: 'R$' }, { key: 'profitPercent', label: 'Percentual', suffix: '%' }, { key: 'taxPercent', label: 'Impostos/taxas', suffix: '%' }, { key: 'discountPercent', label: 'Desconto', suffix: '%' }],
  daily: [{ key: 'travel', label: 'Deslocamento', suffix: 'R$' }, { key: 'helperDailyValue', label: 'Ajudante', suffix: 'R$/dia' }],
  hourly: [{ key: 'travel', label: 'Deslocamento', suffix: 'R$' }],
  installments: [{ key: 'interestPercent', label: 'Acréscimo', suffix: '%' }],
  upfront: [],
};

function parseNumber(value: string): number { const normalizedValue = value.trim().replace(',', '.'); return normalizedValue ? Number(normalizedValue) : Number.NaN; }
function requirePositive(value: number, label: string): number { if (!Number.isFinite(value) || value <= 0) throw new Error(`Informe um valor maior que zero para ${label}.`); return value; }
function requireNonNegative(value: number, label: string): number { if (!Number.isFinite(value) || value < 0) throw new Error(`Informe um valor válido para ${label}.`); return value; }
function requirePercent(value: number, label: string): number { if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error(`Informe um percentual válido para ${label}, entre 0 e 100%.`); return value; }
function requireMarginSalePercent(value: number): number { if (!Number.isFinite(value) || value < 0 || value >= 100) throw new Error('Para margem sobre venda, informe um percentual menor que 100%.'); return value; }
function round(value: number, decimals = 2): number { if (!Number.isFinite(value)) return 0; const factor = 10 ** decimals; return Math.round(value * factor) / factor; }
function money(value: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(value) ? value : 0); }
function createId(prefix: string): string { if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID(); return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`; }
function emptyResult(): BudgetResult { return { error: null, summary: '', details: [], orientation: '', cards: [], formula: [] }; }
function result(summary: string, cards: ResultCardData[], details: string[], orientation: string, formula: string[]): BudgetResult { return { error: null, summary, cards, details, orientation, formula }; }
function marginModeLabel(mode: MarginMode): string { return mode === 'markup-cost' ? 'Markup sobre custo' : 'Margem sobre venda'; }

function NumberField({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (value: string) => void }) {
  return <label className="general-form-field"><span>{field.label}</span><div><input type="number" inputMode="decimal" min="0" step={field.step ?? 0.01} value={value} placeholder="Digite o valor" onFocus={handleNumericInputFocus} onChange={(event) => onChange(event.target.value)} />{field.suffix && <small className="technical-unit">{field.suffix}</small>}</div></label>;
}

function SelectField({ value, onChange }: { value: MarginMode; onChange: (value: MarginMode) => void }) {
  return (
    <label className="general-form-field">
      <span>Tipo de percentual</span>
      <select value={value} onChange={(event) => onChange(event.target.value as MarginMode)}>
        <option value="markup-cost">Markup sobre custo</option>
        <option value="margin-sale">Margem sobre venda</option>
      </select>
    </label>
  );
}

function ResultCard({ label, value, helper }: ResultCardData) {
  return <article className="general-result-card"><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</article>;
}

export function TechnicalBudgetHumanWorkspace({ onCaptureCalculation }: Props) {
  const [activeMode, setActiveMode] = useState<BudgetMode | null>(null);
  const [values, setValues] = useState<Record<FieldKey, string>>(defaultValues);
  const [marginMode, setMarginMode] = useState<MarginMode>('markup-cost');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const activeRule = activeMode ? rules.find((rule) => rule.mode === activeMode) : undefined;
  const setValue = (key: FieldKey, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const n = (key: FieldKey, label: string) => requirePositive(parseNumber(values[key]), label);
  const optionalN = (key: FieldKey, label: string) => values[key].trim() ? requireNonNegative(parseNumber(values[key]), label) : 0;

  const calculated = useMemo<BudgetResult>(() => {
    if (!activeRule) return emptyResult();
    try {
      if (activeRule.mode === 'labor') {
        const quantity = n('quantity', 'quantidade');
        const unitValue = n('unitValue', 'valor unitário');
        const travel = optionalN('travel', 'deslocamento');
        const { subtotal, total } = calculateLabor({ quantity, unitValue, travel });
        return result(`Mão de obra: ${money(total)}`, [{ label: 'Subtotal', value: money(subtotal), helper: `${round(quantity)} × ${money(unitValue)}` }, { label: 'Deslocamento', value: money(travel), helper: 'custo adicional' }, { label: 'Total', value: money(total), helper: 'valor sugerido' }], [`Quantidade: ${round(quantity)}`, `Valor unitário: ${money(unitValue)}`, `Subtotal: ${money(subtotal)}`, `Deslocamento: ${money(travel)}`, `Total: ${money(total)}`], 'Use para serviços repetitivos por ponto, peça, luminária ou tomada. Ajuste dificuldade, altura, deslocamento e urgência antes de fechar.', [`Subtotal = quantidade × valor unitário`, `Total = subtotal + deslocamento`]);
      }

      if (activeRule.mode === 'final-price') {
        const material = optionalN('material', 'material');
        const labor = optionalN('labor', 'mão de obra');
        const travel = optionalN('travel', 'deslocamento');
        const percent = marginMode === 'margin-sale' ? requireMarginSalePercent(parseNumber(values.profitPercent)) : optionalN('profitPercent', 'percentual');
        const taxPercent = optionalN('taxPercent', 'impostos');
        const discountPercent = requirePercent(parseNumber(values.discountPercent), 'desconto');
        const base = material + labor + travel;
        const price = calculateFinalPrice({ material, labor, travel, percent, marginMode, taxPercent, discountPercent });
        const priceBeforeTax = price.priceBeforeTax;
        const profitValue = price.profit;
        const taxValue = price.tax;
        const discountValue = price.discount;
        const total = price.total;
        const effectiveMargin = price.effectiveMarginPercent;
        const formula = marginMode === 'margin-sale'
          ? [`Base = material + mão de obra + deslocamento`, `Preço antes de impostos = base / (1 - margem ÷ 100)`, `Margem real antes de impostos = lucro ÷ preço antes de impostos`, `Total = preço antes de impostos + impostos - desconto`]
          : [`Base = material + mão de obra + deslocamento`, `Preço antes de impostos = base × (1 + markup ÷ 100)`, `Margem real antes de impostos = lucro ÷ preço antes de impostos`, `Total = preço antes de impostos + impostos - desconto`];
        return result(`Preço final: ${money(total)}`, [{ label: 'Base', value: money(base), helper: 'material + mão de obra + deslocamento' }, { label: marginMode === 'markup-cost' ? 'Markup' : 'Margem', value: money(profitValue), helper: `${round(percent)}% · margem real ${round(effectiveMargin)}%` }, { label: 'Total', value: money(total), helper: discountValue > 0 ? `desconto ${money(discountValue)}` : 'sem desconto' }], [`Material: ${money(material)}`, `Mão de obra: ${money(labor)}`, `Deslocamento: ${money(travel)}`, `Tipo: ${marginModeLabel(marginMode)}`, `Percentual informado: ${round(percent)}%`, `Preço antes de impostos: ${money(priceBeforeTax)}`, `Lucro bruto antes de impostos: ${money(profitValue)}`, `Margem real antes de impostos: ${round(effectiveMargin)}%`, `Impostos: ${money(taxValue)}`, `Desconto: ${money(discountValue)}`, `Total: ${money(total)}`], 'Markup sobre custo aumenta o custo por um percentual. Margem sobre venda calcula o preço para que o lucro represente aquele percentual do preço de venda. Desconto aplicado no final reduz a margem real.', formula);
      }

      if (activeRule.mode === 'daily') {
        const days = n('days', 'dias');
        const dailyValue = n('dailyValue', 'valor da diária');
        const helperDailyValue = optionalN('helperDailyValue', 'ajudante');
        const travel = optionalN('travel', 'deslocamento');
        const daily = calculateDailyRate({ days, dailyValue, helperDailyValue, travel });
        return result(`Diária: ${money(daily.total)}`, [{ label: 'Profissional', value: money(daily.professional), helper: `${round(days)} dia(s)` }, { label: 'Ajudante', value: money(daily.helper), helper: helperDailyValue > 0 ? `${money(helperDailyValue)}/dia` : 'não informado' }, { label: 'Total', value: money(daily.total), helper: travel > 0 ? `inclui ${money(travel)} deslocamento` : 'sem deslocamento' }], [`Dias: ${round(days)}`, `Diária profissional: ${money(dailyValue)}`, `Ajudante/dia: ${money(helperDailyValue)}`, `Deslocamento: ${money(travel)}`, `Total: ${money(daily.total)}`], 'Use quando o serviço não cabe bem por ponto ou unidade. Defina claramente o que está incluso na diária.', [`Profissional = dias × diária profissional`, `Ajudante = dias × diária do ajudante`, `Total = profissional + ajudante + deslocamento`]);
      }

      if (activeRule.mode === 'hourly') {
        const hours = n('hours', 'horas');
        const hourlyValue = n('hourlyValue', 'valor hora técnica');
        const travel = optionalN('travel', 'deslocamento');
        const { subtotal, total } = calculateHourlyRate({ hours, hourlyValue, travel });
        return result(`Hora técnica: ${money(total)}`, [{ label: 'Horas', value: `${round(hours)} h`, helper: `${money(hourlyValue)}/h` }, { label: 'Subtotal', value: money(subtotal), helper: 'sem deslocamento' }, { label: 'Total', value: money(total), helper: travel > 0 ? `inclui ${money(travel)} deslocamento` : 'sem deslocamento' }], [`Horas: ${round(hours)} h`, `Valor hora: ${money(hourlyValue)}`, `Subtotal: ${money(subtotal)}`, `Deslocamento: ${money(travel)}`, `Total: ${money(total)}`], 'Use para diagnóstico, visita técnica, programação, manutenção ou serviços de duração variável.', [`Subtotal = horas × valor da hora técnica`, `Total = subtotal + deslocamento`]);
      }

      if (activeRule.mode === 'installments') {
        const total = n('total', 'valor total');
        const installments = n('installments', 'parcelas');
        const interestPercent = optionalN('interestPercent', 'acréscimo');
        const { adjustedTotal, installmentValue } = calculateInstallments({ total, installments, interestPercent });
        return result(`${round(installments)}× de ${money(installmentValue)}`, [{ label: 'Total original', value: money(total), helper: 'sem acréscimo' }, { label: 'Total parcelado', value: money(adjustedTotal), helper: `${round(interestPercent)}% de acréscimo` }, { label: 'Parcela', value: money(installmentValue), helper: `${round(installments)} parcela(s)` }], [`Total original: ${money(total)}`, `Parcelas: ${round(installments)}`, `Acréscimo: ${round(interestPercent)}%`, `Total parcelado: ${money(adjustedTotal)}`, `Valor da parcela: ${money(installmentValue)}`], 'Use para apresentar condição de pagamento. Confira taxas reais da maquininha, banco ou plataforma antes de prometer parcelamento.', [`Total parcelado = total × (1 + acréscimo ÷ 100)`, `Parcela = total parcelado ÷ quantidade de parcelas`]);
      }

      const total = n('total', 'valor total');
      const upfrontPercent = requirePercent(parseNumber(values.upfrontPercent), 'entrada');
      const { upfront: upfrontValue, remaining } = calculateUpfront({ total, upfrontPercent });
      return result(`Entrada: ${money(upfrontValue)}`, [{ label: 'Entrada', value: money(upfrontValue), helper: `${round(upfrontPercent)}% do total` }, { label: 'Saldo', value: money(remaining), helper: 'restante a receber' }, { label: 'Total', value: money(total), helper: 'valor da proposta' }], [`Total: ${money(total)}`, `Percentual de entrada: ${round(upfrontPercent)}%`, `Entrada: ${money(upfrontValue)}`, `Saldo: ${money(remaining)}`], 'Use para sinal de material, reserva de agenda ou início de serviço. Combine por escrito quando o saldo será pago.', [`Entrada = total × percentual de entrada ÷ 100`, `Saldo = total - entrada`]);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Preencha os campos necessários.', summary: '', details: [], orientation: '', cards: [], formula: [] };
    }
  }, [activeRule, values, marginMode]);

  function includeResult(destination: CalculationDestination) {
    if (!activeRule || calculated.error || calculated.cards.length === 0) return;
    onCaptureCalculation?.({ id: createId('technical-budget-calc'), module: 'orcamentoTecnico', moduleLabel: 'Orçamento técnico', calculatorLabel: activeRule.label, destination, createdAt: new Date().toISOString(), summary: calculated.summary, details: [...calculated.details, ...calculated.formula.map((item) => `Fórmula: ${item}`), `Orientação: ${calculated.orientation}`] });
    if (destination === 'survey') setAddedMessage(`${activeRule.label} foi incluído no atendimento.`);
    if (destination === 'budget') setAddedMessage(`${activeRule.label} foi incluído no orçamento.`);
    if (destination === 'both') setAddedMessage(`${activeRule.label} foi incluído no atendimento e no orçamento.`);
  }

  function openCalculator(mode: BudgetMode) { setActiveMode(mode); setAddedMessage(null); setShowAdvanced(false); }
  function closeCalculator() { setActiveMode(null); setAddedMessage(null); setShowAdvanced(false); }

  return (
    <div className="general-calculator-workspace">
      {activeRule && activeMode ? (
        <section className="general-calculator-detail-panel" aria-label={activeRule.label}>
          <header className="general-calculator-detail-header">
            <button className="general-calculator-detail-back" type="button" onClick={closeCalculator}>‹</button>
            <div>
              <span>Orçamento técnico</span>
              <h2>{activeRule.label}</h2>
              <p>{activeRule.description}</p>
            </div>
            <em>LIVRE</em>
          </header>
          <form className="general-calculator-form" onSubmit={(event) => event.preventDefault()}>
            {primaryFields[activeMode].map((field) => <NumberField key={field.key} field={field} value={values[field.key]} onChange={(value) => setValue(field.key, value)} />)}
            <div className="general-advanced-block"><button type="button" onClick={() => setShowAdvanced((current) => !current)}>{showAdvanced ? 'Ocultar ajustes avançados' : 'Mostrar ajustes avançados'}</button>{showAdvanced && <div className="general-advanced-grid">{activeMode === 'final-price' && <SelectField value={marginMode} onChange={setMarginMode} />}{advancedFields[activeMode].length === 0 && <p className="general-helper-text">Este cálculo não possui campos avançados.</p>}{advancedFields[activeMode].map((field) => <NumberField key={field.key} field={field} value={values[field.key]} onChange={(value) => setValue(field.key, value)} />)}</div>}</div>
          </form>
          {calculated.error && <p className="general-error-message">{calculated.error}</p>}
          {calculated.cards.length > 0 && <div className="general-result-grid">{calculated.cards.map((item) => <ResultCard key={item.label} {...item} />)}</div>}
          {calculated.formula.length > 0 && <div className="general-formula-box"><strong>Como este cálculo é feito</strong>{calculated.formula.map((item) => <span key={item}>{item}</span>)}</div>}
          {calculated.orientation && <p className="general-helper-text">{calculated.orientation}</p>}
          {addedMessage && <p className="general-added-message">{addedMessage}</p>}
          <div className="general-capture-actions"><button type="button" onClick={() => includeResult('survey')}>Adicionar ao atendimento</button><button type="button" onClick={() => includeResult('budget')}>Adicionar ao orçamento</button><button type="button" onClick={() => includeResult('both')}>Adicionar aos dois</button><button className="secondary-action" type="button" onClick={closeCalculator}>Voltar</button></div>
          <small className="general-technical-note">Cálculo preliminar. Revise escopo, garantia, prazo, impostos e condições antes de enviar ao cliente.</small>
        </section>
      ) : (
        <>
          <div className="general-plan-banner"><div><strong>Orçamento técnico</strong><span>Cálculos comerciais simples para serviço, preço final, diária, hora técnica e pagamento.</span></div><em>{rules.length} cálculos</em></div>
          <div className="general-picker-list">{rules.map((rule) => <button className="general-picker-card" key={rule.mode} type="button" onClick={() => openCalculator(rule.mode)}><span><strong>{rule.label}</strong><small>{rule.description}</small></span><em>LIVRE</em></button>)}</div>
        </>
      )}
    </div>
  );
}
