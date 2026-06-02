import { GlobalCommandCenter } from "../../../components/GlobalCommandCenter";
import React from 'react';
import { Play, Calendar, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

export const FieldWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* HEADER DA TRINCHEIRA */}
      <GlobalCommandCenter />
      <div className="bg-surface-900 border-b border-surface-800 p-6 pt-12">
        <h1 className="text-xl font-black text-white uppercase tracking-widest mb-1">Rota de Hoje</h1>
        <span className="text-xs text-text-tertiary font-bold tracking-widest uppercase">3 Serviços Agendados</span>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* BOTÃO GIGANTE - THUMB ZONE */}
        <button className="w-full bg-[var(--accent-blue)] text-[#050505] rounded-2xl p-6 shadow-[0_0_30px_rgba(42,139,242,0.2)] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform">
          <Play size={40} className="fill-[#050505]" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-black tracking-widest uppercase">INICIAR SERVIÇO</span>
            <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Hospital Santa Casa • 09:00</span>
          </div>
        </button>

        {/* AGENDA SCROLL-FIRST */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
            <Calendar size={16} /> Próximos Atendimentos
          </h2>
          
          <GlobalCommandCenter />
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-yellow)]"></div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-black text-white uppercase tracking-widest">Edifício JK</span>
              <span className="text-xs font-bold text-[var(--accent-yellow)] uppercase tracking-widest">14:00</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin size={12} /> Vila Olímpia, São Paulo
            </div>
            <span className="text-[10px] bg-surface-800 text-text-tertiary px-2 py-1 rounded w-fit mt-1 uppercase font-bold tracking-widest">PMOC Mensal</span>
          </div>
          
          <GlobalCommandCenter />
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden opacity-50">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-700"></div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-black text-white uppercase tracking-widest">Clínica Cuidar</span>
              <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">16:30</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin size={12} /> Pinheiros, São Paulo
            </div>
            <span className="text-[10px] bg-status-error/20 text-status-error px-2 py-1 rounded w-fit mt-1 uppercase font-bold tracking-widest">Corretiva</span>
          </div>
        </div>

        {/* SERVIÇOS FINALIZADOS */}
        <div className="space-y-4 pt-4 border-t border-surface-800">
          <h2 className="text-xs font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={16} /> Serviços Finalizados (Hoje)
          </h2>
          <div className="bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[var(--accent-green)] uppercase tracking-widest">Padaria Pão de Ouro</span>
              <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Concluído às 08:15</span>
            </div>
            <CheckCircle2 size={20} className="text-[var(--accent-green)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
