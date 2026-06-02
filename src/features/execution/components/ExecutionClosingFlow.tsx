import React, { useState } from 'react';
import { ScreenContainer, SurfaceCard, AppHeader } from '../../../ui/system';
import { PrimaryButton, SecondaryButton } from '../../../app/components/ui';
import { SignaturePad } from './SignaturePad';
import { AssetExecution } from '../../../domain/assetExecution';
import { CheckCircle2, FileText, Send, Check } from 'lucide-react';
import { TrialAndPaywallModal } from './TrialAndPaywallModal';

interface ExecutionClosingFlowProps {
  workOrderId: string;
  clientName: string;
  executions: Record<string, AssetExecution>;
  totalAssets: number;
  onExit: () => void;
  onCheckout: () => void;
}

export const ExecutionClosingFlow: React.FC<ExecutionClosingFlowProps> = ({
  workOrderId,
  clientName,
  executions,
  totalAssets,
  onExit,
  onCheckout
}) => {
  const [step, setStep] = useState<'summary' | 'signature' | 'generating' | 'done' | 'paywall'>('summary');
  const [signature, setSignature] = useState<string | null>(null);

  const allResults = Object.values(executions).flatMap(ex => ex.checklistResults || []);
  const compliantCount = allResults.filter(r => r.status === 'compliant').length;
  const nonCompliantCount = allResults.filter(r => r.status === 'non-compliant').length;
  const naCount = allResults.filter(r => r.status === 'na').length;

  const handleSign = (sigDataUrl: string) => {
    setSignature(sigDataUrl);
    setStep('generating');
    
    // Simula a geração do PDF e finalização
    setTimeout(() => {
      setStep('done');
    }, 1500);
  };

  const handleShareWhatsApp = () => {
    const text = `Olá! O Laudo Técnico referente a ${clientName} foi concluído.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const handleNextOS = () => {
    onCheckout();
  };

  if (step === 'paywall') {
    return <TrialAndPaywallModal onClose={onExit} onSubscribe={onExit} />;
  }

  if (step === 'signature') {
    return (
      <SignaturePad 
        title="Assinatura do Responsável" 
        subtitle={clientName}
        onClose={() => setStep('summary')} 
        onSave={handleSign} 
      />
    );
  }

  if (step === 'generating') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
        <div className="w-16 h-16 border-4 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-white font-bold tracking-widest uppercase">Gerando Laudo...</h2>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] p-6 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center mb-6 shadow-[var(--glow-green)]">
          <Check size={48} className="text-[var(--accent-green)]" strokeWidth={3} />
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight text-center mb-2">LAUDO PRONTO</h1>
        <p className="text-text-secondary font-mono text-[13px] text-center mb-8">{clientName}</p>

        <SurfaceCard padding="md" className="w-full max-w-sm border border-white/[0.08] mb-12">
          <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
            <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Conformes</span>
            <span className="text-[14px] font-black text-[var(--accent-green)]">{compliantCount}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Anomalias</span>
            <span className="text-[14px] font-black text-status-error">{nonCompliantCount}</span>
          </div>
          <div className="text-[10px] text-center text-text-tertiary mt-2 font-mono">GERADO AGORA</div>
        </SurfaceCard>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <PrimaryButton onClick={handleShareWhatsApp} className="py-4 bg-[var(--accent-green)] text-black rounded-xl shadow-[var(--glow-green)]">
            <Send size={18} className="mr-2" />
            <span className="tracking-widest text-[13px]">ENVIAR POR WHATSAPP</span>
          </PrimaryButton>
          
          <SecondaryButton onClick={() => window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'info', message: 'Visualização de PDF em desenvolvimento.' } }))} className="py-4 rounded-xl border-white/[0.08]">
            <FileText size={18} className="mr-2" />
            <span className="tracking-widest text-[13px]">VISUALIZAR PDF</span>
          </SecondaryButton>

          <button onClick={handleNextOS} className="mt-6 py-4 w-full rounded-xl bg-[var(--accent-gold)] text-black font-black tracking-widest text-[13px] shadow-[var(--glow-gold)] transition-colors active:scale-95">
            VOLTAR PARA AGENDA
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT: SUMMARY
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050505] animate-slide-up">
      <AppHeader title="Resumo da Execução" subtitle={clientName} onBack={() => onExit()} />
      
      <div className="flex flex-col p-4 items-center pt-8">
        <h2 className="text-[18px] font-black text-white tracking-widest uppercase mb-6">Pronto para assinatura</h2>
        
        <SurfaceCard padding="lg" className="w-full max-w-sm border border-white/[0.08] mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-text-secondary font-bold tracking-wider">Ativos Inspecionados</span>
              <span className="text-[16px] font-black text-white">{totalAssets}/{totalAssets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-text-secondary font-bold tracking-wider">Itens Conformes</span>
              <span className="text-[16px] font-black text-[var(--accent-green)]">{compliantCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-text-secondary font-bold tracking-wider">Falhas Encontradas</span>
              <span className="text-[16px] font-black text-status-error">{nonCompliantCount}</span>
            </div>
            {naCount > 0 && (
               <div className="flex justify-between items-center">
                 <span className="text-[13px] text-text-secondary font-bold tracking-wider">Não Aplicáveis</span>
                 <span className="text-[16px] font-black text-text-muted">{naCount}</span>
               </div>
            )}
          </div>
        </SurfaceCard>

      </div>
      
      <div className="p-4 bg-surface-900/90 backdrop-blur-md border-t border-surface-800 pb-8">
        <PrimaryButton 
          onClick={() => setStep('signature')}
          className="w-full py-4 text-[13px] rounded-xl shadow-[var(--glow-gold)] tracking-widest font-black"
        >
          ASSINAR LAUDO
        </PrimaryButton>
      </div>
    </div>
  );
};
