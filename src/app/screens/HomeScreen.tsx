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
 * HomeScreen V3 (Centro Operacional)
 * Foco em prioridades diárias, lucro real e ações rápidas.
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

    return { revenue, profit };
  }, [budgets]);

  // Fila de Atenção: Itens em execução ou orçamentos enviados (pendentes)
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
        <PageHeader title="Carregando Centro de Comando..." />
      </PageShell>
    );
  }

  return (
    <PageShell className="aferix-home-screen v3">
      {/* 1. CABEÇALHO HERO */}
      <div className="home-hero-section aferix-mb-lg">
        <PageHeader 
          title="Bom dia, Profissional" 
          sourceLabel="Seu pulso operacional de hoje."
        />
        
        <Surface elevation={2} padding="lg" className="hero-kpi-card aferix-mt-md">
          <div className="aferix-d-flex aferix-justify-between aferix-align-start">
            <div className="aferix-d-flex aferix-flex-column">
              <span className="aferix-font-xs aferix-text-muted aferix-font-bold">LUCRO LÍQUIDO (MÊS)</span>
              <strong style={{ fontSize: '32px', color: 'var(--status-success)' }}>
                <MoneyValue value={metrics.profit} />
              </strong>
            </div>
            <PrimaryButton 
              onClick={() => onNavigate('new-budget')}
              style={{ borderRadius: 'var(--radius-pill)', padding: '0 24px' }}
            >
              + Novo Orçamento
            </PrimaryButton>
          </div>
          
          <div className="aferix-divider aferix-my-md" style={{ height: '1px', background: 'var(--border-soft)' }} />
          
          <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span className="aferix-d-block aferix-font-xs aferix-text-muted">FATURAMENTO REALIZADO</span>
              <strong className="aferix-font-md"><MoneyValue value={metrics.revenue} /></strong>
            </div>
            <div>
              <span className="aferix-d-block aferix-font-xs aferix-text-muted">MARGEM MÉDIA</span>
              <strong className="aferix-font-md" style={{ color: 'var(--brand-primary)' }}>
                {metrics.revenue > 0 ? ((metrics.profit / metrics.revenue) * 100).toFixed(0) : 0}%
              </strong>
            </div>
          </div>
        </Surface>
      </div>

      {/* 2. FILA DE OPERAÇÃO (O QUE FAZER AGORA?) */}
      <div className="home-operational-focus aferix-d-flex aferix-flex-column aferix-gap-lg">
        
        {operationalQueue.executing.length > 0 && (
          <div className="op-section">
            <SectionTitle title="Trabalhos em Execução" eyebrow="Ação em Campo" />
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
            <SectionTitle title="Aguardando Resposta" eyebrow="Funil de Vendas" />
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

        {operationalQueue.authorized.length > 0 && (
          <div className="op-section">
            <SectionTitle title="Próximos Inícios" eyebrow="Agenda" />
            <ListCard>
              {operationalQueue.authorized.map(budget => (
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
        .home-hero-section {
          background: radial-gradient(circle at top right, var(--brand-soft), transparent 40%);
          margin: -16px -16px 24px -16px;
          padding: 16px;
          border-bottom: 1px solid var(--border-soft);
        }
        
        .hero-kpi-card {
          border-color: var(--brand-primary);
        }

        .op-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 480px) {
          .hero-kpi-card h2, .hero-kpi-card strong {
            letter-spacing: -0.02em;
          }
        }
      `}</style>
    </PageShell>
  );
}
