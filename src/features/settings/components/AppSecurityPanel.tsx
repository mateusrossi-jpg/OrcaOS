import { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports -- TODO: Refactor legacy storage access
import {
  APP_ACCESS_LOCK_CHANGED_EVENT,
  disableAppAccessLock,
  enableAppAccessLock,
  isAppAccessLockEnabled,
  lockCurrentSession,
} from '../storage/appAccessLock';
import { GlassInput } from '../../../ui/system/GlassForms';
import { SurfaceCard } from '../../../ui/system/Cards';
import { SectionLabel, Subtitle } from '../../../ui/system/Typography';
import { Shield, ShieldCheck, Lock, ShieldOff } from 'lucide-react';
import { cn } from '../../../utils/ui';

export function AppSecurityPanel() {
  const [isEnabled, setIsEnabled] = useState(() => isAppAccessLockEnabled());
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    function syncState() { setIsEnabled(isAppAccessLockEnabled()); }
    window.addEventListener(APP_ACCESS_LOCK_CHANGED_EVENT, syncState);
    window.addEventListener('storage', syncState);
    return () => {
      window.removeEventListener(APP_ACCESS_LOCK_CHANGED_EVENT, syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  async function savePin() {
    if (pin !== confirmPin) {
      setFeedback({ type: 'error', msg: 'Os PINs não conferem.' });
      return;
    }
    try {
      await enableAppAccessLock(pin);
      setPin('');
      setConfirmPin('');
      setIsEnabled(true);
      setFeedback({ type: 'success', msg: 'Bloqueio de acesso ativado com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', msg: error instanceof Error ? error.message : 'Falha ao ativar o bloqueio.' });
    }
  }

  function disableLock() {
    disableAppAccessLock();
    setIsEnabled(false);
    setFeedback({ type: 'success', msg: 'Bloqueio de acesso desativado.' });
  }

  function lockNow() {
    lockCurrentSession();
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* STATUS HEADER */}
      <SurfaceCard
        padding="lg"
        className={cn(
          "border shadow-2xl relative overflow-hidden",
          isEnabled
            ? "bg-[#47C46A]/[0.05] border-[#47C46A]/20"
            : "bg-white/[0.02] border-white/[0.07]"
        )}
      >
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none",
          isEnabled ? "bg-[#47C46A]/10" : "bg-white/[0.02]"
        )} />
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl border flex items-center justify-center",
            isEnabled
              ? "bg-[#47C46A]/10 border-[#47C46A]/20 text-[#47C46A]"
              : "bg-white/[0.04] border-white/[0.07] text-white/30"
          )}>
            {isEnabled ? <ShieldCheck size={22} /> : <Shield size={22} />}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[14px] font-black text-white uppercase tracking-tight">
              Bloqueio de Acesso
            </span>
            <Subtitle className={cn(
              "text-[11px] uppercase tracking-widest font-black",
              isEnabled ? "text-[#47C46A]" : "text-white/30"
            )}>
              {isEnabled ? "ATIVO — PIN configurado" : "DESATIVADO — Opcional"}
            </Subtitle>
          </div>
        </div>
        <p className="text-[12px] text-white/30 mt-4 leading-relaxed">
          Proteja o app neste dispositivo com um PIN antes de abrir dados de clientes, atendimentos e orçamentos.
        </p>
      </SurfaceCard>

      {/* PIN CONFIG */}
      <SurfaceCard padding="lg" className="shadow-2xl">
        <SectionLabel className="mb-6 opacity-40 uppercase tracking-[0.25em]">
          {isEnabled ? 'Alterar PIN' : 'Configurar PIN'}
        </SectionLabel>
        <p className="text-[11px] text-white/25 mb-6 leading-relaxed">
          Proteção local contra acesso casual neste dispositivo. Conta e criptografia avançada chegam na fase de backend.
        </p>
        <div className="flex flex-col gap-4 mb-6">
          <GlassInput
            label="Novo PIN"
            inputMode="numeric"
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••"
          />
          <GlassInput
            label="Confirmar PIN"
            inputMode="numeric"
            type="password"
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value)}
            placeholder="••••"
          />
        </div>
        <button
          type="button"
          onClick={savePin}
          className="w-full h-13 bg-[#D4AF37] text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(212,169,74,0.2)] hover:brightness-110 active:scale-[0.98] transition-all"
          style={{ height: '52px' }}
        >
          <Shield size={15} />
          {isEnabled ? 'Salvar Novo PIN' : 'Ativar Bloqueio'}
        </button>
      </SurfaceCard>

      {/* SESSION CONTROL */}
      <SurfaceCard padding="lg" className="shadow-2xl">
        <SectionLabel className="mb-6 opacity-40 uppercase tracking-[0.25em]">Sessão Atual</SectionLabel>
        <p className="text-[11px] text-white/25 mb-6 leading-relaxed">
          Bloqueie o app ao emprestar o aparelho ou ao terminar um atendimento em campo.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!isEnabled}
            onClick={lockNow}
            className="w-full h-12 bg-white/[0.04] border border-white/[0.07] text-white font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Lock size={14} />
            Bloquear Agora
          </button>
          <button
            type="button"
            disabled={!isEnabled}
            onClick={disableLock}
            className="w-full h-12 bg-red-500/[0.08] border border-red-500/20 text-red-400 font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ShieldOff size={14} />
            Desativar Bloqueio
          </button>
        </div>
      </SurfaceCard>

      {/* FEEDBACK */}
      {feedback && (
        <div className={cn(
          "p-4 rounded-2xl text-[12px] font-bold text-center border",
          feedback.type === 'success'
            ? "bg-[#47C46A]/10 border-[#47C46A]/20 text-[#47C46A]"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {feedback.msg}
        </div>
      )}
    </div>
  );
}
