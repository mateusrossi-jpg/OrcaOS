import React from 'react';
import { SurfaceCard } from '../../../ui/system';

export const OperationsControlCenter: React.FC = () => {
  return (
    <div className="p-6 bg-[#050505] min-h-screen text-white">
      <h1 className="text-2xl font-black mb-6">OCC / Operations Control</h1>

      <div className="grid grid-cols-2 gap-4">
        <SurfaceCard className="p-4 bg-surface-900 border border-[var(--accent-blue)]">
          <h3 className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest mb-1">Técnicos na Rua</h3>
          <span className="text-3xl font-black">42</span>
        </SurfaceCard>

        <SurfaceCard className="p-4 bg-surface-900 border border-surface-700">
          <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">OS do Dia</h3>
          <span className="text-3xl font-black">128</span>
        </SurfaceCard>

        <SurfaceCard className="p-4 bg-surface-900 border border-[var(--accent-green)]">
          <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1">Concluídas</h3>
          <span className="text-3xl font-black">94</span>
        </SurfaceCard>

        <SurfaceCard className="p-4 bg-status-error/10 border border-status-error">
          <h3 className="text-[10px] font-bold text-status-error uppercase tracking-widest mb-1">SLA Violados</h3>
          <span className="text-3xl font-black text-status-error">3</span>
        </SurfaceCard>
      </div>

      <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mt-8 mb-4">Urgências Ativas</h2>
      <SurfaceCard className="p-4 bg-surface-800 border-l-4 border-status-error flex justify-between items-center">
        <div>
          <h4 className="font-bold text-white">Vazamento Shopping Central</h4>
          <p className="text-xs text-text-secondary mt-1">Emergência há 12 min (Sem técnico atribuído)</p>
        </div>
        <button className="px-4 py-2 bg-status-error text-white font-bold text-xs rounded-lg">DISPATCH</button>
      </SurfaceCard>
    </div>
  );
};
