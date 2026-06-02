import React from 'react';
import { SurfaceCard } from '../../../ui/system';

export const ContractControlCenter: React.FC = () => {
  return (
    <div className="p-6 bg-[#050505] min-h-screen text-white">
      <h1 className="text-2xl font-black mb-6">Contratos & Retenção</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <SurfaceCard className="p-4 bg-[var(--accent-green)]/10 border border-[var(--accent-green)]">
          <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1">Receita Protegida</h3>
          <span className="text-3xl font-black text-white">R$ 142k</span>
          <span className="text-xs text-[var(--accent-green)] font-bold block mt-1">112 Contratos Ativos</span>
        </SurfaceCard>

        <SurfaceCard className="p-4 bg-status-error/10 border border-status-error">
          <h3 className="text-[10px] font-bold text-status-error uppercase tracking-widest mb-1">Receita Ameaçada</h3>
          <span className="text-3xl font-black text-white">R$ 28k</span>
          <span className="text-xs text-status-error font-bold block mt-1">4 Contratos Críticos</span>
        </SurfaceCard>
      </div>

      <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-4">Renovações Próximas (90 dias)</h2>
      <div className="space-y-4">
        <SurfaceCard className="p-4 bg-surface-900 border-l-4 border-[var(--accent-yellow)] flex justify-between items-center">
          <div>
            <h4 className="font-bold text-white">Hospital São Lucas</h4>
            <p className="text-xs text-text-secondary mt-1">R$ 14.500/mês • Vence em 45 dias</p>
          </div>
          <button className="px-4 py-2 bg-[var(--accent-yellow)] text-black font-black text-xs rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            VER PROPOSTA
          </button>
        </SurfaceCard>
      </div>
    </div>
  );
};
