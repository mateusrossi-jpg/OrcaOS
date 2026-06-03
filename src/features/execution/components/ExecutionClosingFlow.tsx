import React, { useState, useEffect } from 'react';
import { ScreenContainer, SurfaceCard, AppHeader, ExecutiveSummaryGrid, ValueBlock, SectionLabel, Body, Stack } from '../../../ui/system';
import { PrimaryButton, SecondaryButton } from '../../../app/components/ui';
import { SignaturePad } from './SignaturePad';
import { AssetExecution } from '../../../domain/assetExecution';
import { CheckCircle2, FileText, Send, Check, DollarSign, Wallet, CreditCard, Banknote, Clock, History, Zap } from 'lucide-react';
import { TrialAndPaywallModal } from './TrialAndPaywallModal';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { operationalFacade } from '../../workflow/operationalFacade';
import { db } from '../../../storage/dexieDatabase';
import { cn } from '../../../utils/ui';

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
  const [step, setStep] = useState<'summary' | 'signature' | 'payment_ask' | 'payment_process' | 'generating' | 'done' | 'paywall'>('summary');
  const [signature, setSignature] = useState<string | null>(null);
  const [executedValue, setExecutedValue] = useState<number>(0);
  const [receivedValue, setReceivedValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX');

  useEffect(() => {
    async function loadWO() {
      const wo = await db.workOrders.get(workOrderId);
      if (wo) setExecutedValue(wo.executedValue || 0);
    }
    loadWO();
  }, [workOrderId]);

  const allResults = Object.values(executions).flatMap(ex => ex.checklistResults || []);
  const compliantCount = allResults.filter(r => r.status === 'compliant').length;
  const nonCompliantCount = allResults.filter(r => r.status === 'non-compliant').length;
  const naCount = allResults.filter(r => r.status === 'na').length;

  const handleSign = (sigDataUrl: string) => {
    setSignature(sigDataUrl);
    setStep('payment_ask');
  };

  const handleFinishWithPayment = async (isReceived: boolean) => {
    setStep('generating');
    try {
      const finalReceived = isReceived ? receivedValue : 0;
      await operationalFacade.completeWorkOrder(
        workOrderId,
        executedValue,
        finalReceived,
        isReceived ? `Pago via ${paymentMethod}` : "Aguardando recebimento"
      );
      
      // Simula a geração do PDF
      setTimeout(() => {
        setStep('done');
      }, 1000);
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'error', message: 'Erro ao finalizar.' } }));
      setStep('summary');
    }
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

  if (step === 'payment_ask') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#050505] animate-slide-up">
         <AppHeader title="Recebimento" subtitle={clientName} onBack={() => setStep('summary')} />
         
         <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center border border-[var(--accent-gold)]/20">
               <DollarSign size={40} className="text-[var(--accent-gold)]" />
            </div>

            <div className="text-center gap-2 flex flex-col">
               <h2 className="text-2xl font-black text-white uppercase tracking-tight">Receber Agora?</h2>
               <p className="text-white/40 text-[13px] font-medium leading-relaxed max-w-[260px] mx-auto">
                 Deseja registrar o pagamento deste serviço imediatamente ou cobrar depois?
               </p>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-4 mt-4">
               <button 
                 onClick={() => { setReceivedValue(executedValue); setStep('payment_process'); }}
                 className="w-full h-16 bg-[var(--accent-gold)] text-black font-black text-[13px] tracking-[0.2em] rounded-2xl shadow-[0_8px_24px_rgba(255,200,0,0.15)] flex items-center justify-center gap-3 uppercase active:scale-95 transition-all"
               >
                 SIM, RECEBER AGORA <Check size={18} />
               </button>
               
               <button 
                 onClick={() => handleFinishWithPayment(false)}
                 className="w-full h-16 bg-white/[0.03] border border-white/[0.08] text-white/60 font-black text-[11px] tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 uppercase active:scale-95 transition-all"
               >
                 RECEBER DEPOIS <Clock size={16} />
               </button>
            </div>
         </div>
      </div>
    );
  }

  if (step === 'payment_process') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#050505] animate-slide-up">
         <AppHeader title="Finalizar e Receber" subtitle={clientName} onBack={() => setStep('payment_ask')} />
         
         <div className="flex flex-col p-6 gap-8 overflow-y-auto pb-32">
            
            {/* VALOR EXECUTADO */}
            <div className="flex flex-col gap-4 items-center">
               <SectionLabel className="!text-[10px] uppercase tracking-widest text-[var(--accent-gold)] font-black">Valor Final do Serviço</SectionLabel>
               <div className="text-5xl font-black text-white font-mono tracking-tighter">{formatCurrencyBRL(executedValue)}</div>
            </div>

            {/* FORMA DE PAGAMENTO */}
            <div className="flex flex-col gap-4">
               <SectionLabel className="!text-[9px] uppercase tracking-[0.2em] opacity-40 ml-1">Método de Recebimento</SectionLabel>
               <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'PIX', icon: <Zap size={18} />, label: 'PIX' },
                    { id: 'DINHEIRO', icon: <Banknote size={18} />, label: 'CASH' },
                    { id: 'CARTÃO', icon: <CreditCard size={18} />, label: 'CARD' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "h-20 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all active:scale-95",
                        paymentMethod === method.id 
                          ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)] text-[var(--accent-gold)]" 
                          : "bg-white/[0.02] border-white/[0.06] text-white/40"
                      )}
                    >
                      {method.icon}
                      <span className="text-[10px] font-black tracking-widest">{method.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* ATALHOS DE VALOR */}
            <div className="flex flex-col gap-4">
               <SectionLabel className="!text-[9px] uppercase tracking-[0.2em] opacity-40 ml-1">Valor Recebido</SectionLabel>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setReceivedValue(executedValue)}
                    className={cn(
                      "h-14 rounded-xl border flex items-center justify-between px-6 transition-all",
                      receivedValue === executedValue ? "bg-[var(--accent-green)]/10 border-[var(--accent-green)]/30 text-[var(--accent-green)]" : "bg-white/[0.02] border-white/[0.06] text-white/60"
                    )}
                  >
                    <span className="text-[11px] font-black tracking-widest uppercase">RECEBER TOTAL</span>
                    <span className="text-[15px] font-mono font-bold">{formatCurrencyBRL(executedValue)}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setReceivedValue(executedValue * 0.5)}
                      className={cn(
                        "h-14 rounded-xl border flex items-center justify-center gap-3 transition-all",
                        receivedValue === executedValue * 0.5 ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/[0.06] text-white/40"
                      )}
                    >
                      <span className="text-[11px] font-black tracking-widest uppercase">50%</span>
                    </button>
                    <button 
                      onClick={() => setReceivedValue(0)}
                      className="h-14 rounded-xl border bg-white/[0.02] border-white/[0.06] text-white/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <span className="text-[11px] font-black tracking-widest uppercase text-white/20 italic">OUTRO...</span>
                    </button>
                  </div>
               </div>
            </div>

         </div>

         {/* ACTION BAR */}
         <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#050505]/80 backdrop-blur-md border-t border-white/[0.05] pb-10">
            <PrimaryButton 
              onClick={() => handleFinishWithPayment(true)}
              className="w-full h-16 !rounded-2xl !bg-[var(--accent-green)] !text-black shadow-[0_8px_30px_rgba(34,197,94,0.2)] font-black tracking-[0.2em] text-[13px]"
            >
              CONCLUIR E RECEBER <Check size={18} className="ml-1" />
            </PrimaryButton>
         </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
        <div className="w-16 h-16 border-4 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-white font-bold tracking-widest uppercase">Consolidando Operação...</h2>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] p-6 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center mb-6 shadow-[var(--glow-green)]">
          <Check size={48} className="text-[var(--accent-green)]" strokeWidth={3} />
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight text-center mb-2">OPERACIONAL OK</h1>
        <p className="text-text-secondary font-mono text-[13px] text-center mb-8">{clientName}</p>

        <SurfaceCard padding="md" className="w-full max-w-sm border border-white/[0.08] mb-12">
          <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
            <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Faturado</span>
            <span className="text-[14px] font-black text-white">{formatCurrencyBRL(executedValue)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[12px] text-text-muted font-bold tracking-widest uppercase">Recebido</span>
            <span className="text-[14px] font-black text-[var(--accent-green)]">{formatCurrencyBRL(receivedValue)}</span>
          </div>
          <div className="text-[10px] text-center text-text-tertiary mt-2 font-mono">CONSOLIDADO NO FLUXO DE CAIXA</div>
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
          </div>
        </SurfaceCard>

        {/* VALOR EXECUTADO PREVIEW */}
        <SurfaceCard padding="md" className="w-full max-w-sm border-dashed border-white/10 bg-white/[0.01]">
           <div className="flex justify-between items-center">
              <Stack className="gap-0.5">
                 <SectionLabel className="!text-[9px]">Valor do Serviço</SectionLabel>
                 <Body className="text-[13px] font-bold text-white/60 italic">Confirmado na OS</Body>
              </Stack>
              <div className="text-xl font-black text-white font-mono">{formatCurrencyBRL(executedValue)}</div>
           </div>
        </SurfaceCard>

      </div>
      
      <div className="p-4 bg-surface-900/90 backdrop-blur-md border-t border-surface-800 pb-8 mt-auto">
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
