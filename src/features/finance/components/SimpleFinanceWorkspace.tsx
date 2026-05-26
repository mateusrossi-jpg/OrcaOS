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
  PanelCard 
} from '../../../app/components/ui';
import { FinanceFacade, type ConsolidatedFinanceRecord } from '../financeFacade';
import { SimpleFinanceService } from '../../../services/SimpleFinanceService';
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

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const FINANCE_VISIBLE_LIMIT = 5;

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function parseAmount(value: string): number {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

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

  const filteredRows = useMemo(() => {
    const normalizedSearch = recordSearch.trim().toLowerCase();
    if (!normalizedSearch) return financeRecords;
    return financeRecords.filter((row) => [row.title, row.clientName, money(row.receivedAmount)].join(' ').toLowerCase().includes(normalizedSearch));
  }, [recordSearch, financeRecords]);

  const visibleRows = showAllRows ? filteredRows : filteredRows.slice(0, FINANCE_VISIBLE_LIMIT);
  const hiddenRecordCount = Math.max(filteredRows.length - visibleRows.length, 0);

  const monthSummary = useMemo(() => {
    return financeRecords.reduce((summary, row) => {
      return {
        realized: summary.realized + row.receivedAmount,
        directCosts: summary.directCosts + row.directCosts,
        net: summary.net + row.netProfit,
      };
    }, { realized: 0, directCosts: 0, net: 0 });
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
      estimatedTax: String(row.estimatedTax),
    });
  }

  async function saveAdjustment() {
    if (!editingDraft) return;
    
    const financeService = new SimpleFinanceService();
    
    await financeService.saveRecord({
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
    setSyncTick((value) => value + 1);
  }

  if (isLoading && financeRecords.length === 0) {
    return (
      <section className="simple-finance-workspace">
        <div className="empty-state-card">
          <strong>Carregando dados financeiros</strong>
          <p>Buscando orçamentos finalizados...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="simple-finance-workspace">
      <div className="dashboard-finance-tiles">
        <MetricCard label="Faturamento Real" value={<MoneyValue value={monthSummary.realized} tone="success" />} tone="success" />
        <MetricCard label="Custos Operacionais" value={<MoneyValue value={monthSummary.directCosts} tone="danger" />} tone="danger" />
        <MetricCard label="Lucro líquido" value={<MoneyValue value={monthSummary.net} tone={monthSummary.net >= 0 ? 'success' : 'danger'} />} tone={monthSummary.net >= 0 ? 'success' : 'danger'} />
      </div>

      {editingDraft && (
        <PanelCard className="finance-entry-panel">
          <BackButton onClick={() => setEditingDraft(null)} label="Voltar para resultados" />
          <header className="panel-list-header">
            <h2>Ajuste Financeiro do Orçamento</h2>
            <p>Refine valores reais de um orçamento finalizado.</p>
          </header>

            <div className="aferix-d-flex aferix-flex-column aferix-gap-md">
              <Input className="wide" label="Título do Orçamento" value={editingDraft.title} onChange={(event) => setEditingDraft((current) => current ? { ...current, title: event.target.value } : current)} />
              <Input label="Cliente" value={editingDraft.clientName} onChange={(event) => setEditingDraft((current) => current ? { ...current, clientName: event.target.value } : current)} />
              
              <SectionTitle title="Valores Reais" eyebrow="Ajuste fino pós-execução" />
              
              <MonetaryInput 
                label="Faturamento Real" 
                value={parseAmount(editingDraft.receivedAmount)} 
                onChange={(val: number) => setEditingDraft(curr => curr ? {...curr, receivedAmount: String(val)} : curr)} 
              />
              
              <div className="finance-costs-stack aferix-d-flex aferix-flex-column aferix-gap-sm">
                <MonetaryInput 
                  label="Material Real" 
                  value={parseAmount(editingDraft.materialCost)} 
                  onChange={(val: number) => setEditingDraft(curr => curr ? {...curr, materialCost: String(val)} : curr)} 
                />
                <MonetaryInput 
                  label="Deslocamento Real" 
                  value={parseAmount(editingDraft.travelCost)} 
                  onChange={(val: number) => setEditingDraft(curr => curr ? {...curr, travelCost: String(val)} : curr)} 
                />
                <MonetaryInput 
                  label="Outros Custos Reais" 
                  value={parseAmount(editingDraft.otherCosts)} 
                  onChange={(val: number) => setEditingDraft(curr => curr ? {...curr, otherCosts: String(val)} : curr)} 
                />
                <MonetaryInput 
                  label="Taxa de Cartão" 
                  value={parseAmount(editingDraft.cardFee)} 
                  onChange={(val: number) => setEditingDraft(curr => curr ? {...curr, cardFee: String(val)} : curr)} 
                />
                <MonetaryInput 
                  label="Imposto Estimado" 
                  value={parseAmount(editingDraft.estimatedTax)} 
                  onChange={(val: number) => setEditingDraft(curr => curr ? {...curr, estimatedTax: String(val)} : curr)} 
                />
              </div>
            </div>

          <div className="finance-entry-actions">
            <PrimaryButton className="finance-entry-submit" onClick={saveAdjustment}>Salvar ajuste</PrimaryButton>
          </div>
        </PanelCard>
      )}

      <PanelCard className="finance-results-panel">
        <header className="panel-list-header">
          <h2>Resultados de Orçamentos Finalizados</h2>
        </header>
        <SearchInput
          value={recordSearch}
          placeholder="Buscar orçamento por título, cliente ou valor..."
          onChange={(value) => { setRecordSearch(value); setShowAllRows(false); }}
        />
      </PanelCard>

      <ListCard>
        {financeRecords.length === 0 ? (
          <QueueEmptyState 
            title="Nenhum orçamento finalizado" 
            meta="Quando um orçamento for finalizado, o resultado aparecerá aqui automaticamente." 
            icon={<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/></svg>}
          />
        ) : filteredRows.length === 0 ? (
          <QueueEmptyState 
            title="Nenhum resultado" 
            meta={`Nenhum orçamento encontrado para "${recordSearch}".`} 
            icon={<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>}
          />
        ) : (
          visibleRows.map((row) => {
            return (
              <ListItem 
                key={row.budgetId}
                title={row.title}
                context={`${row.clientName || 'Cliente final'} • ${formatDate(row.updatedAt)}`}
                status={<StatusBadge status="finalizado" />}
                value={
                  <div className="aferix-d-flex aferix-flex-column aferix-align-end">
                    <MoneyValue value={row.netProfit} tone={row.netProfit >= 0 ? 'success' : 'danger'} compact />
                    <span className="aferix-font-xs aferix-text-muted">{row.netMarginPercent.toFixed(0)}% margem</span>
                  </div>
                }
                action={
                  <ActionMenu
                    label="Ações"
                    items={[
                      { id: 'open', label: 'Ajustar Valores', onSelect: () => openAdjustment(row) },
                    ]}
                  />
                }
              />
            );
          })
        )}
        
        {filteredRows.length > FINANCE_VISIBLE_LIMIT && (
          <div className="finance-list-expand-wrap">
            <Button variant="ghost" className="density-toggle-cta" onClick={() => setShowAllRows((current) => !current)}>
              {showAllRows ? 'Ver menos' : `Ver mais (${hiddenRecordCount})`}
            </Button>
          </div>
        )}
      </ListCard>
    </section>
  );
}
