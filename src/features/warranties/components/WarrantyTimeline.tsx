import React from 'react';

export const WarrantyTimeline: React.FC = () => {
  return (
    <div className="p-6">
      <div className="relative border-l border-surface-700 ml-4 space-y-8">
        
        <div className="relative pl-6">
          <div className="absolute w-4 h-4 bg-status-error rounded-full -left-[8px] top-1 border-4 border-[#050505]"></div>
          <span className="text-xs text-text-secondary font-bold">Hoje</span>
          <h4 className="text-white font-bold mt-1">Reincidência Crítica Detectada</h4>
          <p className="text-sm text-text-secondary mt-1">Placa principal (Compressor 1) falhou 3 vezes nos últimos 6 meses. Ocupação de mão de obra desperdiçada.</p>
        </div>

        <div className="relative pl-6 opacity-70">
          <div className="absolute w-3 h-3 bg-[var(--accent-yellow)] rounded-full -left-[6px] top-1 border-2 border-[#050505]"></div>
          <span className="text-xs text-text-secondary font-bold">Há 2 meses</span>
          <h4 className="text-white font-bold mt-1">Garantia Acionada</h4>
          <p className="text-sm text-text-secondary mt-1">Acionado o fabricante para troca da placa principal. Reembolso de R$ 4.500 obtido.</p>
        </div>

        <div className="relative pl-6 opacity-50">
          <div className="absolute w-3 h-3 bg-[var(--accent-green)] rounded-full -left-[6px] top-1 border-2 border-[#050505]"></div>
          <span className="text-xs text-text-secondary font-bold">Há 6 meses</span>
          <h4 className="text-white font-bold mt-1">Garantia Iniciada</h4>
          <p className="text-sm text-text-secondary mt-1">Instalação do Compressor 1. Garantia de 12 meses ativada automaticamente no fechamento da O.S.</p>
        </div>

      </div>
    </div>
  );
};
