import React, { useState } from 'react';
import { SurfaceCard } from '../../../ui/system';
import { PortalSignature } from '../components/PortalSignature';
import { Proposal } from '../../../domain/revenue';
import { db } from '../../../storage/dexieDatabase';

export const ProposalApprovalPage: React.FC<{ proposal: Proposal; onDone: () => void; onReject: () => void }> = ({ proposal, onDone, onReject }) => {
  const [showSignature, setShowSignature] = useState(false);

  const handleApprove = async () => {
    // Atualizar no banco localmente (seria sync)
    await db.proposals.update(proposal.id, { status: 'APPROVED' });
    await db.anomalies.update(proposal.anomalyId, { status: 'APPROVED', approvedAt: new Date().toISOString() });
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 bg-aferix-bg animate-slide-up flex flex-col">
      <div className="p-6 bg-surface-900 border-b border-surface-800">
        <h1 className="text-xl font-black text-white">Aprovação de Proposta</h1>
        <p className="text-sm text-text-secondary">Ref: {proposal.id}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <SurfaceCard className="p-6 bg-surface-900 border border-surface-700">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Problema Identificado</h3>
            <p className="text-base text-white font-bold mt-1">{proposal.title.replace('Orçamento de Correção: ', '')}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Solução Proposta</h3>
            <p className="text-sm text-text-secondary mt-1">{proposal.description}</p>
          </div>

          <div className="pt-4 border-t border-surface-800">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Investimento Total</h3>
            <span className="text-3xl font-black text-[var(--accent-green)]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.amount)}
            </span>
          </div>
        </SurfaceCard>

        <div className="flex gap-4">
          <button 
            onClick={onReject}
            className="flex-1 py-4 bg-surface-800 border border-surface-700 rounded-2xl font-bold text-text-secondary active:bg-surface-700"
          >
            REJEITAR
          </button>
          <button 
            onClick={() => setShowSignature(true)}
            className="flex-1 py-4 bg-[var(--accent-green)] rounded-2xl font-black text-black shadow-[0_0_30px_rgba(34,197,94,0.3)] active:scale-95 transition-transform"
          >
            APROVAR
          </button>
        </div>
      </div>

      {showSignature && (
        <PortalSignature onCancel={() => setShowSignature(false)} onSigned={handleApprove} />
      )}
    </div>
  );
};
