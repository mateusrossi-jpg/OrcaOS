import React from 'react';
import { SLAStatus, SLABadge } from './SLABadge';

interface SLAIndicatorProps {
  status: SLAStatus;
  progress?: number; // 0 to 100 representing time elapsed
  remainingDays?: number;
}

export function SLAIndicator({ status, progress = 0, remainingDays }: SLAIndicatorProps) {
  const getProgressColor = () => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      case 'blocked': return 'bg-red-600';
      case 'stalled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <SLABadge status={status} />
        {typeof remainingDays === 'number' && (
          <span className={`text-xs ${remainingDays < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {remainingDays < 0 ? `Atrasado ${Math.abs(remainingDays)}d` : `Restam ${remainingDays}d`}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${getProgressColor()} transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
