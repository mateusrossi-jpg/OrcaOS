import React from 'react';

export type SLAStatus = 'healthy' | 'warning' | 'critical' | 'blocked' | 'stalled';

interface SLABadgeProps {
  status: SLAStatus;
  label?: string;
  className?: string;
}

export function SLABadge({ status, label, className = '' }: SLABadgeProps) {
  const getBadgeStyles = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-900/40 text-green-400 border border-green-800/50';
      case 'warning':
        return 'bg-yellow-900/40 text-yellow-500 border border-yellow-800/50';
      case 'critical':
        return 'bg-red-900/40 text-red-400 border border-red-800/50';
      case 'blocked':
        return 'bg-red-950/60 text-red-500 border border-red-900/50';
      case 'stalled':
        return 'bg-gray-800/60 text-gray-400 border border-gray-700/50';
      default:
        return 'bg-gray-800/40 text-gray-400 border border-gray-700/50';
    }
  };

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

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeStyles()} ${className}`}
    >
      {label || getDefaultLabel()}
    </span>
  );
}
