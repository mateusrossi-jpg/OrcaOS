import React from 'react';
import { SurfaceCard } from '../../../ui/system';

export const DispatchBoardPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-aferix-bg text-white animate-in fade-in duration-500">
      <div className="w-1/4 border-r border-surface-800 p-4 bg-surface-900 flex flex-col">
        <h2 className="text-sm font-black uppercase tracking-widest text-text-tertiary mb-4">Técnicos</h2>
        <div className="space-y-3 overflow-y-auto flex-1">
          <SurfaceCard className="p-3 bg-surface-800 border-l-4 border-[var(--accent-green)] cursor-pointer">
            <h4 className="font-bold text-sm">João Silva</h4>
            <div className="flex justify-between items-center mt-1 text-xs">
              <span className="text-text-secondary">Carga: 82%</span>
              <span className="text-[var(--accent-green)] font-bold">Em trânsito</span>
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-3 bg-surface-800 border-l-4 border-[var(--accent-blue)] cursor-pointer">
            <h4 className="font-bold text-sm">Carlos Souza</h4>
            <div className="flex justify-between items-center mt-1 text-xs">
              <span className="text-text-secondary">Carga: 45%</span>
              <span className="text-[var(--accent-blue)] font-bold">Livre</span>
            </div>
          </SurfaceCard>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <h2 className="text-sm font-black uppercase tracking-widest text-text-tertiary mb-4">Serviços do Dia</h2>
        <div className="grid grid-cols-2 gap-4 flex-1 content-start">
          <SurfaceCard className="p-4 bg-surface-800 border border-surface-700">
            <div className="flex justify-between">
              <span className="text-xs text-text-secondary font-bold">14:00</span>
              <span className="text-xs bg-surface-700 px-2 py-0.5 rounded text-text-tertiary font-bold">PENDING</span>
            </div>
            <h3 className="font-bold text-base mt-2">Shopping Central</h3>
            <p className="text-xs text-text-secondary mt-1">PMOC Mensal (2h)</p>
          </SurfaceCard>
        </div>
      </div>

      <div className="w-1/4 border-l border-surface-800 p-4 bg-status-error/5 flex flex-col">
        <h2 className="text-sm font-black uppercase tracking-widest text-status-error mb-4">Urgências & SLAs</h2>
        <div className="space-y-3">
          <SurfaceCard className="p-3 bg-surface-900 border border-status-error border-l-4">
            <h4 className="font-bold text-status-error text-sm">Atraso Crítico</h4>
            <p className="text-xs text-text-secondary mt-1">Técnico atrasado há 30m na OS-9812.</p>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
};
