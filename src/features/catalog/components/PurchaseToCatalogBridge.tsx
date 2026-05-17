import { useMemo, useState } from 'react';
import {
  calculatePurchaseTaxSummary,
  createPurchaseTaxRecordId,
  loadPurchaseTaxRecords,
  purchaseUseCaseLabel,
  type PurchaseTaxRecord,
} from '../storage/purchaseTaxStorage';
import { createCatalogId, type CatalogHubItem } from '../storage/catalogHubStorage';
import { upsertExternalCatalogHubItem } from '../storage/catalogHubSync';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PURCHASE_VISIBLE_LIMIT = 5;

function money(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function buildCatalogItemFromPurchase(record: PurchaseTaxRecord): CatalogHubItem {
  const summary = calculatePurchaseTaxSummary(record);
  const timestamp = new Date().toISOString();
  const noteLines = [
    'Item criado a partir de compra/estoque/margem.',
    `Fornecedor: ${record.supplierName}`,
    record.documentNumber ? `Documento: ${record.documentNumber}` : '',
    record.ncm ? `NCM: ${record.ncm}` : '',
    record.cfop ? `CFOP: ${record.cfop}` : '',
    `Uso: ${purchaseUseCaseLabel(record.useCase)}`,
    `Custo líquido unitário: ${money(summary.unitNetCost)}`,
    `Preço sugerido unitário: ${money(summary.suggestedUnitSalePrice)}`,
    `Markup: ${summary.markupPercent.toFixed(2)}%`,
    record.notes ?? '',
  ].filter(Boolean);

  return {
    id: createCatalogId('catalog-from-purchase'),
    kind: 'material',
    title: record.productDescription,
    category: record.useCase === 'ferramenta-equipamento' ? 'Ferramentas e equipamentos' : 'Estoque e insumos',
    brand: record.supplierName,
    model: record.ncm,
    reference: record.documentNumber,
    unit: 'un',
    defaultQuantity: 1,
    defaultUnitValue: Number(summary.suggestedUnitSalePrice.toFixed(2)),
    destination: 'both',
    itemType: 'material',
    notes: noteLines.join('\n'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function PurchaseToCatalogBridge() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const records = useMemo(() => loadPurchaseTaxRecords(), [refreshKey]);
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = normalizedQuery
      ? records.filter((record) => [record.supplierName, record.productDescription, record.documentNumber, record.ncm, record.cfop, record.notes].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery))
      : [];
    return [...source].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [query, records]);
  const visibleRecords = filteredRecords.slice(0, PURCHASE_VISIBLE_LIMIT);
  const hiddenRecordCount = Math.max(filteredRecords.length - visibleRecords.length, 0);

  function createCatalogItem(record: PurchaseTaxRecord) {
    const { action } = upsertExternalCatalogHubItem(buildCatalogItemFromPurchase(record));
    setFeedback(action === 'created' ? 'Item criado no Catálogo profissional com preço sugerido.' : 'Item existente atualizado no Catálogo profissional com o novo preço sugerido.');
    setRefreshKey((current) => current + 1);
  }

  function duplicateAndCreateCatalogItem(record: PurchaseTaxRecord) {
    const timestamp = new Date().toISOString();
    const copy: PurchaseTaxRecord = {
      ...record,
      id: createPurchaseTaxRecordId(),
      productDescription: `${record.productDescription} lote ${new Date().toLocaleDateString('pt-BR')}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const { action } = upsertExternalCatalogHubItem(buildCatalogItemFromPurchase(copy));
    setFeedback(action === 'created' ? 'Novo item/lote criado no Catálogo profissional.' : 'Item/lote atualizado no Catálogo profissional.');
    setRefreshKey((current) => current + 1);
  }

  return (
    <section className="supplier-tax-workspace">
      <div className="catalog-tab-hero">
        <div>
          <span className="catalog-eyebrow">Estoque → catálogo</span>
          <h3>Criar item de catálogo a partir da compra</h3>
          <p>Transforme uma compra lançada em item do Catálogo profissional usando o preço unitário sugerido pelo cálculo de custo, impostos e margem.</p>
        </div>
        <strong>{records.length} compra(s)</strong>
      </div>

      <div className="aferix-panel-card catalog-list-card">
        <header>
          <div>
            <h4>Compras disponíveis</h4>
            <p>Ao criar o item, ele aparece no Catálogo profissional e pode ser enviado diretamente ao orçamento.</p>
          </div>
        </header>
        <div className="catalog-form-grid" style={{ marginBottom: '16px' }}>
          <div className="catalog-field col-12">
            <span>Buscar compra</span>
            <input value={query} placeholder="Fornecedor, produto, nota, NCM..." onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="continuous-list">
          {records.length === 0 ? (
            <div className="continuous-list-empty">Nenhuma compra encontrada. Salve uma compra acima para criar item de catálogo.</div>
          ) : !query.trim() ? (
            <div className="continuous-list-empty">{records.length} compra(s) salva(s). Pesquise para exibir.</div>
          ) : filteredRecords.length === 0 ? (
            <div className="continuous-list-empty">Nenhuma compra encontrada com essa busca.</div>
          ) : null}
          {visibleRecords.map((record) => {
            const summary = calculatePurchaseTaxSummary(record);
            return (
              <article className="continuous-list-item" key={record.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '16px' }}>
                <div className="client-col">
                  <span className="catalog-eyebrow" style={{ fontSize: '0.68rem', marginBottom: '2px' }}>{purchaseUseCaseLabel(record.useCase)}</span>
                  <strong>{record.productDescription}</strong>
                  <small>{record.supplierName} · custo un. {money(summary.unitNetCost)} · preço catálogo {money(summary.suggestedUnitSalePrice)}</small>
                  <small>{record.documentNumber ? `Doc.: ${record.documentNumber}` : 'Sem documento'} · markup {summary.markupPercent.toFixed(2)}%</small>
                </div>
                <div className="catalog-row-actions">
                  <button className="ghost-action" type="button" onClick={() => createCatalogItem(record)} style={{ minHeight: '32px', fontSize: '0.7rem' }}>Criar item de catálogo</button>
                  <button className="ghost-action" type="button" onClick={() => duplicateAndCreateCatalogItem(record)} style={{ minHeight: '32px', fontSize: '0.7rem' }}>Criar como novo lote</button>
                </div>
              </article>
            );
          })}
          {hiddenRecordCount > 0 && <div className="continuous-list-empty">Mais {hiddenRecordCount} compra(s) oculta(s). Use a busca para refinar.</div>}
        </div>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
