import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { Card, SurfaceCard } from './Cards';
import { Heading, Eyebrow, Label, Value } from './Typography';
import { 
  Play, 
  Plus, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Users, 
  Home, 
  LayoutGrid, 
  DollarSign, 
  MoreHorizontal,
  Search,
  TrendingUp,
  Zap,
  Settings,
  Clock
} from 'lucide-react';

/**
 * EXECUTIVE OPERATING SYSTEM COMPONENTS
 * Strictly following AFERIX V7 GRAPHITE INDUSTRIAL (END OF BLACK).
 */

/**
 * ContextBanner: Premium editorial banner for actionable context.
 */
export const ContextBanner = memo(({ title, meta, icon }: { title: string; meta: string; icon: ReactNode }) => (
  <SurfaceCard className="bg-[#0E1114] border-white/[0.01] p-6 flex items-center gap-4 shadow-[var(--shadow-card)]">
    <div className="w-12 h-12 rounded-2xl bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 flex items-center justify-center text-[var(--accent-blue)] shadow-[var(--glow-blue)]">
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[14px] font-black text-white uppercase tracking-tight leading-none">{title}</span>
      <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.25em]">{meta}</span>
    </div>
  </SurfaceCard>
));

// 1. HeroCard steering
interface HeroCardProps {
  state: 'active' | 'upcoming' | 'none';
  title?: string;
  client?: string;
  time?: string;
  eta?: string;
  onAction: () => void;
}

export const HeroCard = memo(function HeroCard({ state, title, client, time, eta, onAction }: HeroCardProps) {
  if (state === 'none') {
    return (
      <Card variant="cinematic" padding="lg" className="text-center flex flex-col items-center gap-6 rounded-[32px] py-12 border-white/[0.02] shadow-[var(--shadow-cinematic)]">
        <div className="flex flex-col gap-2">
          <Eyebrow className="mb-0 text-white/40 tracking-[0.4em] font-black text-[12px]">MISSÃO LIVRE</Eyebrow>
          <p className="text-[15px] font-medium text-white/20">Sua agenda está disponível hoje.</p>
        </div>
        
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={onAction}
            className="w-full py-5 bg-[var(--accent-blue)] text-white font-black text-[14px] uppercase tracking-[0.2em] rounded-[18px] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_12px_32px_rgba(59,130,246,0.3)]"
          >
            <Plus size={18} strokeWidth={3} /> NOVO ATENDIMENTO
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onAction}
              className="py-4 bg-[#1A1E23] border border-white/[0.05] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[16px] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <FileText size={14} className="text-[var(--accent-blue)]" /> PROPOSTA
            </button>
            <button 
              onClick={onAction}
              className="py-4 bg-[#1A1E23] border border-white/[0.05] text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[16px] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <Users size={14} className="text-[var(--accent-blue)]" /> CLIENTE
            </button>
          </div>
        </div>
      </Card>
    );
  }

  const isExecuting = state === 'active';

  return (
    <Card variant="cinematic" padding="lg" className="rounded-[40px] gap-8 border-[var(--accent-blue)]/20 shadow-[var(--shadow-cinematic)]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
           <div className="relative flex items-center justify-center">
             <div className={cn("w-2.5 h-2.5 rounded-full", isExecuting ? "bg-[var(--accent-green)] shadow-[var(--glow-green)]" : "bg-[var(--accent-gold)] shadow-[var(--glow-gold)]")} />
             <div className={cn("absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-60", isExecuting ? "bg-[var(--accent-green)]" : "bg-[var(--accent-gold)]")} />
           </div>
           <Eyebrow className="mb-0 tracking-[0.4em] text-[12px] font-black opacity-90">
             {isExecuting ? 'EXECUÇÃO ATIVA' : 'PRÓXIMA MISSÃO'}
           </Eyebrow>
        </div>
        <h1 className="text-[46px] md:text-[56px] font-black leading-[0.95] tracking-[-0.05em] text-white uppercase break-words">{title}</h1>
        <div className="flex items-center gap-3 mt-1">
          <div className="w-8 h-[2px] bg-[#3B82F6]" />
          <p className="text-[17px] text-white/60 font-bold uppercase tracking-[0.2em] truncate">{client}</p>
        </div>
      </div>

      <div className="flex items-center gap-10 pt-6 border-t border-white/[0.04]">
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/20 tracking-[0.2em] text-[11px] font-black uppercase">HORÁRIO</Label>
          <Value className="text-[32px] text-white tracking-tighter leading-none num">{time}</Value>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-white/20 tracking-[0.2em] text-[11px] font-black uppercase">STATUS</Label>
          <Value className={cn("text-[32px] uppercase tracking-tighter leading-none", isExecuting ? "text-[var(--accent-green)]" : "text-[var(--accent-gold)]")}>
            {isExecuting ? 'ATIVO' : 'PRONTO'}
          </Value>
        </div>
        {eta && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-white/20 tracking-[0.2em] text-[11px] font-black uppercase">ROTA</Label>
            <Value className="text-[32px] text-white tracking-tighter leading-none num">{eta.split(' ')[0]}<span className="text-sm ml-1 opacity-30 font-black uppercase tracking-[0.1em]">{eta.split(' ').slice(1).join(' ')}</span></Value>
          </div>
        )}
      </div>

      <button 
        onClick={onAction}
        className="w-full py-6 bg-[#3B82F6] text-white font-black text-[15px] uppercase tracking-[0.3em] rounded-[24px] active:scale-[0.98] transition-all shadow-[var(--glow-blue),0_20px_50px_rgba(59,130,246,0.3)] flex items-center justify-center gap-4 group"
      >
        <Play size={22} className={cn("transition-transform group-active:scale-75", isExecuting ? "fill-current" : "")} />
        {isExecuting ? 'CONTINUAR EXECUÇÃO' : 'INICIAR ROTA'}
      </button>
    </Card>
  );
});

// 2. MetricCard (Status Strip)
export const MetricCard = memo(function MetricCard({ label, value, variant = 'default' }: { label: string, value: string | number, variant?: 'default' | 'gold' | 'green' | 'red' | 'blue' }) {
  const colors = {
    default: "text-white/40",
    gold: "text-[#D4AF37]",
    green: "text-[#47C46A]",
    red: "text-[#E85D5D]",
    blue: "text-[#3B82F6]"
  };

  return (
    <div className="flex-1 min-w-[100px] bg-[#0E1114] border border-white/[0.01] rounded-[22px] p-6 flex flex-col gap-2 active:scale-[0.98] transition-all duration-200 ease-[var(--ease-premium)] shadow-[var(--shadow-card)]">
      <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/20 truncate leading-none">{label}</span>
      <span className={cn("text-[28px] font-black tracking-tighter num leading-none", colors[variant as keyof typeof colors] || "text-white")}>{value}</span>
    </div>
  );
});

// 3. ActionCard
export const ActionCard = memo(function ActionCard({ label, icon, onClick }: { label: string, icon: ReactNode, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-5 bg-[#0E1114] border border-white/[0.01] rounded-[32px] aspect-square p-6 active:scale-[0.98] transition-all duration-200 ease-[var(--ease-premium)] hover:brightness-105 shadow-[var(--shadow-card)] group"
    >
      <div className="text-[#3B82F6] opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 30, strokeWidth: 2.5 })}
      </div>
      <span className="text-[13px] font-black text-white/70 uppercase tracking-[0.18em] text-center leading-tight px-1 group-hover:text-white transition-colors">{label}</span>
    </div>
  );
});

// 4. TimelineCard
export const TimelineCard = memo(function TimelineCard({ time, title, status, state }: { time: string, title: string, status: string, state: 'done' | 'active' | 'upcoming' | 'scheduled' }) {
  const icons = {
    done: <CheckCircle2 size={18} className="text-[#47C46A] shadow-[var(--glow-green)]" />,
    active: <Play size={18} className="text-[#3B82F6] fill-[#3B82F6] shadow-[var(--glow-blue)]" />,
    upcoming: <Clock size={18} className="text-white/20" />,
    scheduled: <Clock size={18} className="text-white/20" />
  };

  const statusVariants = {
    done: "text-[#47C46A] border-[#47C46A]/20 bg-[#47C46A]/5",
    active: "text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5",
    upcoming: "text-white/30 border-white/5 bg-white/5",
    scheduled: "text-white/30 border-white/5 bg-white/5"
  };

  return (
    <div className="flex gap-6 w-full group">
      <div className="flex flex-col items-center gap-3 pt-1 shrink-0">
        <span className="text-[12px] font-mono font-black text-white/20 tracking-tighter w-12 text-center num">{time}</span>
        <div className="w-[1.5px] flex-1 bg-gradient-to-b from-white/10 via-white/5 to-transparent mb-2" />
      </div>
      <div className="flex-1 pb-10">
        <div className="flex flex-col gap-3 transition-transform duration-700 group-active:translate-x-1">
          <div className="flex items-center gap-3">
            <div className="shrink-0 transition-transform duration-500 group-hover:scale-110">{icons[state]}</div>
            <span className={cn("text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-lg border", statusVariants[state])}>
              {status}
            </span>
          </div>
          <h4 className={cn(
            "text-[15px] font-black uppercase mt-0.5 tracking-tight leading-tight",
            state === 'done' ? "text-white/25 line-through decoration-[1.5px]" : "text-white/90"
          )}>{title}</h4>
        </div>
      </div>
    </div>
  );
});

// 5. ToolCard (Field Tools Hub)
export const ToolCard = memo(function ToolCard({ label, icon, onClick }: { label: string, icon: ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-4 bg-[#0E1114] border border-white/[0.01] rounded-[28px] aspect-square active:scale-[0.98] transition-all duration-200 ease-[var(--ease-premium)] hover:brightness-105 shadow-[var(--shadow-card)] group relative overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="text-white/40 group-hover:text-[#3B82F6] group-hover:scale-110 transition-all duration-700 ease-out relative z-10">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 28, strokeWidth: 2.5 })}
      </div>
      <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.25em] group-hover:text-white/80 transition-colors relative z-10">{label}</span>
    </button>
  );
});

// 7. ExecutiveHeader
export const ExecutiveHeader = memo(function ExecutiveHeader({ userName, score, standalone = false }: { userName: string, score: number, standalone?: boolean }) {
  const days = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
  const months = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
  const now = new Date();
  
  return (
    <div 
      className="flex items-start justify-between w-full px-6 pb-12 bg-gradient-to-b from-[#4A5360] to-[#434B57] border-b border-white/[0.04] mb-8 flex-shrink-0"
      style={{ paddingTop: standalone ? 'calc(env(safe-area-inset-top) + 24px)' : '40px' }}
    >
      <div className="flex flex-col gap-3">
        <Eyebrow className="mb-0 text-white/30 tracking-[0.4em] text-[11px] font-black opacity-80 uppercase">
          {days[now.getDay()]} • {now.getDate()} DE {months[now.getMonth()]}
        </Eyebrow>
        <Heading className="text-[38px] md:text-[46px] text-white tracking-tight font-black leading-[1] drop-shadow-2xl">Bom dia, {userName}.</Heading>
        <div className="flex items-center gap-3 mt-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#47C46A] shadow-[var(--glow-green)]" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#47C46A] animate-ping opacity-40" />
          </div>
          <span className="text-[12px] font-black text-[#47C46A] uppercase tracking-[0.3em]">Operação ativa</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-4">
        <div className="flex gap-4">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('aferix_command_palette'))}
            className="bg-[#3A424D] hover:bg-[#4A5565] border border-white/[0.05] px-6 py-5 rounded-2xl flex items-center justify-center min-w-[80px] text-white/60 hover:text-white transition-all active:scale-98 shadow-md"
          >
            <Search size={28} />
          </button>
          <div className="bg-[#2D343C] border border-[var(--accent-blue)]/20 shadow-[var(--shadow-card)] px-6 py-5 rounded-2xl flex flex-col items-center justify-center min-w-[80px] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent" />
            <span className="text-[32px] font-black text-[#3B82F6] leading-none tracking-tighter num">{score}%</span>
          </div>
        </div>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mr-1">Aferix Score</span>
      </div>
    </div>
  );
});
