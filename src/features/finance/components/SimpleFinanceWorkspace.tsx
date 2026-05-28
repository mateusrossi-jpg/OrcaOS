import { useMemo, useState, useEffect } from 'react';
import { 
  KpiCard,
  MoneyValue, 
  QueueEmptyState, 
  Button, 
  SecondaryButton, 
  PrimaryButton,
  ListCard, 
  SearchInput, 
  ActionMenu, 
  Input, 
  MonetaryInput,
  SectionTitle,
  Surface,
  Badge,
  ContextBanner
} from '../../../app/components/ui';
import { FinanceFacade, type ConsolidatedFinanceRecord } from '../financeFacade';
import { operationalFacade } from '../../workflow/operationalFacade';
import { formatCurrencyBRL } from '../../../utils/formatters';
import './SimpleFinanceWorkspace.css';

interface AdjustmentDraft {
  budgetId: string;
  title: string;
  clientName: string;
  receivedAmount: string;
  materialCost: string;
  travelCost: string;
  otherCosts: string;
  cardFee: string;
  estimatedTax: string;
}

function parseAmount(value: string): number {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date).toUpperCase();
}

/**
 * SimpleFinanceWorkspace V5 (Business Ledger Edition)
 * Total paridade visual com o Design Spec (Section 4.4).
 * Foco em entendimento imediato do resultado real.
 */
export function SimpleFinanceWorkspace() {
  const [recordSearch, setRecordSearch] = useState('');
  const [editingDraft, setEditingDraft] = useState<AdjustmentDraft | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const [syncTick, setSyncTick] = useState(0);

  const [financeRecords, setFinanceRecords] = useState<ConsolidatedFinanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      const records = await FinanceFacade.getRealizedRecords();
      if (active) {
        setFinanceRecords(records);
        setIsLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [syncTick]);

  const stats = useMemo(() => {
    return financeRecords.reduce((acc, row) => {
      return {
        revenue: acc.revenue + row.receivedAmount,
        costs: acc.costs + row.directCosts,
        profit: acc.profit + row.netProfit,
      };
    }, { revenue: 0, costs: 0, profit: 0 });
  }, [financeRecords]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = recordSearch.trim().toLowerCase();
    if (!normalizedSearch) return financeRecords;
    return financeRecords.filter((row) => [row.title, row.clientName].join(' ').toLowerCase().includes(normalizedSearch));
  }, [recordSearch, financeRecords]);

  function openAdjustment(row: ConsolidatedFinanceRecord) {
    setEditingDraft({
      budgetId: row.budgetId,
      title: row.title,
      clientName: row.clientName,
      receivedAmount: String(row.receivedAmount),
      materialCost: String(row.materialCost),
      travelCost: String(row.travelCost),
      otherCosts: String(row.otherCosts),
      cardFee: String(row.cardFee),
      estimatedTax: String(row.estimatedTax || 0),
    });
  }

  async function saveAdjustment() {
    if (!editingDraft) return;
    await operationalFacade.recordFinanceAdjustment({
      title: editingDraft.title,
      clientName: editingDraft.clientName,
      status: 'realized',
      receivedAmount: parseAmount(editingDraft.receivedAmount),
      materialCost: parseAmount(editingDraft.materialCost),
      travelCost: parseAmount(editingDraft.travelCost),
      cardFee: parseAmount(editingDraft.cardFee),
      estimatedTax: parseAmount(editingDraft.estimatedTax),
      otherCosts: parseAmount(editingDraft.otherCosts),
      sourceBudgetId: editingDraft.budgetId,
    });
    setEditingDraft(null);
    setSyncTick((v) => v + 1);
  }

  if (isLoading && financeRecords.length === 0) {
    return <section className="aferix-p-md"><QueueEmptyState title="Lançamentos" meta="Auditoria financeira em andamento..." /></section>;
  }

  return (
    <div className="aferix-finance-ledger" style={{ maxWidth: '440px', margin: '0 auto' }}>
      
      {/* 1. KPI GRID (MÉTRICAS EXECUTIVAS) */}
      <div className="aferix-grid-2 aferix-mb-lg">
        <div style={{ gridColumn: 'span 2' }}>
          <KpiCard 
            label="Lucro Líquido do Mês" 
            value={stats.profit} 
            featured 
            trend={{ value: stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(0) : 0, isPositive: stats.profit >= 0, label: '% de margem real' }}
          />
        </div>
        <KpiCard label="Receita Bruta" value={stats.revenue} />
        <KpiCard label="Custos Obra" value={stats.costs} />
      </div>

      {/* 2. FILTROS E BUSCA */}
      <Surface elevation={1} padding="sm" className="ledger-search-panel aferix-mb-lg">
        <SearchInput
          value={recordSearch}
          placeholder="Título, cliente ou valor..."
          onChange={setRecordSearch}
        />
      </Surface>

      {/* 3. LISTA DE LANÇAMENTOS (AUDITORIA) */}
      <div className="aferix-d-flex aferix-flex-column aferix-gap-md">
        <SectionTitle title="Lançamentos Realizados" eyebrow="Extrato do Mês" />
        
        {filteredRows.length === 0 ? (
          <QueueEmptyState title="Vazio" meta="Nenhum registro encontrado." />
        ) : (
          filteredRows.map(row => (
            <Surface 
              key={row.budgetId} 
              elevation={1} 
              padding="md" 
              className="ledger-transaction-card"
            >
              <div className="aferix-d-flex aferix-gap-md aferix-align-center">
                {/* Micro Date */}
                <div className="ledger-date-pill">
                  <span>{formatDate(row.updatedAt).split(' ')[0]}</span>
                  <small>{formatDate(row.updatedAt).split(' ')[1]}</small>
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong className="aferix-d-block aferix-font-sm aferix-truncate" style={{ color: 'var(--text-primary)' }}>
                    {row.title}
                  </strong>
                  <small className="aferix-text-muted aferix-d-block aferix-truncate">{row.clientName}</small>
                </div>

                {/* Value */}
                <div className="aferix-text-right">
                  <strong style={{ color: 'var(--status-success)', fontSize: '15px' }}>
                    +{formatCurrencyBRL(row.netProfit)}
                  </strong>
                  <div className="aferix-d-flex aferix-justify-end aferix-mt-xs">
                     <ActionMenu
                      label="…"
                      items={[{ id: 'adj', label: 'Ajustar Auditoria', onSelect: () => openAdjustment(row) }]}
                    />
                  </div>
                </div>
              </div>
            </Surface>
          ))
        )}
      </div>

      {/* 4. MODAL DE AJUSTE (REUTILIZADO) */}
      {editingDraft && (
        <div className="aferix-modal-overlay">
          <div className="aferix-modal-card">
            <header className="aferix-modal-header">
              <h2>Ajuste de Auditoria</h2>
            </header>
            <div className="aferix-modal-body aferix-d-flex aferix-flex-column aferix-gap-md">
              <MonetaryInput label="Faturamento Final" value={parseAmount(editingDraft.receivedAmount)} onChange={(v) => setEditingDraft(d => d ? {...d, receivedAmount: String(v)} : null)} />
              <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <MonetaryInput label="Material" value={parseAmount(editingDraft.materialCost)} onChange={(v) => setEditingDraft(d => d ? {...d, materialCost: String(v)} : null)} />
                <MonetaryInput label="Transp." value={parseAmount(editingDraft.travelCost)} onChange={(v) => setEditingDraft(d => d ? {...d, travelCost: String(v)} : null)} />
                <MonetaryInput label="Taxas" value={parseAmount(editingDraft.cardFee)} onChange={(v) => setEditingDraft(d => d ? {...d, cardFee: String(v)} : null)} />
                <MonetaryInput label="Outros" value={parseAmount(editingDraft.otherCosts)} onChange={(v) => setEditingDraft(d => d ? {...d, otherCosts: String(v)} : null)} />
              </div>
            </div>
            <footer className="aferix-modal-footer">
              <SecondaryButton onClick={() => setEditingDraft(null)}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={saveAdjustment}>Confirmar</PrimaryButton>
            </footer>
          </div>
        </div>
      )}

      <div className="aferix-mt-xl">
        <ContextBanner
          title="Fim de Mês"
          meta="Gere o relatório completo consolidado no menu 'Mais > Relatórios' para sua contabilidade."
          icon="📊"
        />
      </div>

      <style>{`
        .ledger-date-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 42px;
          height: 42px;
          background: var(--bg-active);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-soft);
          flex-shrink: 0;
        }
        .ledger-date-pill span {
          font-size: 13px;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
        }
        .ledger-date-pill small {
          font-size: 9px;
          font-weight: 700;
          color: var(--brand-primary);
          text-transform: uppercase;
        }
        .ledger-transaction-card {
          border-left: 3px solid var(--status-success);
        }
      `}</style>
    </div>
  );
}
