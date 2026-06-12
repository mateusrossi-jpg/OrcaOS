import React, { useState } from 'react';
import { Menu, X, User, Building, LayoutGrid, Users, Cpu, FileText, Activity, ShieldCheck, Box, Settings, HelpCircle, MessageSquare, LogOut } from 'lucide-react';

export const GlobalCommandCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* TRIGGER - Top Right */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[100] w-10 h-10 flex items-center justify-center bg-surface-800 border border-surface-700 rounded-full shadow-lg hover:bg-surface-700 transition-colors active:scale-95"
      >
        <Menu size={20} className="text-white" />
      </button>

      {/* OVERLAY & DRAWER */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[100] animate-fade-in backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface-900 z-[100] shadow-2xl flex flex-col animate-slide-left border-l border-surface-800">
            <div className="flex justify-between items-center p-6 border-b border-surface-800">
              <h2 className="text-xs font-black text-white tracking-widest uppercase">Command Center</h2>
              <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Contexto Atual */}
              <div className="bg-surface-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 border-b border-surface-700 pb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                    <User size={20} className="text-[var(--accent-blue)]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">João Silva</span>
                    <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Técnico Sênior</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Building size={14} /> Empresa: Orca Services
                </div>
                <button className="w-full bg-surface-700 py-2 rounded text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-600 transition-colors">
                  <LayoutGrid size={14} /> Trocar Workspace
                </button>
              </div>

              {/* Navegação Global (Sem Filtros - Tudo Acessível) */}
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-2 mb-2">Operação</h3>
                
                <CommandLink icon={<Users size={16}/>} label="Clientes" />
                <CommandLink icon={<Cpu size={16}/>} label="Ativos" />
                <CommandLink icon={<FileText size={16}/>} label="Catálogo" />
                <CommandLink icon={<Activity size={16}/>} label="Diagnósticos" />
                <CommandLink icon={<FileText size={16}/>} label="Biblioteca Técnica" />
                <CommandLink icon={<ShieldCheck size={16}/>} label="Contratos" />
                <CommandLink icon={<ShieldCheck size={16}/>} label="Garantias" />
                <CommandLink icon={<Box size={16}/>} label="Estoque" />
              </div>

              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-2 mb-2">Sistema</h3>
                <CommandLink icon={<Settings size={16}/>} label="Configurações" />
                <CommandLink icon={<HelpCircle size={16}/>} label="Ajuda" />
                <CommandLink icon={<MessageSquare size={16}/>} label="Feedback" />
              </div>
            </div>

            <div className="p-4 border-t border-surface-800">
              <button className="w-full py-3 flex items-center justify-center gap-2 text-status-error font-bold text-xs uppercase tracking-widest hover:bg-status-error/10 rounded-lg transition-colors">
                <LogOut size={16} /> Sair do Sistema
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const CommandLink = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-surface-800 transition-colors group">
    <div className="text-text-tertiary group-hover:text-[var(--accent-blue)] transition-colors">{icon}</div>
    <span className="font-medium">{label}</span>
  </button>
);
