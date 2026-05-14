interface DashboardTilesProps {
  netProfit: number;
  revenue: number;
  expenses: number;
}

export function DashboardTiles({ netProfit, revenue, expenses }: DashboardTilesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Lucro Líquido - Destaque Principal */}
      <div className="bg-[#161618] border border-[#27272A] p-5 rounded-lg flex flex-col justify-between">
        <span className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">
          Lucro Líquido (Mês)
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-5xl font-black text-[#10B981]">R$ {netProfit.toFixed(2)}</span>
          <span className="text-[#10B981] text-sm font-semibold">+12%</span>
        </div>
      </div>

      {/* Receita Total */}
      <div className="bg-[#161618] border border-[#27272A] p-5 rounded-lg flex flex-col justify-between">
        <span className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">
          Receita Estimada
        </span>
        <div className="mt-2">
          <span className="text-2xl font-semibold text-[#10B981]">R$ {revenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Despesas Operacionais */}
      <div className="bg-[#161618] border border-[#27272A] p-5 rounded-lg flex flex-col justify-between">
        <span className="text-[#94A3B8] text-sm font-medium uppercase tracking-wider">
          Custos & Despesas
        </span>
        <div className="mt-2">
          <span className="text-2xl font-semibold text-[#EF4444]">R$ {expenses.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
