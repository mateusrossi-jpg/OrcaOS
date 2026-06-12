import { generateUUID } from '../core/utils/idGenerator';
import { pilotTelemetry } from '../services/pilotTelemetryService';
import React, { useState, useEffect, useRef } from 'react';
import { ScreenContainer, AppHeader, Section, SectionLabel } from '../ui/system';
import { SurfaceCard } from '../ui/system/Cards';
import { GlassInput, GlassSelect } from '../ui/system/GlassForms';
import { clientService } from '../services/clientService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { useClients } from '../hooks/useClients';
import { siteService } from '../services/siteService';
import { Site } from '../domain/site';
import { trustLayer } from '../core/trust/TrustLayer';
import { ClientZeroBottomSheet, ClientZeroResult } from '../features/clients/components/ClientZeroBottomSheet';
import { UserPlus, ChevronRight, History, Zap, CheckCircle2 } from 'lucide-react';
import { clientMemoryEngine, ClientMemory } from '../services/ClientMemoryEngine';
import { formatCurrencyBRL } from '../utils/formatters';
import { cn } from '../utils/ui';

export function QuickServiceForm({ onBack }: { onBack: () => void }) {

  const { clients } = useClients();
  const [clientSites, setClientSites] = useState<Site[]>([]);
  const [isClientZeroOpen, setIsClientZeroOpen] = useState(false);
  const [clientMemory, setClientMemory] = useState<ClientMemory | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    siteId: '',
    siteName: '',
    address: '',
    serviceDescription: '',
    chargedValue: 0,
    isReceived: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // PILOT TELEMETRY (FASE 4)
  const completeFlowRef = useRef<((abandoned?: boolean) => void) | null>(null);

  useEffect(() => {
    const endTrack = pilotTelemetry.trackScreen('QuickServiceForm');
    completeFlowRef.current = pilotTelemetry.startFlow('quick_service');

    return () => {
      endTrack();
      if (completeFlowRef.current) {
        completeFlowRef.current(true);
      }
    };
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applySuggestion = (s: any) => {
    updateField('serviceDescription', s.title);
    updateField('chargedValue', s.avgPrice || 0);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      let finalClientId = formData.clientId;
      if (!finalClientId && formData.clientName) {
        const newClient = await clientService.add({
          name: formData.clientName,
          phone: '',
          notes: 'Cadastrado automaticamente via Atendimento Rápido',
        });
        finalClientId = newClient.id;
      }

      if (!finalClientId) throw new Error("Cliente é obrigatório");

      let finalSiteId = formData.siteId;
      if (finalClientId && !finalSiteId) {
        const sites = await siteService.getByClientId(finalClientId);
        if (sites.length > 0) {
          finalSiteId = sites[0].id;
        } else {
          const newSite = await siteService.add({
            clientId: finalClientId,
            name: 'Local Principal',
            fullAddress: formData.address || 'Endereço não informado',
            isMain: true,
          });
          finalSiteId = newSite.id;
        }
      }

      const attendanceId = await operationalFacade.initializeAttendance(finalClientId, finalSiteId || 'default-site');

      const budgetId = generateUUID();
      const numericValue = formData.chargedValue;

      const budget: Budget = {
        id: budgetId,
        title: formData.serviceDescription || 'Atendimento Rápido',
        clientId: finalClientId,
        siteId: finalSiteId || 'default-site',
        status: BUDGET_STATUS.INICIADO,
        chargedValue: numericValue,
        materialCost: 0,
        travelCost: 0,
        helperCost: 0,
        fees: 0,
        discounts: 0,
        otherCosts: 0,
        items: [
          {
            id: `item-${Date.now()}`,
            description: formData.serviceDescription || 'Mão de Obra',
            quantity: 1,
            unitPrice: numericValue,
            category: 'labor',
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await operationalFacade.saveBudget(budget);
      await operationalFacade.finalizeBudget(budgetId);

      const { workOrderService } = await import('../services/workOrderService');
      const newOsId = generateUUID();

      const newWorkOrder = {
        id: newOsId,
        budgetId: budget.id,
        clientId: budget.clientId,
        siteId: budget.siteId,
        title: budget.title,
        status: 'in-progress' as const,
        scheduledDate: new Date().toISOString().split('T')[0],
        originalValue: budget.chargedValue,
        executedValue: budget.chargedValue,
        attendanceId: attendanceId,
      };
      await operationalFacade.createWorkOrder(newWorkOrder as any);

      await operationalFacade.completeWorkOrder(
        newOsId,
        numericValue,
        formData.isReceived ? numericValue : 0,
        "Finalizado via Atendimento Rápido"
      );

      trustLayer.emit({
        type: 'success',
        title: 'Atendimento Rápido Salvo',
        description: `OS e Financeiro gerados para ${formData.serviceDescription}.`,
        status: 'synced'
      });

      if (completeFlowRef.current) {
        completeFlowRef.current(false);
        completeFlowRef.current = null;
      }
      pilotTelemetry.trackAction('QuickServiceForm', 'finish_quick_service');

      onBack();
      } catch (error) {
      pilotTelemetry.trackError('QuickServiceForm', 'SAVE_FAILED', (error as Error).message);
      trustLayer.emit({ type: 'error', title: 'Erro ao salvar', description: (error as Error).message, status: 'local' });
      } finally {
      setIsSaving(false);
      }
      };

  const isFormValid = (formData.clientId || formData.clientName) && formData.serviceDescription && formData.chargedValue >= 0;

  return (
    <ScreenContainer className={`pb-32 bg-[#434B57] pt-0 px-0 relative overflow-x-hidden ${isSaving ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Atmospheric glows */}
      <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[40%] bg-gradient-to-b from-[var(--accent-gold)]/5 to-transparent pointer-events-none blur-[100px] z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[30%] bg-[#3B82F6]/5 pointer-events-none blur-[80px] z-0" />

      <div className="relative z-10">
        <AppHeader 
          title="Atendimento Rápido." 
          subtitle="Finalização em um único passo." 
          onBack={onBack}
          className="bg-gradient-to-b from-[#4A5360] to-[#434B57]"
        />

        <div className="flex flex-col gap-5 px-6 mt-4 max-w-md mx-auto w-full">

          {/* CLIENT SECTION */}
          <SurfaceCard padding="lg" className="!bg-[#383F48] border-white/5 shadow-[var(--shadow-card)]">
            <SectionLabel className="mb-5 opacity-40 uppercase tracking-[0.25em]">Cliente</SectionLabel>

            {!formData.clientId ? (
              <button
                type="button"
                onClick={() => setIsClientZeroOpen(true)}
                className="w-full h-14 rounded-2xl border border-dashed border-white/[0.05] bg-[#4B5563] hover:bg-[#505B69] hover:border-[var(--accent-gold)]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-inner"
              >
                <UserPlus size={16} className="text-[var(--accent-gold)]" strokeWidth={2} />
                <span className="text-[12px] font-black tracking-widest uppercase text-white/50">
                  Selecionar / Criar Cliente
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsClientZeroOpen(true)}
                className="w-full h-14 rounded-2xl border border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/[0.05] flex items-center justify-between px-5 active:scale-[0.98] transition-all"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[9px] font-black tracking-[0.2em] text-[var(--accent-gold)] uppercase">Cliente Selecionado</span>
                  <span className="text-[14px] font-black text-white leading-tight">{formData.clientName}</span>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </button>
            )}

            {formData.clientId && clientSites.length > 0 && (
              <div className="mt-4">
                <GlassSelect
                  label="Local (Site) — Opcional"
                  value={formData.siteId}
                  onChange={e => updateField('siteId', e.target.value)}
                  className="bg-[#4B5563]"
                >
                  <option value="">+ Cadastrar Novo Endereço</option>
                  {clientSites.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.fullAddress}</option>
                  ))}
                </GlassSelect>
              </div>
            )}

            {!formData.siteId && (
              <div className="mt-4">
                <GlassInput
                  label="Endereço do Serviço (Opcional)"
                  value={formData.address}
                  onChange={e => updateField('address', e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                  className="bg-[#4B5563]"
                />
              </div>
            )}
          </SurfaceCard>

          {/* SUGGESTIONS FROM MEMORY */}
          {clientMemory && clientMemory.frequentServices.length > 0 && (
            <Section className="gap-3 animate-in fade-in slide-in-from-bottom-2">
              <SectionLabel className="opacity-30 uppercase tracking-[0.2em] text-[9px]">
                Sugestões baseadas no histórico
              </SectionLabel>
              <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {clientMemory.frequentServices.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => applySuggestion(s)}
                    className="flex-none h-13 px-4 py-3 rounded-xl bg-[#444D58] border border-white/5 hover:bg-[#4B5563] flex items-center gap-3 active:scale-95 transition-all shadow-sm"
                    style={{ height: '52px' }}
                  >
                    <History size={14} className="text-[var(--accent-gold)] shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] font-black text-white/90 uppercase whitespace-nowrap">{s.title}</span>
                      <span className="text-[9px] font-mono font-bold text-[var(--accent-gold)]">{formatCurrencyBRL(s.avgPrice)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* SERVICE DETAILS */}
          <SurfaceCard padding="lg" className="!bg-[#383F48] border-white/5 shadow-[var(--shadow-card)]">
            <SectionLabel className="mb-5 opacity-40 uppercase tracking-[0.25em]">Detalhes do Serviço</SectionLabel>
            <div className="flex flex-col gap-5">
              <GlassInput
                label="O que foi feito?"
                value={formData.serviceDescription}
                onChange={e => updateField('serviceDescription', e.target.value)}
                placeholder="Ex: Troca de Disjuntor Geral"
                className="bg-[#4B5563]"
              />

              {/* Monetary input */}
              <div className="flex flex-col gap-2 w-full group">
                <div className="flex justify-between items-center px-1">
                  <label className="font-mono text-[9.5px] font-black uppercase tracking-[0.2em] text-white/30 group-focus-within:text-[#D4AF37] transition-colors">
                    Valor Cobrado
                  </label>
                  <span className="text-[8px] font-bold text-[#47C46A] uppercase tracking-widest">Moeda: BRL</span>
                </div>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 font-black text-xs pointer-events-none z-10">R$</div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.chargedValue || ''}
                    onChange={e => updateField('chargedValue', parseFloat(e.target.value) || 0)}
                    className="bg-[#4B5563] border border-white/[0.05] rounded-[18px] pl-12 pr-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/40 focus:bg-[#505B69] transition-all duration-300 w-full text-[22px] font-black text-[#47C46A] shadow-inner"
                  />
                </div>
              </div>
            </div>
          </SurfaceCard>

          {/* PAYMENT TOGGLE */}
          <SurfaceCard padding="lg" className="!bg-[#383F48] border-white/5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <SectionLabel className="mb-1 opacity-40 uppercase tracking-[0.25em]">Pagamento Recebido?</SectionLabel>
                <p className="text-[11px] text-white/25 leading-snug">Marcar como pago no financeiro imediatamente</p>
              </div>
              <button
                onClick={() => updateField('isReceived', !formData.isReceived)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-all duration-300 shrink-0 border",
                  formData.isReceived
                    ? "bg-[#47C46A] border-[#47C46A] shadow-[0_0_12px_rgba(71,196,106,0.4)]"
                    : "bg-[#4B5563] border-white/10 shadow-inner"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
                  formData.isReceived ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </SurfaceCard>

          {/* SUBMIT */}
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className={cn(
              "w-full h-16 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl mt-2 mb-8",
              isFormValid
                ? "bg-[#D4AF37] text-[#16181C] shadow-[0_8px_32px_rgba(212,169,74,0.3)] hover:brightness-110"
                : "bg-white/[0.03] border border-white/[0.07] text-white/20 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <span className="animate-pulse">SALVANDO...</span>
            ) : (
              <>
                <Zap size={18} className={isFormValid ? "fill-[#16181C]" : "fill-current"} />
                FINALIZAR OPERAÇÃO
              </>
            )}
          </button>
        </div>
      </div>

      <ClientZeroBottomSheet
        isOpen={isClientZeroOpen}
        onClose={() => setIsClientZeroOpen(false)}
        onClientSelected={async (result: ClientZeroResult) => {
          updateField('clientId', result.clientId);
          updateField('clientName', result.clientName);

          try {
            const [sites, memory] = await Promise.all([
              siteService.getByClientId(result.clientId),
              clientMemoryEngine.getClientMemory(result.clientId)
            ]);

            setClientSites(sites);
            setClientMemory(memory);
            if (sites.length === 1) updateField('siteId', sites[0].id);

            if (memory.lastServiceTitle) {
              updateField('serviceDescription', memory.lastServiceTitle);
              updateField('chargedValue', memory.lastExecutedValue || 0);
            }
          } catch (err) {
            console.error('Failed to load client context:', err);
          }

          setIsClientZeroOpen(false);
        }}
      />
    </ScreenContainer>
  );
};
