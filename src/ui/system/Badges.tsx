import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { Zap, ShieldCheck } from 'lucide-react';

export type BadgeVariant = 'default' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'muted';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  label?: string;
  icon?: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Aferix OS V5 Badge: High-polish semantic indicator.
 * Unified for TOKEN-FIRST architecture and Phase 4 UX Hardening.
 */
export const Badge = memo(function Badge({ 
  children, 
  label,
  icon,
  variant = 'default', 
  className = '',
  ...props 
}: BadgeProps) {
  const styles: Record<BadgeVariant, { bg: string, border: string, text: string }> = {
    default: { bg: 'bg-white/[0.06]', border: 'border-white/[0.12]', text: 'text-[var(--text-secondary)]' },
    accent:  { bg: 'bg-[oklch(from_var(--accent-gold)_l_c_h_/_0.12)]', border: 'border-[oklch(from_var(--accent-gold)_l_c_h_/_0.25)]', text: 'text-[var(--accent-gold)]' },
    success: { bg: 'bg-[oklch(from_var(--accent-green)_l_c_h_/_0.12)]', border: 'border-[oklch(from_var(--accent-green)_l_c_h_/_0.25)]', text: 'text-[var(--accent-green)]' },
    danger:  { bg: 'bg-[oklch(from_var(--accent-red)_l_c_h_/_0.12)]', border: 'border-[oklch(from_var(--accent-red)_l_c_h_/_0.25)]', text: 'text-[var(--accent-red)]' },
    warning: { bg: 'bg-[oklch(from_var(--accent-gold)_l_c_h_/_0.12)]', border: 'border-[oklch(from_var(--accent-gold)_l_c_h_/_0.25)]', text: 'text-[var(--accent-gold)]' },
    info:    { bg: 'bg-[oklch(from_var(--accent-blue)_l_c_h_/_0.12)]', border: 'border-[oklch(from_var(--accent-blue)_l_c_h_/_0.25)]', text: 'text-[var(--accent-blue)]' },
    muted:   { bg: 'bg-white/[0.04]', border: 'border-white/[0.08]', text: 'text-[var(--text-tertiary)]' }
  };

  const activeStyle = styles[variant] || styles.default;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-[6px] px-2 py-0.5 select-none",
        activeStyle.bg,
        activeStyle.border,
        className
      )}
      {...props}
    >
      {icon && <span className={cn("flex shrink-0", activeStyle.text)}>{icon}</span>}
      <span className={cn("font-mono text-[9.5px] font-bold tracking-wider whitespace-nowrap uppercase", activeStyle.text)}>
        {label || children}
      </span>
    </div>
  );
});

/**
 * StatusPill: Authoritative lifecycle indicator.
 * Implements "Solid Gold" standard for approved/live states.
 */
export const StatusPill = memo(function StatusPill({ status, className = '' }: { status: string, className?: string }) {
  const s = (status ?? '').toLowerCase().replace(' ', '_').replace('em_execucao', 'execucao');
  
  const configs: Record<string, { label: string, variant: BadgeVariant }> = {
    iniciado:   { label: 'RASCUNHO',  variant: 'default' },
    enviado:    { label: 'ENVIADO',   variant: 'accent'  },
    aprovado:   { label: 'APROVADO',  variant: 'accent'  },
    autorizado: { label: 'AUTORIZADO',variant: 'accent'  },
    execucao:   { label: 'EXECUÇÃO',  variant: 'accent'  },
    finalizado: { label: 'HISTÓRICO', variant: 'success' },
    done:       { label: 'CONCLUÍDO', variant: 'success' },
    paid:       { label: 'PAGO',      variant: 'success' },
    partial:    { label: 'PARCIAL',   variant: 'warning' },
    pending:    { label: 'PENDENTE',  variant: 'danger'  },
    cancelled:  { label: 'CANCELADO', variant: 'danger'  },
    rejected:   { label: 'RECUSADO',  variant: 'danger'  },
  };

  const config = configs[s] || { label: s.toUpperCase(), variant: 'default' };

  // SOLID GOLD AUTHORITY (Approval Standard)
  const isSolidGold = ['aprovado', 'autorizado', 'execucao'].includes(s);

  if (isSolidGold) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--accent-gold)] text-black font-bold text-[9.5px] tracking-wider uppercase shadow-[0_4px_12px_rgba(212,169,78,0.25)]", 
        s === 'execucao' && "animate-pulse",
        className
      )}>
        {s === 'execucao' && <Zap size={10} fill="currentColor" />}
        {(s === 'autorizado' || s === 'aprovado') && <ShieldCheck size={10} strokeWidth={3} />}
        {config.label}
      </div>
    );
  }

  return <Badge label={config.label} variant={config.variant} className={className} />;
});

/**
 * StatusDot: Subtle pulse indicator for live states.
 */
export const StatusDot = memo(function StatusDot({ tone = 'success', className = '' }: { tone?: 'success' | 'warning' | 'danger' | 'info', className?: string }) {
  const tones = {
    success:  "bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]",
    warning:  "bg-[var(--accent-gold)] shadow-[0_0_8px_var(--accent-gold)]",
    danger: "bg-[var(--accent-red)] shadow-[0_0_8px_var(--accent-red)]",
    info:     "bg-[var(--accent-blue)] shadow-[0_0_8px_var(--accent-blue)]",
  };

  return (
    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", tones[tone], className)} />
  );
});

/**
 * OpsChip: Technical chip for operational context.
 */
export type ChipAccent = false | "red" | "orange" | "green" | "blue";
export const OpsChip = memo(function OpsChip({ icon, label, accent, onClick }: { icon: ReactNode, label: string, accent: ChipAccent, onClick?: () => void }) {
  const styles: Record<string, { bg: string, border: string, text: string }> = {
    red:    { bg: "bg-[oklch(from_var(--accent-red)_l_c_h_/_0.08)]", border: "border-[oklch(from_var(--accent-red)_l_c_h_/_0.15)]", text: "var(--accent-red)" },
    orange: { bg: "bg-[oklch(from_var(--accent-gold)_l_c_h_/_0.08)]", border: "border-[oklch(from_var(--accent-gold)_l_c_h_/_0.15)]", text: "var(--accent-gold)" },
    green:  { bg: "bg-[oklch(from_var(--accent-green)_l_c_h_/_0.08)]", border: "border-[oklch(from_var(--accent-green)_l_c_h_/_0.15)]", text: "var(--accent-green)" },
    blue:   { bg: "bg-[oklch(from_var(--accent-blue)_l_c_h_/_0.08)]", border: "border-[oklch(from_var(--accent-blue)_l_c_h_/_0.15)]", text: "var(--accent-blue)" },
    default: { bg: "bg-white/[0.04]", border: "border-white/[0.07]", text: "var(--text-secondary)" }
  };

  const style = accent ? styles[accent] : styles.default;
  const isClickable = !!onClick;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[10px] px-[11px] py-[5px] border transition-all select-none", 
        style.bg, 
        style.border,
        isClickable && "cursor-pointer active:scale-95 hover:brightness-110"
      )}
    >
      <span className="flex shrink-0" style={{ color: style.text }}>{icon}</span>
      <span 
        className="font-mono text-[10px] font-bold tracking-[0.03em] whitespace-nowrap"
        style={{ color: style.text }}
      >
        {label}
      </span>
    </div>
  );
});

// Alias for backward compatibility
export const SemanticBadge = Badge;
