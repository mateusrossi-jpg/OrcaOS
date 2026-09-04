import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { Zap, ShieldCheck } from 'lucide-react';
import { V12StatusBadge } from './v12Components';

export type BadgeVariant = 'default' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'muted';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  label?: string;
  icon?: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Badge: Canonical Golden V12 Semantic Badge
 * Maps cleanly to standard status colors (#30D158, #FFD60A, #FF453A, #0A84FF, #8E8E93).
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
    default: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-[#8E8E93]' },
    accent:  { bg: 'bg-[#FFD60A]/10', border: 'border-[#FFD60A]/20', text: 'text-[#FFD60A]' },
    success: { bg: 'bg-[#30D158]/10', border: 'border-[#30D158]/20', text: 'text-[#30D158]' },
    danger:  { bg: 'bg-[#FF453A]/10', border: 'border-[#FF453A]/20', text: 'text-[#FF453A]' },
    warning: { bg: 'bg-[#FFD60A]/10', border: 'border-[#FFD60A]/20', text: 'text-[#FFD60A]' },
    info:    { bg: 'bg-[#0A84FF]/10', border: 'border-[#0A84FF]/20', text: 'text-[#0A84FF]' },
    muted:   { bg: 'bg-white/5', border: 'border-white/5', text: 'text-[#8E8E93]' }
  };

  const activeStyle = styles[variant] || styles.default;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 select-none",
        activeStyle.bg,
        activeStyle.border,
        className
      )}
      {...props}
    >
      {icon && <span className={cn("flex shrink-0", activeStyle.text)}>{icon}</span>}
      <span className={cn("text-[10px] font-bold tracking-wider whitespace-nowrap uppercase", activeStyle.text)}>
        {label || children}
      </span>
    </div>
  );
});

/**
 * StatusPill: Authoritative lifecycle indicator.
 * Maps operational states to standard V12 tones.
 */
export const StatusPill = memo(function StatusPill({ status, className = '' }: { status: string, className?: string }) {
  const s = (status ?? '').toLowerCase().replace(' ', '_').replace('em_execucao', 'execucao');
  
  const configs: Record<string, { label: string, tone: 'success' | 'attention' | 'critical' | 'info' | 'neutral' }> = {
    iniciado:   { label: 'RASCUNHO',  tone: 'neutral' },
    enviado:    { label: 'ENVIADO',   tone: 'info' },
    aprovado:   { label: 'APROVADO',  tone: 'success' },
    autorizado: { label: 'AUTORIZADO',tone: 'success' },
    execucao:   { label: 'EM EXECUÇÃO', tone: 'attention' },
    finalizado: { label: 'HISTÓRICO', tone: 'success' },
    done:       { label: 'CONCLUÍDO', tone: 'success' },
    paid:       { label: 'PAGO',      tone: 'success' },
    partial:    { label: 'PARCIAL',   tone: 'attention' },
    pending:    { label: 'PENDENTE',  tone: 'critical' },
    cancelled:  { label: 'CANCELADO', tone: 'critical' },
    rejected:   { label: 'RECUSADO',  tone: 'critical' },
  };

  const config = configs[s] || { label: s.toUpperCase(), tone: 'neutral' };

  return <V12StatusBadge label={config.label} tone={config.tone} className={className} />;
});

/**
 * StatusDot: Subtle indicator for live states.
 */
export const StatusDot = memo(function StatusDot({ tone = 'success', className = '' }: { tone?: 'success' | 'warning' | 'danger' | 'info', className?: string }) {
  const tones = {
    success:  "bg-[#30D158]",
    warning:  "bg-[#FFD60A]",
    danger:   "bg-[#FF453A]",
    info:     "bg-[#0A84FF]",
  };

  return (
    <div className={cn("h-2 w-2 rounded-full", tones[tone], className)} />
  );
});

/**
 * OpsChip: Technical chip for operational context.
 */
export type ChipAccent = false | "red" | "orange" | "green" | "blue";
export interface OpsChipProps {
  icon?: ReactNode;
  label: string;
  accent?: ChipAccent;
  tone?: "muted" | "success" | "orange" | "green" | "blue" | "warning" | "danger" | "info" | string;
  onClick?: () => void;
  className?: string;
}

export const OpsChip = memo(function OpsChip({ icon, label, accent, tone, onClick, className }: OpsChipProps) {
  const styles: Record<string, { bg: string, border: string, text: string }> = {
    red:    { bg: "bg-[#FF453A]/10", border: "border-[#FF453A]/20", text: "text-[#FF453A]" },
    orange: { bg: "bg-[#FFD60A]/10", border: "border-[#FFD60A]/20", text: "text-[#FFD60A]" },
    green:  { bg: "bg-[#30D158]/10", border: "border-[#30D158]/20", text: "text-[#30D158]" },
    blue:   { bg: "bg-[#0A84FF]/10", border: "border-[#0A84FF]/20", text: "text-[#0A84FF]" },
    default: { bg: "bg-white/5", border: "border-white/10", text: "text-[#8E8E93]" }
  };

  let activeAccent: string = "default";
  if (accent) {
    activeAccent = accent;
  } else if (tone) {
    if (tone === "green" || tone === "success") activeAccent = "green";
    else if (tone === "orange" || tone === "warning") activeAccent = "orange";
    else if (tone === "red" || tone === "danger") activeAccent = "red";
    else if (tone === "blue" || tone === "info") activeAccent = "blue";
  }

  const style = styles[activeAccent] || styles.default;
  const isClickable = !!onClick;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 border transition-all select-none", 
        style.bg, 
        style.border,
        isClickable && "cursor-pointer active:scale-95 hover:border-white/20",
        className
      )}
    >
      {icon && <span className={cn("flex shrink-0", style.text)}>{icon}</span>}
      <span className={cn("text-[11px] font-bold tracking-tight whitespace-nowrap", style.text)}>
        {label}
      </span>
    </div>
  );
});

// Backward compatibility aliases
export const SemanticBadge = Badge;
export { V12StatusBadge };

