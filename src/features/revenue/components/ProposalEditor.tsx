import { generateUUID } from '../../../core/utils/idGenerator';
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../storage/dexieDatabase';
import { Anomaly, Proposal } from '../../../domain/revenue';
import { GlassInput, GlassTextarea } from '../../../ui/system/GlassForms';
import { SurfaceCard } from '../../../ui/system/Cards';
import { SectionLabel } from '../../../ui/system/Typography';
import { Asset360Modal } from '../../clients/components/Asset360Modal';
import { Wrench, X, ChevronRight, MessageCircle, Sparkles, Check } from 'lucide-react';
import { sendWhatsAppMessage } from '../../../utils/whatsapp';
const generateId = () => generateUUID();

interface ProposalEditorProps {
  anomaly: Anomaly;
  onClose: () => void;
}

export const ProposalEditor: React.FC<ProposalEditorProps> = ({ anomaly, onClose }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(`Anomalia identificada: ${anomaly.title}\nRecomendação técnica: ${anomaly.recommendedAction || 'Nenhuma recomendação'}`);
  const [showAsset360, setShowAsset360] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const client = useLiveQuery(() => db.clients.get(anomaly.clientId), [anomaly.clientId]);

  const handleSave = async (shouldShare = false) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
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

      if (shouldShare && client?.phone) {
        const msg = `Olá ${client.name}! Gostaria de enviar a proposta de correção para ${anomaly.title}.\n\nValor: R$ ${(proposal.amount || 0).toLocaleString('pt-BR')}\n\nPodemos prosseguir?`;
        sendWhatsAppMessage(client.phone, msg);
      }

      window.dispatchEvent(new CustomEvent('aferix_toast', {
        detail: { type: 'success', message: 'Proposta gerada com sucesso!' }
      }));

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[#080A0E] border-l border-white/[0.07] shadow-[−40px_0_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Atmospheric glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-gold)]/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-[#0A84FF]/5 blur-[80px] rounded-full pointer-events-none" />

        {/* HEADER */}
        <div className="relative z-10 px-7 pt-10 pb-6 border-b border-white/[0.05]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black font-mono text-[var(--accent-gold)] tracking-[0.3em] uppercase">
                Pipeline Comercial
              </span>
              <h2 className="text-[26px] font-black text-white uppercase tracking-tight leading-none">
                Gerar Proposta
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/30 hover:text-white active:scale-95 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto relative z-10 px-7 py-6 flex flex-col gap-6">
          {/* ANOMALY CARD */}
          <SurfaceCard padding="lg" className="bg-gradient-to-br from-red-500/[0.08] to-red-500/[0.02] border-red-500/[0.15] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 blur-2xl rounded-full" />
            <SectionLabel className="!mb-3 opacity-40 uppercase tracking-[0.25em]">Anomalia Identificada</SectionLabel>
            <p className="text-[16px] font-black text-white uppercase leading-tight mb-2">{anomaly.title}</p>
            {anomaly.recommendedAction && (
              <p className="text-[12px] text-white/40 leading-relaxed">{anomaly.recommendedAction}</p>
            )}
          </SurfaceCard>

          {/* ASSET INSPECTION BUTTON */}
          <button
            onClick={() => setShowAsset360(true)}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-[var(--accent-gold)]/[0.06] border border-[var(--accent-gold)]/20 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center">
                <Wrench size={16} />
              </div>
              <span className="text-[12px] font-black uppercase tracking-widest">Inspecionar Ativo</span>
            </div>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* FORM */}
          <div className="flex flex-col gap-5">
            <div className="relative">
              <div className="absolute left-5 top-[calc(50%+10px)] -translate-y-1/2 text-white/30 font-black text-xs pointer-events-none z-10">R$</div>
              <GlassInput
                label="Valor Total do Orçamento"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-12 text-[20px] font-black text-[#47C46A]"
              />
            </div>
            <GlassTextarea
              label="Escopo Detalhado"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="relative z-10 px-7 pb-10 pt-5 border-t border-white/[0.05] flex flex-col gap-3 bg-[#080A0E]/80 backdrop-blur-sm">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="w-full h-14 bg-[#D4AF37] text-black font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(212,169,74,0.25)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Sparkles size={16} />
            {isSaving ? "SALVANDO..." : "CONSOLIDAR PROPOSTA"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="w-full h-12 bg-[#47C46A]/10 border border-[#47C46A]/25 text-[#47C46A] font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <MessageCircle size={15} />
            Consolidar e Enviar via WhatsApp
          </button>
          <button
            onClick={onClose}
            className="w-full h-10 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white/40 transition-all"
          >
            Descartar Alterações
          </button>
        </div>
      </div>

      {showAsset360 && (
        <Asset360Modal assetId={anomaly.assetId} onClose={() => setShowAsset360(false)} />
      )}
    </div>
  );
};
