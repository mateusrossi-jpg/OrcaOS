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
import './SupplierTaxMarginWorkspace.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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
    if (!normalizedQuery) return records;
    return records.filter((record) => [record.supplierName, record.productDescription, record.documentNumber, record.ncm, record.cfop, record.notes].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [query, records]);

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
      <div className="supplier-tax-header">
        <div>
          <span className="orca-kicker">Estoque → catálogo</span>
          <h2>Criar item de catálogo a partir da compra</h2>
          <p>Transforme uma compra lançada em item do Catálogo profissional usando o preço unitário sugerido pelo cálculo de custo, impostos e margem.</p>
        </div>
        <strong>{records.length} compra(s)</strong>
      </div>

      <div className="supplier-tax-card">
        <div>
          <strong>Compras disponíveis</strong>
          <small>Ao criar o item, ele aparece no Catálogo profissional e pode ser enviado ao orçamento guiado.</small>
        </div>
        <label className="supplier-tax-search">
          <span>Buscar compra</span>
          <input value={query} placeholder="Fornecedor, produto, nota, NCM..." onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="supplier-tax-list">
          {filteredRecords.length === 0 ? <small>Nenhuma compra encontrada. Salve uma compra acima para criar item de catálogo.</small> : filteredRecords.map((record) => {
            const summary = calculatePurchaseTaxSummary(record);
            return (
              <article className="supplier-tax-record" key={record.id}>
                <div>
                  <span>{purchaseUseCaseLabel(record.useCase)}</span>
                  <strong>{record.productDescription}</strong>
                  <small>{record.supplierName} · custo un. {money(summary.unitNetCost)} · preço catálogo {money(summary.suggestedUnitSalePrice)}</small>
                  <small>{record.documentNumber ? `Doc.: ${record.documentNumber}` : 'Sem documento'} · markup {summary.markupPercent.toFixed(2)}%</small>
                </div>
                <div className="supplier-tax-actions compact-actions">
                  <button className="primary-action inline-action" type="button" onClick={() => createCatalogItem(record)}>Criar item de catálogo</button>
                  <button className="secondary-action inline-action" type="button" onClick={() => duplicateAndCreateCatalogItem(record)}>Criar como novo lote</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {feedback && <div className="guided-cart-feedback">{feedback}</div>}
    </section>
  );
}
