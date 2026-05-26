import React from 'react';
import { ClientPipelineProjection } from '../../../domain/operationalProjections';
import { ERPCard, ERPCardContent } from '../../../ui/system';

interface CRMCardProps {
  client: ClientPipelineProjection;
  onClick?: (clientId: string) => void;
}

export function CRMCard({ client, onClick }: CRMCardProps) {
  const agingDays = Math.floor((Date.now() - new Date(client.lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24));
  
  const getAgingColor = () => {
    if (agingDays > 14) return 'text-red-400';
    if (agingDays > 7) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <ERPCard onClick={() => onClick?.(client.clientId)} hoverable>
      <ERPCardContent className="p-3 gap-2">
        <div className="flex justify-between items-start">
          <h4 className="text-gray-200 font-medium text-sm truncate pr-2">{client.clientName}</h4>
        {client.activeBudgets > 1 && (
          <span className="bg-yellow-900/30 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {client.activeBudgets} orçamentos
          </span>
        )}
      </div>

      <div className="flex justify-between items-end mt-1">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Receita Potencial</span>
          <span className="text-green-400 font-medium text-sm">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.totalRevenue)}
          </span>
        </div>
        
          <div className={`text-xs flex items-center gap-1 ${getAgingColor()}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {agingDays}d
          </div>
        </div>
      </ERPCardContent>
    </ERPCard>
  );
}
