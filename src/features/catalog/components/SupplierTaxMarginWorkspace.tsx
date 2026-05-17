import { useEffect, useMemo, useState } from 'react';
import {
  calculatePurchaseTaxSummary,
  createPurchaseTaxRecordId,
  loadPurchaseTaxRecords,
  purchaseUseCaseLabel,
  savePurchaseTaxRecords,
  taxRegimeLabel,
  type BusinessTaxRegime,
  type PurchaseTaxRecord,
  type PurchaseUseCase,
} from '../storage/purchaseTaxStorage';

interface PurchaseTaxDraft {
  supplierName: string;
  documentNumber: string;
  purchaseDate: string;
  productDescription: string;
  ncm: string;
  cfop: string;
  useCase: PurchaseUseCase;
  taxRegime: BusinessTaxRegime;
  quantity: string;
  unitCost: string;
  freightCost: string;
  otherCosts: string;
  travelCost: string;
  icmsValue: string;
  ipiValue: string;
  pisValue: string;
  cofinsValue: string;
  issValue: string;
  cbsValue: string;
  ibsValue: string;
  creditableTaxValue: string;
  desiredNetMarginPercent: string;
  estimatedSaleTaxPercent: string;
  cardFeePercent: string;
  reservePercent: string;
  notes: string;
}

const emptyDraft: PurchaseTaxDraft = {
  supplierName: '',
  documentNumber: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  productDescription: '',
  ncm: '',
  cfop: '',
  useCase: 'estoque-revenda',
  taxRegime: 'simples',
  quantity: '1',
  unitCost: '0',
  freightCost: '0',
  otherCosts: '0',
  travelCost: '0',
  icmsValue: '0',
  ipiValue: '0',
  pisValue: '0',
  cofinsValue: '0',
  issValue: '0',
  cbsValue: '0',
  ibsValue: '0',
  creditableTaxValue: '0',
  desiredNetMarginPercent: '30',
  estimatedSaleTaxPercent: '6',
  cardFeePercent: '3',
  reservePercent: '2',
  notes: '',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const TAX_RECORD_VISIBLE_LIMIT = 5;

function money(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function parseDecimal(value: string, fallback = 0): number {
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function draftToRecord(draft: PurchaseTaxDraft, existing?: PurchaseTaxRecord): PurchaseTaxRecord | null {
  const supplierName = draft.supplierName.trim();
  const productDescription = draft.productDescription.trim();
  if (!supplierName || !productDescription) return null;
  const timestamp = new Date().toISOString();

  return {
    id: existing?.id ?? createPurchaseTaxRecordId(),
    supplierName,
    documentNumber: draft.documentNumber.trim() || undefined,
    purchaseDate: draft.purchaseDate || timestamp.slice(0, 10),
    productDescription,
    ncm: draft.ncm.trim() || undefined,
    cfop: draft.cfop.trim() || undefined,
    useCase: draft.useCase,
    taxRegime: draft.taxRegime,
    quantity: parseDecimal(draft.quantity, 1),
    unitCost: parseDecimal(draft.unitCost, 0),
    freightCost: parseDecimal(draft.freightCost, 0),
    otherCosts: parseDecimal(draft.otherCosts, 0),
    travelCost: parseDecimal(draft.travelCost, 0),
    icmsValue: parseDecimal(draft.icmsValue, 0),
    ipiValue: parseDecimal(draft.ipiValue, 0),
    pisValue: parseDecimal(draft.pisValue, 0),
    cofinsValue: parseDecimal(draft.cofinsValue, 0),
    issValue: parseDecimal(draft.issValue, 0),
    cbsValue: parseDecimal(draft.cbsValue, 0),
    ibsValue: parseDecimal(draft.ibsValue, 0),
    creditableTaxValue: parseDecimal(draft.creditableTaxValue, 0),
    desiredNetMarginPercent: parseDecimal(draft.desiredNetMarginPercent, 0),
    estimatedSaleTaxPercent: parseDecimal(draft.estimatedSaleTaxPercent, 0),
    cardFeePercent: parseDecimal(draft.cardFeePercent, 0),
    reservePercent: parseDecimal(draft.reservePercent, 0),
    notes: draft.notes.trim() || undefined,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function recordToDraft(record: PurchaseTaxRecord): PurchaseTaxDraft {
  return {
    supplierName: record.supplierName,
    documentNumber: record.documentNumber ?? '',
    purchaseDate: record.purchaseDate,
    productDescription: record.productDescription,
    ncm: record.ncm ?? '',
    cfop: record.cfop ?? '',
    useCase: record.useCase,
    taxRegime: record.taxRegime,
    quantity: String(record.quantity),
    unitCost: String(record.unitCost),
    freightCost: String(record.freightCost),
    otherCosts: String(record.otherCosts),
    travelCost: String(record.travelCost),
    icmsValue: String(record.icmsValue),
    ipiValue: String(record.ipiValue),
    pisValue: String(record.pisValue),
    cofinsValue: String(record.cofinsValue),
    issValue: String(record.issValue),
    cbsValue: String(record.cbsValue),
    ibsValue: String(record.ibsValue),
    creditableTaxValue: String(record.creditableTaxValue),
    desiredNetMarginPercent: String(record.desiredNetMarginPercent),
    estimatedSaleTaxPercent: String(record.estimatedSaleTaxPercent),
    cardFeePercent: String(record.cardFeePercent),
    reservePercent: String(record.reservePercent),
    notes: record.notes ?? '',
  };
}

export function SupplierTaxMarginWorkspace() {
  const [records, setRecords] = useState<PurchaseTaxRecord[]>(() => loadPurchaseTaxRecords());
  const [draft, setDraft] = useState<PurchaseTaxDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => savePurchaseTaxRecords(records), [records]);

  const previewRecord = useMemo(() => draftToRecord(draft) ?? draftToRecord({ ...emptyDraft, supplierName: 'Prévia', productDescription: 'Item' }), [draft]);
  const previewSummary = previewRecord ? calculatePurchaseTaxSummary(previewRecord) : null;
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = normalizedQuery
      ? records.filter((record) => [record.supplierName, record.productDescription, record.documentNumber, record.ncm, record.cfop, record.notes].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery))
      : [];
    return [...source].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [query, records]);
  const visibleRecords = filteredRecords.slice(0, TAX_RECORD_VISIBLE_LIMIT);
  const hiddenRecordCount = Math.max(filteredRecords.length - visibleRecords.length, 0);

  function updateDraft<K extends keyof PurchaseTaxDraft>(key: K, value: PurchaseTaxDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function saveRecord() {
    const existing = editingId ? records.find((record) => record.id === editingId) : undefined;
    const nextRecord = draftToRecord(draft, existing);
    if (!nextRecord) {
      setFeedback('Informe fornecedor e descrição do item para salvar.');
      return;
    }

    if (editingId) {
      setRecords((current) => current.map((record) => (record.id === editingId ? nextRecord : record)));
      setFeedback('Compra/custo atualizado.');
    } else {
      setRecords((current) => [nextRecord, ...current]);
      setFeedback('Compra/custo salvo na base gerencial.');
    }
    resetForm();
  }

  function editRecord(record: PurchaseTaxRecord) {
    setDraft(recordToDraft(record));
    setEditingId(record.id);
    setFeedback(`Editando ${record.productDescription}.`);
  }

  function duplicateRecord(record: PurchaseTaxRecord) {
    const timestamp = new Date().toISOString();
    setRecords((current) => [{ ...record, id: createPurchaseTaxRecordId(), productDescription: `${record.productDescription} cópia`, createdAt: timestamp, updatedAt: timestamp }, ...current]);
    setFeedback('Registro duplicado.');
  }

  function removeRecord(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <section className="supplier-tax-workspace">
      <div className="catalog-tab-hero">
        <div>
          <span className="catalog-eyebrow">Compras, estoque e margem</span>
          <h3>Custo real, impostos e preço viável</h3>
          <p>Cadastre compras de insumos/peças, simule custo real, carga tributária estimada, deslocamento, margem e preço sugerido.</p>
        </div>
        <strong>{records.length} lançamento(s)</strong>
      </div>

      <div className="supplier-tax-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 0.65fr)', gap: '24px', alignItems: 'start' }}>
        <div className="catalog-form-card">
          <header>
            <div>
              <h4>{editingId ? 'Editar lançamento' : 'Novo lançamento'}</h4>
              <p>Use os valores da nota, cupom, pedido ou compra para formar custo gerencial.</p>
            </div>
          </header>
          <div className="catalog-form-grid">
            <div className="catalog-field col-4">
              <span>Fornecedor</span>
              <input value={draft.supplierName} placeholder="Ex.: Fornecedor principal" onChange={(event) => updateDraft('supplierName', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Nota/pedido</span>
              <input value={draft.documentNumber} placeholder="NF, cupom, pedido..." onChange={(event) => updateDraft('documentNumber', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Data</span>
              <input type="date" value={draft.purchaseDate} onChange={(event) => updateDraft('purchaseDate', event.target.value)} />
            </div>
            <div className="catalog-field col-12">
              <span>Item/peça/insumo</span>
              <input value={draft.productDescription} placeholder="Ex.: Módulo tomada 2P+T 20A branco" onChange={(event) => updateDraft('productDescription', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>NCM</span>
              <input value={draft.ncm} placeholder="Opcional" onChange={(event) => updateDraft('ncm', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>CFOP</span>
              <input value={draft.cfop} placeholder="Opcional" onChange={(event) => updateDraft('cfop', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Uso</span>
              <select value={draft.useCase} onChange={(event) => updateDraft('useCase', event.target.value as PurchaseUseCase)}>
                <option value="estoque-revenda">Estoque para revenda</option>
                <option value="insumo-servico">Insumo aplicado em serviço</option>
                <option value="uso-proprio-obra">Uso próprio em obra/cliente</option>
                <option value="ferramenta-equipamento">Ferramenta/equipamento</option>
              </select>
            </div>
            <div className="catalog-field col-4">
              <span>Regime</span>
              <select value={draft.taxRegime} onChange={(event) => updateDraft('taxRegime', event.target.value as BusinessTaxRegime)}>
                <option value="mei">MEI</option>
                <option value="simples">Simples Nacional</option>
                <option value="lucro-presumido">Lucro Presumido</option>
                <option value="lucro-real">Lucro Real</option>
                <option value="custom">Personalizado/contador</option>
              </select>
            </div>
            <div className="catalog-field col-4">
              <span>Quantidade</span>
              <input inputMode="decimal" value={draft.quantity} onChange={(event) => updateDraft('quantity', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Custo unitário</span>
              <input inputMode="decimal" value={draft.unitCost} onChange={(event) => updateDraft('unitCost', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Frete</span>
              <input inputMode="decimal" value={draft.freightCost} onChange={(event) => updateDraft('freightCost', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Outros custos</span>
              <input inputMode="decimal" value={draft.otherCosts} onChange={(event) => updateDraft('otherCosts', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Deslocamento compra</span>
              <input inputMode="decimal" value={draft.travelCost} onChange={(event) => updateDraft('travelCost', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>ICMS destacado</span>
              <input inputMode="decimal" value={draft.icmsValue} onChange={(event) => updateDraft('icmsValue', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>IPI destacado</span>
              <input inputMode="decimal" value={draft.ipiValue} onChange={(event) => updateDraft('ipiValue', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>PIS</span>
              <input inputMode="decimal" value={draft.pisValue} onChange={(event) => updateDraft('pisValue', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Cofins</span>
              <input inputMode="decimal" value={draft.cofinsValue} onChange={(event) => updateDraft('cofinsValue', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>ISS</span>
              <input inputMode="decimal" value={draft.issValue} onChange={(event) => updateDraft('issValue', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>CBS 2026+</span>
              <input inputMode="decimal" value={draft.cbsValue} onChange={(event) => updateDraft('cbsValue', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>IBS 2026+</span>
              <input inputMode="decimal" value={draft.ibsValue} onChange={(event) => updateDraft('ibsValue', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Crédito gerencial</span>
              <input inputMode="decimal" value={draft.creditableTaxValue} onChange={(event) => updateDraft('creditableTaxValue', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Margem líquida desejada %</span>
              <input inputMode="decimal" value={draft.desiredNetMarginPercent} onChange={(event) => updateDraft('desiredNetMarginPercent', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Imposto na venda %</span>
              <input inputMode="decimal" value={draft.estimatedSaleTaxPercent} onChange={(event) => updateDraft('estimatedSaleTaxPercent', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Taxa cartão %</span>
              <input inputMode="decimal" value={draft.cardFeePercent} onChange={(event) => updateDraft('cardFeePercent', event.target.value)} />
            </div>
            <div className="catalog-field col-4">
              <span>Reserva/risco %</span>
              <input inputMode="decimal" value={draft.reservePercent} onChange={(event) => updateDraft('reservePercent', event.target.value)} />
            </div>
            <div className="catalog-field col-12">
              <span>Observações fiscais/gerenciais</span>
              <textarea value={draft.notes} placeholder="Ex.: compra para estoque, confirmar ICMS/ST, produto usado em atendimento..." onChange={(event) => updateDraft('notes', event.target.value)} />
            </div>
          </div>
          <div className="catalog-hub-actions start-actions" style={{ marginTop: '16px' }}>
            <button className="primary-action inline-action" type="button" onClick={saveRecord}>{editingId ? 'Salvar alterações' : 'Salvar lançamento'}</button>
            {editingId && <button className="secondary-action inline-action" type="button" onClick={resetForm}>Cancelar edição</button>}
          </div>
        </div>

        {previewSummary && (
          <aside className="catalog-form-card" style={{ background: 'linear-gradient(180deg, var(--aferix-surface-raised, #16181e), var(--aferix-surface, #0f1013))', border: '1px solid var(--aferix-border, #222222)' }}>
            <header>
              <div>
                <h4>Prévia de Preço</h4>
                <p>Estimativa gerencial tributária e comercial.</p>
              </div>
            </header>
            <div className="supplier-tax-result-grid" style={{ display: 'grid', gap: '8px' }}>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Custo produtos</span><strong style={{ fontSize: '1rem' }}>{money(previewSummary.grossProductsCost)}</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Tributos compra</span><strong style={{ fontSize: '1rem' }}>{money(previewSummary.taxIncludedInPurchase)}</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Custo aquisição</span><strong style={{ fontSize: '1rem' }}>{money(previewSummary.grossAcquisitionCost)}</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Crédito gerencial</span><strong style={{ fontSize: '1rem' }}>{money(previewSummary.managerialCredit)}</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Custo líquido</span><strong style={{ fontSize: '1rem' }}>{money(previewSummary.netAcquisitionCost)}</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Custo un.</span><strong style={{ fontSize: '1.15rem', color: 'var(--aferix-primary, #f5a400)' }}>{money(previewSummary.unitNetCost)}</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Percentual saída</span><strong style={{ fontSize: '1rem' }}>{previewSummary.saleVariablePercent.toFixed(2)}%</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Preço sugerido</span><strong style={{ fontSize: '1rem' }}>{money(previewSummary.suggestedSalePrice)}</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Preço un. sugerido</span><strong style={{ fontSize: '1.25rem', color: 'var(--aferix-primary, #f5a400)' }}>{money(previewSummary.suggestedUnitSalePrice)}</strong></article>
              <article style={{ display: 'grid', gap: '2px', border: '1px solid #222222', borderRadius: '8px', padding: '10px', background: '#000000' }}><span className="catalog-eyebrow" style={{ fontSize: '0.62rem' }}>Markup</span><strong style={{ fontSize: '1rem' }}>{previewSummary.markupPercent.toFixed(2)}%</strong></article>
            </div>
          </aside>
        )}
      </div>

      <div className="aferix-panel-card catalog-list-card">
        <header>
          <div>
            <h4>Lançamentos salvos</h4>
            <p>Use para comparar fornecedores, formar estoque e revisar margem de lucro.</p>
          </div>
        </header>
        <div className="catalog-form-grid" style={{ marginBottom: '16px' }}>
          <div className="catalog-field col-12">
            <span>Buscar</span>
            <input value={query} placeholder="Fornecedor, produto, nota, NCM..." onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="continuous-list">
          {records.length === 0 ? (
            <div className="continuous-list-empty">Nenhum lançamento salvo ainda.</div>
          ) : !query.trim() ? (
            <div className="continuous-list-empty">{records.length} lançamento(s) salvo(s). Pesquise para exibir.</div>
          ) : filteredRecords.length === 0 ? (
            <div className="continuous-list-empty">Nenhum lançamento encontrado com essa busca.</div>
          ) : null}
          {visibleRecords.map((record) => {
            const summary = calculatePurchaseTaxSummary(record);
            return (
              <article className="continuous-list-item" key={record.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '16px' }}>
                <div className="client-col">
                  <span className="catalog-eyebrow" style={{ fontSize: '0.68rem', marginBottom: '2px' }}>{taxRegimeLabel(record.taxRegime)} · {purchaseUseCaseLabel(record.useCase)}</span>
                  <strong>{record.productDescription}</strong>
                  <small>{record.supplierName} · {record.quantity} un. · custo un. {money(summary.unitNetCost)} · preço un. sugerido {money(summary.suggestedUnitSalePrice)}</small>
                  <small>{record.documentNumber ? `Doc.: ${record.documentNumber}` : 'Sem documento'} · {record.ncm ? `NCM: ${record.ncm}` : 'NCM não informado'} · {record.cfop ? `CFOP: ${record.cfop}` : 'CFOP não informado'}</small>
                </div>
                <div className="catalog-row-actions">
                  <button className="ghost-action" type="button" onClick={() => editRecord(record)} style={{ minHeight: '32px', fontSize: '0.7rem' }}>Editar</button>
                  <button className="ghost-action" type="button" onClick={() => duplicateRecord(record)} style={{ minHeight: '32px', fontSize: '0.7rem' }}>Duplicar</button>
                  <button className="danger-action" type="button" onClick={() => removeRecord(record.id)} style={{ minHeight: '32px', fontSize: '0.7rem', padding: '0 8px', borderRadius: '4px' }}>Remover</button>
                </div>
              </article>
            );
          })}
          {hiddenRecordCount > 0 && <div className="continuous-list-empty">Mais {hiddenRecordCount} lançamento(s) oculto(s). Use a busca para refinar.</div>}
        </div>
      </div>

      <div className="catalog-form-card" style={{ borderStyle: 'dashed', background: 'rgba(255, 255, 255, 0.01)' }}>
        <h4 style={{ fontSize: '1rem' }}>Nota fiscal e impostos</h4>
        <p style={{ fontSize: '0.82rem', margin: 0 }}>Use este módulo como controle gerencial. Para declaração fiscal, aproveitamento de crédito, ICMS/ST, monofásico, DAS, CBS/IBS e escrituração, valide as regras com seu contador e com os documentos fiscais da operação.</p>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
