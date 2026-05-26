import React from 'react';

interface ExecutionPressureCardProps {
  readonly slaMinutesRemaining: number;
  readonly isBlocked: boolean;
  readonly hasPendingMaterial: boolean;
}

export const ExecutionPressureCard: React.FC<ExecutionPressureCardProps> = ({ slaMinutesRemaining, isBlocked, hasPendingMaterial }) => {
  const isCritical = slaMinutesRemaining < 30 || isBlocked;
  
  return (
    <div className={`p-4 rounded-xl border mb-4 ${
      isCritical ? 'bg-red-900/10 border-red-800' : 'bg-surface-800 border-surface-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Health</h3>
        {isCritical && <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className={`text-2xl font-mono font-bold ${slaMinutesRemaining < 0 ? 'text-red-400' : 'text-text-primary'}`}>
            {Math.abs(slaMinutesRemaining)}m
          </div>
          <div className="text-xs text-text-muted">
            {slaMinutesRemaining < 0 ? 'SLA ESTOURADO' : 'SLA Restante'}
          </div>
        </div>

        {isBlocked && (
          <div className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1.5 rounded uppercase">
            Bloqueado
          </div>
        )}

        {hasPendingMaterial && (
          <div className="bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1.5 rounded uppercase">
            Falta Material
          </div>
        )}
      </div>
    </div>
  );
};
