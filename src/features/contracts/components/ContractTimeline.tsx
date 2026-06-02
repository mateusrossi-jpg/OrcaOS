import React from 'react';

export const ContractTimeline: React.FC = () => {
  return (
    <div className="p-6">
      <div className="relative border-l border-surface-700 ml-4 space-y-8">
        
        <div className="relative pl-6">
          <div className="absolute w-4 h-4 bg-[var(--accent-green)] rounded-full -left-[8px] top-1 border-4 border-[#050505]"></div>
          <span className="text-xs text-text-secondary font-bold">Hoje</span>
          <h4 className="text-white font-bold mt-1">Proposta de Renovação Gerada</h4>
          <p className="text-sm text-text-secondary mt-1">Proposta enviada automaticamente para o Portal do Cliente (R$ 12.500).</p>
        </div>

        <div className="relative pl-6 opacity-70">
          <div className="absolute w-3 h-3 bg-surface-500 rounded-full -left-[6px] top-1 border-2 border-[#050505]"></div>
          <span className="text-xs text-text-secondary font-bold">Há 2 meses</span>
          <h4 className="text-white font-bold mt-1">SLA Violado (Corretiva)</h4>
          <p className="text-sm text-text-secondary mt-1">Técnico chegou 40 min atrasado. Impacto de -15 no Health Score.</p>
        </div>

        <div className="relative pl-6 opacity-50">
          <div className="absolute w-3 h-3 bg-[var(--accent-blue)] rounded-full -left-[6px] top-1 border-2 border-[#050505]"></div>
          <span className="text-xs text-text-secondary font-bold">Há 11 meses</span>
          <h4 className="text-white font-bold mt-1">Assinatura Inicial</h4>
          <p className="text-sm text-text-secondary mt-1">Contrato assinado digitalmente.</p>
        </div>

      </div>
    </div>
  );
};
