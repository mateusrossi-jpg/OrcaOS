import React from 'react';
import { SurfaceCard } from '../../../ui/system';

export const PortalContractCenter: React.FC = () => {
  return (
    <div className="p-6 bg-aferix-bg text-white min-h-screen">
      <h1 className="text-2xl font-black mb-6">Seus Contratos</h1>

      <SurfaceCard className="p-6 bg-surface-900 border border-surface-700 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">Manutenção Preventiva Integral</h3>
            <p className="text-sm text-text-secondary mt-1">Vigência: 01/01/2026 até 31/12/2026</p>
          </div>
          <span className="bg-[var(--accent-green)]/20 text-[var(--accent-green)] px-2 py-1 rounded text-xs font-bold uppercase">
            Ativo
          </span>
        </div>
        <div className="pt-4 border-t border-surface-800 flex gap-4">
          <button className="text-sm text-text-tertiary font-bold hover:text-white transition-colors">Ver Escopo</button>
          <button className="text-sm text-[var(--accent-blue)] font-bold">Baixar PDF</button>
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-6 bg-[var(--accent-yellow)]/10 border border-[var(--accent-yellow)]">
        <h3 className="text-xs font-bold text-[var(--accent-yellow)] uppercase tracking-widest mb-2">Ação Necessária</h3>
        <h4 className="font-bold text-white text-base">Renovação 2027 Disponível</h4>
        <p className="text-sm text-text-secondary mt-1 mb-4">Seu contrato vence em 45 dias. Assine digitalmente agora para garantir a cobertura sem interrupções.</p>
        <button className="w-full py-3 bg-[var(--accent-yellow)] text-black font-black text-sm rounded-xl">
          RENOVAR CONTRATO
        </button>
      </SurfaceCard>
    </div>
  );
};
