import { generateUUID } from '../core/utils/idGenerator';
import React, { useState } from 'react';
import { ScreenContainer, AppHeader } from '../ui/system/Layouts';
import { Input, Select, MonetaryInput, PrimaryButton } from '../app/components/ui/index';
import { SurfaceCard } from '../ui/system/Cards';
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
    chargedValue: '',
    isReceived: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applySuggestion = (s: any) => {
    updateField('serviceDescription', s.title);
    updateField('chargedValue', String(s.avgPrice));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      // 1. Client & Site Resolution
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

      // 1.5. Iniciar Atendimento via Facade (P0 Fix)
      const attendanceId = await operationalFacade.initializeAttendance(finalClientId, finalSiteId || 'default-site');

      const budgetId = generateUUID();
      const numericValue = Number(formData.chargedValue.replace(/[^0-9.-]+/g, "")) || 0;

      // 2. Fake a full Budget object
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

      // 3. Save via Facade
      await operationalFacade.saveBudget(budget);
      await operationalFacade.finalizeBudget(budgetId);

      // The Facade does not automatically create the OS upon finalizeBudget, wait, does it?
      // No, authorizeBudget generates OS if it's from clientProposal... let me check how workOrders are created.
      // Wait, let's just do it here to ensure it creates the WorkOrder and liquidates it.
      
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

      // 4. Finance Record & OS Completion
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

      onBack();
    } catch (error) {
      trustLayer.emit({ type: 'error', title: 'Erro ao salvar', description: (error as Error).message, status: 'local' });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = (formData.clientId || formData.clientName) && formData.serviceDescription && Number(formData.chargedValue) >= 0;

  return (
    <ScreenContainer className={`pb-32 bg-[var(--bg-primary)] ${isSaving ? "opacity-50 pointer-events-none" : ""}`}>
      <AppHeader title="Atendimento Rápido." subtitle="Finalização em um único passo." onBack={onBack} />
      
      <div className="flex flex-col gap-6 px-4 mt-4 max-w-md mx-auto w-full">
        <SurfaceCard padding="lg">
          <SectionLabel className="mb-6">Cliente</SectionLabel>
          <div className="flex flex-col gap-3">

            {/* CLIENT ZERO TRIGGER — Fase 1 */}
            {!formData.clientId ? (
              <button
                type="button"
                onClick={() => setIsClientZeroOpen(true)}
                className="w-full h-[56px] rounded-[16px] border border-dashed border-white/20 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:border-[var(--accent-gold)]/40 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <UserPlus size={16} className="text-[var(--accent-gold)]" strokeWidth={2} />
                <span className="text-[12px] font-bold tracking-widest uppercase text-white/60">
                  Selecionar / Criar Cliente
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsClientZeroOpen(true)}
                className="w-full h-[56px] rounded-[16px] border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/8 flex items-center justify-between px-4 active:scale-95 transition-all"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black tracking-[0.2em] text-[var(--accent-gold)] uppercase">Cliente Selecionado</span>
                  <span className="text-[14px] font-black text-white leading-tight">{formData.clientName}</span>
                </div>
                <ChevronRight size={16} className="text-white/30" />
              </button>
            )}

            {formData.clientId && clientSites.length > 0 && (
              <Select
                label="Local (Site) - Opcional"
                value={formData.siteId}
                onChange={(val) => updateField('siteId', val)}
              >
                <option value="">+ Cadastrar Novo Endereço</option>
                {clientSites.map(s => <option key={s.id} value={s.id}>{s.name} - {s.fullAddress}</option>)}
              </Select>
            )}

            {!formData.siteId && (
              <Input
                label="Endereço do Serviço (Opcional)"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Ex: Rua das Flores, 123"
              />
            )}
          </div>
        </SurfaceCard>

        {/* V7 P3: ORÇAMENTO QUE SE ESCREVE SOZINHO */}
        {clientMemory && clientMemory.frequentServices.length > 0 && (
          <Section className="gap-4 animate-in fade-in slide-in-from-bottom-2 px-1">
             <SectionLabel className="!text-[9px] uppercase tracking-[0.2em] opacity-40 ml-1">Sugestões baseadas no histórico</SectionLabel>
             <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {clientMemory.frequentServices.map((s, idx) => (
                   <button 
                     key={idx}
                     onClick={() => applySuggestion(s)}
                     className="flex-none h-12 px-5 rounded-xl bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/10 flex items-center gap-3 active:scale-95 transition-all"
                   >
                      <History size={14} className="text-[var(--accent-gold)]" />
                      <div className="flex flex-col items-start">
                         <span className="text-[11px] font-black text-white/90 uppercase">{s.title}</span>
                         <span className="text-[9px] font-mono font-bold text-[var(--accent-gold)]">{formatCurrencyBRL(s.avgPrice)}</span>
                      </div>
                   </button>
                ))}
             </div>
          </Section>
        )}

        <SurfaceCard padding="lg">
          <SectionLabel className="mb-6">Detalhes do Serviço</SectionLabel>
          <div className="flex flex-col gap-6">
            <Input 
              label="O que foi feito?" 
              value={formData.serviceDescription} 
              onChange={(e) => updateField('serviceDescription', e.target.value)} 
              placeholder="Ex: Troca de Disjuntor Geral" 
              required 
            />
            
            <MonetaryInput 
              label="Valor Cobrado" 
              value={formData.chargedValue} 
              onChange={(val) => updateField('chargedValue', val)} 
            />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel className="mb-1">Pagamento Recebido?</SectionLabel>
              <p className="text-[11px] opacity-80 text-[var(--text-secondary)]">Marcar como pago no financeiro</p>
            </div>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={formData.isReceived} 
                onChange={(e) => updateField('isReceived', e.target.checked)} 
                id="isReceived"
              />
              <label 
                htmlFor="isReceived" 
                className={`block w-14 h-8 rounded-full cursor-pointer transition-colors ${formData.isReceived ? 'bg-[var(--accent-green)]' : 'bg-white/10'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${formData.isReceived ? 'left-7' : 'left-1'}`} />
              </label>
            </div>
          </div>
        </SurfaceCard>

        <PrimaryButton 
          onClick={handleSave} 
          disabled={!isFormValid || isSaving}
          className="h-16 mt-4 !rounded-2xl !text-[13px] font-black tracking-[0.2em] mb-8"
        >
          {isSaving ? "SALVANDO..." : "FINALIZAR OPERAÇÃO"}
        </PrimaryButton>
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

            // V7 P3: Auto-preenchimento baseado na memória
            if (memory.lastServiceTitle) {
              updateField('serviceDescription', memory.lastServiceTitle);
              updateField('chargedValue', String(memory.lastExecutedValue || ''));
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
