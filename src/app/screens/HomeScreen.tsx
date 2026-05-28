import { useMemo } from 'react';
import type { AppTab } from '../appTypes';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { 
  PageShell, 
  PageHeader, 
  ListItem, 
  ListCard, 
  StatusBadge, 
  SectionTitle, 
  MoneyValue, 
  ActionMenu, 
  PrimaryButton, 
  Surface,
  ContextBanner,
  KpiCard
} from '../components/ui';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import type { Budget } from '../../domain/budget';
import { BUDGET_STATUS } from '../../domain/budget';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: Budget) => void;
}

/**
 * HomeScreen V5 (Centro de Comando Premium)
 * Total parity with design spec: High-impact metric grid and Operational Queue.
 */
export function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { budgets, isLoading, deleteBudget } = useBudgetHistory();

  const metrics = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyBudgets = (budgets || []).filter(b => new Date(b.updatedAt) >= startOfMonth);
    
    const revenue = monthlyBudgets
      .filter(b => b.status === BUDGET_STATUS.FINALIZADO)
      .reduce((acc, b) => acc + (b.chargedValue - b.discounts), 0);
      
    const profit = monthlyBudgets
      .filter(b => b.status === BUDGET_STATUS.FINALIZADO)
      .reduce((acc, b) => acc + (calculateBudget(b).lucroBruto), 0);

    const activeCount = budgets.filter(b => ['iniciado', 'enviado', 'autorizado', 'em_execucao'].includes(b.status)).length;

    return { revenue, profit, activeCount };
  }, [budgets]);

  const operationalQueue = useMemo(() => {
    const executing = budgets.filter(b => b.status === BUDGET_STATUS.EM_EXECUCAO);
    const pendingApproval = budgets.filter(b => b.status === BUDGET_STATUS.ENVIADO);
    const authorized = budgets.filter(b => b.status === BUDGET_STATUS.AUTORIZADO);
    
    return { executing, pendingApproval, authorized };
  }, [budgets]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir este registro definitivamente?')) {
      await deleteBudget(id);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="AFERIX" sourceLabel="Carregando pulso operacional..." />
      </PageShell>
    );
  }

  return (
    <PageShell className="aferix-home-screen v5">
      {/* 1. HEADER & GLOBAL CTA */}
      <div className="home-hero-header">
        <PageHeader 
          title="Resumo" 
          sourceLabel="Pulso operacional de hoje"
          action={
            <PrimaryButton 
              onClick={() => onNavigate('new-budget')}
              style={{ borderRadius: 'var(--radius-pill)', padding: '0 var(--sz-lg)' }}
            >
              + Novo
            </PrimaryButton>
          }
        />
      </div>

      {/* 2. KPI GRID (Section 4.5 Spec) */}
      <div className="aferix-grid-2 aferix-mb-xl">
        <KpiCard 
          label="Lucro do Mês" 
          value={metrics.profit} 
          featured 
          trend={{ value: 12, isPositive: true, label: 'vs mês anterior' }}
        />
        <KpiCard 
          label="Serviços Ativos" 
          value={metrics.activeCount} 
          trend={{ value: 5, isPositive: true, label: 'novos hoje' }}
        />
      </div>

      {/* 3. FILA DE OPERAÇÃO */}
      <div className="home-operational-focus aferix-d-flex aferix-flex-column aferix-gap-lg">
        
        {operationalQueue.executing.length > 0 && (
          <div className="op-section">
            <SectionTitle title="Trabalhos em Execução" eyebrow="Campo" />
            <ListCard>
              {operationalQueue.executing.map(budget => (
                <ListItem
                  key={budget.id}
                  onClick={() => onSelectBudget?.(budget)}
                  title={budget.title}
                  context={budget.clientName}
                  status={<StatusBadge status={budget.status} />}
                  value={<MoneyValue value={calculateBudget(budget).totalComercial} compact />}
                  action={
                    <ActionMenu
                      label="…"
                      items={[
                        { id: 'open', label: 'Abrir OS', onSelect: () => onSelectBudget?.(budget) },
                        { id: 'delete', label: 'Excluir', tone: 'danger', onSelect: () => handleDelete(budget.id) },
                      ]}
                    />
                  }
                />
              ))}
            </ListCard>
          </div>
        )}

        {operationalQueue.pendingApproval.length > 0 && (
          <div className="op-section">
            <SectionTitle title="Aguardando Resposta" eyebrow="Propostas" />
            <ListCard>
              {operationalQueue.pendingApproval.map(budget => (
                <ListItem
                  key={budget.id}
                  onClick={() => onSelectBudget?.(budget)}
                  title={budget.title}
                  context={budget.clientName}
                  status={<StatusBadge status={budget.status} />}
                  value={<MoneyValue value={calculateBudget(budget).totalComercial} compact />}
                />
              ))}
            </ListCard>
          </div>
        )}

        {budgets.length === 0 && (
          <ContextBanner
            title="Sua mesa está limpa."
            meta="Inicie um novo orçamento para começar a organizar sua operação."
            icon="✨"
          />
        )}
      </div>

      <style>{`
        .aferix-home-screen.v5 {
          padding-top: var(--sz-sm);
        }

        .home-hero-header {
          margin-bottom: var(--sz-lg);
        }

        .op-section {
          display: flex;
          flex-direction: column;
          gap: var(--sz-sm);
        }
      `}</style>
    </PageShell>
  );
}
