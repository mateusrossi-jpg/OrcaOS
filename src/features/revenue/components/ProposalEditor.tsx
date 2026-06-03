import { generateUUID } from '../../../core/utils/idGenerator';
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { Anomaly, Proposal } from '../../../domain/revenue';
import { ScreenContainer, AppHeader, SurfaceCard } from '../../../ui/system';
import { PrimaryButton, Input } from '../../../app/components/ui';
const generateId = () => generateUUID();

interface ProposalEditorProps {
  anomaly: Anomaly;
  onClose: () => void;
}

export const ProposalEditor: React.FC<ProposalEditorProps> = ({ anomaly, onClose }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(`Anomalia identificada: ${anomaly.title}\nRecomendação técnica: ${anomaly.recommendedAction || 'Nenhuma recomendação'}`);

  const handleSave = async () => {
    const proposal: Proposal = {
      id: generateId(),
      companyId: anomaly.companyId,
      workspaceId: anomaly.workspaceId,
      anomalyId: anomaly.id,
      clientId: anomaly.clientId,
      siteId: anomaly.siteId,
      assetId: anomaly.assetId,
      title: `Orçamento de Correção: ${anomaly.title}`,
      description,
      amount: parseFloat(amount) || 0,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };

    await db.proposals.put(proposal);
    await db.anomalies.update(anomaly.id, { 
      status: 'QUOTED', 
      quotedAt: new Date().toISOString() 
    });

    // Also inject an event into operationalEvents for the Timeline
    await db.operationalEvents.put({
      id: generateId(),
      companyId: anomaly.companyId,
      workspaceId: anomaly.workspaceId,
      aggregateId: anomaly.assetId,
      aggregateType: 'asset',
      eventType: 'PROPOSAL_CREATED_FROM_ANOMALY',
      payload: { proposalId: proposal.id, anomalyId: anomaly.id },
      timestamp: new Date().toISOString(),
      syncStatus: 'pending'
    } as any);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
      <SurfaceCard className="w-full max-w-lg p-6 bg-surface-900 animate-slide-up">
        <h2 className="text-xl font-black text-white mb-4">Gerar Proposta Comercial</h2>
        
        <div className="bg-surface-800 p-4 rounded-xl mb-6 border border-surface-700">
          <p className="text-xs text-text-tertiary mb-1">Origem (Zero Redigitação)</p>
          <p className="text-sm text-white font-bold">{anomaly.title}</p>
          <p className="text-sm text-text-secondary mt-2">{anomaly.recommendedAction}</p>
        </div>

        <div className="space-y-4 mb-6">
          <Input 
            label="Valor Total (R$)"
            type="number"
            placeholder="0,00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <Input 
            label="Escopo da Proposta (Auto-preenchido)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-text-secondary font-bold">Cancelar</button>
          <PrimaryButton onClick={handleSave} className="flex-1">Gerar Proposta</PrimaryButton>
        </div>
      </SurfaceCard>
    </div>
  );
};
