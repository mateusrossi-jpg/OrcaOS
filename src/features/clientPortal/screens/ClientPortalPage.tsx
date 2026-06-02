import React from 'react';
import { Activity, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ClientPortalPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 overflow-x-hidden font-sans">
      {/* CABEÇALHO DO PORTAL DO CLIENTE */}
      <div className="bg-surface-900 border-b border-surface-800 p-6 pt-12 text-center shadow-lg">
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Seu Portal Aferix</h1>
        <p className="text-xs text-text-tertiary">Hospital Santa Casa</p>
        
        <div className="flex justify-center mt-6">
          <div className="bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 rounded-xl p-4 flex flex-col items-center min-w-[200px]">
            <Activity size={24} className="text-[var(--accent-green)] mb-2" />
            <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Saúde Geral dos Ativos</h3>
            <span className="text-3xl font-black text-white">92%</span>
            <span className="text-[10px] text-[var(--accent-green)] font-bold mt-1">EXCELENTE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-8 mt-4">
        
        {/* AÇÃO NECESSÁRIA (PROPOSTAS) */}
        <section>
          <h2 className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-widest flex items-center gap-2 mb-3">
            <FileText size={16} /> Aprovação Pendente
          </h2>
          <div className="bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-[var(--accent-blue)]"></div>
            <div className="flex flex-col mb-4">
              <span className="text-lg font-black text-white">Orçamento PRP-0145</span>
              <span className="text-xs text-text-secondary">Troca de compressor - Chiller A-02</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-black text-[var(--accent-blue)]">R$ 12.500</span>
            </div>
            <button className="w-full bg-[var(--accent-blue)] text-[#050505] font-black text-sm uppercase tracking-widest py-3 rounded-lg active:scale-95 transition-transform">
              Analisar & Aprovar
            </button>
          </div>
        </section>

        {/* ÚLTIMOS DOCUMENTOS (PMOC) */}
        <section>
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-3">Documentos & Certificados</h2>
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-[var(--accent-green)]" /> PMOC Mensal - Maio/2026
              </span>
              <span className="text-[10px] text-text-tertiary">Concluído 100% Conforme</span>
            </div>
            <button className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full text-white hover:bg-surface-700 transition-colors">
              <Download size={18} />
            </button>
          </div>
        </section>

        {/* HISTÓRICO RECENTE */}
        <section>
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-3">Últimas Execuções</h2>
          <div className="space-y-3">
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between opacity-80">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Limpeza Ar Condicionado Sala de Cirurgia</span>
                <span className="text-[10px] text-text-tertiary">Realizado Ontem</span>
              </div>
              <CheckCircle2 size={20} className="text-[var(--accent-green)]" />
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between opacity-80">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Inspeção Preventiva Elétrica</span>
                <span className="text-[10px] text-text-tertiary">Realizado 15 Mai</span>
              </div>
              <CheckCircle2 size={20} className="text-[var(--accent-green)]" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
