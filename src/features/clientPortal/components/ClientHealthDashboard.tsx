import React from 'react';
import { SurfaceCard } from '../../../ui/system';

interface HealthProps {
  score: number;
  openAnomalies: number;
  activeProposals: number;
  totalAssets: number;
  criticalAssets: number;
}

export const ClientHealthDashboard: React.FC<{ data: HealthProps }> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-4 animate-fade-in">
      <SurfaceCard className="p-4 bg-surface-900 border border-surface-700 col-span-2">
        <h3 className="text-xs font-bold text-text-tertiary mb-2 uppercase tracking-widest">Health Score Global</h3>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-[var(--accent-blue)]">{data.score}</span>
          <span className="text-sm font-bold text-[var(--accent-blue)] mb-1">/ 100</span>
        </div>
        <p className="text-xs text-text-secondary mt-2">Sua infraestrutura está saudável, mas há oportunidades de melhoria.</p>
      </SurfaceCard>

      <SurfaceCard className="p-4 bg-surface-800 border border-surface-700">
        <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Anomalias</h3>
        <span className="text-2xl font-black text-status-error">{data.openAnomalies}</span>
      </SurfaceCard>

      <SurfaceCard className="p-4 bg-surface-800 border border-surface-700">
        <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Propostas</h3>
        <span className="text-2xl font-black text-[var(--accent-yellow)]">{data.activeProposals}</span>
      </SurfaceCard>

      <SurfaceCard className="p-4 bg-surface-800 border border-surface-700">
        <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Equipamentos</h3>
        <span className="text-2xl font-black text-white">{data.totalAssets}</span>
      </SurfaceCard>

      <SurfaceCard className="p-4 bg-surface-800 border border-surface-700">
        <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Críticos</h3>
        <span className="text-2xl font-black text-status-error">{data.criticalAssets}</span>
      </SurfaceCard>
    </div>
  );
};
