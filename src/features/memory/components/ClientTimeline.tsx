import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { SurfaceCard } from '../../../ui/system';

interface ClientTimelineProps {
  clientId: string;
}

export const ClientTimeline: React.FC<ClientTimelineProps> = ({ clientId }) => {
  // Load events
  const events = useLiveQuery(
    async () => {
      // Pega todos os eventos cujos metadados contém este clientId
      // Dexie não permite indexação fácil dentro de metadata.clientId
      // Então vamos pegar todos e filtrar no lado do cliente por simplicidade de leitura
      const allEvents = await db.operationalEvents.toArray();
      const clientEvents = allEvents.filter(e => e.metadata?.clientId === clientId);
      
      return clientEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [clientId]
  ) || [];

  return (
    <div className="flex flex-col space-y-6 animate-fade-in p-4">
      <SurfaceCard className="p-4 bg-surface-900 border border-surface-700">
        <h2 className="text-xl font-black text-white">Histórico do Cliente</h2>
        <p className="text-sm text-text-secondary">Shopping Exemplo</p>
      </SurfaceCard>

      <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-surface-700">
        {events.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-4">
            <div className="absolute left-[-21px] w-3 h-3 rounded-full bg-[var(--accent-purple)] ring-4 ring-surface-900 mt-1.5" />
            <SurfaceCard className="flex-1 p-4 bg-surface-800 border border-surface-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold tracking-wider text-text-tertiary">
                  {new Date(evt.timestamp).toLocaleDateString()}
                </span>
                <span className="text-[10px] text-text-secondary font-bold px-2 py-0.5 bg-surface-700 rounded-md">
                  {evt.eventType.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                {evt.metadata?.title || 'Ação Registrada'}
              </h3>
              <p className="text-xs text-text-secondary">
                {evt.metadata?.description || 'Sem detalhes.'}
              </p>
            </SurfaceCard>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-text-tertiary">Nenhum evento registrado para este cliente.</p>
        )}
      </div>
    </div>
  );
};
