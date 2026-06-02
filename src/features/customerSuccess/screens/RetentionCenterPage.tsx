import React from 'react';
import { ShieldAlert, Activity, Heart, AlertTriangle } from 'lucide-react';
import { CustomerHealth } from '../../../domain/customerSuccess';

export const RetentionCenterPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background p-6 pb-24 overflow-x-hidden">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <ShieldAlert className="text-status-error" />
          Centro de Retenção
        </h1>
        <p className="text-sm text-text-secondary mt-1">Prevenção e controle de Churn de contratos.</p>
      </div>

      {/* Kanban de Risco (Simplificado em formato de lista responsiva) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Column: Críticos */}
        <div className="flex flex-col bg-status-error/5 border border-status-error/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-status-error border-b border-status-error/20 pb-2">
            <AlertTriangle size={18} />
            <h2 className="font-black tracking-widest text-xs">CRÍTICOS</h2>
            <span className="ml-auto bg-status-error text-[#050505] px-2 py-0.5 rounded-full text-[10px] font-bold">2</span>
          </div>
          <RiskCard clientName="Hospital Santa Casa" mrr="R$ 15.000" health={32} reason="Alta reincidência de falhas" />
          <RiskCard clientName="Rede Supermercados XYZ" mrr="R$ 8.500" health={38} reason="Contrato não renovado" />
        </div>

        {/* Column: Em Risco */}
        <div className="flex flex-col bg-[var(--accent-yellow)]/5 border border-[var(--accent-yellow)]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-[var(--accent-yellow)] border-b border-[var(--accent-yellow)]/20 pb-2">
            <Activity size={18} />
            <h2 className="font-black tracking-widest text-xs">EM RISCO</h2>
            <span className="ml-auto bg-[var(--accent-yellow)] text-[#050505] px-2 py-0.5 rounded-full text-[10px] font-bold">1</span>
          </div>
          <RiskCard clientName="Clínica Médica Alpha" mrr="R$ 3.200" health={65} reason="Baixo engajamento no portal" />
        </div>

        {/* Column: Atenção */}
        <div className="flex flex-col bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-[var(--accent-blue)] border-b border-[var(--accent-blue)]/20 pb-2">
            <Activity size={18} />
            <h2 className="font-black tracking-widest text-xs">ATENÇÃO</h2>
            <span className="ml-auto bg-[var(--accent-blue)] text-[#050505] px-2 py-0.5 rounded-full text-[10px] font-bold">3</span>
          </div>
          {/* Vazio ou cards mockados */}
        </div>

        {/* Column: Saudáveis */}
        <div className="flex flex-col bg-[var(--accent-green)]/5 border border-[var(--accent-green)]/20 rounded-xl p-4 opacity-50">
          <div className="flex items-center gap-2 mb-4 text-[var(--accent-green)] border-b border-[var(--accent-green)]/20 pb-2">
            <Heart size={18} />
            <h2 className="font-black tracking-widest text-xs">SAUDÁVEIS</h2>
            <span className="ml-auto bg-[var(--accent-green)] text-[#050505] px-2 py-0.5 rounded-full text-[10px] font-bold">45</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const RiskCard: React.FC<{ clientName: string, mrr: string, health: number, reason: string }> = ({ clientName, mrr, health, reason }) => (
  <div className="bg-surface-900 border border-surface-700 rounded-lg p-3 mb-3 cursor-pointer hover:border-surface-600 transition-colors">
    <h3 className="font-bold text-white text-sm mb-1">{clientName}</h3>
    <div className="flex justify-between items-center mb-3">
      <span className="text-xs text-text-secondary">MRR Ameaçado:</span>
      <span className="text-sm font-black text-status-error">{mrr}</span>
    </div>
    <div className="w-full bg-surface-800 rounded-full h-1.5 mb-1">
      <div className={`h-1.5 rounded-full ${health < 40 ? 'bg-status-error' : 'bg-[var(--accent-yellow)]'}`} style={{ width: `${health}%` }}></div>
    </div>
    <div className="flex justify-between items-center mt-2">
      <span className="text-[10px] text-text-tertiary">Motivo: {reason}</span>
      <span className="text-[10px] font-bold text-white">{health}/100</span>
    </div>
  </div>
);
