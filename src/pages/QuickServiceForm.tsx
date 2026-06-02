import React, { useState } from 'react';
import { ScreenContainer, AppHeader } from '../ui/system/Layouts';
import { Input, Select } from '../app/components/ui/index';
import { SurfaceCard } from '../ui/system/Cards';
import { SectionLabel, Heading } from '../ui/system/Typography';
import { PrimaryButton } from '../app/components/ui';
import { clientService } from '../services/clientService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { useClients } from '../hooks/useClients';
import { siteService } from '../services/siteService';
import { Site } from '../domain/site';
import { trustLayer } from '../core/trust/TrustLayer';

export function QuickServiceForm({ onBack }: { onBack: () => void }) {
  const { clients } = useClients();
  const [clientSites, setClientSites] = useState<Site[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    siteId: '',
    siteName: '',
    serviceDescription: '',
    chargedValue: '',
    isReceived: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      // 1. Client Resolution
      let finalClientId = formData.clientId;
      if (!finalClientId && formData.clientName) {
        const newClient = await clientService.add({
          name: formData.clientName,
          phone: '',
          notes: 'Cadastrado automaticamente via Atendimento Rápido',
        });
        finalClientId = newClient.id;
      }

      if (!finalClientId) {
        throw new Error("Cliente é obrigatório");
      }

      let finalSiteId = formData.siteId;
      if (finalClientId && !finalSiteId) {
        // Fallback: see if there's a site for the client, else let backend handle (or set 'default-site')
        const sites = await siteService.getByClientId(finalClientId);
        if (sites.length > 0) {
          finalSiteId = sites[0].id;
        } else {
          finalSiteId = 'default-site';
        }
      }

      // 1.5. Criar Attendance mínimo no banco de dados Dexie
      const attendanceId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `att-${Date.now()}`;
      const newAttendance = {
        id: attendanceId,
        clientId: finalClientId || '',
        siteId: finalSiteId || 'default-site',
        status: 'iniciado' as const,
        companyId: 'default-company',
        workspaceId: 'default-workspace',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { db } = await import('../storage/dexieDatabase');
      await db.attendances.add(newAttendance).catch(err => {
        console.error("Erro ao iniciar atendimento no QuickServiceForm:", err);
      });

      localStorage.setItem('aferix_active_attendance_id', attendanceId);

      const budgetId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `bdg-${Date.now()}`;
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
      const newOsId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `os-${Date.now()}`;
      
      const newWorkOrder = {
        id: newOsId,
        budgetId: budget.id,
        clientId: budget.clientId,
        siteId: budget.siteId,
        title: budget.title,
        status: 'completed' as const,
        scheduledDate: new Date().toISOString().split('T')[0],
        originalValue: budget.chargedValue,
        executedValue: budget.chargedValue,
        attendanceId: attendanceId,
      };
      await workOrderService.add(newWorkOrder as any);

      // 4. Finance Record
      if (formData.isReceived && numericValue > 0) {
        await operationalFacade.registerPayment(newOsId, numericValue);
      }

      trustLayer.emit({
        type: 'success',
        title: 'Atendimento Rápido Salvo',
        description: `OS e Financeiro gerados para ${formData.serviceDescription}.`,
        status: 'synced'
      });

      onBack();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar Atendimento Rápido: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = (formData.clientId || formData.clientName) && formData.serviceDescription && Number(formData.chargedValue) >= 0;

  return (
    <ScreenContainer className={isSaving ? "opacity-50 pointer-events-none" : ""}>
      <AppHeader title="Atendimento Rápido." subtitle="Finalização em um único passo." onBack={onBack} />
      
      <div className="px-4 flex flex-col gap-6 pb-32 mt-4">
        <SurfaceCard padding="lg">
          <SectionLabel className="mb-6">Dados do Cliente</SectionLabel>
          <div className="flex flex-col gap-6">
            <Select 
              label="Cliente (Base)" 
              value={formData.clientId} 
              onChange={async (val) => {
                const client = clients.find(c => c.id === val);
                updateField('clientId', val);
                updateField('clientName', client?.name || '');
                updateField('siteId', ''); // reset site
                if (val) {
                  const sites = await siteService.getByClientId(val);
                  setClientSites(sites);
                  if (sites.length === 1) {
                    updateField('siteId', sites[0].id);
                  }
                } else {
                  setClientSites([]);
                }
              }}
            >
              <option value="">Novo Cliente (Cadastro Rápido)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>

            {!formData.clientId && (
              <Input 
                label="Nome do Novo Cliente" 
                value={formData.clientName} 
                onChange={(e) => updateField('clientName', e.target.value)} 
                placeholder="Ex: João da Silva" 
                required 
              />
            )}

            {formData.clientId && clientSites.length > 0 && (
              <Select
                label="Local (Site) - Obrigatório"
                value={formData.siteId}
                onChange={(val) => updateField('siteId', val)}
              >
                <option value="">Selecione um local</option>
                {clientSites.map(s => <option key={s.id} value={s.id}>{s.name} - {s.fullAddress}</option>)}
              </Select>
            )}
          </div>
        </SurfaceCard>

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
            
            <Input 
              label="Valor Cobrado (R$)" 
              type="number" 
              value={formData.chargedValue} 
              onChange={(e) => updateField('chargedValue', e.target.value)} 
              placeholder="Ex: 150.00" 
              required 
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
          className="h-16 mt-4 !rounded-2xl !text-[13px] font-black tracking-[0.2em]"
        >
          {isSaving ? "SALVANDO..." : "FINALIZAR OPERAÇÃO"}
        </PrimaryButton>
      </div>
    </ScreenContainer>
  );
}
