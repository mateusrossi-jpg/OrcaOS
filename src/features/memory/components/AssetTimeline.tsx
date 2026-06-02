import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { SurfaceCard } from '../../../ui/system';
import { HealthScoreService, HealthScore } from '../../../services/HealthScoreService';
import { WarrantyService } from '../../../services/WarrantyService';
import { RecurrenceAnalyzer } from '../../../services/RecurrenceAnalyzer';

interface AssetTimelineProps {
  assetId: string;
  companyId: string;
}

export const AssetTimeline: React.FC<AssetTimelineProps> = ({ assetId, companyId }) => {
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [hasWarranty, setHasWarranty] = useState(false);
  const [recurrenceCount, setRecurrenceCount] = useState(0);

  // Load events
  const events = useLiveQuery(
    async () => {
      const allEvents = await db.operationalEvents
        .where({ aggregateId: assetId })
        .toArray();
      // Sort desc
      return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [assetId]
  ) || [];

  useEffect(() => {
    async function loadStats() {
      const h = await HealthScoreService.calculateAssetHealth(assetId, companyId);
      setHealth(h);
      
      const warranty = await WarrantyService.checkActiveWarranty(assetId, companyId);
      setHasWarranty(warranty);

      // Check generic recurrence (e.g. looking for "vazamento")
      const rec = await RecurrenceAnalyzer.checkRecurrence(assetId, companyId, 'vazamento');
      setRecurrenceCount(rec.count);
    }
    loadStats();
  }, [assetId, companyId]);

  return (
    <div className="flex flex-col space-y-6 animate-fade-in p-4">
      {/* Header Info */}
      <SurfaceCard className="p-4 bg-surface-900 border border-surface-700 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black text-white">Equipamento TAG-001</h2>
            <p className="text-sm text-text-secondary">Chiller Principal</p>
          </div>
          {health && (
            <div className="flex flex-col items-end">
              <span className={`text-2xl font-black ${health.color}`}>{health.score}</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${health.color}`}>
                {health.label}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {hasWarranty && (
            <div className="bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 px-3 py-1 rounded-full flex items-center">
              <span className="text-[10px] font-bold text-[var(--accent-green)]">GARANTIA ATIVA</span>
            </div>
          )}
          {recurrenceCount > 1 && (
            <div className="bg-status-error/10 border border-status-error/30 px-3 py-1 rounded-full flex items-center">
              <span className="text-[10px] font-bold text-status-error">REINCIDENTE ({recurrenceCount}x)</span>
            </div>
          )}
        </div>
      </SurfaceCard>

      {/* Timeline Feed */}
      <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-700 before:to-transparent">
        {events.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-4">
            <div className="absolute left-[-21px] w-3 h-3 rounded-full bg-[var(--accent-blue)] ring-4 ring-surface-900 mt-1.5" />
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
                {evt.metadata?.title || 'Evento Registrado'}
              </h3>
              <p className="text-xs text-text-secondary">
                {evt.metadata?.description || 'Sem detalhes.'}
              </p>
              {evt.actor && (
                <div className="mt-3 text-[10px] font-bold text-text-tertiary flex items-center">
                  <span className="w-4 h-4 rounded-full bg-surface-600 mr-2" />
                  {evt.actor}
                </div>
              )}
            </SurfaceCard>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-text-tertiary">Nenhum evento registrado na linha do tempo.</p>
        )}
      </div>
    </div>
  );
};
