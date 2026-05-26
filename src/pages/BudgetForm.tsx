import React from 'react';
import { useBudgetForm } from '../hooks/useBudgetForm';
import { formatCurrencyBRL, formatPercent } from '../utils/formatters';
import { useClients } from '../hooks/useClients';
import { Client } from '../domain/client';
import { Budget } from '../domain/budget';


interface BudgetFormProps {
  id?: string | null;
  onBack?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ id, onBack }) => {


  const {
    budget,
    isLoading,
    updateField,
    preview,
    isSaving,
    isReadOnly,
    showFinalizeModal,
    saveDraft,
    markAsSent,
    markAsAuthorized,
    markAsRejected,
    requestFinalize,
    cancelFinalize,
    confirmFinalize,
    error,
    clearError,
  } = useBudgetForm(id);

  const handleSaveDraft = async () => {
    await saveDraft();
  };

  const { clients } = useClients();

  const handleNumericChange = (field: string, value: string) => {
    const numValue = parseFloat(value.replace(',', '.')) || 0;
    updateField(field as unknown as keyof Budget, numValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saudavel': return 'text-green-400';
      case 'atencao': return 'text-yellow-400';
      case 'prejuizo': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-500 mb-4"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-4 pb-36 font-sans transition-opacity duration-300 ${isSaving ? 'opacity-70' : 'opacity-100'}`}>
      {/* 1. Header Compacto */}
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:bg-gray-900 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-100 truncate max-w-[180px]">
            {budget.title || (id ? 'Editar orçamento' : 'Novo orçamento')}
          </h1>
        </div>
        <span className={`text-[10px] px-2 py-1 bg-gray-900 rounded-md border border-gray-800 uppercase font-bold tracking-wider ${isReadOnly ? 'text-green-500 border-green-900/50' : 'text-yellow-500 border-yellow-900/50'}`}>
          {budget.status}
        </span>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs font-bold flex justify-between items-center mb-6">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-300 ml-2 font-black text-sm">✕</button>
        </div>
      )}

      <div className="space-y-8">
        {/* 2. Dominant Field: Valor Cobrado (AHA MOMENT) */}
        <section className={`relative overflow-hidden p-8 rounded-3xl border-2 transition-all duration-500 ${isReadOnly ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-900 border-gray-800'}`}>
          
          <label className="block text-xs text-yellow-500 uppercase font-black mb-4 text-center tracking-widest opacity-80">Preço do Serviço</label>
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-500">R$</span>
              <input
                type="number"
                inputMode="decimal"
                value={budget.chargedValue || ''}
                onChange={(e) => handleNumericChange('chargedValue', e.target.value)}
                disabled={isReadOnly}
                className="bg-transparent text-lg font-medium text-white focus:outline-none w-full text-center disabled:opacity-100 placeholder-gray-800"
                placeholder="0,00"
              />
            </div>
          </div>
        </section>

        {/* 3. Basic Data */}
        <div className="grid grid-cols-1 gap-4">
          <div className={`p-4 rounded-2xl border transition-colors ${isReadOnly ? 'bg-transparent border-gray-900' : 'bg-gray-900/50 border-gray-800 focus-within:border-gray-700'}`}>
            <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-wider">Título do Projeto</label>
            <input
              type="text"
              value={budget.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={isReadOnly}
              className="w-full bg-transparent text-base font-bold text-gray-100 focus:outline-none placeholder-gray-700 disabled:opacity-100"
              placeholder="Ex: Instalação Residencial"
            />
          </div>
          <div className={`p-4 rounded-2xl border transition-colors ${isReadOnly ? 'bg-transparent border-gray-900' : 'bg-gray-900/50 border-gray-800 focus-within:border-gray-700'}`}>
            <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 tracking-wider">Cliente</label>
            <select
              value={budget.clientId || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedClient = clients.find((c: Client) => c.id === selectedId);
                updateField('clientId', selectedId);
                updateField('clientName', selectedClient?.name || '');
              }}
              disabled={isReadOnly}
              className="w-full bg-transparent text-base font-bold text-gray-100 focus:outline-none disabled:opacity-100"
            >
              <option value="">Cliente Avulso (Nome Livre)</option>
              {clients.map((c: Client) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {!budget.clientId && (
              <input
                type="text"
                value={budget.clientName || ''}
                onChange={(e) => updateField('clientName', e.target.value)}
                disabled={isReadOnly}
                className="w-full bg-transparent text-sm font-medium text-gray-300 focus:outline-none placeholder-gray-700 disabled:opacity-100 border-t border-gray-800 pt-3 mt-3"
                placeholder="Digite o nome do cliente avulso..."
              />
            )}
          </div>
        </div>

        {/* 4. Costs Grid (Mobile Friendly) */}
        <div>
          <h3 className="text-xs text-gray-500 uppercase font-black mb-4 px-1 tracking-widest">Custos e Deduções</h3>
          <div className="grid grid-cols-2 gap-3">
            <CostInput label="Materiais" value={budget.materialCost} onChange={(val) => handleNumericChange('materialCost', val)} disabled={isReadOnly} />
            <CostInput label="Ajudante" value={budget.helperCost} onChange={(val) => handleNumericChange('helperCost', val)} disabled={isReadOnly} />
            <CostInput label="Transporte" value={budget.travelCost} onChange={(val) => handleNumericChange('travelCost', val)} disabled={isReadOnly} />
            <CostInput label="Outros" value={budget.otherCosts} onChange={(val) => handleNumericChange('otherCosts', val)} disabled={isReadOnly} />
            <CostInput label="Taxas" value={budget.fees} onChange={(val) => handleNumericChange('fees', val)} disabled={isReadOnly} />
            <CostInput label="Desconto" value={budget.discounts} onChange={(val) => handleNumericChange('discounts', val)} disabled={isReadOnly} isNegative />
          </div>
        </div>
      </div>

      {/* 6. Hierarquia de Ações */}
      {!isReadOnly && (
        <div className="mt-12 space-y-4">
          <button onClick={handleSaveDraft} disabled={isSaving} className="w-full bg-gray-900 border border-gray-800 py-4 rounded-2xl font-black text-sm text-gray-300 active:bg-gray-800 active:scale-[0.98] transition-all uppercase tracking-widest">
            {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={markAsSent} disabled={isSaving} className="bg-gray-900 border border-gray-800 py-4 rounded-2xl font-bold text-xs text-gray-400 active:bg-gray-800 transition-colors uppercase">
              Enviado
            </button>
            <button onClick={markAsAuthorized} disabled={isSaving} className="bg-green-500/10 border border-green-500/20 py-4 rounded-2xl font-bold text-xs text-green-500 active:bg-green-500/20 transition-colors uppercase">
              Autorizar
            </button>
          </div>
          
          <button onClick={markAsRejected} disabled={isSaving} className="w-full bg-transparent border border-red-900/30 py-4 rounded-2xl font-bold text-xs text-red-900 active:bg-red-900/10 transition-colors uppercase">
            Recusar
          </button>

          <div className="pt-4">
            <button onClick={requestFinalize} disabled={isSaving} className="w-full bg-yellow-500 py-5 rounded-2xl font-black text-gray-950 active:bg-yellow-600 active:scale-[0.98] transition-all uppercase tracking-[0.1em] shadow-lg shadow-yellow-500/20">
              Finalizar Orçamento
            </button>
          </div>
        </div>
      )}

      {/* 5. Compact Sticky Preview (REFINED) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 z-40 pointer-events-none">
        <div className="max-w-md mx-auto bg-gray-800 border border-gray-700 p-3 rounded-xl flex justify-between items-center pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Lucro Real</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${getStatusColor(preview?.statusLucro || 'saudavel')}`}>
                {formatCurrencyBRL(preview?.grossProfit || 0)}
              </span>
              <span className={`text-[10px] font-bold ${getStatusColor(preview?.statusLucro || 'saudavel')} opacity-80`}>
                ({formatPercent(preview?.marginPercent || 0)})
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Custo Total</span>
            <span className="text-sm font-black text-gray-300">
              {formatCurrencyBRL(preview?.totalCost || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* 7. Finalize Modal (DARK PREMIUM) */}
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black/95 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-sm rounded-lg p-6">
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-8 sm:hidden" />
            
            <h2 className="text-2xl font-black text-white mb-8 text-center uppercase tracking-wider">Revisão Final</h2>
            
            <div className="space-y-5 mb-10">
              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Faturamento</span>
                <span className="text-lg font-black text-white">{formatCurrencyBRL((budget.chargedValue - budget.discounts) || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Custos Operacionais</span>
                <span className="text-lg font-bold text-red-500">-{formatCurrencyBRL(preview?.totalCost || 0)}</span>
              </div>
              <div className="bg-gray-950/50 p-6 rounded-3xl border border-gray-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Lucro do Serviço</span>
                  <span className={`text-[10px] font-black uppercase ${getStatusColor(preview?.statusLucro || 'saudavel')}`}>{preview?.statusLucro || 'saudavel'}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className={`text-3xl font-black ${getStatusColor(preview?.statusLucro || 'saudavel')}`}>
                    {formatCurrencyBRL(preview?.grossProfit || 0)}
                  </span>
                  <span className={`text-base font-black ${getStatusColor(preview?.statusLucro || 'saudavel')}`}>
                    {formatPercent(preview?.marginPercent || 0)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-600 mb-8 text-center leading-relaxed font-bold uppercase tracking-wide">
              Esta ação é definitiva e congela os valores para relatórios.
            </p>

            <div className="space-y-3">
              <button
                onClick={confirmFinalize}
                disabled={isSaving}
                className="w-full bg-yellow-500 py-5 rounded-2xl font-black text-gray-950 uppercase tracking-widest active:scale-95 transition-transform"
              >
                Confirmar e Congelar
              </button>
              <button
                onClick={cancelFinalize}
                disabled={isSaving}
                className="w-full py-4 rounded-2xl font-bold text-gray-500 bg-transparent active:text-gray-300 transition-colors uppercase text-xs"
              >
                Voltar e Ajustar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CostInputProps {
  label: string;
  value: number;
  onChange: (val: string) => void;
  disabled?: boolean;
  isNegative?: boolean;
}

const CostInput: React.FC<CostInputProps> = ({ label, value, onChange, disabled, isNegative }) => (
  <div className={`p-4 rounded-2xl border transition-all ${disabled ? 'bg-transparent border-gray-900' : 'bg-gray-900/50 border-gray-800 active:scale-[0.97] active:bg-gray-800'}`}>
    <label className="block text-[10px] text-gray-300 uppercase font-black mb-2 tracking-widest">{label}</label>
    <div className="flex items-center">
      <span className={`text-xs font-black mr-1 ${isNegative ? 'text-red-500' : 'text-gray-600'}`}>
        {isNegative ? '-' : '+'} R$
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-transparent text-xl font-black focus:outline-none text-gray-100 placeholder-gray-800 disabled:opacity-100"
        placeholder="0,00"
      />
    </div>
  </div>
);
