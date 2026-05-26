import React from 'react';
import { ERPTokens } from './tokens';

export type SemanticStatus = 'healthy' | 'warning' | 'critical' | 'blocked' | 'stalled' | 'info';

interface ERPBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: SemanticStatus;
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'soft';
  className?: string;
}

export function ERPBadge({ status = 'info', children, variant = 'soft', className = '', ...props }: ERPBadgeProps) {
  const semantic = ERPTokens.colors.semantic[status];
  
  let styles = '';
  if (variant === 'soft') {
    styles = `${semantic.bg} ${semantic.text} border ${semantic.border}`;
  } else if (variant === 'solid') {
    styles = `${semantic.dot} text-gray-950 font-bold`; // Using dot color as solid bg
  } else if (variant === 'outline') {
    styles = `bg-transparent ${semantic.text} border ${semantic.border}`;
  }

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// Pre-configured Badges for specific domains
export function SLABadge({ status, label, ...props }: { status: SemanticStatus; label?: string; className?: string }) {
  const getDefaultLabel = () => {
    switch (status) {
      case 'healthy': return 'No Prazo';
      case 'warning': return 'Risco SLA';
      case 'critical': return 'SLA Violado';
      case 'blocked': return 'Bloqueado';
      case 'stalled': return 'Paralisado';
      default: return 'Desconhecido';
    }
  };
  return <ERPBadge status={status} {...props}>{label || getDefaultLabel()}</ERPBadge>;
}

export function CRMStageBadge({ stage, label, className = '' }: { stage: keyof typeof ERPTokens.colors.crm; label: string; className?: string }) {
  const bg = ERPTokens.colors.crm[stage];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white ${bg} ${className}`}>
      {label}
    </span>
  );
}
