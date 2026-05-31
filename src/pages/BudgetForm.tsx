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
import { StickyActionBar } from '../components/StickyActionBar';
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

  return (
    <ScreenContainer className={cn("pb-48 px-0 pt-0", isSaving && "opacity-75 pointer-events-none")}>
      
      {/* ━━━ CINEMATIC HEADER ━━━ */}
      <div className="px-6 pt-12 pb-6 flex flex-col gap-6">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col">
            <button 
              onClick={handleExit} 
              className="flex items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors mb-3 font-mono text-[9px] uppercase tracking-wider w-fit"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--accent-gold)]" /> Voltar
            </button>
            
            <div className="flex items-center gap-2 mb-1.5">
              <SectionLabel className="!text-[9px] tracking-[0.22em]">{DAY}</SectionLabel>
              <span className="w-0.5 h-0.5 rounded-full bg-[#3C3C3C]" />
              <SectionLabel className="!text-[9px] tracking-[0.14em]">{DATE_STR}</SectionLabel>
            </div>
            
            <Heading className="text-[26px]">
              {budget.title || 'Novo Orçamento.'}
            </Heading>
          </div>

          <div className="mt-1">
            <StatusPill status={budget.status} />
          </div>
        </div>

        {/* ━━━ DYNAMIC KPI STRIP ━━━ */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-0.5 mt-2">
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
        </div>
      </div>

      <div className="px-6 flex flex-col gap-6">

      <div className="mb-10">
        <WorkflowStepper currentStep={currentStep} workflowMap={BUDGET_WORKFLOW_MAP} onStepClick={async (id) => { await saveDraft(); setCurrentStep(id); }} />
      </div>

      {error && (
        <SurfaceCard className="mb-4 border-[#C0392B]/30 bg-[#C0392B]/5 !p-4" padding="none">
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
            <SurfaceCard padding="lg">
              <SectionLabel className="mb-8">Contratante Principal</SectionLabel>
              <div className="flex flex-col gap-6">
                <Select label="Selecionar Cliente da Base" value={budget.clientId || ''} onChange={(val: string) => { const client = clients.find(c => c.id === val); updateField('clientId', val); updateField('clientName', client?.name || ''); updateField('siteId', ''); }} disabled={!permissions.canEditClient}>
                  <option value="">Cliente Avulso (Não cadastrado)</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                {budget.clientId && (
                  <div className="animate-in fade-in slide-in-from-top-1">
                    <Select label="Local de Atendimento (Unidade)" value={budget.siteId || ''} onChange={(val: string) => updateField('siteId', val)} disabled={!permissions.canEditClient || isLoadingSites}>
                      <option value="">Endereço principal...</option>
                      {clientSites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.fullAddress.slice(0, 30)}...)</option>)}
                    </Select>
                  </div>
                )}
                {!budget.clientId && <Input label="Nome do Cliente (Livre)" value={budget.clientName || ''} onChange={(e) => updateField('clientName', e.target.value)} disabled={!permissions.canEditClient} placeholder="Digite o nome completo" required />}
              </div>
            </SurfaceCard>
          </div>
        )}

        {/* STEP 2: ESCOPO */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <SurfaceCard padding="lg">
              <SectionLabel className="mb-8">Escopo Operacional</SectionLabel>
              <div className="flex flex-col gap-6">
                <Input label="Título do Projeto" value={budget.title} onChange={(e) => updateField('title', e.target.value)} disabled={!permissions.canEditTitle} placeholder="Ex: Reforma Elétrica" />
                <Input label="Prazo de Execução Sugerido" value={budget.executionDeadline || ''} onChange={(e) => updateField('executionDeadline', e.target.value)} disabled={!permissions.canEditNotes} placeholder="Ex: 5 dias úteis" />
              </div>
            </SurfaceCard>
          </div>
        )}

        {/* STEP 3: TÉCNICO */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <SurfaceCard padding="lg">
              <SectionLabel className="mb-8">Relatório Técnico</SectionLabel>
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
             <div className="flex justify-between items-center px-2">
                <SectionLabel>Composição de Serviços</SectionLabel>
                <div className="flex gap-2">
                   <button onClick={() => setShowCatalog(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] text-white font-bold font-mono tracking-widest uppercase hover:bg-white/[0.08]">
                      <Plus size={11} className="text-[#D4A94E]" /> CATÁLOGO
                   </button>
                   <button onClick={() => addItem({ kind: 'labor', title: 'Novo Serviço' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] text-white font-bold font-mono tracking-widest uppercase hover:bg-white/[0.08]">
                      <Plus size={11} /> MANUAL
                   </button>
                </div>
             </div>

             <SurfaceCard padding="none" className="overflow-hidden">
                {budget.items.filter(it => it.category === 'labor').length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                     <Wrench size={32} className="mb-4" />
                     <span className="text-[10px] font-bold tracking-widest uppercase font-mono">Nenhum serviço técnico adicionado.</span>
                  </div>
                ) : (
                  budget.items.filter(it => it.category === 'labor').map((item, idx) => (
                    <InteractiveRow 
                      key={item.id} 
                      className={cn(idx !== 0 && "border-t border-white/[0.05]")}
                      leftSlot={<div className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-mono text-white/40">{idx + 1}</div>}
                    >
                       <div className="flex-1 flex flex-col gap-3 pr-2">
                          <input 
                            value={item.description} 
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="bg-transparent border-none text-[14px] font-bold text-white outline-none p-0 w-full placeholder:text-white/10"
                            placeholder="Descrição do serviço..."
                          />
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-2 py-1 rounded-md">
                                <span className="text-[8px] font-mono text-white/30 uppercase">QTD</span>
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                                  className="bg-transparent border-none text-[12px] font-bold text-[#D4A94E] outline-none p-0 w-10 num"
                                />
                             </div>
                             <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-2 py-1 rounded-md">
                                <span className="text-[8px] font-mono text-white/30 uppercase">UNIT</span>
                                <input 
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                                  className="bg-transparent border-none text-[12px] font-bold text-white/70 outline-none p-0 w-16 num"
                                />
                             </div>
                             <div className="ml-auto text-[13px] font-bold text-white num">
                                {formatCurrencyBRL(item.quantity * item.unitPrice)}
                             </div>
                             <button onClick={() => removeItem(item.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                             </button>
                          </div>
                       </div>
                    </InteractiveRow>
                  ))
                )}
             </SurfaceCard>
             <div className="flex justify-end pr-2">
                <div className="flex items-center gap-3">
                   <span className="text-[9px] font-bold font-mono text-white/30 tracking-widest uppercase">SUBTOTAL_SERVIÇOS</span>
                   <span className="text-lg font-bold text-white num">
                      {formatCurrencyBRL(budget.items.filter(it => it.category === 'labor').reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0))}
                   </span>
                </div>
             </div>
          </div>
        )}

        {/* STEP 5: MATERIAIS */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center px-2">
                <SectionLabel>Insumos e Materiais</SectionLabel>
                <div className="flex gap-2">
                   <button onClick={() => setShowCatalog(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] text-white font-bold font-mono tracking-widest uppercase hover:bg-white/[0.08]">
                      <Plus size={11} className="text-[#D4A94E]" /> CATÁLOGO
                   </button>
                   <button onClick={() => addItem({ kind: 'material', title: 'Novo Material' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[10px] text-white font-bold font-mono tracking-widest uppercase hover:bg-white/[0.08]">
                      <Plus size={11} /> MANUAL
                   </button>
                </div>
             </div>

             <SurfaceCard padding="none" className="overflow-hidden">
                {budget.items.filter(it => it.category === 'material').length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                     <Package size={32} className="mb-4" />
                     <span className="text-[10px] font-bold tracking-widest uppercase font-mono">Nenhum material de aplicação.</span>
                  </div>
                ) : (
                  budget.items.filter(it => it.category === 'material').map((item, idx) => (
                    <InteractiveRow 
                      key={item.id} 
                      className={cn(idx !== 0 && "border-t border-white/[0.05]")}
                      leftSlot={<div className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-mono text-white/40">{idx + 1}</div>}
                    >
                       <div className="flex-1 flex flex-col gap-3 pr-2">
                          <input 
                            value={item.description} 
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="bg-transparent border-none text-[14px] font-bold text-white outline-none p-0 w-full placeholder:text-white/10"
                            placeholder="Descrição do material..."
                          />
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-2 py-1 rounded-md">
                                <span className="text-[8px] font-mono text-white/30 uppercase">QTD</span>
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                                  className="bg-transparent border-none text-[12px] font-bold text-[#D4A94E] outline-none p-0 w-10 num"
                                />
                             </div>
                             <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-2 py-1 rounded-md">
                                <span className="text-[8px] font-mono text-white/30 uppercase">CUSTO</span>
                                <input 
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                                  className="bg-transparent border-none text-[12px] font-bold text-white/70 outline-none p-0 w-16 num"
                                />
                             </div>
                             <div className="ml-auto text-[13px] font-bold text-white num">
                                {formatCurrencyBRL(item.quantity * item.unitPrice)}
                             </div>
                             <button onClick={() => removeItem(item.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                <Trash2 size={14} />
                             </button>
                          </div>
                       </div>
                    </InteractiveRow>
                  ))
                )}
             </SurfaceCard>
             <div className="flex justify-end pr-2">
                <div className="flex items-center gap-3">
                   <span className="text-[9px] font-bold font-mono text-white/30 tracking-widest uppercase">SUBTOTAL_MATERIAIS</span>
                   <span className="text-lg font-bold text-white num">
                      {formatCurrencyBRL(budget.items.filter(it => it.category === 'material').reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0))}
                   </span>
                </div>
             </div>
          </div>
        )}

        {/* STEP 6: LOGÍSTICA */}
        {currentStep === 6 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <SurfaceCard padding="lg">
                <SectionLabel className="mb-8">Custos de Logística e Apoio</SectionLabel>
                <div className="flex flex-col gap-6">
                   <MonetaryInput label="Deslocamento / Combustível" value={budget.travelCost} onChange={(v: number) => updateField('travelCost', v)} disabled={!permissions.canEditFinancials} />
                   <MonetaryInput label="Custo de Ajudantes / Terceiros" value={budget.helperCost} onChange={(v: number) => updateField('helperCost', v)} disabled={!permissions.canEditFinancials} />
                   <MonetaryInput label="Outros Custos Diretos" value={budget.otherCosts} onChange={(v: number) => updateField('otherCosts', v)} disabled={!permissions.canEditFinancials} />
                </div>
             </SurfaceCard>
             <ContextBanner title="Impacto na Margem" meta={`Os custos logísticos representam ${formatPercent((budget.travelCost + budget.helperCost + budget.otherCosts) / (budget.chargedValue || 1))} do faturamento.`} icon={<Activity size={14} />} />
          </div>
        )}

        {/* STEP 7: TAXAS */}
        {currentStep === 7 && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <SurfaceCard padding="lg">
                <SectionLabel className="mb-8">Impostos e Descontos</SectionLabel>
                <div className="flex flex-col gap-6">
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
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <SurfaceCard variant="elevated" padding="lg" className="border-t-[var(--accent-gold)]/20">
              <SectionLabel className="mb-8 !text-[var(--accent-gold)]">Preço Final Proposto</SectionLabel>
              <div className="flex flex-col mb-10">
                <div className="text-[52px] font-bold tracking-tightest leading-none text-[var(--accent-gold)] flex items-baseline num">
                  R$ <MoneyValue value={budget.chargedValue} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/40 mt-8 uppercase tracking-widest font-black font-mono">
                  <span className="flex items-center gap-1.5">LUCRO: <span className="text-[var(--accent-green)] num"><MoneyValue value={preview?.grossProfit || 0} /></span></span>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="flex items-center gap-1.5">MARGEM: <span className="text-[var(--accent-gold)] num">{formatPercent(preview?.marginPercent || 0)}</span></span>
                </div>
              </div>
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

      <StickyActionBar
        actions={
          <div className="flex w-full gap-3 px- shell pb-8 pt-3 items-center">
            {currentStep > 1 && currentStep < 11 && (
              <DangerButton onClick={handleBackStep} className="w-16 h-16 !rounded-2xl shrink-0">
                <ChevronLeft className="h-6 w-6" strokeWidth={3} />
              </DangerButton>
            )}
            <PrimaryButton 
              onClick={currentStep < 11 ? handleNextStep : handleExit} 
              className={cn(
                "flex-1 h-16 !rounded-2xl !text-[13px] font-black tracking-[0.2em]",
                currentStep === 11 && "!bg-[#C0392B] !text-white shadow-[0_8px_32px_rgba(192,57,43,0.3)]" // Exit should be red
              )}
            >
              <span>{currentStep < 11 ? (BUDGET_WORKFLOW_MAP[currentStep]?.actionLabel?.toUpperCase() || "CONTINUAR") : "SAIR_DO_PIPELINE"}</span> 
              <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </PrimaryButton>
          </div>
        }
      />

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

      {showCatalog && (
        <Modal isOpen={showCatalog} title="CATÁLOGO PROFISSIONAL" onClose={() => setShowCatalog(false)}>
          <div className="-m-8 max-h-[80vh] overflow-y-auto">
            <PremiumCatalogWorkspace onSendToBudget={(items) => { items.forEach(it => addItem(it)); setShowCatalog(false); }} />
          </div>
        </Modal>
      )}
      </div>
    </ScreenContainer>
  );
});
