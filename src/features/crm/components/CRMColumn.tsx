import React from 'react';
import { ClientPipelineProjection } from '../../../domain/operationalProjections';
import { CRMCard } from './CRMCard';

interface CRMColumnProps {
  title: string;
  clients: readonly ClientPipelineProjection[];
  accentColor?: string;
  onCardClick?: (clientId: string) => void;
}

export function CRMColumn({ title, clients, accentColor = 'bg-gray-700', onCardClick }: CRMColumnProps) {
  const totalRevenue = clients.reduce((acc, c) => acc + c.totalRevenue, 0);

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] h-full bg-gray-950/50 rounded-xl border border-gray-800/60 overflow-hidden">
      {/* Column Header */}
      <div className="p-3 border-b border-gray-800/60 bg-gray-900/50 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${accentColor}`} />
            <h3 className="font-semibold text-gray-200 text-sm">{title}</h3>
          </div>
          <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full font-medium">
            {clients.length}
          </span>
        </div>
        {clients.length > 0 && (
          <div className="text-xs text-gray-500 pl-4.5 font-medium">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalRevenue)}
          </div>
        )}
      </div>

      {/* Cards Area */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
        {clients.map(client => (
          <CRMCard 
            key={client.clientId} 
            client={client} 
            onClick={onCardClick}
          />
        ))}
        {clients.length === 0 && (
          <div className="text-center p-4 text-gray-600 text-sm border border-dashed border-gray-800 rounded-lg m-2">
            Nenhum cliente
          </div>
        )}
      </div>
    </div>
  );
}
