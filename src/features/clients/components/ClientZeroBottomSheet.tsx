/**
 * ClientZeroBottomSheet
 * 
 * AFERIX V5 — CLIENT ZERO SPRINT
 * 
 * Ultra-fast client creation with:
 * - Name + Phone only (mandatory)
 * - Real-time duplicate detection while typing phone
 * - Smart Client Card after save
 * - Progressive profile: all other fields are optional
 * 
 * Target: New client ≤ 10 seconds, ≤ 2 fields, ≤ 5 touches.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { UserPlus, PhoneCall, CheckCircle2, Clock, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';
import { clientService } from '../../../services/clientService';
import { operationalReadModelService } from '../../../services/operationalReadModelService';
import { trustLayer } from '../../../core/trust/TrustLayer';
import { Client } from '../../../domain/client';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { cn } from '../../../utils/ui';

export interface ClientZeroResult {
  clientId: string;
  clientName: string;
  phone: string;
  isExisting: boolean;
}

interface ClientZeroBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onClientSelected: (result: ClientZeroResult) => void;
  /** Optional: Pre-fill name */
  initialName?: string;
}

interface DuplicateMatch {
  client: Client;
  crmData: {
    totalWorkOrders: number;
    totalRevenue: number;
    lastInteractionAt?: string;
  } | null;
}

export function ClientZeroBottomSheet({
  isOpen,
  onClose,
  onClientSelected,
  initialName = '',
}: ClientZeroBottomSheetProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicateMatch | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [savedClient, setSavedClient] = useState<ClientZeroResult | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPhone('');
      setDuplicateMatch(null);
      setSavedClient(null);
      setIsSaving(false);
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [isOpen, initialName]);

  // Real-time duplicate detection as user types phone
  const detectDuplicate = useCallback(async (phoneValue: string) => {
    if (phoneValue.replace(/\D/g, '').length < 6) {
      setDuplicateMatch(null);
      return;
    }

    setIsSearching(true);
    try {
      const allClients = await clientService.getAll();
      const normalizedPhone = phoneValue.replace(/\D/g, '');
      
      const match = allClients.find(c => {
        const clientPhone = (c.phone || '').replace(/\D/g, '');
        return clientPhone.length >= 6 && clientPhone.includes(normalizedPhone);
      });

      if (match) {
        // Load CRM data for context
        const crmList = await operationalReadModelService.getCRMProjection();
        const crmData = crmList.find(c => c.clientId === match.id);
        setDuplicateMatch({
          client: match,
          crmData: crmData ? {
            totalWorkOrders: crmData.totalWorkOrders || 0,
            totalRevenue: crmData.totalRevenue || 0,
            lastInteractionAt: crmData.lastInteractionAt || undefined,
          } : null,
        });
      } else {
        setDuplicateMatch(null);
      }
    } catch (e) {
      console.error('Client duplicate detection failed:', e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced phone lookup
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => detectDuplicate(phone), 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [phone, detectDuplicate]);

  const handleUseExisting = () => {
    if (!duplicateMatch) return;
    const result: ClientZeroResult = {
      clientId: duplicateMatch.client.id,
      clientName: duplicateMatch.client.name,
      phone: duplicateMatch.client.phone || phone,
      isExisting: true,
    };
    setSavedClient(result);
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => {
      onClientSelected(result);
      onClose();
    }, 900);
  };

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const newClient = await clientService.add({
        name: name.trim(),
        phone: phone.trim() || undefined,
      } as any);

      const result: ClientZeroResult = {
        clientId: newClient.id,
        clientName: newClient.name,
        phone: phone.trim(),
        isExisting: false,
      };

      setSavedClient(result);
      if (navigator.vibrate) navigator.vibrate([50, 30, 80]);

      trustLayer.emit({
        type: 'success',
        title: `${name.trim()} cadastrado!`,
        description: 'Pronto para iniciar o atendimento.',
        status: 'local',
      });

      setTimeout(() => {
        onClientSelected(result);
        onClose();
      }, 900);
    } catch (e) {
      console.error('Client Zero save failed:', e);
      trustLayer.emit({ type: 'error', title: 'Erro ao cadastrar cliente', status: 'local' });
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = name.trim().length >= 2;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0c0f16] border-t border-white/10 rounded-t-[28px] p-6 flex flex-col gap-5 max-w-md mx-auto w-full animate-slide-up pb-[calc(env(safe-area-inset-bottom)+24px)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/15 flex items-center justify-center">
              <UserPlus size={15} className="text-[var(--accent-gold)]" />
            </div>
            <div>
              <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase block">
                Novo Cliente
              </span>
              <span className="text-[9px] text-text-tertiary font-mono tracking-widest">
                Nome + Telefone → Pronto
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white font-bold text-[10px] uppercase tracking-widest min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            Fechar
          </button>
        </div>

        {/* SUCCESS STATE */}
        {savedClient && (
          <div className="flex flex-col items-center justify-center py-6 gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center shadow-[var(--glow-green)] animate-bounce">
              <CheckCircle2 size={36} className="text-[var(--accent-green)]" strokeWidth={2.5} />
            </div>
            <h3 className="text-[16px] font-black text-white uppercase tracking-widest text-center">
              {savedClient.isExisting ? 'Cliente Selecionado!' : 'Cliente Cadastrado!'}
            </h3>
            <p className="text-[12px] text-text-secondary font-medium text-center">
              {savedClient.clientName}
            </p>
          </div>
        )}

        {/* FORM */}
        {!savedClient && (
          <>
            {/* Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black tracking-[0.2em] text-text-tertiary uppercase">
                Nome <span className="text-[var(--accent-gold)]">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && isValid) handleSave(); }}
                placeholder="Ex: João da Silva"
                autoCapitalize="words"
                className="w-full h-[54px] px-4 rounded-[14px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-semibold placeholder:text-white/20 focus:outline-none focus:border-[var(--accent-gold)]/60 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Phone Field with Duplicate Detector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black tracking-[0.2em] text-text-tertiary uppercase flex items-center gap-1.5">
                <PhoneCall size={9} className="text-text-muted" />
                Telefone / WhatsApp
                {isSearching && <span className="text-[var(--accent-gold)] animate-pulse">Buscando...</span>}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && isValid) handleSave(); }}
                placeholder="(00) 00000-0000"
                className="w-full h-[54px] px-4 rounded-[14px] bg-white/[0.04] border border-white/[0.08] text-white text-[15px] font-semibold placeholder:text-white/20 focus:outline-none focus:border-[var(--accent-gold)]/60 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* DUPLICATE DETECTED BANNER — FASE 3 */}
            {duplicateMatch && (
              <div className="flex flex-col gap-3 p-4 rounded-[16px] bg-amber-500/10 border border-amber-500/30 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-400 shrink-0" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-amber-400 uppercase">
                    CLIENTE JÁ EXISTENTE
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <p className="text-[14px] font-black text-white leading-tight">
                    {duplicateMatch.client.name}
                  </p>
                  {duplicateMatch.client.phone && (
                    <p className="text-[11px] text-text-secondary font-mono">
                      {duplicateMatch.client.phone}
                    </p>
                  )}
                </div>

                {duplicateMatch.crmData && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] text-text-muted font-mono uppercase tracking-widest">Atendimentos</span>
                      <span className="text-[13px] font-black text-white">{duplicateMatch.crmData.totalWorkOrders}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] text-text-muted font-mono uppercase tracking-widest">Faturamento</span>
                      <span className="text-[12px] font-black text-[var(--accent-green)]">
                        {formatCurrencyBRL(duplicateMatch.crmData.totalRevenue)}
                      </span>
                    </div>
                    {duplicateMatch.crmData.lastInteractionAt && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-text-muted font-mono uppercase tracking-widest">Última Interação</span>
                        <span className="text-[11px] font-bold text-white/80">
                          {new Date(duplicateMatch.crmData.lastInteractionAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleUseExisting}
                  className="w-full h-[50px] rounded-[14px] bg-[var(--accent-gold)] text-black font-black tracking-widest text-[11px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[var(--glow-gold)]"
                >
                  <ArrowRight size={14} strokeWidth={3} />
                  CONTINUAR COM ESTE CLIENTE
                </button>
              </div>
            )}

            {/* Progressive Profile Note */}
            {!duplicateMatch && (
              <p className="text-[9.5px] text-text-muted font-medium text-center leading-relaxed">
                Endereço, CPF, e-mail e demais dados podem ser adicionados depois.
                <br />
                <span className="text-text-tertiary/60">Perfil progressivo ativo.</span>
              </p>
            )}

            {/* SAVE BUTTON */}
            {!duplicateMatch && (
              <button
                onClick={handleSave}
                disabled={!isValid || isSaving}
                className={cn(
                  "w-full h-[56px] rounded-[16px] font-black tracking-widest text-[12px] uppercase flex items-center justify-center gap-2 transition-all",
                  isValid && !isSaving
                    ? "bg-[var(--accent-gold)] text-black shadow-[var(--glow-gold)] active:scale-95"
                    : "bg-white/[0.05] text-white/20 cursor-not-allowed border border-white/[0.06]"
                )}
              >
                {isSaving ? (
                  <span className="animate-pulse">CADASTRANDO...</span>
                ) : (
                  <>
                    <UserPlus size={14} strokeWidth={3} />
                    CADASTRAR CLIENTE
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
