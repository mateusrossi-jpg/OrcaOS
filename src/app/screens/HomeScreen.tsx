import type { AppTab } from '../appTypes';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { PageShell, PageHeader, QueueEmptyState, ListItem, ListCard, StatusBadge, SectionTitle, MoneyValue } from '../components/ui';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import type { Budget } from '../../domain/budget';

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void;
  onSelectBudget?: (budget: Budget) => void;
}

export function HomeScreen({ onNavigate, onSelectBudget }: HomeScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();

  // 3. Atividade Recente: Lista enxuta (max 3 a 5 itens)
  const recentBudgets = budgets.slice(0, 5);

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="Painel" />
        <div className="empty-state-card">
          <strong>Carregando sua operação...</strong>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="aferix-operational-screen">
      <PageHeader title="Painel Operacional" />

      <div className="home-dashboard-layout">
        
        {/* 1. CTA Principal e Único */}
        <section className="home-primary-cta-section">
          <button 
            className="home-primary-cta" 
            onClick={() => onNavigate('new-budget')}
          >
            <span className="cta-icon">＋</span>
            Novo Orçamento
          </button>
        </section>



        {/* 3. Atividade Recente */}
        {budgets.length === 0 ? (
          <QueueEmptyState
            title="Sua operação começa aqui"
            icon="🚀"
            meta="Crie seu primeiro orçamento para começar a gerenciar seus ganhos com precisão."
            action={<button className="primary-action" onClick={() => onNavigate('new-budget')}>Criar primeiro orçamento</button>}
          />
        ) : (
          <div className="home-recent-activity">
            <SectionTitle title="Atividade Recente" />
            <ListCard>
              {recentBudgets.map((budget) => (
                <ListItem
                  key={budget.id}
                  onClick={() => onSelectBudget?.(budget)}
                  title={budget.title || 'Sem título'}
                  context={budget.clientName || 'Cliente não informado'}
                  status={<StatusBadge status={budget.status} />}
                  value={<MoneyValue value={calculateBudget(budget).totalComercial} compact />}
                />
              ))}
            </ListCard>
          </div>
        )}
      </div>

      <style>{`
        .home-dashboard-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
          width: 100%;
        }
        
        /* Premium Yellow CTA */
        .home-primary-cta-section {
          display: flex;
          flex-direction: column;
        }

        .home-primary-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          min-height: 64px;
          border: none;
          border-radius: var(--aferix-radius-lg, 12px);
          background: var(--aferix-primary, #f5a400);
          color: #000;
          font-size: 1.15rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
          box-shadow: 0 4px 14px rgba(245, 164, 0, 0.25);
        }

        .home-primary-cta:active {
          transform: scale(0.98);
          box-shadow: 0 2px 8px rgba(245, 164, 0, 0.2);
        }

        .cta-icon {
          font-size: 1.4rem;
          font-weight: bold;
        }

        .operational-metrics-panel {
          padding: 16px !important;
          background: var(--aferix-surface-raised, #16181e) !important;
          border: 1px solid var(--aferix-border, #2a2d36) !important;
        }

        .compact-metric-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 12px !important;
        }
        
        @media (max-width: 480px) {
          .compact-metric-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          /* Receita takes full width if it's the 3rd item */
          .compact-metric-grid > article:last-child {
            grid-column: 1 / -1;
          }
        }

        .home-recent-activity {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
          width: 100%;
        }
      `}</style>
    </PageShell>
  );
}
