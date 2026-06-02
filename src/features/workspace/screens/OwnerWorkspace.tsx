import React from 'react';
import { DollarSign, ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import { GlobalCommandCenter } from '../../../components/GlobalCommandCenter';

export const OwnerWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 overflow-x-hidden">
      <GlobalCommandCenter />
      {/* COCKPIT EXECUTIVO */}
      <div className="bg-surface-900 border-b border-surface-800 p-6 pt-12">
        <h1 className="text-xl font-black text-white uppercase tracking-widest mb-6">Visão Executiva</h1>
        
        {/* PERGUNTA 1: Quanto vou faturar? */}
        <div className="mb-8">
          <h2 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2 mb-2">
            <DollarSign size={14} /> Faturamento Previsto (Mês)
          </h2>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white tracking-tighter">R$ 284.500</span>
            <span className="text-sm font-bold text-[var(--accent-green)] flex items-center pb-1"><TrendingUp size={16}/> +12%</span>
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Contratos</span>
              <span className="text-sm font-bold text-white">R$ 180k</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Corretivas</span>
              <span className="text-sm font-bold text-white">R$ 104.5k</span>
            </div>
          </div>
        </div>

        {/* PERGUNTA 2: Quanto está em risco? */}
        <div className="bg-status-error/10 border border-status-error/30 rounded-xl p-4">
          <h2 className="text-[10px] font-bold text-status-error uppercase tracking-widest flex items-center gap-2 mb-1">
            <ShieldAlert size={14} /> MRR em Risco (Churn Alert)
          </h2>
          <span className="text-2xl font-black text-white">R$ 22.400</span>
          <p className="text-xs text-text-secondary mt-1">2 Clientes críticos (Hospital Santa Casa, Clínica Viver)</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        
        {/* PERGUNTA 3: Onde preciso agir? */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Onde agir hoje?</h2>
          
          <div className="flex flex-col gap-3">
            {/* Aprovação Alta Diretoria */}
            <div className="bg-surface-900 border border-[var(--accent-blue)]/50 rounded-xl p-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  Proposta VIP Pendente
                </span>
                <span className="text-[10px] text-text-tertiary">Aprovar desconto comercial de 15%</span>
              </div>
              <button className="bg-[var(--accent-blue)] text-[#050505] font-black text-[10px] px-3 py-2 rounded uppercase tracking-widest active:scale-95 transition-transform">
                Analisar
              </button>
            </div>

            {/* Alerta de Estoque */}
            <div className="bg-surface-900 border border-status-warning/50 rounded-xl p-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={14} className="text-status-warning" /> Capital Imobilizado Alto
                </span>
                <span className="text-[10px] text-text-tertiary">R$ 85k parados no estoque há 90 dias</span>
              </div>
              <button className="bg-surface-800 text-white font-black text-[10px] px-3 py-2 rounded uppercase tracking-widest hover:bg-surface-700 transition-colors">
                Ver
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
