import React from 'react';
import { EvidenceDraft } from '../../types';

interface AttachmentQueueCardProps {
  readonly pendingDrafts: readonly EvidenceDraft[];
  readonly isOnline: boolean;
}

export const AttachmentQueueCard: React.FC<AttachmentQueueCardProps> = ({ pendingDrafts, isOnline }) => {
  if (pendingDrafts.length === 0) return null;

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-3 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-surface-900 border border-surface-700 flex items-center justify-center">
          📸
        </div>
        <div>
          <div className="text-sm font-bold text-text-primary">
            {pendingDrafts.length} anexo{pendingDrafts.length > 1 ? 's' : ''} na fila
          </div>
          <div className="text-xs text-text-muted">
            {isOnline ? 'Sincronizando em background...' : 'Aguardando rede (Modo Offline)'}
          </div>
        </div>
      </div>
      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-blue-500 animate-pulse' : 'bg-orange-500'}`} />
    </div>
  );
};
