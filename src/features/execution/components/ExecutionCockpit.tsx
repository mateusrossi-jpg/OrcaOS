import React, { useState, useEffect } from 'react';
import { ExecutionHeader } from './ExecutionHeader';
import { ExecutionTimeline, TimelineEvent } from './ExecutionTimeline';
import { ExecutionQuickActions } from './ExecutionQuickActions';
import { ExecutionHealthBoard } from './health/ExecutionHealthBoard';
import { executionIntelligenceService } from '../intelligence/ExecutionIntelligenceService';
import { executionRecommendationEngine } from '../intelligence/ExecutionRecommendationEngine';
import { pilotUsageMetrics } from '../metrics/PilotUsageMetrics';

interface ExecutionCockpitProps {
  readonly workOrderId: string;
  readonly clientName: string;
  readonly onExit: () => void;
}

/**
 * ExecutionCockpit
 * The ultimate field execution shell.
 * Integrates UI, Offline Hardware State, Intelligence Engine and Quick Actions.
 */
export const ExecutionCockpit: React.FC<ExecutionCockpitProps> = ({ workOrderId, clientName, onExit }) => {
  const [activeState, setActiveState] = useState<'idle' | 'in_progress' | 'paused'>('idle');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: '1', type: 'ARRIVAL', timestamp: new Date().toISOString(), description: 'Técnico chegou ao local' }
  ]);
  const [sessionStartTime] = useState(Date.now());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAction = (action: string) => {
    if (action === 'start') {
      setActiveState('in_progress');
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), type: 'START', timestamp: new Date().toISOString(), description: 'Execução iniciada' }]);
    } else if (action === 'pause') {
      setActiveState('paused');
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), type: 'PAUSE', timestamp: new Date().toISOString(), description: 'Execução pausada (motivo: aguardando)' }]);
    } else if (action === 'finish') {
      setActiveState('idle');
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), type: 'FINISH', timestamp: new Date().toISOString(), description: 'Serviço finalizado' }]);
      
      // Log commercial telemetry on finish
      pilotUsageMetrics.logSession({
        workOrderId,
        durationMinutes: Math.round((Date.now() - sessionStartTime) / 60000),
        reconnectCount: 0,
        attachmentCount: timeline.filter(t => t.type === 'PHOTO').length,
        highestIdleMinutes: 0
      });
    } else if (action === 'photo') {
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), type: 'PHOTO', timestamp: new Date().toISOString(), description: 'Evidência fotográfica adicionada' }]);
    }
  };

  // Derive intelligence (Pure, Consumer-Only)
  const riskProfile = executionIntelligenceService.deriveRiskProfile({
    workOrderId,
    slaMinutesRemaining: activeState === 'in_progress' ? 25 : 120, // Mock dynamic
    lastActivityAt: timeline[timeline.length - 1]?.timestamp || new Date().toISOString(),
    pendingMaterials: 0
  });

  const recommendations = executionRecommendationEngine.generateHints(riskProfile);

  return (
    <div className="fixed inset-0 bg-surface-900 z-40 flex flex-col overflow-hidden">
      <ExecutionHeader 
        clientName={clientName} 
        workOrderId={workOrderId} 
        status={activeState === 'in_progress' ? 'Em andamento' : activeState === 'paused' ? 'Pausado' : 'Aguardando'} 
        onBack={onExit} 
      />

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <ExecutionHealthBoard 
          riskProfile={riskProfile} 
          recommendations={recommendations} 
          pendingAttachmentsCount={timeline.filter(t => t.type === 'PHOTO').length} 
          isOnline={isOnline}
        />

        <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Instruções</h2>
          <p className="text-text-primary text-sm leading-relaxed">
            Verificar vazamento na válvula principal. Trazer fotos do antes e depois.
          </p>
        </div>

        <ExecutionTimeline events={timeline} />
      </div>

      <ExecutionQuickActions activeState={activeState} onAction={handleAction} />
    </div>
  );
};
