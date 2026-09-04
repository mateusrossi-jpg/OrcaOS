import { generateUUID } from '../core/utils/idGenerator';
import { pilotTelemetry } from '../services/pilotTelemetryService';
import React, { useState, useEffect, useRef } from 'react';
import { AppHeader } from '../ui/system';
import { AferixV12Tokens } from '../ui/system/v12Tokens';
import { 
  GroupedSection, 
  PrimaryPillButton, 
  SecondaryActionButton 
} from '../ui/system/v12Components';
import { clientService } from '../services/clientService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { useClients } from '../hooks/useClients';
import { siteService } from '../services/siteService';
import { Site } from '../domain/site';
import { trustLayer } from '../core/trust/TrustLayer';
import { ClientZeroBottomSheet, ClientZeroResult } from '../features/clients/components/ClientZeroBottomSheet';
import { UserPlus, ChevronRight, History, Zap } from 'lucide-react';
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
    <div className={cn(AferixV12Tokens.layout.pageContainer, "px-4 pt-4 relative overflow-x-hidden", isSaving && "opacity-60 pointer-events-none")}>
      <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
        <AppHeader 
          title="Atendimento Rápido" 
          subtitle="Finalização em um único passo" 
          onBack={onBack}
          standalone
        />

        {/* 1. CLIENT SECTION */}
        <GroupedSection headerTitle="Cliente">
          <div className="p-5 flex flex-col gap-4">
            {!formData.clientId ? (
              <SecondaryActionButton
                icon={UserPlus}
                onClick={() => setIsClientZeroOpen(true)}
                className="w-full h-14 border border-dashed border-white/10"
              >
                Selecionar / Criar Cliente
              </SecondaryActionButton>
            ) : (
              <button
                type="button"
                onClick={() => setIsClientZeroOpen(true)}
                className="w-full h-14 rounded-[14px] border border-[#FFD60A]/20 bg-[#FFD60A]/5 flex items-center justify-between px-4 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <span className="text-[9px] font-bold tracking-wider text-[#FFD60A] uppercase">Cliente Selecionado</span>
                  <span className="text-[14px] font-bold text-white leading-tight truncate">{formData.clientName}</span>
                </div>
                <ChevronRight size={16} className="text-[#8E8E93]" />
              </button>
            )}

            {formData.clientId && clientSites.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">Local (Site) — Opcional</label>
                <select
                  value={formData.siteId}
                  onChange={e => updateField('siteId', e.target.value)}
                  className="w-full h-12 bg-[#3A3A3C] border border-white/10 rounded-[14px] px-4 text-white text-[14px] focus:outline-none focus:border-white/20 transition-all"
                >
                  <option value="">+ Cadastrar Novo Endereço</option>
                  {clientSites.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.fullAddress}</option>
                  ))}
                </select>
              </div>
            )}

            {!formData.siteId && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">Endereço do Serviço (Opcional)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => updateField('address', e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                  className="w-full h-12 bg-[#3A3A3C] border border-white/10 rounded-[14px] px-4 text-white text-[14px] placeholder:text-[#8E8E93] focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            )}
          </div>
        </GroupedSection>

        {/* 2. SUGGESTIONS FROM MEMORY */}
        {clientMemory && clientMemory.frequentServices.length > 0 && (
          <GroupedSection headerTitle="Sugestões do Histórico">
            <div className="p-4 flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {clientMemory.frequentServices.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => applySuggestion(s)}
                  className="flex-none h-12 px-3.5 rounded-[12px] bg-[#3A3A3C] border border-white/5 hover:border-white/20 flex items-center gap-2.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <History size={13} className="text-[#FFD60A] shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[11px] font-bold text-white uppercase whitespace-nowrap truncate max-w-[140px]">{s.title}</span>
                    <span className="text-[10px] font-mono font-bold text-[#30D158]">{formatCurrencyBRL(s.avgPrice)}</span>
                  </div>
                </button>
              ))}
            </div>
          </GroupedSection>
        )}

        {/* 3. SERVICE DETAILS */}
        <GroupedSection headerTitle="Detalhes do Serviço">
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">O que foi feito?</label>
              <input
                type="text"
                value={formData.serviceDescription}
                onChange={e => updateField('serviceDescription', e.target.value)}
                placeholder="Ex: Troca de Disjuntor Geral"
                className="w-full h-12 bg-[#3A3A3C] border border-white/10 rounded-[14px] px-4 text-white text-[14px] placeholder:text-[#8E8E93] focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            {/* Monetary input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                  Valor Cobrado (R$)
                </label>
                <span className="text-[9px] font-bold text-[#30D158] uppercase">BRL</span>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] font-bold text-[14px] pointer-events-none">R$</div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.chargedValue || ''}
                  onChange={e => updateField('chargedValue', parseFloat(e.target.value) || 0)}
                  className="w-full h-14 bg-[#3A3A3C] border border-white/10 rounded-[14px] pl-11 pr-4 text-[22px] font-mono font-black text-[#30D158] focus:outline-none focus:border-white/20 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>
        </GroupedSection>

        {/* 4. PAYMENT TOGGLE */}
        <GroupedSection headerTitle="Status de Pagamento">
          <div className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-white">Pagamento já recebido?</span>
              <span className="text-[11px] text-[#8E8E93]">Registra recebimento imediato no caixa</span>
            </div>
            <button
              type="button"
              onClick={() => updateField('isReceived', !formData.isReceived)}
              className={cn(
                "relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 border flex items-center p-0.5 cursor-pointer",
                formData.isReceived
                  ? "bg-[#30D158] border-[#30D158]"
                  : "bg-[#3A3A3C] border-white/10"
              )}
              aria-label="Alternar pagamento recebido"
            >
              <div className={cn(
                "w-5 h-5 rounded-full transition-all shadow-md",
                formData.isReceived ? "bg-[#050505] translate-x-5" : "bg-[#8E8E93] translate-x-0"
              )} />
            </button>
          </div>
        </GroupedSection>

        {/* 5. SUBMIT BUTTON */}
        <div className="pt-2">
          <PrimaryPillButton
            icon={Zap}
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            loading={isSaving}
          >
            FINALIZAR OPERAÇÃO
          </PrimaryPillButton>
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
    </div>
  );
}
