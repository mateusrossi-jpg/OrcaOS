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

      <div className="supplier-tax-grid-layout" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '32px', 
        alignItems: 'start' 
      }}>
        {previewSummary && (
          <aside className="catalog-form-card premium-finance-panel" style={{ 
            background: 'var(--aferix-surface-raised, #16181e)', 
            border: '1px solid var(--aferix-border-strong, #333333)',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
            order: window.innerWidth < 768 ? 1 : 0
          }}>
            <header style={{ marginBottom: '32px', borderBottom: '2px solid var(--aferix-primary)', paddingBottom: '16px', width: 'fit-content' }}>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--aferix-text)', letterSpacing: '-0.02em' }}>Prévia de Preço</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--aferix-text-muted)', marginTop: '4px' }}>Análise estratégica de margem e custo.</p>
              </div>
            </header>
            
            <div className="supplier-tax-result-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 0', borderBottom: '1px solid var(--aferix-border-soft)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--aferix-text-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custo bruto produtos</span>
                <strong style={{ fontSize: '1.25rem' }}>{money(previewSummary.grossProductsCost)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 0', borderBottom: '1px solid var(--aferix-border-soft)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--aferix-text-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tributos na compra</span>
                <strong style={{ fontSize: '1.25rem' }}>{money(previewSummary.taxIncludedInPurchase)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 0', borderBottom: '1px solid var(--aferix-border-soft)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--aferix-text-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custo de aquisição</span>
                <strong style={{ fontSize: '1.25rem' }}>{money(previewSummary.grossAcquisitionCost)}</strong>
              </div>
              
              <div style={{ padding: '24px', background: 'var(--aferix-surface-active)', borderRadius: '12px', border: '1px solid var(--aferix-primary-soft, rgba(245, 164, 0, 0.15))', margin: '8px 0' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--aferix-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Custo unitário líquido</span>
                <strong style={{ fontSize: '2.25rem', color: 'var(--aferix-primary)', lineHeight: 1 }}>{money(previewSummary.unitNetCost)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--aferix-text-soft)', fontWeight: 600 }}>Markup calculado</span>
                <strong style={{ fontSize: '1.25rem' }}>{previewSummary.markupPercent.toFixed(2)}%</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '24px', background: 'var(--aferix-primary)', borderRadius: '12px', color: '#000', boxShadow: '0 8px 24px rgba(245, 164, 0, 0.3)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Preço de Venda Sugerido (un.)</span>
                <strong style={{ fontSize: '2.5rem', fontWeight: 950, lineHeight: 1 }}>{money(previewSummary.suggestedUnitSalePrice)}</strong>
              </div>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--aferix-text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: 1.5 }}>
                Margem líquida alvo de <strong>{previewRecord?.desiredNetMarginPercent}%</strong> e<br/>encargos de saída estimados em <strong>{previewSummary.saleVariablePercent.toFixed(1)}%</strong>.
              </p>
            </div>
          </aside>
        )}

        <div className="catalog-form-card secondary-form-panel" style={{ 
          background: 'transparent', 
          border: '1px solid var(--aferix-border-soft)', 
          padding: '24px',
          borderRadius: '12px'
        }}>
          <header style={{ marginBottom: '24px' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--aferix-text-soft)' }}>{editingId ? 'Editar lançamento' : 'Novo lançamento'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--aferix-text-muted)', marginTop: '4px' }}>Cadastre custos e compras.</p>
            </div>
          </header>
          <div className="catalog-form-grid compact-form">
            <div className="catalog-field col-12">
              <span>Fornecedor</span>
              <input value={draft.supplierName} placeholder="Ex.: Fornecedor principal" onChange={(event) => updateDraft('supplierName', event.target.value)} />
            </div>
            <div className="catalog-field col-6">
              <span>Nota/pedido</span>
              <input value={draft.documentNumber} placeholder="NF, cupom, pedido..." onChange={(event) => updateDraft('documentNumber', event.target.value)} />
            </div>
            <div className="catalog-field col-6">
              <span>Data</span>
              <input type="date" value={draft.purchaseDate} onChange={(event) => updateDraft('purchaseDate', event.target.value)} />
            </div>
            <div className="catalog-field col-12">
              <span>Item/peça/insumo</span>
              <input value={draft.productDescription} placeholder="Ex.: Módulo tomada 2P+T 20A branco" onChange={(event) => updateDraft('productDescription', event.target.value)} />
            </div>
            <div className="catalog-field col-6">
              <span>Quantidade</span>
              <input inputMode="decimal" value={draft.quantity} onChange={(event) => updateDraft('quantity', event.target.value)} />
            </div>
            <div className="catalog-field col-6">
              <span>Custo unitário</span>
              <input inputMode="decimal" value={draft.unitCost} onChange={(event) => updateDraft('unitCost', event.target.value)} />
            </div>
            
            <details className="catalog-field col-12" style={{ cursor: 'pointer' }}>
              <summary style={{ fontSize: '0.8rem', color: 'var(--aferix-primary)', fontWeight: 600, marginBottom: '8px' }}>Mais detalhes (Impostos e Frete)</summary>
              <div className="catalog-form-grid" style={{ paddingTop: '12px' }}>
                <div className="catalog-field col-6">
                  <span>Frete</span>
                  <input inputMode="decimal" value={draft.freightCost} onChange={(event) => updateDraft('freightCost', event.target.value)} />
                </div>
                <div className="catalog-field col-6">
                  <span>Outros custos</span>
                  <input inputMode="decimal" value={draft.otherCosts} onChange={(event) => updateDraft('otherCosts', event.target.value)} />
                </div>
                <div className="catalog-field col-6">
                  <span>Uso</span>
                  <select value={draft.useCase} onChange={(event) => updateDraft('useCase', event.target.value as PurchaseUseCase)}>
                    <option value="estoque-revenda">Estoque para revenda</option>
                    <option value="insumo-servico">Insumo aplicado em serviço</option>
                    <option value="uso-proprio-obra">Uso próprio em obra/cliente</option>
                    <option value="ferramenta-equipamento">Ferramenta/equipamento</option>
                  </select>
                </div>
                <div className="catalog-field col-6">
                  <span>Regime</span>
                  <select value={draft.taxRegime} onChange={(event) => updateDraft('taxRegime', event.target.value as BusinessTaxRegime)}>
                    <option value="mei">MEI</option>
                    <option value="simples">Simples Nacional</option>
                    <option value="lucro-presumido">Lucro Presumido</option>
                    <option value="lucro-real">Lucro Real</option>
                    <option value="custom">Personalizado/contador</option>
                  </select>
                </div>
                <div className="catalog-field col-6">
                  <span>Margem líquida %</span>
                  <input inputMode="decimal" value={draft.desiredNetMarginPercent} onChange={(event) => updateDraft('desiredNetMarginPercent', event.target.value)} />
                </div>
                <div className="catalog-field col-6">
                  <span>Imposto na venda %</span>
                  <input inputMode="decimal" value={draft.estimatedSaleTaxPercent} onChange={(event) => updateDraft('estimatedSaleTaxPercent', event.target.value)} />
                </div>
              </div>
            </details>

            <div className="catalog-field col-12">
              <span>Observações</span>
              <textarea value={draft.notes} rows={2} placeholder="Notas rápidas..." onChange={(event) => updateDraft('notes', event.target.value)} />
            </div>
          </div>
          <div className="catalog-hub-actions start-actions" style={{ marginTop: '20px' }}>
            <button className="primary-action inline-action" type="button" onClick={saveRecord}>{editingId ? 'Salvar' : 'Salvar lançamento'}</button>
            {editingId && <button className="secondary-action inline-action" type="button" onClick={resetForm}>Cancelar</button>}
          </div>
        </div>
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
