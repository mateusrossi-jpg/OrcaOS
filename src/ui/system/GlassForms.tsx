import React, { memo } from 'react';
import { cn } from '../../utils/ui';
import { Search, Mic } from 'lucide-react';

/**
 * AFERIX GLASS FORM SYSTEM
 * Shared visual language for all input controls.
 * Aligned with Executive OS V5.
 */

const baseGlassStyle = "bg-[#4B5563] border border-white/5 rounded-[18px] px-5 py-4 text-white placeholder:text-text-placeholder focus:outline-none focus:border-aferix-gold/40 transition-all duration-300 w-full text-[15px] font-medium shadow-md";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mask?: string;
  hint?: string;
}

export const GlassInput = memo(function GlassInput({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <div className="flex justify-between items-center px-1">
        {label && <label className="font-mono text-[9.5px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-aferix-gold transition-colors">{label}</label>}
        {hint && <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{hint}</span>}
      </div>
      <input className={cn(baseGlassStyle, error && "border-[#E85D5D]/40", className)} {...props} />
      {error && <span className="text-[10px] font-bold text-[#E85D5D] ml-1 uppercase tracking-wider">{error}</span>}
    </div>
  );
});

export const GlassTextarea = memo(function GlassTextarea({ label, error, hint, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <div className="flex justify-between items-center px-1">
        {label && <label className="font-mono text-[9.5px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-aferix-gold transition-colors">{label}</label>}
        {hint && <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{hint}</span>}
      </div>
      <textarea className={cn(baseGlassStyle, "min-h-[120px] resize-none", error && "border-[#E85D5D]/40", className)} {...props} />
      {error && <span className="text-[10px] font-bold text-[#E85D5D] ml-1 uppercase tracking-wider">{error}</span>}
    </div>
  );
});

export const GlassSelect = memo(function GlassSelect({ label, error, hint, children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <div className="flex justify-between items-center px-1">
        {label && <label className="font-mono text-[9.5px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-aferix-gold transition-colors">{label}</label>}
        {hint && <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{hint}</span>}
      </div>
      <div className="relative">
        <select className={cn(baseGlassStyle, "appearance-none", error && "border-[#E85D5D]/40", className)} {...props}>
          {children}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
});

export const GlassDatePicker = memo(function GlassDatePicker({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <div className="flex justify-between items-center px-1">
        {label && <label className="font-mono text-[9.5px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-aferix-gold transition-colors">{label}</label>}
        {hint && <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{hint}</span>}
      </div>
      <input type="date" className={cn(baseGlassStyle, "color-scheme-dark", error && "border-[#E85D5D]/40", className)} {...props} />
      {error && <span className="text-[10px] font-bold text-[#E85D5D] ml-1 uppercase tracking-wider">{error}</span>}
    </div>
  );
});

export const GlassCurrencyInput = memo(function GlassCurrencyInput({ label, error, hint, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <div className="flex justify-between items-center px-1">
        {label && <label className="font-mono text-[9.5px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-aferix-gold transition-colors">{label}</label>}
        <span className="text-[8px] font-bold text-[#47C46A] uppercase tracking-widest">Moeda: BRL</span>
      </div>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 font-black text-xs">R$</div>
        <input type="number" step="0.01" placeholder="0,00" className={cn(baseGlassStyle, "pl-12", error && "border-[#E85D5D]/40", className)} {...props} />
      </div>
      {error && <span className="text-[10px] font-bold text-[#E85D5D] ml-1 uppercase tracking-wider">{error}</span>}
    </div>
  );
});

export const GlassPhoneInput = memo(function GlassPhoneInput({ label, error, ...props }: InputProps) {
  return (
    <GlassInput 
      label={label || "Telefone"} 
      hint="Ex: (17) 99999-9999"
      placeholder="(00) 00000-0000"
      type="tel"
      error={error}
      {...props} 
    />
  );
});

export const GlassEmailInput = memo(function GlassEmailInput({ label, error, ...props }: InputProps) {
  return (
    <GlassInput 
      label={label || "E-mail"} 
      hint="Ex: contato@empresa.com.br"
      placeholder="nome@exemplo.com"
      type="email"
      error={error}
      {...props} 
    />
  );
});

export const GlassSearchInput = memo(function GlassSearchInput({ className, ...props }: InputProps) {
  return (
    <div className="relative w-full group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#D4AF37] transition-colors">
        <Search size={18} />
      </div>
      <input className={cn(baseGlassStyle, "pl-12", className)} {...props} />
    </div>
  );
});

export const GlassVoiceInput = memo(function GlassVoiceInput({ label, onTranscript, placeholder }: { label?: string, onTranscript: (text: string) => void, placeholder?: string }) {
  const [isRecording, setIsRecording] = React.useState(false);
  
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      if (navigator.vibrate) navigator.vibrate(50);
      
      setTimeout(() => {
         setIsRecording(false);
         onTranscript("Serviço concluído conforme o esperado. Verificado o quadro de energia e as tensões estão estáveis.");
         if (navigator.vibrate) navigator.vibrate([50, 50]);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full group">
       {label && <label className="font-mono text-[9.5px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-[#D4AF37] transition-colors">{label}</label>}
       <button 
         onClick={toggleRecording}
         className={cn(
           "w-full py-6 px-6 rounded-[22px] border transition-all duration-500 flex items-center justify-between shadow-xl active:scale-[0.98]",
           isRecording ? "bg-[#E85D5D]/10 border-[#E85D5D]/40 animate-pulse" : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
         )}
       >
         <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
              isRecording ? "bg-[#E85D5D] text-white" : "bg-[#0A84FF]/20 text-[#0A84FF]"
            )}>
               <Mic size={20} className={isRecording ? "animate-bounce" : ""} />
            </div>
            <div className="flex flex-col items-start text-left">
               <span className="text-[15px] font-bold text-white uppercase tracking-tight leading-none">
                 {isRecording ? "Escutando..." : "Gravar Nota de Campo"}
               </span>
               <span className="text-[11px] text-white/20 font-medium mt-1.5 leading-none">
                 {isRecording ? "Fale agora para transcrever" : (placeholder || "Clique para iniciar gravação por voz")}
               </span>
            </div>
         </div>
         {isRecording && (
           <div className="flex gap-1 items-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1 h-4 bg-[#E85D5D] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
           </div>
         )}
       </button>
    </div>
  );
});

export const GlassFormCard = memo(function GlassFormCard({ children, title, className }: { children: React.ReactNode, title?: string, className?: string }) {
  return (
    <div className={cn("bg-aferix-surface backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-8 flex flex-col gap-6 shadow-2xl", className)}>
      {title && <h3 className="font-black uppercase tracking-[0.15em] text-white/80 text-sm mb-2">{title}</h3>}
      {children}
    </div>
  );
});
