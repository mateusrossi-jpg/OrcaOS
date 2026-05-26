import React from 'react';

interface ExecutionHeaderProps {
  readonly clientName: string;
  readonly workOrderId: string;
  readonly status: string;
  readonly onBack: () => void;
}

export const ExecutionHeader: React.FC<ExecutionHeaderProps> = ({ clientName, workOrderId, status, onBack }) => {
  return (
    <div className="sticky top-0 z-10 bg-surface-900 border-b border-surface-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 text-text-muted hover:text-white" aria-label="Voltar">
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold text-text-primary leading-tight truncate max-w-[200px]">
            {clientName}
          </h1>
          <div className="text-xs font-mono text-text-muted flex items-center gap-2 mt-0.5">
            <span>#{workOrderId.split('-')[0]}</span>
            <span className="w-1 h-1 rounded-full bg-surface-600" />
            <span className="uppercase text-brand-primary">{status}</span>
          </div>
        </div>
      </div>
      
      <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center border border-surface-700">
        <span className="text-xl">📍</span>
      </div>
    </div>
  );
};
