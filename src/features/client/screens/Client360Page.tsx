import React from 'react';
import { ArrowLeft, Activity, DollarSign, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Client360Page: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* CABEÇALHO 360 */}
      <div className="bg-surface-900 border-b border-surface-800 p-6 pt-12 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <button className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full hover:bg-surface-700 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">Hospital Santa Casa</h1>
            <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Cliente desde Fev/2023</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={12}/> Health Score</h3>
            <span className="text-3xl font-black text-white">92/100</span>
          </div>
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign size={12}/> MRR</h3>
            <span className="text-2xl font-black text-white">R$ 15.4k</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          <span className="bg-surface-800 px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap border border-surface-700">2 Contratos Ativos</span>
          <span className="bg-[var(--accent-blue)]/20 px-3 py-1 rounded text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest whitespace-nowrap border border-[var(--accent-blue)]/30">3 Propostas em Aberto</span>
          <span className="bg-status-error/20 px-3 py-1 rounded text-[10px] font-bold text-status-error uppercase tracking-widest whitespace-nowrap border border-status-error/30">1 Pendência Técnica</span>
        </div>
      </div>

      {/* TIMELINE FEED */}
      <div className="flex-1 p-6">
        <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-6">Timeline Operacional</h2>
        
        <div className="relative border-l-2 border-surface-800 pl-6 space-y-8 ml-3">
          
          {/* Evento 1 */}
          <div className="relative">
            <div className="absolute -left-[35px] bg-status-error p-1.5 rounded-full border-4 border-background">
              <AlertTriangle size={14} className="text-[#050505]" />
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Anomalia Reportada</span>
              <span className="text-[10px] text-text-tertiary">Hoje, 09:30</span>
            </div>
            <div className="bg-surface-900 border border-status-error/30 p-3 rounded-lg">
              <span className="text-sm text-text-secondary">Chiller Principal Desarmou por alta pressão.</span>
            </div>
          </div>

          {/* Evento 2 */}
          <div className="relative">
            <div className="absolute -left-[35px] bg-[var(--accent-blue)] p-1.5 rounded-full border-4 border-background">
              <FileText size={14} className="text-[#050505]" />
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Proposta Aprovada</span>
              <span className="text-[10px] text-text-tertiary">Ontem, 14:15</span>
            </div>
            <div className="bg-surface-900 border border-surface-800 p-3 rounded-lg">
              <span className="text-sm text-text-secondary">Troca de filtro secador - <strong>R$ 1.250,00</strong></span>
            </div>
          </div>

          {/* Evento 3 */}
          <div className="relative">
            <div className="absolute -left-[35px] bg-[var(--accent-green)] p-1.5 rounded-full border-4 border-background">
              <ShieldCheck size={14} className="text-[#050505]" />
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Garantia Acionada (Protegida)</span>
              <span className="text-[10px] text-text-tertiary">20 Mai, 10:00</span>
            </div>
            <div className="bg-surface-900 border border-[var(--accent-green)]/30 p-3 rounded-lg">
              <span className="text-sm text-text-secondary">Garantia rejeitada pelo Aferix. Serviço faturado como nova OS.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
