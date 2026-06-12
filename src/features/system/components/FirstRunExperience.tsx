import React, { useState } from 'react';
import { 
  Building, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Target, 
  Star,
  Users,
  Briefcase
} from 'lucide-react';
import { 
  SurfaceCard, 
  SectionLabel, 
  Stack, 
  Body, 
  Subtitle,
  GlassInput
} from '../../../ui/system';
import { PrimaryButton } from '../../../app/components/ui/index';
import { cn } from '../../../utils/ui';

interface FirstRunExperienceProps {
  onComplete: (data: any) => void;
}

/**
 * FirstRunExperience: The critical "First 5 Minutes" journey (RC14).
 * Goal: Simulate first revenue and capture core business identity.
 */
export const FirstRunExperience: React.FC<FirstRunExperienceProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    companyName: '',
    businessType: 'Eletricista',
    firstClient: '',
    firstService: ''
  });

  const next = () => {
    if (step < 4) setStep(s => s + 1);
    else onComplete(data);
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-aferix-bg flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
       
       <div className="w-full max-w-sm flex flex-col gap-10">
          
          {/* PROGRESS TRACKER */}
          <div className="flex gap-2 w-full px-1">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500", i <= step ? "bg-[var(--accent-gold)]" : "bg-white/10")} />
             ))}
          </div>

          {step === 1 && (
            <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col gap-2">
                  <h1 className="text-[32px] font-black text-white uppercase tracking-tighter leading-tight">Vamos Batizar sua Empresa.</h1>
                  <p className="text-white/40 text-[15px]">Como seus clientes conhecem seu negócio?</p>
               </div>
               <GlassInput 
                 autoFocus
                 label="Nome da Empresa" 
                 placeholder="Ex: Aferix Elétrica" 
                 value={data.companyName}
                 onChange={e => setData({...data, companyName: e.target.value})}
               />
               <PrimaryButton onClick={next} disabled={!data.companyName} className="h-16 tracking-widest font-black uppercase rounded-2xl">PRÓXIMO PASSO</PrimaryButton>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col gap-2">
                  <h1 className="text-[32px] font-black text-white uppercase tracking-tighter leading-tight">Qual o seu Especialismo?</h1>
                  <p className="text-white/40 text-[15px]">Ajudamos você a configurar o catálogo ideal.</p>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {['Eletricista', 'Instalador CFTV', 'Ar Condicionado (PMOC)', 'Manutenção Predial'].map(type => (
                    <button 
                      key={type}
                      onClick={() => { setData({...data, businessType: type}); next(); }}
                      className={cn(
                        "w-full p-6 rounded-[24px] border text-left flex items-center justify-between transition-all active:scale-95",
                        data.businessType === type ? "bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/40" : "bg-white/[0.02] border-white/10"
                      )}
                    >
                       <span className="text-[15px] font-bold text-white uppercase tracking-tight">{type}</span>
                       <ChevronRight size={18} className="text-white/20" />
                    </button>
                  ))}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col gap-2">
                  <h1 className="text-[32px] font-black text-white uppercase tracking-tighter leading-tight">Seu Primeiro Cliente.</h1>
                  <p className="text-white/40 text-[15px]">Simule uma proposta real agora mesmo.</p>
               </div>
               <GlassInput 
                 autoFocus
                 label="Nome do Cliente" 
                 placeholder="Ex: Condomínio Vale Verde" 
                 value={data.firstClient}
                 onChange={e => setData({...data, firstClient: e.target.value})}
               />
               <PrimaryButton onClick={next} disabled={!data.firstClient} className="h-16 tracking-widest font-black uppercase rounded-2xl">CRIAR CLIENTE</PrimaryButton>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500 text-center items-center">
               <div className="w-20 h-20 rounded-full bg-[#47C46A]/10 border border-[#47C46A]/30 flex items-center justify-center text-[#47C46A] mb-4">
                  <Zap size={40} className="fill-current" />
               </div>
               <div className="flex flex-col gap-2">
                  <h1 className="text-[32px] font-black text-white uppercase tracking-tighter leading-tight">Tudo Pronto para Lucrar.</h1>
                  <p className="text-white/40 text-[15px]">Você acaba de configurar seu sistema de receita. Clique abaixo para ver o que preparamos.</p>
               </div>
               <div className="w-full p-6 rounded-[32px] bg-white/[0.03] border border-white/10 flex flex-col gap-4 text-left">
                  <div className="flex items-center gap-3">
                     <CheckCircle2 size={16} className="text-[#47C46A]" />
                     <span className="text-[13px] font-bold text-white uppercase">Empresa: {data.companyName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <CheckCircle2 size={16} className="text-[#47C46A]" />
                     <span className="text-[13px] font-bold text-white uppercase">Especialista em {data.businessType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <CheckCircle2 size={16} className="text-[#47C46A]" />
                     <span className="text-[13px] font-bold text-white uppercase">Cliente cadastrado: {data.firstClient}</span>
                  </div>
               </div>
               <PrimaryButton onClick={next} className="w-full h-16 tracking-[0.3em] font-black uppercase rounded-2xl shadow-[0_16px_40px_rgba(212,169,74,0.3)]">INICIAR OPERAÇÃO</PrimaryButton>
            </div>
          )}

       </div>

    </div>
  );
};
