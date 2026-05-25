import React from 'react';
import { useBudgetHistory, HistoryFilter } from '../hooks/useBudgetHistory';
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import { formatCurrencyBRL, formatPercent } from '../utils/formatters';

interface BudgetHistoryPageProps {
  onOpenBudget: (id: string) => void;
  onNewBudget: () => void;
}

export const BudgetHistoryPage: React.FC<BudgetHistoryPageProps> = ({ onOpenBudget, onNewBudget }) => {
  const { budgets, totalCount, isLoading, filter, setFilter, refresh, deleteBudget, error, clearError } = useBudgetHistory();

  const getStatusLabel = (status: string) => status.toUpperCase();
  
  const getStatusStyles = (status: string) => {
    switch (status) {
      case BUDGET_STATUS.FINALIZADO: return 'bg-green-500/10 text-green-400 border-green-500/20';
      case BUDGET_STATUS.EXECUCAO:
      case BUDGET_STATUS.INICIADO:
      case BUDGET_STATUS.REVISAO: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case BUDGET_STATUS.RECUSADO: return 'bg-red-500/10 text-red-400 border-red-500/20';
      case BUDGET_STATUS.ENVIADO:
      case BUDGET_STATUS.AUTORIZADO: return 'bg-gray-800 text-gray-300 border-gray-700';
      default: return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 pb-24 font-sans">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-100">Histórico</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{totalCount} orçamentos</p>
        </div>
        <button 
          onClick={onNewBudget}
          className="bg-yellow-500 text-gray-950 px-4 py-2 rounded-lg font-bold text-sm active:bg-yellow-600 transition-colors"
        >
          + Novo
        </button>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs font-bold flex justify-between items-center mb-6">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-300 ml-2 font-black text-sm">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        <FilterPill active={filter === 'todos'} onClick={() => setFilter('todos')} label="Todos" />
        <FilterPill active={filter === 'andamento'} onClick={() => setFilter('andamento')} label="Em andamento" />
        <FilterPill active={filter === 'finalizados'} onClick={() => setFilter('finalizados')} label="Finalizados" />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-500 mb-4"></div>
          <p className="text-sm font-medium">Carregando histórico...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
            <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-6">Nenhum orçamento criado ainda.</p>
          <button 
            onClick={onNewBudget}
            className="bg-gray-800 border border-gray-700 text-yellow-500 px-6 py-3 rounded-xl font-bold active:bg-gray-700 transition-colors"
          >
            Criar primeiro orçamento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
            {budgets.map(budget => (
              <BudgetCard 
                key={budget.id} 
                budget={budget} 
                onClick={() => {
                  onOpenBudget(budget.id);
                }} 
                statusStyles={getStatusStyles(budget.status)}
                statusLabel={getStatusLabel(budget.status)}
                deleteBudget={() => deleteBudget(budget.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const FilterPill: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
      active 
        ? 'bg-yellow-500 text-gray-950 border-yellow-500 shadow-lg shadow-yellow-500/10' 
        : 'bg-gray-900 text-gray-400 border-gray-800 active:bg-gray-800'
    }`}
  >
    {label}
  </button>
);

const BudgetCard: React.FC<{ 
  budget: Budget; 
  onClick: () => void; 
  statusStyles: string;
  statusLabel: string;
  deleteBudget?: () => void;
}> = ({ budget, onClick, statusStyles, statusLabel, deleteBudget }) => {
  
  const finance = budget.financialSnapshot || (() => {
    const calc = calculateBudget({
      chargedValue: budget.chargedValue,
      materialCost: budget.materialCost,
      travelCost: budget.travelCost,
      helperCost: budget.helperCost,
      fees: budget.fees,
      discounts: budget.discounts,
      otherCosts: budget.otherCosts,
    });
    return {
      custoTotal: calc.totalCost,
      lucroBruto: calc.grossProfit,
      margemPercentual: calc.marginPercent,
      statusLucro: calc.statusLucro,
      createdAt: budget.createdAt,
    };
  })();

  const getProfitColor = (status: string) => {
    switch (status) {
      case 'saudavel': return 'text-green-400';
      case 'atencao': return 'text-yellow-400';
      case 'prejuizo': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formattedDate = new Date(budget.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="w-full bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col text-left active:bg-gray-800 transition-colors group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-4">
          <h3 className="font-bold text-gray-100 group-active:text-yellow-400 transition-colors line-clamp-1">
            {budget.title || 'Sem título'}
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase">{formattedDate}</p>
        </div>
        <div className="flex items-center">
          <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${statusStyles}`}>
            {statusLabel}
          </span>
          {deleteBudget && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Excluir orçamento?')) {
                  deleteBudget();
                }
              }}
              className="ml-2 text-sm text-red-400 hover:text-red-300"
            >
              Excluir
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Valor Cobrado</p>
          <p className="text-lg font-black text-gray-100">{formatCurrencyBRL(budget.chargedValue)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">
            Lucro ({formatPercent(finance.margemPercentual)})
          </p>
          <p className={`text-lg font-black ${getProfitColor(finance.statusLucro)}`}>
            {formatCurrencyBRL(finance.lucroBruto)}
          </p>
        </div>
      </div>
    </div>
  );
};
