import { useState, useMemo, memo, useEffect } from 'react';
import { 
  FileDown, 
  Send, 
  Lock, 
  ArrowRight, 
  X, 
  User, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  DollarSign, 
  Activity, 
  Settings, 
  Info, 
  Star, 
  Wrench, 
  Package 
} from "lucide-react";
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { formatCurrencyBRL, formatPercent } from '../utils/formatters';
import { useClients } from '../hooks/useClients';
import { useBudgetForm } from '../hooks/useBudgetForm';
import { siteService } from '../services/siteService';
import { Site } from '../domain/site';
import { BUDGET_WORKFLOW_MAP, type WorkflowStepId } from '../domain/budgetWorkflow';
import { WorkflowStepper } from '../app/components/ui/WorkflowStepper';
import { FastSiteCreationModal } from '../features/clients/components/FastSiteCreationModal';
import { PremiumCatalogWorkspace } from '../features/catalog/components/PremiumCatalogWorkspace';
import type { CatalogHubItem } from '../features/catalog/types/catalogTypes';
import { BudgetSummaryView } from '../features/budgets/components/BudgetSummaryView';
import { FieldWorkTool } from '../features/budgets/components/FieldWorkTool';
import { 
  Input,
  Select,
  MonetaryInput,
  TextArea,
  Modal,
  MoneyValue,
  PrimaryButton,
  DangerButton,
  ERPLoader,
  ContextBanner
} from '../app/components/ui';
import { OperationalDock } from '../components/OperationalDock';
import { HeroCard } from '../components/HeroCard';
import { cn } from '../utils/ui';

// ── Unified UI Architecture ──────────────────────────────────────────────────
import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  SectionLabel,
  SemanticBadge,
  ExecutiveSummaryGrid,
  ValueBlock,
  StatusPill,
  InteractiveRow,
  Heading,
  OpsChip
} from '../ui/system';

interface BudgetFormProps {
  id?: string | null;
  onBack?: () => void;
}

/**
 * LIGHTNING PROPOSAL COMPOSER (RC1)
 * Refactored under Executive Parity Plan (Phase 4G: Technical BOM).
 */
export const BudgetForm: React.FC<BudgetFormProps> = memo(({ id, onBack }) => {
  const {
    budget,
    isLoading,
    updateField,
    addItem,
    removeItem,
    updateItem,
    preview,
    isSaving,
    permissions,
    showFinalizeModal,
    saveDraft,
    markAsSent,
    cancelFinalize,
    confirmFinalize,
    error,
    clearError,
    isReadOnly,
  } = useBudgetForm(id);

  const [currentStep, setCurrentStep] = useState<WorkflowStepId>(1);
  const { clients } = useClients();
  const [showCatalog, setShowCatalog] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [clientSites, setClientSites] = useState<Site[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(false);

  useEffect(() => {
    async function loadSites() {
      if (!budget.clientId) { setClientSites([]); return; }
      setIsLoadingSites(true);
      try {
        const sites = await siteService.getByClientId(budget.clientId);
        setClientSites(sites);
        if (sites.length === 1 && !budget.siteId) updateField('siteId', sites[0].id);
      } catch (e) { console.error(e); } finally { setIsLoadingSites(false); }
    }
    loadSites();
  }, [budget.clientId]);

  useEffect(() => {
    if (!isLoading && budget.status) {
      if (budget.status === BUDGET_STATUS.FINALIZADO) setCurrentStep(11);
      else if ((budget.status === BUDGET_STATUS.EM_EXECUCAO || budget.status === BUDGET_STATUS.AUTORIZADO) && currentStep < 10) setCurrentStep(10);
      else if (budget.status === BUDGET_STATUS.ENVIADO && currentStep < 9) setCurrentStep(9);
    }
  }, [isLoading, budget.status, currentStep]);

  const handleNextStep = async () => {
    await saveDraft();
    if (currentStep < 11) {
      setCurrentStep((prev) => (prev + 1) as WorkflowStepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackStep = async () => {
    await saveDraft();
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WorkflowStepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExit = async () => {
    await saveDraft();
    if (onBack) onBack();
  };

  if (isLoading) return <ScreenContainer className="items-center justify-center"><ERPLoader message="Abrindo pipeline..." /></ScreenContainer>;

  const totalVal = (budget.chargedValue || 0) - (budget.discounts || 0);
  const profit = preview?.grossProfit || 0;
  const budgetMargin = totalVal > 0 ? (profit / totalVal) * 100 : 0;
  
  const today = new Date();
  const DAY = today.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase();
  const DATE_STR = today.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }).toUpperCase();

  if (showCatalog) {
    return (
      <PremiumCatalogWorkspace 
        onSendToBudget={(items) => { 
          items.forEach(it => addItem(it)); 
          setShowCatalog(false); 
        }} 
        onBack={() => setShowCatalog(false)}
      />
    );
  }

  return (
    <ScreenContainer className={cn("pb-48 px-0 pt-0", isSaving && "opacity-75 pointer-events-none")}>
      
      <AppHeader
        title={budget.title || 'Novo Projeto.'}
        onBack={handleExit}
        action={<StatusPill status={budget.status} />}
        chips={
          <>
            <OpsChip
              icon={<DollarSign size={11} />}
              label={formatCurrencyBRL(totalVal)}
              accent={false}
            />
            <OpsChip
              icon={<Activity size={11} />}
              label={`${budgetMargin.toFixed(0)}% MARGEM`}
              accent={budgetMargin > 40 ? "green" : "orange"}
            />
            <OpsChip
              icon={<Info size={11} />}
              label={`Etapa ${currentStep}/11`}
              accent={false}
            />
          </>
        }
      />

      <div className="px-6 flex flex-col gap-6">

      <div className="mb-10">
        <WorkflowStepper currentStep={currentStep} workflowMap={BUDGET_WORKFLOW_MAP} onStepClick={async (id) => { await saveDraft(); setCurrentStep(id); }} />
      </div>

      {error && (
        <SurfaceCard className="mb-4 border-[var(--accent-red)]/30 bg-[var(--accent-red)]/5 !p-4" padding="none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#F87171]">{error}</span>
            <button onClick={clearError} className="p-2 -mr-2 text-[#F87171]"><X className="h-4 w-4" /></button>
          </div>
        </SurfaceCard>
      )}

      <div className="flex flex-col gap-6">
        
        {/* STEP 1: CLIENTE */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <SurfaceCard padding="lg" variant="elevated">
              <SectionLabel className="mb-10 text-[var(--accent-gold)]">Contratante Principal</SectionLabel>
              <div className="flex flex-col gap-8">
                <Select label="Selecionar Cliente da Base" value={budget.clientId || ''} onChange={(val: string) => { const client = clients.find(c => c.id === val); updateField('clientId', val); updateField('clientName', client?.name || ''); updateField('siteId', ''); }} disabled={!permissions.canEditClient}>
                  <option value="">Novo Cliente (Cadastro Rápido)</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                {budget.clientId && (
                  <div className="animate-in fade-in slide-in-from-top-1">
                    <Select label="Local de Atendimento (Unidade)" value={budget.siteId || ''} onChange={(val: string) => { if(val === 'NEW_SITE') setIsSiteModalOpen(true); else updateField('siteId', val); }} disabled={!permissions.canEditClient || isLoadingSites}>
                      <option value="">Endereço principal...</option>
                      {clientSites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.fullAddress.slice(0, 30)}...)</option>)}
                      <option value="NEW_SITE">➕ Cadastrar Novo Local (Fast Flow)...</option>
                    </Select>
                  </div>
                )}
                {!budget.clientId && <Input label="Nome do Novo Cliente" value={budget.clientName || ''} onChange={(e) => updateField('clientName', e.target.value)} disabled={!permissions.canEditClient} placeholder="Digite o nome completo" required />}
              </div>
            </SurfaceCard>
          </div>
        )}

        {/* STEP 2: ESCOPO */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <SurfaceCard padding="lg" variant="elevated">
              <SectionLabel className="mb-10 text-[var(--accent-gold)]">Escopo Operacional</SectionLabel>
              <div className="flex flex-col gap-8">
                <Input label="Título do Projeto" value={budget.title} onChange={(e) => updateField('title', e.target.value)} disabled={!permissions.canEditTitle} placeholder="Ex: Reforma Elétrica" />
                <Input label="Prazo de Execução Sugerido" value={budget.executionDeadline || ''} onChange={(e) => updateField('executionDeadline', e.target.value)} disabled={!permissions.canEditNotes} placeholder="Ex: 5 dias úteis" />
              </div>
            </SurfaceCard>
          </div>
        )}

        {/* STEP 3: TÉCNICO */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <SurfaceCard padding="lg" variant="elevated">
              <SectionLabel className="mb-10 text-[var(--accent-gold)]">Relatório Técnico</SectionLabel>
              <TextArea 
                label="Levantamento / Descritivo" 
                value={budget.technicalNotes || ''} 
                onChange={(val) => updateField('technicalNotes', val)} 
                rows={10} 
                placeholder="Descreva as condições encontradas e o plano técnico..."
              />
            </SurfaceCard>
          </div>
        )}

        {/* STEP 4: SERVIÇOS */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center px-2 mb-2">
                <SectionLabel className="!text-[10px] !text-[var(--accent-gold)]">Composição de Serviços</SectionLabel>
                <div className="flex gap-2">
                   <button onClick={() => setShowCatalog(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[10px] text-white font-black font-mono tracking-widest uppercase hover:bg-white/[0.08] transition-all">
                      <Plus size={12} className="text-[var(--accent-gold)]" /> CATÁLOGO
                   </button>
                   <button onClick={() => addItem({ kind: 'labor', title: 'Novo Serviço' })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[10px] text-white font-black font-mono tracking-widest uppercase hover:bg-white/[0.08] transition-all">
                      <Plus size={12} /> MANUAL
                   </button>
                </div>
             </div>

             <SurfaceCard padding="none" className="overflow-hidden border-white/[0.08]">
                {budget.items.filter(it => it.category === 'labor').length === 0 ? (
                  <div className="py-20 text-center opacity-20">
                     <SectionLabel className="!text-[10px]">NENHUM_SERVIÇO_REGISTRADO</SectionLabel>
                  </div>
                ) : (
                  budget.items.filter(it => it.category === 'labor').map((item, idx) => (
                    <InteractiveRow 
                      key={item.id} 
                      className={cn(idx !== 0 && "border-t border-white/[0.06]")}
                      leftSlot={<div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[10px] font-black font-mono text-white/30">{idx + 1}</div>}
                    >
                       <div className="flex-1 flex flex-col gap-4 pr-2">
                          <input 
                            value={item.description} 
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="bg-transparent border-none text-[15px] font-bold text-white outline-none p-0 w-full placeholder:text-white/5"
                            placeholder="Descrição do serviço..."
                          />
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-3 bg-black/20 border border-white/[0.05] px-3 py-1.5 rounded-xl">
                                <span className="text-[9px] font-black font-mono text-white/20 uppercase tracking-tighter">QTD</span>
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                                  className="bg-transparent border-none text-[13px] font-black text-[var(--accent-gold)] outline-none p-0 w-10 num"
                                />
                             </div>
                             <div className="flex items-center gap-3 bg-black/20 border border-white/[0.05] px-3 py-1.5 rounded-xl">
                                <span className="text-[9px] font-black font-mono text-white/20 uppercase tracking-tighter">UNIT</span>
                                <input 
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                                  className="bg-transparent border-none text-[13px] font-black text-white/60 outline-none p-0 w-16 num"
                                />
                             </div>
                             <div className="ml-auto text-[14px] font-black text-white num">
                                {formatCurrencyBRL(item.quantity * item.unitPrice)}
                             </div>
                             <button onClick={() => removeItem(item.id)} className="p-2 text-white/10 hover:text-[var(--accent-red)] transition-colors">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </div>
                    </InteractiveRow>
                  ))
                )}
             </SurfaceCard>
             <div className="flex justify-end pr-2 mt-2">
                <div className="flex items-baseline gap-4">
                   <SectionLabel className="!text-[10px] opacity-30 tracking-[0.2em]">SUBTOTAL_SERVIÇOS</SectionLabel>
                   <span className="text-2xl font-black text-white num">
                      {formatCurrencyBRL(budget.items.filter(it => it.category === 'labor').reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0))}
                   </span>
                </div>
             </div>
          </div>
        )}

        {/* STEP 5: MATERIAIS */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center px-2 mb-2">
                <SectionLabel className="!text-[10px] !text-[var(--accent-gold)]">Insumos e Materiais</SectionLabel>
                <div className="flex gap-2">
                   <button onClick={() => setShowCatalog(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[10px] text-white font-black font-mono tracking-widest uppercase hover:bg-white/[0.08] transition-all">
                      <Plus size={12} className="text-[var(--accent-gold)]" /> CATÁLOGO
                   </button>
                   <button onClick={() => addItem({ kind: 'material', title: 'Novo Material' })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[10px] text-white font-black font-mono tracking-widest uppercase hover:bg-white/[0.08] transition-all">
                      <Plus size={12} /> MANUAL
                   </button>
                </div>
             </div>

             <SurfaceCard padding="none" className="overflow-hidden border-white/[0.08]">
                {budget.items.filter(it => it.category === 'material').length === 0 ? (
                  <div className="py-20 text-center opacity-20">
                     <SectionLabel className="!text-[10px]">NENHUM_MATERIAL_REGISTRADO</SectionLabel>
                  </div>
                ) : (
                  budget.items.filter(it => it.category === 'material').map((item, idx) => (
                    <InteractiveRow 
                      key={item.id} 
                      className={cn(idx !== 0 && "border-t border-white/[0.06]")}
                      leftSlot={<div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[10px] font-black font-mono text-white/30">{idx + 1}</div>}
                    >
                       <div className="flex-1 flex flex-col gap-4 pr-2">
                          <input 
                            value={item.description} 
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="bg-transparent border-none text-[15px] font-bold text-white outline-none p-0 w-full placeholder:text-white/5"
                            placeholder="Descrição do material..."
                          />
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-3 bg-black/20 border border-white/[0.05] px-3 py-1.5 rounded-xl">
                                <span className="text-[9px] font-black font-mono text-white/20 uppercase tracking-tighter">QTD</span>
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                                  className="bg-transparent border-none text-[13px] font-black text-[var(--accent-gold)] outline-none p-0 w-10 num"
                                />
                             </div>
                             <div className="flex items-center gap-3 bg-black/20 border border-white/[0.05] px-3 py-1.5 rounded-xl">
                                <span className="text-[9px] font-black font-mono text-white/20 uppercase tracking-tighter">CUSTO</span>
                                <input 
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                                  className="bg-transparent border-none text-[13px] font-black text-white/60 outline-none p-0 w-16 num"
                                />
                             </div>
                             <div className="ml-auto text-[14px] font-black text-white num">
                                {formatCurrencyBRL(item.quantity * item.unitPrice)}
                             </div>
                             <button onClick={() => removeItem(item.id)} className="p-2 text-white/10 hover:text-[var(--accent-red)] transition-colors">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </div>
                    </InteractiveRow>
                  ))
                )}
             </SurfaceCard>
             <div className="flex justify-end pr-2 mt-2">
                <div className="flex items-baseline gap-4">
                   <SectionLabel className="!text-[10px] opacity-30 tracking-[0.2em]">SUBTOTAL_MATERIAIS</SectionLabel>
                   <span className="text-2xl font-black text-white num">
                      {formatCurrencyBRL(budget.items.filter(it => it.category === 'material').reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0))}
                   </span>
                </div>
             </div>
          </div>
        )}

        {/* STEP 6: LOGÍSTICA */}
        {currentStep === 6 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <SurfaceCard padding="lg" variant="elevated">
                <SectionLabel className="mb-10 text-[var(--accent-gold)]">Custos de Logística e Apoio</SectionLabel>
                <div className="flex flex-col gap-8">
                   <MonetaryInput label="Deslocamento / Combustível" value={budget.travelCost} onChange={(v: number) => updateField('travelCost', v)} disabled={!permissions.canEditFinancials} />
                   <MonetaryInput label="Custo de Ajudantes / Terceiros" value={budget.helperCost} onChange={(v: number) => updateField('helperCost', v)} disabled={!permissions.canEditFinancials} />
                   <MonetaryInput label="Outros Custos Diretos" value={budget.otherCosts} onChange={(v: number) => updateField('otherCosts', v)} disabled={!permissions.canEditFinancials} />
                </div>
             </SurfaceCard>
             <ContextBanner title="Análise de Margem" meta={`Os custos logísticos consomem ${formatPercent((budget.travelCost + budget.helperCost + budget.otherCosts) / (budget.chargedValue || 1))} da sua receita bruta.`} icon={<Activity size={18} />} />
          </div>
        )}

        {/* STEP 7: TAXAS */}
        {currentStep === 7 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <SurfaceCard padding="lg" variant="elevated">
                <SectionLabel className="mb-10 text-[var(--accent-gold)]">Impostos e Descontos</SectionLabel>
                <div className="flex flex-col gap-8">
                   <MonetaryInput label="Impostos e Taxas Operacionais" value={budget.fees} onChange={(v: number) => updateField('fees', v)} disabled={!permissions.canEditFinancials} />
                   <MonetaryInput label="Desconto Comercial" value={budget.discounts} onChange={(v: number) => updateField('discounts', v)} disabled={!permissions.canEditFinancials} />
                </div>
             </SurfaceCard>
             <div className="px-2">
                <ValueBlock label="Custo Total de Operação" value={formatCurrencyBRL(preview?.totalCost || 0)} variant="danger" />
             </div>
          </div>
        )}

        {/* STEP 8: ESTRATÉGIA */}
        {currentStep === 8 && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <HeroCard 
              primaryValue={<>R$ <MoneyValue value={budget.chargedValue} /></>}
              subtitle="PREÇO FINAL PROPOSTO"
              className="glow-gold"
            >
              <div className="flex flex-wrap items-center gap-6 mt-4 uppercase tracking-[0.2em] font-black font-mono">
                <div className="flex flex-col gap-1">
                   <SectionLabel className="!text-[8px] opacity-40">LUCRO_LÍQUIDO</SectionLabel>
                   <span className="text-[var(--accent-green)] text-lg num"><MoneyValue value={preview?.grossProfit || 0} /></span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col gap-1">
                   <SectionLabel className="!text-[8px] opacity-40">MARGEM_OP</SectionLabel>
                   <span className="text-[var(--accent-gold)] text-lg num">{formatPercent(preview?.marginPercent || 0)}</span>
                </div>
              </div>
            </HeroCard>
            
            <SurfaceCard padding="lg" variant="elevated">
              <SectionLabel className="mb-10 text-[var(--accent-gold)]">Ajuste Comercial Final</SectionLabel>
              <MonetaryInput label="Definir Valor Comercial" value={budget.chargedValue} onChange={(v: number) => updateField('chargedValue', v)} disabled={!permissions.canEditFinancials} />
            </SurfaceCard>
          </div>
        )}

        {currentStep >= 9 && currentStep <= 11 && <div className="animate-in fade-in duration-300">
           {currentStep === 9 && <SurfaceCard padding="lg"><SectionLabel className="mb-8">Termos</SectionLabel><TextArea label="Notas Comercial" value={budget.commercialNotes || ''} onChange={v => updateField('commercialNotes', v)} rows={5} /></SurfaceCard>}
           {currentStep === 10 && <FieldWorkTool budget={budget} onUpdateNotes={(v: string) => updateField('notes', v)} isReadOnly={!permissions.canEditNotes} />}
           {currentStep === 11 && <BudgetSummaryView budget={budget} onArchived={onBack} />}
        </div>}

      </div>

      <OperationalDock>
        {currentStep > 1 && currentStep < 11 && (
          <button 
            onClick={handleBackStep} 
            className="operational-dock-nav"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <button 
          onClick={currentStep < 11 ? handleNextStep : handleExit} 
          className={cn(
            "operational-dock-cta",
            currentStep === 11 && "danger"
          )}
        >
          <span>{currentStep < 11 ? (BUDGET_WORKFLOW_MAP[currentStep]?.actionLabel?.toUpperCase() || "CONTINUAR") : "SAIR DO PIPELINE"}</span> 
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </OperationalDock>

      <Modal isOpen={showFinalizeModal} title="Auditoria Real" confirmLabel="Consolidar Caixa" onClose={cancelFinalize} onConfirm={confirmFinalize}>
        <div className="flex flex-col gap-8 py-4">
          <p className="text-sm font-medium text-white/40 leading-relaxed">Confirme os valores reais para fechar o caixa.</p>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <SectionLabel>Faturamento</SectionLabel>
              <strong className="text-xl text-white num"><MoneyValue value={budget.chargedValue - budget.discounts} /></strong>
            </div>
            <div className="pt-2">
              <SectionLabel className="!text-[var(--accent-gold)] mb-3">Lucro Líquido Real</SectionLabel>
              <p className="num text-4xl font-bold text-[var(--accent-gold)] tracking-tighter">{formatCurrencyBRL(preview?.grossProfit || 0)}</p>
            </div>
          </div>
        </div>
      </Modal>
      </div>

      {isSiteModalOpen && budget.clientId && (
        <FastSiteCreationModal 
          clientId={budget.clientId} 
          isOpen={isSiteModalOpen} 
          onClose={() => setIsSiteModalOpen(false)} 
          onSuccess={async (siteId) => {
             setIsSiteModalOpen(false);
             const sites = await siteService.getByClientId(budget.clientId!);
             if (sites) setClientSites(sites);
             updateField('siteId', siteId);
          }} 
        />
      )}
    </ScreenContainer>
  );
});
