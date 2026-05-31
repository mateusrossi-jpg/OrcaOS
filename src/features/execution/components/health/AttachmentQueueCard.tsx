import React from 'react';
import { EvidenceDraft } from '../../types';

interface AttachmentQueueCardProps {
  readonly pendingDrafts: readonly EvidenceDraft[];
  readonly isOnline: boolean;
}

export const AttachmentQueueCard: React.FC<AttachmentQueueCardProps> = ({ pendingDrafts, isOnline }) => {
  if (pendingDrafts.length === 0) return null;

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-[22px] p-4 mb-6 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center text-xl">
           📸
        </div>
        <div>
          <div className="text-[15px] font-bold text-[#EFEFEF]">
            {pendingDrafts.length} anexo{pendingDrafts.length > 1 ? 's' : ''} na fila
          </div>
          <div className="text-[12.5px] text-[#808080] font-medium leading-tight mt-1">
            {isOnline ? 'Sincronizando em background...' : 'Aguardando rede (Modo Offline)'}
          </div>
        </div>
      </div>
      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#32D74B] animate-pulse shadow-[0_0_12px_rgba(50,215,75,0.4)]' : 'bg-[#D4A94E] shadow-[0_0_12px_rgba(212,169,78,0.4)]'}`} />
    </div>
  );
};
