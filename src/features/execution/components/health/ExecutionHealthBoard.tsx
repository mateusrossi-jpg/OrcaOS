import React from 'react';
import { ExecutionRiskProfile } from '../../intelligence/ExecutionIntelligenceService';
import { ExecutionRecommendation } from '../../intelligence/ExecutionRecommendationEngine';
import { ExecutionPressureCard } from './ExecutionPressureCard';
import { AttachmentQueueCard } from './AttachmentQueueCard';

interface ExecutionHealthBoardProps {
  readonly riskProfile: ExecutionRiskProfile;
  readonly recommendations: readonly ExecutionRecommendation[];
  readonly pendingAttachmentsCount: number;
  readonly isOnline: boolean;
}

export const ExecutionHealthBoard: React.FC<ExecutionHealthBoardProps> = ({ 
  riskProfile, recommendations, pendingAttachmentsCount, isOnline 
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* 1. Network / Upload State */}
      {!isOnline && (
        <div className="bg-orange-900/20 border border-orange-800 rounded-xl p-3 flex items-center justify-between text-orange-200 text-sm">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">⚠️</span>
            <span className="font-bold">Modo Offline</span>
          </div>
          <span className="text-xs opacity-75">Sincronização pausada</span>
        </div>
      )}

      {pendingAttachmentsCount > 0 && (
        <AttachmentQueueCard 
          pendingDrafts={Array.from({length: pendingAttachmentsCount}).map((_, i) => ({
            id: String(i), workOrderId: '', localPath: '', type: 'photo', timestamp: '', status: 'pending'
          }))} 
          isOnline={isOnline} 
        />
      )}

      {/* 2. Core Operational Risk */}
      <ExecutionPressureCard 
        slaMinutesRemaining={riskProfile.slaRisk === 'critical' ? -15 : riskProfile.slaRisk === 'high' ? 25 : 120} 
        isBlocked={riskProfile.isBlocked} 
        hasPendingMaterial={riskProfile.hasPendingDependencies} 
      />

      {/* 3. Actionable Hints Engine */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.map(rec => (
            <div key={rec.id} className={`p-3 rounded-lg border text-sm flex gap-3 ${
              rec.type === 'actionable' ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' :
              rec.type === 'warning' ? 'bg-orange-900/10 border-orange-800 text-orange-300' :
              'bg-surface-800 border-surface-700 text-text-secondary'
            }`}>
              <div className="text-xl leading-none">
                {rec.type === 'actionable' ? '👉' : rec.type === 'warning' ? '⚠️' : '💡'}
              </div>
              <div>
                <div className="font-medium mb-0.5">{rec.message}</div>
                {rec.suggestedAction && (
                  <div className="text-xs opacity-80 uppercase tracking-wide font-bold">
                    Próximo passo: {rec.suggestedAction}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
