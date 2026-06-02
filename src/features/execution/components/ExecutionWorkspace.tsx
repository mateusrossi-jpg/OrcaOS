import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, MapPin, Camera } from 'lucide-react';

interface ExecutionWorkspaceProps {
  readonly workOrderId: string;
  readonly clientName: string;
  readonly onExit: () => void;
}

export const ExecutionWorkspace: React.FC<ExecutionWorkspaceProps> = ({ workOrderId, clientName, onExit }) => {
  const [activeState, setActiveState] = useState<'idle' | 'in_progress' | 'paused'>('in_progress');

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background overflow-hidden">
      {/* CABEÇALHO */}
      <div className="flex-none bg-surface-900 border-b border-surface-800 p-4 pt-12 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full hover:bg-surface-700 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white tracking-widest uppercase">{clientName}</h1>
            <span className="text-[10px] text-text-tertiary">OS #{workOrderId}</span>
          </div>
        </div>
        <div className="bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[var(--accent-blue)]/30">
          Execução
        </div>
      </div>

      {/* SCROLL-FIRST CONTENT */}
      <div className="flex flex-col p-4">
        
        {/* Local */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 mb-4 flex items-center gap-3">
          <MapPin size={24} className="text-text-secondary" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Unidade Matriz - 3º Andar</span>
            <span className="text-xs text-text-tertiary">Av. Paulista, 1000 - São Paulo, SP</span>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Progresso Geral</h2>
            <span className="text-sm font-black text-white">1/3</span>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-2">
            <div className="bg-[var(--accent-green)] h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Lista de Ativos */}
        <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-3">Checklist de Ativos</h2>
        <div className="flex flex-col gap-3 mb-6">
          {/* Ativo Concluido */}
          <div className="bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 rounded-xl p-4 flex items-center justify-between opacity-80">
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary font-mono">HVAC-01</span>
              <span className="text-sm font-bold text-[var(--accent-green)]">Ar Condicionado Split 36k</span>
            </div>
            <CheckCircle2 size={24} className="text-[var(--accent-green)]" />
          </div>
          
          {/* Ativo Pendente (Próximo) */}
          <div className="bg-surface-800 border border-[var(--accent-blue)] rounded-xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-blue)]"></div>
            <div className="flex flex-col">
              <span className="text-xs text-[var(--accent-blue)] font-mono font-bold tracking-widest">A FAZER AGORA</span>
              <span className="text-base font-black text-white">Chiller Central A-02</span>
            </div>
            <button className="bg-[var(--accent-blue)] text-[#050505] px-4 py-2 rounded font-black text-xs tracking-widest uppercase hover:brightness-110">
              Iniciar
            </button>
          </div>

          {/* Ativo Futuro */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between opacity-50">
            <div className="flex flex-col">
              <span className="text-xs text-text-tertiary font-mono">BMB-01</span>
              <span className="text-sm font-bold text-text-secondary">Bomba D'água</span>
            </div>
            <span className="text-xs text-text-tertiary uppercase tracking-widest">Aguardando</span>
          </div>
        </div>

        {/* Anomalias */}
        <div className="bg-status-error/5 border border-status-error/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-status-error uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} />
              Anomalias (1)
            </h2>
            <button className="text-xs font-bold bg-status-error/20 text-status-error px-3 py-1 rounded">
              + NOVO
            </button>
          </div>
          <div className="bg-surface-900 border border-status-error/30 rounded p-3 flex justify-between items-center">
            <span className="text-sm text-white font-bold">Vazamento fluido refr.</span>
            <Camera size={16} className="text-text-secondary" />
          </div>
        </div>

        {/* Observações */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 mb-6">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2 mb-2">
            <FileText size={16} />
            Observações Gerais
          </h2>
          <p className="text-sm text-text-secondary">Cliente solicitou silêncio na ala oeste. Reparo da bomba deixado para o fim do expediente.</p>
        </div>

      </div>

      {/* FINALIZAÇÃO (Sticky Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-800 p-4 pb-8 flex items-center justify-center z-20">
        <button 
          className="w-full max-w-md bg-[var(--accent-blue)] text-[#050505] font-black text-sm uppercase tracking-widest py-5 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          CONTINUAR EXECUÇÃO
        </button>
      </div>

    </div>
  );
};
