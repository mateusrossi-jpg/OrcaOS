import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { Anomaly } from '../../../domain/revenue';
import { ScreenContainer, AppHeader, SurfaceCard } from '../../../ui/system';
import { ProposalEditor } from '../components/ProposalEditor';

const KanbanColumn: React.FC<{ title: string; anomalies: Anomaly[]; onSelect: (a: Anomaly) => void }> = ({ title, anomalies, onSelect }) => {
  return (
    <div className="flex-1 min-w-[300px] flex flex-col bg-surface-900/50 rounded-[24px] p-4 border border-surface-800">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-black tracking-widest text-text-secondary uppercase">{title}</h3>
        <span className="bg-surface-800 text-white text-xs font-bold px-2 py-1 rounded-full">{anomalies.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pb-10">
        {anomalies.map(anomaly => (
          <SurfaceCard 
            key={anomaly.id} 
            padding="md"
            onClick={() => onSelect(anomaly)}
            className="cursor-pointer hover:border-[var(--accent-blue)]/50 transition-colors bg-surface-800 group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold tracking-wider text-text-tertiary">
                {new Date(anomaly.createdAt).toLocaleDateString()}
              </span>
              {anomaly.severity === 'critical' && (
                <span className="text-[10px] bg-status-error/20 text-status-error px-2 py-0.5 rounded font-bold">CRÍTICO</span>
              )}
            </div>
            <h4 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-[var(--accent-blue)] transition-colors">{anomaly.title}</h4>
            <p className="text-xs text-text-secondary line-clamp-2">{anomaly.description || anomaly.recommendedAction}</p>
          </SurfaceCard>
        ))}
        {anomalies.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-surface-800 rounded-2xl">
            <span className="text-text-tertiary text-xs font-bold">Vazio</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const RevenueInboxPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const anomalies = useLiveQuery(() => db.anomalies.toArray(), []) || [];

  const openAnomalies = anomalies.filter(a => a.status === 'OPEN');
  const quotedAnomalies = anomalies.filter(a => a.status === 'QUOTED');
  const approvedAnomalies = anomalies.filter(a => a.status === 'APPROVED');

  return (
    <ScreenContainer>
      <AppHeader title="Revenue Inbox" subtitle="Oportunidades Comerciais" onBack={onBack} />
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-6 h-full min-h-[600px]">
          <KanbanColumn 
            title="Para Orçar (Leads)" 
            anomalies={openAnomalies} 
            onSelect={a => setSelectedAnomaly(a)} 
          />
          <KanbanColumn 
            title="Orçados (Enviados)" 
            anomalies={quotedAnomalies} 
            onSelect={() => {}} 
          />
          <KanbanColumn 
            title="Aprovados (Ganhos)" 
            anomalies={approvedAnomalies} 
            onSelect={() => {}} 
          />
        </div>
      </div>

      {selectedAnomaly && (
        <ProposalEditor anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />
      )}
    </ScreenContainer>
  );
};
