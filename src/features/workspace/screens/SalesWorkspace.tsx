import React from 'react';
import { DollarSign, FileText, AlertTriangle, ChevronRight, Inbox } from 'lucide-react';
import { GlobalCommandCenter } from '../../../components/GlobalCommandCenter';

export const SalesWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 overflow-x-hidden">
      <GlobalCommandCenter />
      {/* HEADER DA MÁQUINA DE VENDAS */}
      <div className="bg-surface-900 border-b border-surface-800 p-6 pt-12">
        <h1 className="text-xl font-black text-white uppercase tracking-widest mb-4">Pipeline de Receita</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest mb-1 flex items-center gap-1">Receita Potencial</h3>
            <span className="text-2xl font-black text-white">R$ 142k</span>
          </div>
          <div className="bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1 flex items-center gap-1">Receita Fechada (Mês)</h3>
            <span className="text-2xl font-black text-white">R$ 84k</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        
        {/* REVENUE INBOX (ANOMALIAS NÃO ORÇADAS) */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xs font-bold text-status-error uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} /> Dinheiro na Mesa
            </h2>
            <span className="text-[10px] bg-status-error text-white font-bold px-2 py-0.5 rounded">4 LEADS</span>
          </div>
          
          <div className="bg-surface-900 border border-status-error/30 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">Vazamento Chiller</span>
                <span className="text-xs text-text-tertiary">Hospital Santa Casa</span>
              </div>
              <button className="bg-status-error text-white font-black text-[10px] px-3 py-2 rounded uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-1">
                ORÇAR <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-surface-800">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">Placa Queimada</span>
                <span className="text-xs text-text-tertiary">Edifício JK</span>
              </div>
              <button className="bg-status-error text-white font-black text-[10px] px-3 py-2 rounded uppercase tracking-widest active:scale-95 transition-transform flex items-center gap-1">
                ORÇAR <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* PROPOSTAS PENDENTES DE APROVAÇÃO */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} /> Propostas Pendentes
            </h2>
            <span className="text-[10px] text-[var(--accent-blue)] font-bold tracking-widest uppercase">R$ 45.200 Aguardando</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-widest">PRP-0145</span>
                <span className="text-xs text-text-tertiary">Clínica Cuidar</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-[var(--accent-blue)]">R$ 12.500</span>
                <span className="text-[10px] text-status-warning uppercase font-bold">Cobrar</span>
              </div>
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-widest">PRP-0144</span>
                <span className="text-xs text-text-tertiary">Shopping Central</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-[var(--accent-blue)]">R$ 32.700</span>
                <span className="text-[10px] text-text-tertiary uppercase font-bold">Enviado Hoje</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
