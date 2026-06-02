import React from 'react';
import { Users, AlertOctagon, Clock, ShieldAlert, Activity } from 'lucide-react';
import { GlobalCommandCenter } from '../../../components/GlobalCommandCenter';

export const ManagerWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 overflow-x-hidden">
      <GlobalCommandCenter />
      {/* HEADER DO COMANDANTE DA OPERAÇÃO */}
      <div className="bg-surface-900 border-b border-surface-800 p-6 pt-12">
        <h1 className="text-xl font-black text-white uppercase tracking-widest mb-4">Central de Operações</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-800 border border-[var(--accent-blue)]/50 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Técnicos em Campo</h3>
              <span className="text-2xl font-black text-white">12/15</span>
            </div>
            <Users size={24} className="text-[var(--accent-blue)] opacity-50" />
          </div>
          <div className="bg-status-error/10 border border-status-error/30 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold text-status-error uppercase tracking-widest">SLAs em Risco</h3>
              <span className="text-2xl font-black text-white">3</span>
            </div>
            <Clock size={24} className="text-status-error opacity-50" />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        
        {/* URGÊNCIAS E ATRASOS */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xs font-bold text-status-error uppercase tracking-widest flex items-center gap-2">
              <AlertOctagon size={16} /> Fogo na Rua
            </h2>
            <span className="text-[10px] text-status-error font-bold tracking-widest uppercase">Ação Imediata</span>
          </div>
          
          <div className="bg-surface-900 border border-status-error/50 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-error"></div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-widest">Equipe Alpha • João</span>
                <span className="text-xs text-text-secondary">OS #4055 - Parada Total de Chiller</span>
              </div>
              <span className="bg-status-error text-[#050505] font-black text-[10px] px-2 py-1 rounded uppercase">Estourou SLA</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-surface-800 text-white font-bold text-[10px] py-2 rounded uppercase tracking-widest hover:bg-surface-700 transition-colors">
                Ligar para Técnico
              </button>
              <button className="flex-1 bg-surface-800 text-white font-bold text-[10px] py-2 rounded uppercase tracking-widest hover:bg-surface-700 transition-colors">
                Redirecionar Ajuda
              </button>
            </div>
          </div>
        </div>

        {/* CLIENTES CRÍTICOS (HEALTH SCORE BAIXO) */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xs font-bold text-[var(--accent-orange)] uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={16} /> Clientes Críticos
            </h2>
          </div>

          <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white uppercase tracking-widest">Hospital São Judas</span>
              <span className="text-[10px] text-text-tertiary">3 falhas na mesma máquina</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-status-error" />
              <span className="text-sm font-black text-status-error">32/100</span>
            </div>
          </div>
        </div>

        {/* DISPATCH BOARD MINI */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Próximos Despachos</h2>
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex justify-between items-center opacity-70">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white uppercase tracking-widest">Shopping Central</span>
              <span className="text-[10px] text-text-tertiary">Instalação • 14:00</span>
            </div>
            <span className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-widest">Equipe Beta</span>
          </div>
        </div>

      </div>
    </div>
  );
};
