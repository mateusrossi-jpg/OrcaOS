import React from 'react';
import { QueueSummary } from '../../../core/workflow/queueEngine';

interface OperationalPressureCardProps {
  summary: QueueSummary;
}

export function OperationalPressureCard({ summary }: OperationalPressureCardProps) {
  const totalPressure = summary.urgent + summary.overdue + summary.blocked + summary.delayedExecution;
  const isHighPressure = totalPressure > Math.max(5, summary.total * 0.3);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-300 font-medium text-sm">Pressão Operacional</h3>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isHighPressure ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'}`}>
          {isHighPressure ? 'Alta' : 'Controlada'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        <div className="bg-gray-950 p-3 rounded-lg border border-gray-800/50 flex flex-col">
          <span className="text-gray-500 text-xs mb-1">Urgentes</span>
          <span className={`text-xl font-bold ${summary.urgent > 0 ? 'text-yellow-500' : 'text-gray-300'}`}>{summary.urgent}</span>
        </div>
        <div className="bg-gray-950 p-3 rounded-lg border border-gray-800/50 flex flex-col">
          <span className="text-gray-500 text-xs mb-1">Atrasados</span>
          <span className={`text-xl font-bold ${summary.overdue > 0 ? 'text-red-400' : 'text-gray-300'}`}>{summary.overdue}</span>
        </div>
        <div className="bg-gray-950 p-3 rounded-lg border border-gray-800/50 flex flex-col">
          <span className="text-gray-500 text-xs mb-1">Bloqueados</span>
          <span className={`text-xl font-bold ${summary.blocked > 0 ? 'text-red-500' : 'text-gray-300'}`}>{summary.blocked}</span>
        </div>
        <div className="bg-gray-950 p-3 rounded-lg border border-gray-800/50 flex flex-col">
          <span className="text-gray-500 text-xs mb-1">Exec. Ativa</span>
          <span className="text-xl font-bold text-blue-400">{summary.activeExecution}</span>
        </div>
      </div>
      
      {summary.awaitingClient > 0 && (
        <div className="text-xs text-yellow-500/80 mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80" />
          {summary.awaitingClient} tarefas aguardando cliente
        </div>
      )}
    </div>
  );
}
