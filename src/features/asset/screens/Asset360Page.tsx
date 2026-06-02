import React from 'react';
import { ArrowLeft, Cpu, Activity, AlertOctagon, Wrench, Package } from 'lucide-react';

export const Asset360Page: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* CABEÇALHO 360 */}
      <div className="bg-surface-900 border-b border-surface-800 p-6 pt-12 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <button className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full hover:bg-surface-700 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">Chiller Central A-02</h1>
            <span className="text-[10px] text-text-tertiary uppercase tracking-widest">TAG: CHL-1020 • Hospital Santa Casa</span>
          </div>
        </div>

        <div className="flex gap-4 items-stretch mb-6">
          <div className="w-24 h-24 bg-surface-800 border border-surface-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Cpu size={32} className="text-text-tertiary" />
          </div>
          <div className="flex flex-col justify-between flex-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-status-error/10 border border-status-error/30 rounded p-2 flex flex-col">
                <span className="text-[8px] font-bold text-status-error uppercase tracking-widest">Health Score</span>
                <span className="text-sm font-black text-white">42/100</span>
              </div>
              <div className="bg-[var(--accent-yellow)]/10 border border-[var(--accent-yellow)]/30 rounded p-2 flex flex-col">
                <span className="text-[8px] font-bold text-[var(--accent-yellow)] uppercase tracking-widest">Garantia</span>
                <span className="text-xs font-bold text-white mt-1">Expira: Out/2026</span>
              </div>
            </div>
            <div className="bg-surface-800 border border-surface-700 rounded p-2 flex flex-col">
              <span className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest">Tempo Médio Entre Falhas (MTBF)</span>
              <span className="text-sm font-bold text-white">45 dias <span className="text-status-error text-[10px] font-normal">(Crítico)</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE FEED */}
      <div className="flex-1 p-6">
        <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-6">Prontuário do Equipamento</h2>
        
        <div className="relative border-l-2 border-surface-800 pl-6 space-y-8 ml-3">
          
          {/* Evento 1 */}
          <div className="relative">
            <div className="absolute -left-[35px] bg-status-error p-1.5 rounded-full border-4 border-background">
              <AlertOctagon size={14} className="text-[#050505]" />
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Anomalia Reincidente</span>
              <span className="text-[10px] text-text-tertiary">Hoje</span>
            </div>
            <div className="bg-surface-900 border border-status-error/30 p-3 rounded-lg">
              <span className="text-sm text-text-secondary">3ª Falha de Compressor reportada em menos de 6 meses. Recomendação de Retrofit emitida pelo sistema.</span>
            </div>
          </div>

          {/* Evento 2 */}
          <div className="relative">
            <div className="absolute -left-[35px] bg-[var(--accent-blue)] p-1.5 rounded-full border-4 border-background">
              <Package size={14} className="text-[#050505]" />
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Peça Trocada</span>
              <span className="text-[10px] text-text-tertiary">15 Fev</span>
            </div>
            <div className="bg-surface-900 border border-surface-800 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm font-bold text-white">Placa Inversora</span>
              <span className="text-xs text-[var(--accent-blue)] font-bold">R$ 2.450,00</span>
            </div>
          </div>

          {/* Evento 3 */}
          <div className="relative">
            <div className="absolute -left-[35px] bg-surface-700 p-1.5 rounded-full border-4 border-background">
              <Wrench size={14} className="text-white" />
            </div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-widest">PMOC - Manutenção Prev.</span>
              <span className="text-[10px] text-text-tertiary">10 Jan</span>
            </div>
            <div className="bg-surface-900 border border-surface-800 p-3 rounded-lg">
              <span className="text-sm text-[var(--accent-green)] font-bold mb-1 block">✔ Conforme</span>
              <span className="text-xs text-text-secondary">Checklist executado. Limpeza de condensadora.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
