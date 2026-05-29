import React from 'react';
import { Budget } from '../../../domain/budget';
import { calculateBudget } from '../../../domain/aferixFinanceEngine';
import { formatCurrencyBRL, formatPercent } from '../../../utils/formatters';
import { operationalFacade } from '../../workflow/operationalFacade';
import { 
  Card,
  MoneyValue, 
  SectionLabel, 
  ContextBanner,
  PageTitle,
  ListItem
} from '../../../app/components/ui';
import { cn } from '../../../utils/ui';
import { Package, ArrowRight } from 'lucide-react';

interface BudgetSummaryViewProps {
  budget: Budget;
  onArchived?: () => void;
}

/**
 * BudgetSummaryView V6 (Auditoria de Encerramento)
 * Purified and focused on final business results.
 */
export const BudgetSummaryView: React.FC<BudgetSummaryViewProps> = ({ budget, onArchived }) => {
  const result = calculateBudget(budget);
  const isProfitable = result.lucroBruto > 0;
  
  const handleArchive = async () => {
    if (window.confirm('Arquivar este projeto? Ele sairá da Mesa de Trabalho e entrará no histórico permanente.')) {
      await operationalFacade.archiveBudget(budget.id);
      onArchived?.();
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-32">
      <PageTitle 
        eyebrow="Operação Finalizada"
        title="Auditoria de Lucro"
        subtitle="Confira o desempenho consolidado e a rentabilidade final deste projeto."
      />

      {/* 1. FINANCIAL RESULT (Executive Polish) */}
      <Card className="p-8 border-l-4 border-l-[var(--accent-gold)]">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-gold)] mb-3">Lucro Líquido Consolidado</p>
            <p className={cn("num text-[48px] font-bold leading-none tracking-tighter", isProfitable ? "text-[var(--accent-gold)]" : "text-[var(--accent-red)]")}>
              {formatCurrencyBRL(result.lucroBruto)}
            </p>
          </div>
          <div className="rounded-full bg-[var(--accent-gold)]/10 px-4 py-2 text-[16px] font-bold text-[var(--accent-gold)] border border-[var(--accent-gold)]/20 shadow-glow">
            {formatPercent(result.marginPercent)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t var(--border-subtle) pt-8">
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Faturamento Real</p>
            <p className="num text-[22px] font-bold text-[var(--text-primary)]">{formatCurrencyBRL(result.totalComercial)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Custo Operacional</p>
            <p className="num text-[22px] font-bold text-[var(--accent-red)] opacity-80">{formatCurrencyBRL(result.totalCost)}</p>
          </div>
        </div>
      </Card>

      {/* 2. OPERATIONAL RECAP */}
      <div className="flex flex-col gap-4">
        <SectionLabel className="mt-0">Recapitulação do Escopo</SectionLabel>
        <div className="flex flex-col gap-2">
          {(budget.items || []).slice(0, 4).map((item) => (
            <ListItem
              key={item.id}
              title={item.description}
              context={`${item.quantity} un x ${formatCurrencyBRL(item.unitPrice)}`}
              value={<MoneyValue value={item.quantity * item.unitPrice} compact />}
            />
          ))}
          {budget.items.length > 4 && (
            <div className="p-5 text-center rounded-xl border border-dashed border-white/5 bg-white/[0.01]">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">+ {budget.items.length - 4} itens no escopo</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. NOTES */}
      {(budget.commercialNotes || budget.notes) && (
        <Card className="p-8">
          <SectionLabel className="mt-0 mb-8">Registro Permanente</SectionLabel>
          <div className="flex flex-col gap-8">
            {budget.commercialNotes && (
              <div>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em] mb-3">Notas Comerciais</p>
                <p className="text-[14.5px] font-medium text-[var(--text-secondary)] leading-relaxed">{budget.commercialNotes}</p>
              </div>
            )}
            {budget.notes && (
              <div>
                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em] mb-3">Diário de Execução</p>
                <p className="text-[14.5px] font-medium text-[var(--text-secondary)] leading-relaxed">{budget.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 4. FINAL ACTION */}
      <div className="flex flex-col gap-4 mt-4">
        <ContextBanner
          title="Consolidar e Arquivar"
          meta="Este projeto será movido para o histórico e o lucro será computado no seu BI mensal."
          icon={<Package className="h-5 w-5" />}
        />
        <button 
          onClick={handleArchive}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[var(--bg-surface-glass)] border border-[var(--accent-gold)]/30 py-5 text-[15px] font-bold text-[var(--accent-gold)] active:scale-[0.98] transition-all shadow-glow"
        >
          CONSOLIDAR OPERAÇÃO <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
