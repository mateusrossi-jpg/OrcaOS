import { useMemo } from 'react';
import type { AppTab } from '../appTypes';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { 
  PageShell, 
  PageHeader, 
  Surface,
  MoneyValue, 
  ActionMenu, 
  PrimaryButton, 
  StatusPill,
  ContextBanner
} from '../components/ui';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import type { Budget } from '../../domain/budget';
import { BUDGET_STATUS } from '../../domain/budget';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: Budget) => void;
}

/**
 * HomeScreen V6 (Centro Operacional Diário)
 * Foco em: "O que preciso fazer agora?" e "Qual a saúde do meu negócio hoje?"
 * Design: High-density, ERP Premium, Action-Oriented.
 */
export function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { budgets, isLoading, deleteBudget } = useBudgetHistory();

  // --- BUSINESS LOGIC: THE OPERATIONAL PULSE ---
  const pulse = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Financials
    const monthlyFinalized = budgets.filter(b => b.status === BUDGET_STATUS.FINALIZADO && new Date(b.updatedAt) >= startOfMonth);
    const profit = monthlyFinalized.reduce((acc, b) => acc + (b.financialSnapshot?.lucroBruto || calculateBudget(b).lucroBruto), 0);
    const receivables = budgets
      .filter(b => b.status === BUDGET_STATUS.AUTORIZADO || b.status === BUDGET_STATUS.EM_EXECUCAO)
      .reduce((acc, b) => acc + (b.chargedValue - b.discounts), 0);

    // Queues
    const executing = budgets.filter(b => b.status === BUDGET_STATUS.EM_EXECUCAO);
    const pendingApproval = budgets.filter(b => b.status === BUDGET_STATUS.ENVIADO);
    const authorized = budgets.filter(b => b.status === BUDGET_STATUS.AUTORIZADO);
    
    // Alerts (e.g., sent more than 3 days ago)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const staleProposals = pendingApproval.filter(b => new Date(b.updatedAt) < threeDaysAgo);

    return { profit, receivables, executing, pendingApproval, authorized, staleProposals };
  }, [budgets]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir este registro definitivamente?')) {
      await deleteBudget(id);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="AFERIX" sourceLabel="Inicializando mesa operacional..." />
      </PageShell>
    );
  }

  return (
    <PageShell className="aferix-operational-center">
      
      {/* 1. HERO BOARD: Saúde do Negócio */}
      <div className="op-center-hero aferix-mb-lg">
        <header className="aferix-d-flex aferix-justify-between aferix-align-center aferix-mb-md">
          <h1 className="aferix-font-xl" style={{ fontWeight: 900, letterSpacing: '-0.03em' }}>Visão Geral</h1>
          <PrimaryButton 
            onClick={() => onNavigate('new-budget')}
            style={{ borderRadius: 'var(--radius-pill)', padding: '0 var(--sz-md)', height: '36px', minHeight: '36px', fontSize: '13px' }}
          >
            + Criar
          </PrimaryButton>
        </header>

        <Surface elevation={2} padding="md" className="hero-board-surface">
          <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sz-md)' }}>
            <div className="metric-block">
              <span className="metric-label">LUCRO DO MÊS</span>
              <strong className="metric-value text-success">
                <MoneyValue value={pulse.profit} compact />
              </strong>
            </div>
            <div className="metric-block">
              <span className="metric-label">A RECEBER</span>
              <strong className="metric-value text-brand">
                <MoneyValue value={pulse.receivables} compact />
              </strong>
            </div>
          </div>
        </Surface>
      </div>

      {/* 2. ALERTAS (Priority 1) */}
      {pulse.staleProposals.length > 0 && (
        <div className="op-center-alerts aferix-mb-lg">
          <span className="aferix-eyebrow" style={{ color: 'var(--status-danger)' }}>REQUER ATENÇÃO</span>
          <Surface elevation={1} padding="sm" style={{ borderLeft: '3px solid var(--status-danger)' }}>
            <div className="aferix-d-flex aferix-justify-between aferix-align-center">
              <div className="aferix-d-flex aferix-flex-column">
                <strong className="aferix-font-sm">Propostas Frias</strong>
                <small className="aferix-text-muted">{pulse.staleProposals.length} clientes aguardando contato há mais de 3 dias.</small>
              </div>
              <button className="ghost-action" style={{ fontSize: '12px', color: 'var(--status-danger)' }}>Revisar</button>
            </div>
          </Surface>
        </div>
      )}

      {/* 3. MESA DE TRABALHO (Priority 2) */}
      <div className="op-center-queue aferix-d-flex aferix-flex-column aferix-gap-md">
        
        {/* EM EXECUÇÃO */}
        {pulse.executing.length > 0 && (
          <section className="queue-section">
            <span className="aferix-eyebrow">EM CAMPO AGORA</span>
            <div className="aferix-d-flex aferix-flex-column aferix-gap-xs">
              {pulse.executing.map(budget => (
                <Surface key={budget.id} elevation={1} padding="md" className="queue-card clickable" onClick={() => onSelectBudget?.(budget)}>
                  <div className="aferix-d-flex aferix-justify-between aferix-align-start aferix-mb-xs">
                    <strong className="aferix-font-md aferix-truncate" style={{ flex: 1, paddingRight: '8px' }}>{budget.title}</strong>
                    <StatusPill status={budget.status} />
                  </div>
                  <div className="aferix-d-flex aferix-justify-between aferix-align-center">
                    <small className="aferix-text-muted">{budget.clientName || 'Cliente Avulso'}</small>
                    <ActionMenu label="…" items={[
                      { id: 'open', label: 'Diário de Obra', onSelect: () => onSelectBudget?.(budget) }
                    ]} />
                  </div>
                </Surface>
              ))}
            </div>
          </section>
        )}

        {/* PRÓXIMOS TRABALHOS */}
        {pulse.authorized.length > 0 && (
          <section className="queue-section">
            <span className="aferix-eyebrow">PRÓXIMOS SERVIÇOS</span>
            <div className="aferix-d-flex aferix-flex-column aferix-gap-xs">
              {pulse.authorized.map(budget => (
                <Surface key={budget.id} elevation={1} padding="md" className="queue-card clickable" onClick={() => onSelectBudget?.(budget)}>
                  <div className="aferix-d-flex aferix-justify-between aferix-align-start aferix-mb-xs">
                    <strong className="aferix-font-sm aferix-truncate" style={{ flex: 1, paddingRight: '8px' }}>{budget.title}</strong>
                    <strong className="tabular-nums" style={{ fontSize: '13px', color: 'var(--brand-primary)' }}>
                      <MoneyValue value={budget.chargedValue} compact />
                    </strong>
                  </div>
                  <small className="aferix-text-muted">{budget.clientName}</small>
                </Surface>
              ))}
            </div>
          </section>
        )}

        {/* AGUARDANDO RESPOSTA */}
        {pulse.pendingApproval.length > 0 && (
          <section className="queue-section">
            <span className="aferix-eyebrow">FUNIL DE VENDAS</span>
            <div className="aferix-d-flex aferix-flex-column aferix-gap-xs">
              {pulse.pendingApproval.map(budget => (
                <Surface key={budget.id} elevation={1} padding="md" className="queue-card clickable" onClick={() => onSelectBudget?.(budget)}>
                  <div className="aferix-d-flex aferix-justify-between aferix-align-center">
                    <div className="aferix-d-flex aferix-flex-column aferix-truncate" style={{ flex: 1 }}>
                      <strong className="aferix-font-sm aferix-truncate">{budget.title}</strong>
                      <small className="aferix-text-muted">{budget.clientName}</small>
                    </div>
                    <ActionMenu label="…" items={[
                      { id: 'open', label: 'Revisar', onSelect: () => onSelectBudget?.(budget) },
                      { id: 'del', label: 'Excluir', tone: 'danger', onSelect: () => handleDelete(budget.id) },
                    ]} />
                  </div>
                </Surface>
              ))}
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {budgets.length === 0 && (
          <ContextBanner
            title="Mesa de Trabalho Limpa"
            meta="Seu centro operacional está vazio. Inicie um novo orçamento para começar a trabalhar."
            icon="🗂️"
            actionLabel="Criar Orçamento"
            onAction={() => onNavigate('new-budget')}
          />
        )}
      </div>

      <style>{`
        .aferix-operational-center {
          padding-top: var(--sz-sm);
          max-width: 440px;
          margin: 0 auto;
        }

        .metric-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .metric-value {
          font-size: 24px;
          letter-spacing: -0.02em;
        }

        .text-success { color: var(--status-success); }
        .text-brand { color: var(--brand-primary); }

        .queue-section {
          margin-bottom: var(--sz-sm);
        }

        .queue-card {
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.2s ease;
        }

        .queue-card:active {
          transform: scale(0.98);
        }

        .queue-card:hover {
          border-color: var(--border-medium);
        }
      `}</style>
    </PageShell>
  );
}
