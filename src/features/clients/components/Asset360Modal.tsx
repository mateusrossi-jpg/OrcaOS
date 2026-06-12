import { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Activity, 
  History, 
  DollarSign, 
  Settings, 
  Wrench, 
  Tag, 
  Check, 
  Thermometer,
  CalendarClock,
  Briefcase,
  Copy,
  Clock,
  Zap,
  Navigation
} from "lucide-react";
import { 
  SemanticBadge, 
  ExecutiveSummaryGrid, 
  ValueBlock,
  SectionLabel,
  InteractiveRow,
  SurfaceCard,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Value,
  FinancialValue,
  ERPLoader,
  Grid,
  GlassInput,
  GlassSelect,
  GlassDatePicker,
  TimelineCard,
  ExecutiveHeader
} from '../../../ui/system';
import { 
  PrimaryButton, 
  SecondaryButton
} from '../../../app/components/ui';
import { operationalReadModelService } from '../../../services/operationalReadModelService';
import { maintenancePlanService } from '../../../services/maintenancePlanService';
import { assetService } from '../../../services/assetService';
import { db } from '../../../storage/dexieDatabase';
import { AssetDossierProjection } from '../../../domain/operationalProjections';
import { MaintenancePlan, MaintenanceFrequency } from '../../../domain/maintenancePlan';
import { AssetExecution } from '../../../domain/assetExecution';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { cn } from '../../../utils/ui';

interface Asset360ModalProps {
  assetId: string | null;
  onClose: () => void;
}

/**
 * Asset360Modal: Deep technical memory for specific assets.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 * Feature: Real Technical History + Maintenance Plans.
 * Transitioned to Full-Screen Experience (Roadmap RC18).
 */
export function Asset360Modal({ assetId, onClose }: Asset360ModalProps) {
  const [projection, setProjection] = useState<AssetDossierProjection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [structuredHistory, setStructuredHistory] = useState<AssetExecution[]>([]);
  
  // Maintenance Plans State
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planDraft, setPlanDraft] = useState({
    title: 'Manutenção Preventiva',
    frequency: 'quarterly' as MaintenanceFrequency,
    nextDate: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0]
  });

  async function loadProjection() {
    if (!assetId) return;
    setIsLoading(true);
    try {
      const [data, executions] = await Promise.all([
        operationalReadModelService.getAsset360Projection(assetId),
        db.assetExecutions.where('assetId').equals(assetId).reverse().sortBy('createdAt')
      ]);
      setProjection(data);
      setStructuredHistory(executions || []);
    } catch (e) {
      console.error('Failed to load asset dossier:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPlans() {
    if (!assetId) return;
    try {
      const p = await maintenancePlanService.getByAssetId(assetId);
      setPlans(p);
    } catch (e) {
      console.error('Failed to load plans:', e);
    }
  }

  useEffect(() => {
    if (assetId) {
      loadProjection();
      loadPlans();
    }
  }, [assetId]);

  async function handleCreatePlan() {
    if (!projection) return;
    try {
      await maintenancePlanService.add({
        clientId: projection.asset.clientId,
        siteId: projection.asset.siteId,
        assetId: projection.asset.id,
        title: planDraft.title,
        frequency: planDraft.frequency,
        nextExecutionDate: new Date(planDraft.nextDate).toISOString(),
        isActive: true,
        checklistTemplate: ['Inspeção Visual', 'Limpeza Geral', 'Teste de Funcionamento']
      });
      setIsCreatingPlan(false);
      await loadPlans();
    } catch (e) {
      console.error('Failed to create plan:', e);
    }
  }

  async function handleDuplicateAsset() {
    if (!assetId) return;
    try {
      await assetService.duplicate(assetId);
      window.dispatchEvent(new CustomEvent('aferix_toast', { detail: { type: 'success', message: 'Equipamento duplicado com sucesso.' } }));
      onClose(); 
    } catch (e) {
      console.error('Failed to duplicate asset:', e);
    }
  }

  if (!assetId) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-aferix-bg overflow-y-auto animate-in slide-in-from-right-6 duration-700">
      {/* Top Navigation */}
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute top-16 left-6 z-[1100] w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
        >
          <Navigation size={18} className="-rotate-90" />
        </button>
        <ExecutiveHeader userName="Mateus" score={96} standalone />
      </div>

      <div className="px-6 flex flex-col gap-10 pb-40">
        <Section className="gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] shadow-[0_0_10px_var(--accent-gold)]" />
            <SectionLabel className="ml-1 uppercase tracking-[0.4em] text-white/40 leading-none mb-0">Memória Técnica do Ativo</SectionLabel>
          </div>
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-[42px] font-black text-white uppercase leading-[0.95] tracking-tight">{projection?.asset.name || 'Ativo'}</h1>
            <button 
              onClick={handleDuplicateAsset}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/40 active:scale-95 transition-all"
              title="Duplicar Ativo"
            >
              <Copy size={20} />
            </button>
          </div>
        </Section>

        {isLoading ? (
          <div className="py-20"><ERPLoader message="Recuperando memória técnica..." /></div>
        ) : !projection ? (
          <div className="py-12 text-center opacity-30"><Body className="font-mono text-[10px] font-black tracking-widest uppercase">ATIVO_NÃO_LOCALIZADO</Body></div>
        ) : (
          <div className="flex flex-col gap-10 animate-scale-pop">
            {/* Executive Summary */}
            <ExecutiveSummaryGrid>
               <ValueBlock 
                label="Saúde Técnica" 
                value={`${projection.healthScore}%`} 
                icon={<Activity size={12} />} 
                variant={projection.healthScore > 70 ? "success" : projection.healthScore > 40 ? "warning" : "danger"}
               />
               <ValueBlock 
                label="Custo Total" 
                value={formatCurrencyBRL(projection.totalMaintenanceCost)} 
                icon={<DollarSign size={12} />} 
               />
               <ValueBlock 
                label="Intervenções" 
                value={structuredHistory.length || projection.timeline.length} 
                icon={<Wrench size={12} />} 
               />
               <ValueBlock 
                label="TAG" 
                value={projection.asset.tag || 'N/A'} 
                icon={<Tag size={12} />} 
               />
            </ExecutiveSummaryGrid>

            {/* Technical Details Banner */}
            <SurfaceCard className="bg-white/[0.03] border-white/10 p-6 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)]">
                  <Settings size={24} />
               </div>
               <div className="flex flex-col">
                  <span className="text-[14px] font-black text-white uppercase tracking-tight">{projection.asset.name}</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                    {projection.asset.manufacturer || 'Fabricante N/D'} · Mod: {projection.asset.model || 'N/D'} · SN: {projection.asset.serialNumber || 'N/D'}
                  </span>
               </div>
            </SurfaceCard>

            {/* Timeline */}
            <Section className="gap-6">
              <SectionLabel className="ml-1 uppercase tracking-widest text-[var(--accent-gold)]">Linha do Tempo Técnica</SectionLabel>
              
              <div className="flex flex-col gap-0 relative">
                {projection.timeline.length === 0 ? (
                  <div className="py-12 text-center opacity-20 border border-dashed border-white/10 rounded-3xl">
                      <Body className="font-mono text-[11px] font-black uppercase tracking-widest">MEMÓRIA_TÉCNICA_VAZIA</Body>
                  </div>
                ) : (
                  projection.timeline.map((evt, idx) => (
                    <TimelineCard 
                      key={evt.id}
                      time={new Date(evt.timestamp).toLocaleDateString('pt-BR')}
                      title={evt.title}
                      status={evt.severity === 'critical' ? 'Alerta Crítico' : 'Executado'}
                      state={evt.severity === 'critical' ? 'upcoming' : 'done'}
                    />
                  ))
                )}
              </div>
            </Section>

            {/* Warranty */}
            <Section className="gap-4">
              <SectionLabel className="!text-[var(--accent-green)] ml-1 flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck size={14} /> Garantia & Proteção
              </SectionLabel>
              <SurfaceCard padding="lg" className="bg-[var(--accent-green)]/5 border-[var(--accent-green)]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <ShieldCheck size={48} className="text-[var(--accent-green)]" />
                </div>
                <Body className="font-black text-white uppercase tracking-tight">Ativo Coberto</Body>
                <Subtitle className="mt-1 text-[var(--accent-green)] font-bold uppercase tracking-widest text-[10px]">Proteção Aferix até Dez/2026</Subtitle>
                <div className="mt-4 pt-4 border-t border-white/5">
                   <p className="text-[11px] text-white/40 leading-relaxed italic">"Garantia de 12 meses ativada na instalação. Cobre defeitos de fabricação e mão de obra de re-execução."</p>
                </div>
              </SurfaceCard>
            </Section>

            {/* Maintenance Plans */}
            <Section className="gap-6 pt-10 border-t border-white/[0.05]">
                 <div className="flex justify-between items-center px-1">
                    <SectionLabel className="!mb-0 uppercase tracking-widest opacity-40">Planos de Recorrência</SectionLabel>
                    {!isCreatingPlan && (
                      <button 
                        onClick={() => setIsCreatingPlan(true)}
                        className="text-[10px] text-[var(--accent-gold)] font-black font-mono tracking-wider hover:brightness-125 transition-all"
                      >
                        + NOVO_PLANO
                      </button>
                    )}
                 </div>

                 {isCreatingPlan ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <GlassFormCard>
                          <GlassInput 
                            label="Título da Manutenção"
                            value={planDraft.title}
                            onChange={(e) => setPlanDraft({...planDraft, title: e.target.value})}
                            placeholder="Ex: Preventiva Trimestral"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <GlassSelect 
                              label="Frequência"
                              value={planDraft.frequency}
                              onChange={(e) => setPlanDraft({...planDraft, frequency: e.target.value as any})}
                            >
                                <option value="monthly">Mensal</option>
                                <option value="quarterly">Trimestral</option>
                                <option value="semiannual">Semestral</option>
                                <option value="annual">Anual</option>
                            </GlassSelect>
                            <GlassDatePicker 
                              label="Próxima Execução"
                              value={planDraft.nextDate}
                              onChange={(e) => setPlanDraft({...planDraft, nextDate: e.target.value})}
                            />
                          </div>
                          <Stack className="gap-3 mt-4">
                             <PrimaryButton onClick={handleCreatePlan} className="h-16 font-black tracking-[0.2em] rounded-2xl">ATIVAR RECORRÊNCIA</PrimaryButton>
                             <SecondaryButton onClick={() => setIsCreatingPlan(false)} className="h-14 rounded-2xl uppercase font-black text-[10px] tracking-widest">CANCELAR</SecondaryButton>
                          </Stack>
                       </GlassFormCard>
                    </div>
                 ) : (
                   <Stack className="gap-4">
                      {plans.length === 0 ? (
                        <SurfaceCard padding="xl" className="text-center border-dashed opacity-20 py-16 rounded-[32px]">
                           <Clock size={32} className="mx-auto mb-4" />
                           <Body className="text-[11px] font-black uppercase tracking-widest">Nenhuma recorrência programada</Body>
                        </SurfaceCard>
                      ) : (
                        <div className="flex flex-col gap-3">
                            {plans.map((plan) => (
                              <SurfaceCard key={plan.id} padding="none" className="bg-white/[0.01] border-white/[0.05] overflow-hidden group">
                                  <InteractiveRow className="p-6">
                                      <div className="flex items-center gap-5 w-full">
                                        <div className={cn(
                                          "w-12 h-12 rounded-2xl border grid place-items-center shrink-0 transition-all",
                                          plan.isActive ? "bg-[var(--accent-green)]/10 border-[var(--accent-green)]/20 text-[var(--accent-green)]" : "bg-white/[0.03] border-white/[0.07] text-white/20"
                                        )}>
                                            <Zap size={22} fill={plan.isActive ? "currentColor" : "none"} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Body className="font-black uppercase tracking-tight text-[15px]">{plan.title}</Body>
                                            <Subtitle className="text-[10px] font-black font-mono uppercase tracking-[0.2em] opacity-40 mt-1">
                                              {plan.frequency} · PRÓXIMA: {new Date(plan.nextExecutionDate).toLocaleDateString('pt-BR')}
                                            </Subtitle>
                                        </div>
                                        <SemanticBadge label={plan.isActive ? 'ATIVO' : 'PAUSADO'} variant={plan.isActive ? 'success' : 'default'} className="scale-90 origin-right" />
                                      </div>
                                  </InteractiveRow>
                              </SurfaceCard>
                            ))}
                        </div>
                      )}
                   </Stack>
                 )}

                 <SurfaceCard className="bg-white/[0.03] border-white/10 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)]">
                       <History size={20} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[12px] font-black text-white uppercase tracking-tight">Inteligência de Campo</span>
                       <span className="text-[10px] text-white/40 font-medium">OSs rascunho são geradas automaticamente 7 dias antes da execução.</span>
                    </div>
                 </SurfaceCard>
            </Section>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-10 left-6 right-6 z-[1100] flex gap-4">
        <SecondaryButton onClick={onClose} className="flex-1 h-16 !rounded-2xl font-black text-[11px] uppercase tracking-[0.2em]">
          FECHAR DOSSIÊ
        </SecondaryButton>
        <PrimaryButton 
          onClick={() => {}} 
          className="flex-[1.5] h-16 bg-[var(--accent-gold)] text-black font-black text-[12px] tracking-[0.2em] rounded-2xl shadow-[0_20px_50px_rgba(212,169,74,0.3)] flex items-center justify-center gap-3 uppercase"
        >
          GERAR INTERVENÇÃO <Wrench size={20} />
        </PrimaryButton>
      </div>
    </div>
  );
}
