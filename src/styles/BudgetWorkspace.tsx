import type { ReactNode } from 'react';

interface BudgetWorkspaceProps {
  children: ReactNode;
  subtotal: number;
  taxes: number;
  netProfit: number;
}

export function BudgetWorkspace({ children, subtotal, taxes, netProfit }: BudgetWorkspaceProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start w-full max-w-7xl mx-auto p-4">
      
      {/* Coluna Esquerda: Itens do Orçamento (70%) */}
      <div className="w-full md:w-[70%] bg-[#161618] border border-[#27272A] rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#F8FAFC] mb-6 border-b border-[#27272A] pb-4">
          Itens da Proposta
        </h2>
        {/* Renderiza a tabela de itens ou blocos de levantamento aqui */}
        <div className="space-y-4">
          {children}
        </div>
      </div>

      {/* Coluna Direita: Painel Financeiro Sticky (30%) */}
      <div className="w-full md:w-[30%] bg-[#161618] border border-[#27272A] rounded-lg p-6 sticky top-6">
        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Resumo do Orçamento</h3>
        
        <div className="space-y-3 text-sm border-b border-[#27272A] pb-4 mb-4">
          <div className="flex justify-between">
            <span className="text-[#A1A1AA]">Subtotal (Materiais + Serviço)</span>
            <span className="text-[#F8FAFC] font-medium">R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Impostos Estimados</span>
            <span className="text-[#EF4444] font-medium">- R$ {taxes.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-[#F8FAFC] font-bold text-base">Lucro Estimado</span>
          <span className="text-[#10B981] font-bold text-xl">R$ {netProfit.toFixed(2)}</span>
        </div>

        <button className="w-full bg-[#f59e0b] hover:bg-[#0F766E] active:bg-[#115E59] text-[#071312] font-semibold py-3 px-4 rounded-lg transition-colors">
          Salvar & Gerar PDF
        </button>
      </div>
    </div>
  );
}
