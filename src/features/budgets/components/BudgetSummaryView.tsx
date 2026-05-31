import React, { memo } from 'react';
import { Budget } from '../../../domain/budget';
import { calculateBudget } from '../../../domain/aferixFinanceEngine';
import { formatCurrencyBRL, formatPercent } from '../../../utils/formatters';
import { operationalFacade } from '../../workflow/operationalFacade';
import { 
  MoneyValue, 
  ContextBanner
} from '../../../app/components/ui';

import { 
  SurfaceCard,
  SectionLabel,
  ExecutiveSummaryGrid,
  ValueBlock,
  InteractiveRow,
  SemanticBadge
} from '../../../ui/system';

import { Package, ArrowRight, TrendingUp, BarChart3, Clock, FileText } from 'lucide-react';

interface BudgetSummaryViewProps {
  budget: Budget;
  onArchived?: () => void;
}

/**
 * BudgetSummaryView V7 (Auditoria de Encerramento)
 * Refactored for absolute executive DNA parity (Phase 4G).
 */
export const BudgetSummaryView: React.FC<BudgetSummaryViewProps> = memo(({ budget, onArchived }) => {
  const result = calculateBudget(budget);
  const isProfitable = result.lucroBruto > 0;
  
  const handleArchive = async () => {
    if (window.confirm('Arquivar este projeto? Ele entrará no histórico permanente de BI.')) {
      await operationalFacade.archiveBudget(budget.id);
      onArchived?.();
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. FINANCIAL RESULT HERO (Cinematic) */}
      <div className="flex flex-col gap-3">
        <SectionLabel style={{ marginLeft: "8px" }}>Auditoria de Rentabilidade</SectionLabel>
        <SurfaceCard variant="cinematic" padding="lg">
          <div className="flex justify-between items-start mb-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.25em] text-[#D4A94E] uppercase mb-4 font-mono">Lucro_Líquido_Final</span>
              <p className="num text-[48px] font-bold leading-none tracking-tightest text-white">
                {formatCurrencyBRL(result.lucroBruto)}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-xl">
               <TrendingUp size={12} className="text-[#2ECC71]" />
               <span className="num text-[13px] font-bold text-white">{formatPercent(result.marginPercent)}</span>
            </div>
          </div>

          <ExecutiveSummaryGrid>
             <ValueBlock 
               label="Faturamento" 
               value={formatCurrencyBRL(result.totalComercial)} 
               icon={<BarChart3 size={11} />}
             />
             <ValueBlock 
               label="Custo_Op" 
               value={formatCurrencyBRL(result.totalCost)} 
               variant="danger"
               icon={<TrendingUp size={11} className="rotate-180" />}
             />
          </ExecutiveSummaryGrid>
        </SurfaceCard>
      </div>

      {/* 2. OPERATIONAL RECAP */}
      <div className="flex flex-col gap-3">
        <SectionLabel style={{ marginLeft: "8px" }}>Recapitulação do Escopo</SectionLabel>
        <SurfaceCard padding="none" className="overflow-hidden">
          {(budget.items || []).slice(0, 5).map((item, idx) => (
            <InteractiveRow 
              key={item.id}
              className={idx !== 0 ? "border-t border-white/[0.05]" : ""}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-1">
                   <span className="text-[14px] font-bold text-white leading-tight">{item.description}</span>
                   <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                     {item.quantity} un × {formatCurrencyBRL(item.unitPrice)}
                   </span>
                </div>
                <span className="num text-[13px] font-bold text-white">
                   {formatCurrencyBRL(item.quantity * item.unitPrice)}
                </span>
              </div>
            </InteractiveRow>
          ))}
          {budget.items.length > 5 && (
            <div className="p-5 text-center bg-white/[0.01] border-t border-white/[0.05]">
              <span className="text-[10px] font-bold text-[#505050] uppercase tracking-widest font-mono">
                + {budget.items.length - 5} ITENS ADICIONAIS NO REGISTRO
              </span>
            </div>
          )}
        </SurfaceCard>
      </div>

      {/* 3. PERMANENT LOGS */}
      {(budget.commercialNotes || budget.notes) && (
        <div className="flex flex-col gap-3">
           <SectionLabel style={{ marginLeft: "8px" }}>Registro Técnico Permanente</SectionLabel>
           <SurfaceCard padding="lg" className="bg-[#141414]">
              {budget.commercialNotes && (
                <div className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-3 opacity-30">
                     <FileText size={11} />
                     <span className="text-[9px] font-black uppercase tracking-widest font-mono">Notas Comerciais</span>
                  </div>
                  <p className="text-[14px] font-medium text-[#808080] leading-relaxed">{budget.commercialNotes}</p>
                </div>
              )}
              {budget.notes && (
                <div className="last:mb-0">
                  <div className="flex items-center gap-2 mb-3 opacity-30">
                     <Clock size={11} />
                     <span className="text-[9px] font-black uppercase tracking-widest font-mono">Diário de Execução</span>
                  </div>
                  <p className="text-[14px] font-medium text-[#808080] leading-relaxed">{budget.notes}</p>
                </div>
              )}
           </SurfaceCard>
        </div>
      )}

      {/* 4. FINAL ACTION */}
      <div className="flex flex-col gap-4">
        <ContextBanner
          title="Consolidar e Arquivar"
          meta="Este projeto será movido para o histórico permanente e os dados serão computados no seu BI mensal."
          icon={<Package className="h-5 w-5" />}
        />
        <button 
          onClick={handleArchive}
          className="w-full flex items-center justify-center gap-3 h-16 rounded-2xl bg-[#D4A94E] text-black text-[14px] font-bold shadow-[0_8px_32px_rgba(212,169,78,0.15)] active:scale-[0.98] transition-all uppercase tracking-widest"
        >
          CONSOLIDAR OPERAÇÃO <ArrowRight className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
});
