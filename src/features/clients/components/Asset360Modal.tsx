import { useEffect, useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Activity, 
  History, 
  AlertCircle,
  FileText,
  DollarSign,
  PenTool,
  Settings,
  ArrowLeft,
  CalendarDays,
  Plus,
  Zap,
  CheckSquare,
  Wrench,
  Tag
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
  Grid
} from '../../../ui/system';
import { 
  Modal, 
  ContextBanner, 
  Select, 
  PrimaryButton, 
  SecondaryButton,
  Input
} from '../../../app/components/ui';
import { operationalReadModelService } from '../../../services/operationalReadModelService';
import { maintenancePlanService } from '../../../services/maintenancePlanService';
import { assetService } from '../../../services/assetService';
import { AssetDossierProjection } from '../../../domain/operationalProjections';
import { MaintenancePlan, MaintenanceFrequency } from '../../../domain/maintenancePlan';
import { formatCurrencyBRL } from '../../../utils/formatters';
import { cn } from '../../../utils/ui';

interface Asset360ModalProps {
  assetId: string | null;
  onClose: () => void;
}

/**
 * Asset360Modal: Deep technical memory for specific assets.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 */
export function Asset360Modal({ assetId, onClose }: Asset360ModalProps) {
  const [projection, setProjection] = useState<AssetDossierProjection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'planos'>('info');
  
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
      const data = await operationalReadModelService.getAsset360Projection(assetId);
      setProjection(data);
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

  if (!assetId) return null;

  return (
    <Modal
      isOpen={!!assetId}
      onClose={onClose}
      title={projection?.asset.name.toUpperCase() || "Dossiê do Ativo"}
      confirmLabel="Fechar"
      onConfirm={onClose}
    >
      <div className="flex flex-col gap-8 pt-4">
        
        {isLoading ? (
          <div className="py-20"><ERPLoader message="Recuperando memória técnica..." /></div>
        ) : !projection ? (
          <div className="py-12 text-center opacity-30"><Body className="font-mono text-[10px] font-black tracking-widest uppercase">ATIVO_NÃO_LOCALIZADO</Body></div>
        ) : (
          <Section className="gap-8">
            {/* Header Executivo Asset (Fase 4A Hardening) */}
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
                value={projection.timeline.length} 
                icon={<Wrench size={12} />} 
               />
               <ValueBlock 
                label="TAG" 
                value={projection.asset.tag || 'N/A'} 
                icon={<Tag size={12} />} 
               />
            </ExecutiveSummaryGrid>

            {/* TAB NAV */}
            <div className="flex gap-6 border-b border-white/[0.07] px-1">
               <button 
                onClick={() => setActiveTab('info')}
                className={cn(
                  "pb-3 text-[11px] font-black tracking-widest transition-all",
                  activeTab === 'info' ? "border-b-2 border-[var(--accent-gold)] text-white" : "text-[var(--text-tertiary)]"
                )}
               >HISTÓRICO</button>
               <button 
                onClick={() => setActiveTab('planos')}
                className={cn(
                  "pb-3 text-[11px] font-black tracking-widest transition-all",
                  activeTab === 'planos' ? "border-b-2 border-[var(--accent-gold)] text-white" : "text-[var(--text-tertiary)]"
                )}
               >PLANO_PREVENTIVO</button>
            </div>

            {activeTab === 'info' ? (
              <Section className="gap-6">
                <ContextBanner 
                  title={projection.asset.name} 
                  meta={`${projection.asset.manufacturer || 'Fabricante N/D'} · Mod: ${projection.asset.model || 'N/D'} · SN: ${projection.asset.serialNumber || 'N/D'}`}
                  icon={<Settings size={14} />}
                />

                <Stack className="gap-4">
                  <SectionLabel className="ml-1">Linha do Tempo Técnica</SectionLabel>
                  
                  <div className="flex flex-col gap-6 pl-2 relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.07]" />
                    
                    {projection.timeline.length === 0 ? (
                      <div className="py-12 text-center opacity-20">
                          <Body className="font-mono text-[11px] font-black uppercase tracking-widest">MEMÓRIA_VAZIA</Body>
                      </div>
                    ) : (
                      projection.timeline.map((evt) => (
                          <div key={evt.id} className="flex gap-4 relative">
                            <div className={cn(
                              "w-3.5 h-3.5 rounded-full bg-[#050505] border-2 z-10 mt-1 shrink-0",
                              evt.severity === 'critical' ? "border-[var(--accent-red)]" : "border-[var(--accent-gold)]"
                            )} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <Body className="font-bold leading-tight">{evt.title}</Body>
                                  <SectionLabel className="!text-[9px] mt-0.5">{new Date(evt.timestamp).toLocaleDateString('pt-BR')}</SectionLabel>
                                </div>
                                <Subtitle className="mt-1 opacity-60 leading-relaxed">{evt.description}</Subtitle>
                            </div>
                          </div>
                      ))
                    )}
                  </div>
                </Stack>
              </Section>
            ) : (
              <Section className="gap-6">
                 <div className="flex justify-between items-center px-1">
                    <SectionLabel>Planos de Recorrência</SectionLabel>
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
                    <SurfaceCard className="border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/5">
                       <Stack className="gap-6">
                          <Input 
                            label="Título da Manutenção"
                            value={planDraft.title}
                            onChange={(e) => setPlanDraft({...planDraft, title: e.target.value})}
                            placeholder="Ex: Preventiva Trimestral"
                          />
                          <Grid className="gap-4">
                            <Select 
                              label="Frequência"
                              value={planDraft.frequency}
                              onChange={(val) => setPlanDraft({...planDraft, frequency: val as any})}
                            >
                                <option value="monthly">Mensal</option>
                                <option value="quarterly">Trimestral</option>
                                <option value="semiannual">Semestral</option>
                                <option value="annual">Anual</option>
                            </Select>
                            <Input 
                              label="Início / Próxima"
                              type="date"
                              value={planDraft.nextDate}
                              onChange={(e) => setPlanDraft({...planDraft, nextDate: e.target.value})}
                            />
                          </Grid>
                          <Stack className="gap-3 mt-4">
                             <PrimaryButton onClick={handleCreatePlan} className="h-14 !text-[11px] font-black">ATIVAR_RECORRÊNCIA</PrimaryButton>
                             <SecondaryButton onClick={() => setIsCreatingPlan(false)} className="h-12 !text-[11px]">CANCELAR</SecondaryButton>
                          </Stack>
                       </Stack>
                    </SurfaceCard>
                 ) : (
                   <Stack className="gap-4">
                      {plans.length === 0 ? (
                        <SurfaceCard padding="xl" className="text-center border-dashed opacity-50">
                           <Clock size={24} className="text-[var(--text-tertiary)] mx-auto mb-3 opacity-30" />
                           <Body className="text-[13px] opacity-60">Nenhuma recorrência programada.</Body>
                        </SurfaceCard>
                      ) : (
                        <SurfaceCard padding="none">
                           <Stack className="gap-0">
                            {plans.map((plan, i) => (
                              <InteractiveRow key={plan.id} className={i !== 0 ? "border-t border-white/[0.05]" : ""}>
                                  <div className="flex items-center gap-4 w-full">
                                    <div className={cn(
                                      "w-9 h-9 rounded-xl border grid place-items-center shrink-0",
                                      plan.isActive ? "bg-[var(--accent-green)]/10 border-[var(--accent-green)]/20" : "bg-white/[0.03] border-white/[0.07]"
                                    )}>
                                        <Zap size={18} className={plan.isActive ? "text-[var(--accent-green)]" : "text-[var(--text-tertiary)]"} fill={plan.isActive ? "currentColor" : "none"} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Body className="font-bold truncate">{plan.title}</Body>
                                        <Subtitle className="text-[10px] font-bold font-mono uppercase tracking-wider opacity-60">
                                          {plan.frequency} · PRÓXIMA: {new Date(plan.nextExecutionDate).toLocaleDateString('pt-BR')}
                                        </Subtitle>
                                    </div>
                                    <SemanticBadge label={plan.isActive ? 'ATIVO' : 'PAUSADO'} variant={plan.isActive ? 'success' : 'default'} className="scale-75 origin-right" />
                                  </div>
                              </InteractiveRow>
                            ))}
                           </Stack>
                        </SurfaceCard>
                      )}
                   </Stack>
                 )}

                 <ContextBanner 
                   title="Inteligência de Campo"
                   meta="OSs rascunho são geradas automaticamente 7 dias antes da execução para preparação da equipe."
                   icon={<History size={14} />}
                 />
              </Section>
            )}
          </Section>
        )}
      </div>
    </Modal>
  );
}
