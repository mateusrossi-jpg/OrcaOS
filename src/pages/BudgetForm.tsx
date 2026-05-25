import React, { useState } from 'react';
import { useBudgetForm } from '../hooks/useBudgetForm';
import { BUDGET_STATUS } from '../domain/budget';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const BudgetForm: React.FC = () => {
  const {
    budget,
    updateField,
    calculation,
    save,
    sendToClient,
    finalize,
    isSaving,
    isReadOnly,
  } = useBudgetForm();

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  const handleNumericChange = (field: string, value: string) => {
    const numValue = parseFloat(value.replace(',', '.')) || 0;
    updateField(field as any, numValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saudavel': return 'text-green-400';
      case 'atencao': return 'text-yellow-400';
      case 'prejuizo': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 pb-32">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-yellow-500 uppercase tracking-wider">
          {isReadOnly ? 'Orçamento Finalizado' : 'Novo Orçamento'}
        </h1>
        <div className="text-xs px-2 py-1 bg-gray-800 rounded border border-gray-700 uppercase">
          {budget.status}
        </div>
      </header>

      {/* Main Form */}
      <div className="space-y-6">
        {/* Title */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <label className="block text-xs text-gray-400 uppercase mb-1">Título do Projeto</label>
          <input
            type="text"
            value={budget.title}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={isReadOnly}
            className="w-full bg-transparent text-lg font-medium focus:outline-none border-b border-gray-700 focus:border-yellow-500 py-1"
            placeholder="Ex: Reforma Cozinha"
          />
        </div>

        {/* Highlighted Value */}
        <div className="bg-gray-800 p-6 rounded-xl border-2 border-yellow-600/30">
          <label className="block text-sm text-yellow-500 uppercase font-bold mb-2 text-center">Valor Cobrado</label>
          <div className="relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-500">R$</span>
            <input
              type="number"
              inputMode="decimal"
              value={budget.chargedValue || ''}
              onChange={(e) => handleNumericChange('chargedValue', e.target.value)}
              disabled={isReadOnly}
              className="w-full bg-transparent text-5xl font-black text-center focus:outline-none text-white pl-12"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Costs Grid */}
        <div className="grid grid-cols-2 gap-4">
          <CostInput
            label="Materiais"
            value={budget.materialCost}
            onChange={(val) => handleNumericChange('materialCost', val)}
            disabled={isReadOnly}
          />
          <CostInput
            label="Deslocamento"
            value={budget.travelCost}
            onChange={(val) => handleNumericChange('travelCost', val)}
            disabled={isReadOnly}
          />
          <CostInput
            label="Ajudante"
            value={budget.helperCost}
            onChange={(val) => handleNumericChange('helperCost', val)}
            disabled={isReadOnly}
          />
          <CostInput
            label="Outros Custos"
            value={budget.otherCosts}
            onChange={(val) => handleNumericChange('otherCosts', val)}
            disabled={isReadOnly}
          />
          <CostInput
            label="Taxas/Impostos"
            value={budget.fees}
            onChange={(val) => handleNumericChange('fees', val)}
            disabled={isReadOnly}
          />
          <CostInput
            label="Desconto"
            value={budget.discounts}
            onChange={(val) => handleNumericChange('discounts', val)}
            disabled={isReadOnly}
            isNegative
          />
        </div>
      </div>

      {/* Actions */}
      {!isReadOnly && (
        <div className="mt-8 space-y-3">
          <button
            onClick={save}
            disabled={isSaving}
            className="w-full bg-gray-800 border border-gray-700 py-4 rounded-xl font-bold text-gray-300 active:bg-gray-700 transition-colors"
          >
            {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          <button
            onClick={sendToClient}
            className="w-full bg-gray-800 border border-yellow-900/50 py-4 rounded-xl font-bold text-yellow-500 active:bg-gray-700 transition-colors"
          >
            Enviar para Cliente
          </button>
          <button
            onClick={() => setShowFinalizeModal(true)}
            className="w-full bg-yellow-500 py-4 rounded-xl font-black text-gray-900 active:bg-yellow-600 transition-colors uppercase"
          >
            Finalizar Orçamento
          </button>
        </div>
      )}

      {/* Sticky Financial Preview */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-md border-t border-gray-700 p-4 shadow-2xl">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold">Custo Total: {formatCurrency(calculation.totalCost)}</p>
            <p className={`text-2xl font-black ${getStatusColor(calculation.statusLucro)}`}>
              {formatCurrency(calculation.grossProfit)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Margem</p>
            <p className={`text-2xl font-black ${getStatusColor(calculation.statusLucro)}`}>
              {calculation.marginPercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Finalize Modal */}
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-sm rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Resumo Financeiro</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Total Recebido</span>
                <span className="font-bold text-white">{formatCurrency(budget.chargedValue - budget.discounts)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Custos Totais</span>
                <span className="font-bold text-red-400">-{formatCurrency(calculation.totalCost)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-lg font-bold text-gray-300">LUCRO REAL</span>
                <span className={`text-lg font-black ${getStatusColor(calculation.statusLucro)}`}>
                  {formatCurrency(calculation.grossProfit)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-8 text-center leading-relaxed">
              Ao finalizar, o orçamento será travado para edição e os valores serão registrados no histórico financeiro.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  finalize();
                  setShowFinalizeModal(false);
                }}
                className="w-full bg-yellow-500 py-4 rounded-xl font-black text-gray-900 uppercase"
              >
                Confirmar e Finalizar
              </button>
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="w-full py-3 rounded-xl font-bold text-gray-400"
              >
                Voltar
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
  <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">{label}</label>
    <div className="flex items-center">
      <span className={`text-xs font-bold mr-1 ${isNegative ? 'text-red-400' : 'text-gray-500'}`}>
        {isNegative ? '-' : '+'} R$
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-transparent text-lg font-bold focus:outline-none text-white"
        placeholder="0,00"
      />
    </div>
  </div>
);
