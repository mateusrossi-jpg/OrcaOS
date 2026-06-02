import React from 'react';
import { SurfaceCard } from '../../../ui/system';

export const RecurringRevenueDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-[#050505] min-h-screen text-white">
      <h1 className="text-2xl font-black mb-6">Radar Financeiro de Contratos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SurfaceCard className="p-6 border-l-4 border-[var(--accent-green)]">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">MRR Protegido</h3>
          <span className="text-4xl font-black">R$ 142.500</span>
        </SurfaceCard>
        
        <SurfaceCard className="p-6 border-l-4 border-status-error">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">MRR em Risco</h3>
          <span className="text-4xl font-black text-status-error">R$ 28.000</span>
        </SurfaceCard>

        <SurfaceCard className="p-6 border-l-4 border-[var(--accent-blue)]">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Receita Anual Projetada</h3>
          <span className="text-4xl font-black text-[var(--accent-blue)]">R$ 1.71M</span>
        </SurfaceCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-4">Expirações Futuras (Timeline)</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-surface-900 rounded-lg">
              <span className="font-bold text-[var(--accent-yellow)]">Novembro 2026</span>
              <span className="font-bold">R$ 45.000 (3 contratos)</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-surface-900 rounded-lg">
              <span className="font-bold text-text-secondary">Dezembro 2026</span>
              <span className="font-bold">R$ 12.000 (1 contrato)</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-4">Contratos por Faixa</h2>
          <div className="space-y-4">
            <div className="w-full bg-surface-900 h-10 rounded-lg overflow-hidden flex">
              <div className="bg-[var(--accent-green)] h-full w-[70%]" title="Saudáveis (70%)"></div>
              <div className="bg-[var(--accent-yellow)] h-full w-[20%]" title="Atenção (20%)"></div>
              <div className="bg-status-error h-full w-[10%]" title="Risco Crítico (10%)"></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-text-secondary">
              <span className="text-[var(--accent-green)]">70% Saudáveis</span>
              <span className="text-[var(--accent-yellow)]">20% Atenção</span>
              <span className="text-status-error">10% Críticos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
