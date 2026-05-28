import { useMemo, useState, useEffect } from 'react';
import { 
  MetricCard, 
  MoneyValue, 
  QueueEmptyState, 
  Button, 
  BackButton, 
  ListCard, 
  ListItem, 
  SearchInput, 
  StatusBadge, 
  ActionMenu, 
  Input, 
  MonetaryInput,
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
  Surface,
  Badge,
  ContextBanner
} from '../../../app/components/ui';
import { FinanceFacade, type ConsolidatedFinanceRecord } from '../financeFacade';
import { operationalFacade } from '../../workflow/operationalFacade';
import { BudgetPersistenceService } from '../../../services/BudgetPersistenceService';
import { BUDGET_STATUS } from '../../../domain/budget';
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

const FINANCE_VISIBLE_LIMIT = 8;

function parseAmount(value: string): number {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

/**
 * SimpleFinanceWorkspace V3 (O Livro de Verdades)
 * Foco em DRE Simplificado e Extrato Bancário Premium.
 */
export function SimpleFinanceWorkspace() {
  const [recordSearch, setRecordSearch] = useState('');
  const [editingDraft, setEditingDraft] = useState<AdjustmentDraft | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const [syncTick, setSyncTick] = useState(0);

  const [financeRecords, setFinanceRecords] = useState<ConsolidatedFinanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReceivables, setPendingReceivables] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      const records = await FinanceFacade.getRealizedRecords();
      
      const budgetPersistence = new BudgetPersistenceService();
      const allBudgets = await budgetPersistence.listBudgets();
      const authorizedTotal = allBudgets
        .filter(b => b.status === BUDGET_STATUS.AUTORIZADO || b.status === BUDGET_STATUS.EM_EXECUCAO)
        .reduce((acc, b) => acc + (b.chargedValue - b.discounts), 0);

      if (active) {
        setFinanceRecords(records);
        setPendingReceivables(authorizedTotal);
        setIsLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [syncTick]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = recordSearch.trim().toLowerCase();
    if (!normalizedSearch) return financeRecords;
    return financeRecords.filter((row) => [row.title, row.clientName].join(' ').toLowerCase().includes(normalizedSearch));
  }, [recordSearch, financeRecords]);

  const visibleRows = showAllRows ? filteredRows : filteredRows.slice(0, FINANCE_VISIBLE_LIMIT);
  const hiddenRecordCount = Math.max(filteredRows.length - visibleRows.length, 0);

  const stats = useMemo(() => {
    return financeRecords.reduce((acc, row) => {
      return {
        revenue: acc.revenue + row.receivedAmount,
        costs: acc.costs + row.directCosts,
        profit: acc.profit + row.netProfit,
      };
    }, { revenue: 0, costs: 0, profit: 0 });
  }, [financeRecords]);

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
    return <section className="aferix-p-md"><QueueEmptyState title="Auditoria Financeira" meta="Acessando o livro de registros..." /></section>;
  }

  return (
    <div className="aferix-finance-center v3 aferix-d-flex aferix-flex-column aferix-gap-lg">
      
      {/* 1. DRE SIMPLIFICADO (MÊS ATUAL) */}
      <Surface elevation={2} padding="lg" className="aferix-dre-card">
        <header className="aferix-d-flex aferix-justify-between aferix-align-center aferix-mb-md">
          <span className="aferix-font-xs aferix-font-bold aferix-text-muted">DRE OPERACIONAL (MAIO)</span>
          <Badge tone={stats.profit >= 0 ? 'success' : 'danger'}>
            {stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(0) : 0}% Margem
          </Badge>
        </header>
        
        <div className="aferix-text-center aferix-mb-lg">
          <span className="aferix-d-block aferix-font-xs aferix-text-muted">LUCRO LÍQUIDO ACUMULADO</span>
          <strong style={{ fontSize: '36px', color: 'var(--status-success)' }}>
            {formatCurrencyBRL(stats.profit)}
          </strong>
        </div>

        <div className="aferix-divider aferix-my-md" style={{ height: '1px', background: 'var(--border-soft)' }} />

        <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <span className="aferix-d-block aferix-font-xs aferix-text-muted">RECEITA BRUTA</span>
            <strong className="aferix-font-md" style={{ color: 'var(--text-primary)' }}>{formatCurrencyBRL(stats.revenue)}</strong>
          </div>
          <div>
            <span className="aferix-d-block aferix-font-xs aferix-text-muted">CUSTOS DIRETOS</span>
            <strong className="aferix-font-md" style={{ color: 'var(--status-danger)' }}>{formatCurrencyBRL(stats.costs)}</strong>
          </div>
        </div>
      </Surface>

      {/* 2. FILTRO DE BUSCA (LIVRO) */}
      <div className="finance-ledger-header">
        <SectionTitle title="Livro de Lançamentos" eyebrow="Histórico de Auditoria" />
        <Surface elevation={1} padding="sm" className="aferix-mt-sm">
          <SearchInput
            value={recordSearch}
            placeholder="Buscar por título ou cliente..."
            onChange={setRecordSearch}
          />
        </Surface>
      </div>

      {/* 3. EXTRATO DE LANÇAMENTOS */}
      <ListCard>
        {filteredRows.length === 0 ? (
          <QueueEmptyState title="Vazio" meta="Nenhum registro encontrado para este filtro." />
        ) : (
          visibleRows.map(row => (
            <div key={row.budgetId} className="aferix-p-md aferix-d-flex aferix-justify-between aferix-align-center" style={{ borderBottom: '1px solid var(--border-dim)' }}>
              <div className="aferix-d-flex aferix-flex-column">
                <span className="aferix-font-sm aferix-font-bold">{row.title}</span>
                <small className="aferix-text-muted">{formatDate(row.updatedAt)} • {row.clientName}</small>
              </div>
              <div className="aferix-d-flex aferix-align-center aferix-gap-md">
                <div className="aferix-text-right">
                  <strong className="aferix-d-block aferix-font-sm" style={{ color: 'var(--status-success)' }}>
                    +{formatCurrencyBRL(row.netProfit)}
                  </strong>
                  <span className="aferix-font-xs aferix-text-muted">{row.netMarginPercent.toFixed(0)}% margem</span>
                </div>
                <ActionMenu
                  label="…"
                  items={[{ id: 'adj', label: 'Ajustar Auditoria', onSelect: () => openAdjustment(row) }]}
                />
              </div>
            </div>
          ))
        )}

        {filteredRows.length > FINANCE_VISIBLE_LIMIT && (
          <div className="aferix-p-sm aferix-text-center">
            <Button variant="ghost" onClick={() => setShowAllRows(!showAllRows)}>
              {showAllRows ? 'Ver menos' : `Ver mais (${hiddenRecordCount})`}
            </Button>
          </div>
        )}
      </ListCard>

      {/* 4. MODAL DE AJUSTE (AUDITORIA) */}
      {editingDraft && (
        <div className="aferix-modal-overlay">
          <div className="aferix-modal-card">
            <header className="aferix-modal-header">
              <h2>Ajuste de Auditoria</h2>
            </header>
            <div className="aferix-modal-body aferix-d-flex aferix-flex-column aferix-gap-md">
              <p className="aferix-text-muted aferix-font-sm">Refine os valores reais observados na execução deste projeto.</p>
              
              <MonetaryInput label="Faturamento Final" value={parseAmount(editingDraft.receivedAmount)} onChange={(v) => setEditingDraft(d => d ? {...d, receivedAmount: String(v)} : null)} />
              
              <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <MonetaryInput label="Material Real" value={parseAmount(editingDraft.materialCost)} onChange={(v) => setEditingDraft(d => d ? {...d, materialCost: String(v)} : null)} />
                <MonetaryInput label="Transporte Real" value={parseAmount(editingDraft.travelCost)} onChange={(v) => setEditingDraft(d => d ? {...d, travelCost: String(v)} : null)} />
                <MonetaryInput label="Taxa Cartão" value={parseAmount(editingDraft.cardFee)} onChange={(v) => setEditingDraft(d => d ? {...d, cardFee: String(v)} : null)} />
                <MonetaryInput label="Outros" value={parseAmount(editingDraft.otherCosts)} onChange={(v) => setEditingDraft(d => d ? {...d, otherCosts: String(v)} : null)} />
              </div>
            </div>
            <footer className="aferix-modal-footer">
              <SecondaryButton onClick={() => setEditingDraft(null)}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={saveAdjustment}>Confirmar Ajustes</PrimaryButton>
            </footer>
          </div>
        </div>
      )}

      <ContextBanner
        title="Projeção de Caixa"
        meta={`Você tem ${formatCurrencyBRL(pendingReceivables)} previstos para entrar nos próximos 15 dias baseado em orçamentos aprovados.`}
        icon="📉"
      />
    </div>
  );
}
