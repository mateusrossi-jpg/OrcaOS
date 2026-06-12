import React, { useState, useEffect } from 'react';
import { pilotTelemetry } from '../../../services/pilotTelemetryService';
import { ScreenContainer, SurfaceCard, AppHeader, ExecutiveSummaryGrid, ValueBlock, SectionLabel, Body, Stack } from '../../../ui/system';
import { PrimaryButton, SecondaryButton, MonetaryInput } from '../../../app/components/ui';
import { SignaturePad } from './SignaturePad';
import { AssetExecution } from '../../../domain/assetExecution';
import { Asset } from '../../../domain/asset';
import { CheckCircle2, FileText, Send, Check, DollarSign, Wallet, CreditCard, Banknote, Clock, History, Zap, Star, Share2, ThumbsUp, ThumbsDown, Camera, Image as ImageIcon, Trash2, ChevronRight } from 'lucide-react';
import { TrialAndPaywallModal } from './TrialAndPaywallModal';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { operationalFacade } from '../../workflow/operationalFacade';
import { db } from '../../../storage/dexieDatabase';
import { cn } from '../../../utils/ui';
import { TechnicalReportPreview } from './TechnicalReportPreview';
import { professionalProfileService } from '../../../services/professionalProfileService';
import { reputationEngine } from '../../../services/ReputationEngine';

interface ExecutionClosingFlowProps {
  workOrderId: string;
  clientName: string;
  executions: Record<string, AssetExecution>;
  totalAssets: number;
  onExit: () => void;
  onCheckout: () => void;
  onCompleteFlow?: (abandoned?: boolean) => void;
}

export const ExecutionClosingFlow: React.FC<ExecutionClosingFlowProps> = ({
  workOrderId,
  clientName,
  executions,
  totalAssets,
  onExit,
  onCheckout,
  onCompleteFlow
}) => {
  const [step, setStep] = useState<'summary' | 'parts' | 'signature' | 'payment_ask' | 'payment_process' | 'generating' | 'review' | 'referral' | 'marketing' | 'done' | 'paywall'>('summary');
  const [signature, setSignature] = useState<string | null>(null);
  const [executedValue, setExecutedValue] = useState<number>(0);
  const [receivedValue, setReceivedValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX');
  const [showReport, setShowReport] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [workOrder, setWorkOrder] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [consumedParts, setConsumedParts] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [isCustomPayment, setIsCustomPayment] = useState<boolean>(false);
  const [isEditingExecutedValue, setIsEditingExecutedValue] = useState<boolean>(false);

  useEffect(() => {
    const endTrack = pilotTelemetry.trackScreen(`ExecutionClosing_${step}`);
    return () => endTrack();
  }, [step]);

  useEffect(() => {
    async function loadData() {
      const [wo, prof, allAssets, allCatalog] = await Promise.all([
        db.workOrders.get(workOrderId),
        professionalProfileService.getProfile(),
        db.assets.where('id').anyOf(Object.keys(executions)).toArray(),
        db.catalog.toArray()
      ]);
      
      if (wo) {
        setWorkOrder(wo);
        setExecutedValue(wo.executedValue || 0);
      }
      setProfile(prof);
      setAssets(allAssets);
      setCatalog(allCatalog);
    }
    loadData();
  }, [workOrderId, executions]);

  const handleAddPart = (part: any) => {
     setConsumedParts(prev => {
        const existing = prev.find(p => p.id === part.id);
        if (existing) {
           return prev.map(p => p.id === part.id ? { ...p, qty: p.qty + 1 } : p);
        }
        return [...prev, { ...part, qty: 1 }];
     });
  };

  const handleRemovePart = (partId: string) => {
     setConsumedParts(prev => prev.filter(p => p.id !== partId));
  };

  const totalPartsCost = consumedParts.reduce((acc, p) => acc + (p.unitCost * p.qty), 0);

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
      
      // RC10: Trigger Reputation Workflow
      await reputationEngine.triggerReputationWorkflow(workOrderId, workOrder?.clientId || '');

      if (onCompleteFlow) onCompleteFlow(false);
      pilotTelemetry.trackAction('ExecutionClosing', 'finish_os', { isReceived });

      // Simula a geração do PDF
      setTimeout(() => {
        setStep('review');
      }, 1000);
      } catch (err) {
      pilotTelemetry.trackError('ExecutionClosing', 'FINISH_FAILED', err instanceof Error ? err.message : 'Unknown');
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

  const handleGoogleReview = () => {
    window.open(`https://search.google.com/local/writereview?placeid=MOCK_PLACE_ID`);
    setStep('referral');
  };

  const handleSpeakWithOwner = () => {
    const text = `Olá! Tive um problema com o serviço ${workOrder?.title} e gostaria de falar com o responsável.`;
    window.open(`https://wa.me/5500000000000?text=${encodeURIComponent(text)}`);
    setStep('done');
  };

  const handleShareReferral = () => {
    const text = `Olá! Fiz um serviço com ${profile?.professionalName || 'esta empresa'} e gostei bastante. Caso precise de assistência técnica ou manutenção, recoemndo conversar com eles.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    setStep('marketing');
  };

  if (step === 'paywall') {
    return <TrialAndPaywallModal onClose={onExit} onSubscribe={onExit} />;
  }

  if (step === 'parts') {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col bg-aferix-bg animate-slide-up">
         <AppHeader title="Consumo de Peças" subtitle="Materiais e Kits usados" onBack={() => setStep('summary')} standalone />
         
         <div className="flex-1 flex flex-col p-6 gap-8 overflow-y-auto pb-32">
            <div className="flex flex-col gap-4">
               <SectionLabel className="!text-[9px] uppercase tracking-widest opacity-40 ml-1">Itens do Catálogo</SectionLabel>
               <div className="grid grid-cols-2 gap-3">
                  {catalog.slice(0, 6).map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleAddPart(item)}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-start gap-2 active:scale-95 transition-all"
                    >
                       <span className="text-[11px] font-black text-white uppercase truncate w-full">{item.name}</span>
                       <span className="text-[10px] text-white/30">{formatCurrencyBRL(item.unitCost)}</span>
                    </button>
                  ))}
               </div>
            </div>

            {consumedParts.length > 0 && (
               <div className="flex flex-col gap-4">
                  <SectionLabel className="!text-[9px] uppercase tracking-widest text-[var(--accent-gold)] font-black ml-1">Cesto de Consumo</SectionLabel>
                  <div className="flex flex-col gap-2">
                     {consumedParts.map(part => (
                        <div key={part.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                           <div className="flex flex-col">
                              <span className="text-[12px] font-black text-white uppercase">{part.name}</span>
                              <span className="text-[10px] text-white/40">{part.qty} x {formatCurrencyBRL(part.unitCost)}</span>
                           </div>
                           <button onClick={() => handleRemovePart(part.id)} className="w-12 h-12 flex items-center justify-center text-red-400 active:scale-95 transition-all rounded-xl hover:bg-white/5"><Trash2 size={16} /></button>
                        </div>
                     ))}
                  </div>
                  <div className="mt-4 p-4 border-t border-white/5 flex justify-between items-center">
                     <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">Custo Real de Material</span>
                     <span className="text-lg font-black text-white font-mono">{formatCurrencyBRL(totalPartsCost)}</span>
                  </div>
               </div>
            )}
         </div>

         <div className="absolute bottom-0 left-0 right-0 p-6 bg-aferix-bg/80 backdrop-blur-md border-t border-white/[0.05] pb-10">
            <PrimaryButton 
              onClick={() => setStep('signature')}
              className="w-full h-16 !rounded-2xl font-black tracking-[0.2em] text-[13px]"
            >
              PROSSEGUIR PARA ASSINATURA <ChevronRight size={18} className="ml-1" />
            </PrimaryButton>
         </div>
      </div>
    );
  }

  if (step === 'signature') {
    return (
      <SignaturePad 
        title="Assinatura do Responsável" 
        subtitle={clientName}
        onClose={() => setStep('parts')} 
        onSave={handleSign} 
      />
    );
  }

  if (step === 'payment_ask') {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col bg-aferix-bg animate-slide-up">
         <AppHeader title="Recebimento" subtitle={clientName} onBack={() => setStep('signature')} standalone />
         
         <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 gap-8 pb-32">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center border border-[var(--accent-gold)]/20 shrink-0">
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
      <div className="fixed inset-0 z-[1000] flex flex-col bg-aferix-bg animate-slide-up">
         <AppHeader title="Finalizar e Receber" subtitle={clientName} onBack={() => setStep('payment_ask')} standalone />
         
         <div className="flex-1 flex flex-col p-6 gap-8 overflow-y-auto pb-32">
            
            {/* VALOR EXECUTADO */}
            <div className="flex flex-col gap-2 items-center w-full">
               <SectionLabel className="!text-[10px] uppercase tracking-widest text-[var(--accent-gold)] font-black">Valor Final do Serviço</SectionLabel>
               
               {isEditingExecutedValue ? (
                  <div className="w-full max-w-[280px] animate-slide-up flex flex-col gap-2">
                     <MonetaryInput 
                       value={executedValue}
                       onChange={(val) => {
                         setExecutedValue(val);
                         if (!isCustomPayment) {
                           setReceivedValue(val);
                         }
                       }}
                     />
                     <button
                       type="button"
                       onClick={() => setIsEditingExecutedValue(false)}
                       className="w-full h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 text-[11px] font-black tracking-widest uppercase hover:text-white transition-all active:scale-95"
                     >
                       Confirmar Valor
                     </button>
                  </div>
               ) : (
                  <button 
                    type="button"
                    onClick={() => setIsEditingExecutedValue(true)}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
                  >
                     <span className="text-4xl font-black text-white font-mono tracking-tighter">{formatCurrencyBRL(executedValue)}</span>
                     <FileText size={16} className="text-white/20 group-hover:text-[var(--accent-gold)] transition-colors" />
                  </button>
               )}
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
                      type="button"
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
                    type="button"
                    onClick={() => { setReceivedValue(executedValue); setIsCustomPayment(false); }}
                    className={cn(
                      "h-14 rounded-xl border flex items-center justify-between px-6 transition-all active:scale-[0.98]",
                      (!isCustomPayment && receivedValue === executedValue) ? "bg-[var(--accent-green)]/10 border-[var(--accent-green)]/30 text-[var(--accent-green)]" : "bg-white/[0.02] border-white/[0.06] text-white/60"
                    )}
                  >
                    <span className="text-[11px] font-black tracking-widest uppercase">RECEBER TOTAL</span>
                    <span className="text-[15px] font-mono font-bold">{formatCurrencyBRL(executedValue)}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => { setReceivedValue(executedValue * 0.5); setIsCustomPayment(false); }}
                      className={cn(
                        "h-14 rounded-xl border flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                        (!isCustomPayment && receivedValue === executedValue * 0.5) ? "bg-white/10 border-white/20 text-white font-bold" : "bg-white/[0.02] border-white/[0.06] text-white/40"
                      )}
                    >
                      <span className="text-[11px] font-black tracking-widest uppercase">50%</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsCustomPayment(true); setReceivedValue(0); }}
                      className={cn(
                        "h-14 rounded-xl border flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                        isCustomPayment ? "bg-white/10 border-white/20 text-white font-bold" : "bg-white/[0.02] border-white/[0.06] text-white/40"
                      )}
                    >
                      <span className="text-[11px] font-black tracking-widest uppercase">OUTRO...</span>
                    </button>
                  </div>
               </div>

               {isCustomPayment && (
                  <div className="mt-4 p-5 rounded-[24px] bg-white/[0.02] border border-white/10 flex flex-col gap-4 animate-slide-up">
                     <MonetaryInput 
                       label="Digitar Valor Recebido"
                       value={receivedValue}
                       onChange={(val) => setReceivedValue(val)}
                     />
                     <div className="flex gap-2">
                        {[10, 50, 100].map(amount => (
                           <button
                             key={amount}
                             type="button"
                             onClick={() => setReceivedValue(prev => prev + amount)}
                             className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[11px] font-black hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
                           >
                              +{amount}
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>

         </div>

         {/* ACTION BAR */}
         <div className="absolute bottom-0 left-0 right-0 p-6 bg-aferix-bg/80 backdrop-blur-md border-t border-white/[0.05] pb-10">
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-aferix-bg">
        <div className="w-16 h-16 border-4 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-white font-bold tracking-widest uppercase">Consolidando Operação...</h2>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col bg-aferix-bg p-6 py-12 items-center justify-center animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
         <div className="w-20 h-20 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center mb-8 border border-[var(--accent-gold)]/20 shadow-[0_0_40px_rgba(212,169,74,0.15)]">
            <Star size={40} className="text-[var(--accent-gold)] fill-current" />
         </div>

         <h1 className="text-[26px] font-black text-white uppercase tracking-tight text-center mb-2">Como foi o serviço?</h1>
         <p className="text-white/40 text-[13px] font-medium text-center mb-10 max-w-[260px]">Sua avaliação ajuda a {profile?.professionalName || 'nossa equipe'} a crescer.</p>

         <div className="flex gap-4 mb-10">
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                onClick={() => setReviewRating(star)}
                className={cn(
                  "w-12 h-12 rounded-2xl border transition-all active:scale-90",
                  reviewRating >= star ? "bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black" : "bg-white/5 border-white/10 text-white/20"
                )}
              >
                <Star size={24} className={reviewRating >= star ? "fill-current" : ""} />
              </button>
            ))}
         </div>

         {reviewRating > 0 && (
           <div className="w-full max-w-sm flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
              {reviewRating >= 4 ? (
                <div className="flex flex-col gap-6 items-center">
                   <div className="p-5 rounded-[28px] bg-[#47C46A]/5 border border-[#47C46A]/20 flex flex-col gap-3 items-center text-center">
                      <ThumbsUp size={32} className="text-[#47C46A]" />
                      <Body className="text-[14px] font-bold text-white">Que ótimo que você gostou! Nos ajudaria com uma avaliação no Google?</Body>
                      <PrimaryButton 
                        onClick={handleGoogleReview}
                        className="w-full h-14 !bg-[#4285F4] !text-white font-black tracking-widest text-[11px] rounded-xl"
                      >
                         AVALIAR NO GOOGLE
                      </PrimaryButton>
                   </div>
                   <button onClick={() => setStep('referral')} className="h-12 flex items-center justify-center text-[10px] font-black text-white/30 uppercase tracking-widest active:scale-95 transition-all">Pular para indicações</button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 items-center">
                   <div className="p-5 rounded-[28px] bg-red-500/5 border border-red-500/20 flex flex-col gap-3 items-center text-center">
                      <ThumbsDown size={32} className="text-red-400" />
                      <Body className="text-[14px] font-bold text-white">Lamentamos que sua experiência não tenha sido ideal. Queremos ouvir você.</Body>
                      <PrimaryButton 
                        onClick={handleSpeakWithOwner}
                        className="w-full h-14 !bg-white !text-black font-black tracking-widest text-[11px] rounded-xl"
                      >
                         FALAR COM RESPONSÁVEL
                      </PrimaryButton>
                   </div>
                   <button onClick={() => setStep('done')} className="h-12 flex items-center justify-center text-[10px] font-black text-white/30 uppercase tracking-widest active:scale-95 transition-all">Finalizar sem contato</button>
                </div>
              )}
           </div>
         )}
      </div>
    );
  }

  if (step === 'referral') {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col bg-aferix-bg p-6 py-12 items-center justify-center animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
         <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20">
            <Share2 size={40} className="text-blue-400" />
         </div>

         <h1 className="text-[26px] font-black text-white uppercase tracking-tight text-center mb-2">Gostaria de nos indicar?</h1>
         <p className="text-white/40 text-[13px] font-medium text-center mb-10 max-w-[280px]">Indicações para amigos ou parceiros ajudam muito o nosso trabalho local.</p>

         <div className="w-full max-w-sm flex flex-col gap-4">
            <PrimaryButton 
              onClick={handleShareReferral}
              className="h-16 !bg-[#25D366] !text-white font-black tracking-[0.2em] text-[13px] shadow-[0_8px_32px_rgba(37,211,102,0.2)]"
            >
              INDICAR AGORA <Send size={18} className="ml-1" />
            </PrimaryButton>
            <button onClick={() => setStep('marketing')} className="h-12 text-[10px] font-black text-white/20 uppercase tracking-widest">AINDA NÃO</button>
         </div>
      </div>
    );
  }

  if (step === 'marketing') {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col bg-aferix-bg p-6 py-12 items-center justify-center animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
         <div className="w-20 h-20 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center mb-8 border border-[var(--accent-gold)]/20">
            <ImageIcon size={40} className="text-[var(--accent-gold)]" />
         </div>

         <h1 className="text-[26px] font-black text-white uppercase tracking-tight text-center mb-2">Deseja o card de Antes/Depois?</h1>
         <p className="text-white/40 text-[13px] font-medium text-center mb-10 max-w-[260px]">Geramos automaticamente um card visual com as evidências do seu serviço.</p>

         <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
            <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 opacity-40">
               <Camera size={24} />
               <span className="text-[9px] font-black uppercase">ANTES</span>
            </div>
            <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 opacity-40">
               <Camera size={24} />
               <span className="text-[9px] font-black uppercase text-[var(--accent-green)]">DEPOIS</span>
            </div>
         </div>

         <div className="w-full max-w-sm flex flex-col gap-4">
            <PrimaryButton 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'success', message: 'Marketing gerado com sucesso.' } }));
                setStep('done');
              }}
              className="h-16 !bg-white !text-black font-black tracking-[0.2em] text-[13px]"
            >
              GERAR E COMPARTILHAR
            </PrimaryButton>
            <button onClick={() => setStep('done')} className="h-12 text-[10px] font-black text-white/20 uppercase tracking-widest">NÃO, OBRIGADO</button>
         </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <>
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-aferix-bg p-6 py-12 animate-fade-in overflow-y-auto">
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
            
            <SecondaryButton onClick={() => setShowReport(true)} className="py-4 rounded-xl border-white/[0.08]">
              <FileText size={18} className="mr-2" />
              <span className="tracking-widest text-[13px]">VISUALIZAR LAUDO PDF</span>
            </SecondaryButton>

            <button onClick={handleNextOS} className="mt-6 py-4 w-full rounded-xl bg-[var(--accent-gold)] text-black font-black tracking-widest text-[13px] shadow-[var(--glow-gold)] transition-colors active:scale-95">
              VOLTAR PARA AGENDA
            </button>
          </div>
        </div>

        {showReport && (
          <TechnicalReportPreview
            clientName={clientName}
            workOrderTitle={workOrder?.title || 'Relatório de Serviço'}
            businessProfile={profile}
            assets={assets}
            executions={executions}
            signature={signature}
            onClose={() => setShowReport(false)}
          />
        )}
      </>
    );
  }

  // DEFAULT: SUMMARY
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-aferix-bg animate-in slide-in-from-right-6 duration-500">
      <AppHeader title="Resumo da Execução" subtitle={clientName} onBack={() => onExit()} standalone />
      
      <div className="flex-1 overflow-y-auto w-full flex flex-col p-4 items-center pt-8 pb-32">
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
      
      <div className="p-4 bg-surface-900/90 backdrop-blur-md border-t border-surface-800 pb-8 mt-auto flex flex-col gap-3">
        <PrimaryButton 
          onClick={() => setStep('signature')}
          className="w-full h-14 text-[13px] rounded-xl shadow-[var(--glow-gold)] tracking-widest font-black uppercase flex items-center justify-center gap-2"
        >
          PROSSEGUIR PARA ASSINATURA <ChevronRight size={18} />
        </PrimaryButton>
        <SecondaryButton 
          onClick={() => setStep('parts')}
          className="w-full h-14 text-[11px] rounded-xl border-white/[0.08] tracking-widest font-black uppercase flex items-center justify-center gap-2"
        >
          {consumedParts.length > 0 ? `MATERIAIS ADICIONADOS (${consumedParts.length})` : 'REGISTRAR PEÇAS / MATERIAIS'}
        </SecondaryButton>
      </div>
    </div>
  );
};
