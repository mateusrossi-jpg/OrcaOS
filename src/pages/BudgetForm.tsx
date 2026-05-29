import React, { useState, useEffect } from 'react';
import { FileDown, Send, Lock, ArrowRight, X } from "lucide-react";
import { BUDGET_STATUS } from '../domain/budget';
import { formatCurrencyBRL, formatPercent } from '../utils/formatters';
import { useClients } from '../hooks/useClients';
import { useBudgetForm } from '../hooks/useBudgetForm';
import { BUDGET_WORKFLOW_MAP, type WorkflowStepId } from '../domain/budgetWorkflow';
import { WorkflowStepper } from '../app/components/ui/WorkflowStepper';
import { PremiumCatalogWorkspace } from '../features/catalog/components/PremiumCatalogWorkspace';
import type { CatalogHubItem } from '../features/catalog/types/catalogTypes';
import { BudgetSummaryView } from '../features/budgets/components/BudgetSummaryView';
import { FieldWorkTool } from '../features/budgets/components/FieldWorkTool';
import { 
  PageShell,
  Card,
  Input,
  Select,
  MonetaryInput,
  StatusPill,
  TextArea,
  Modal,
  MoneyValue,
  SectionLabel,
  ContextBanner,
  PageTitle,
  ERPLoader
} from '../app/components/ui';
import { StickyActionBar } from '../components/StickyActionBar';
import { cn } from '../utils/ui';

interface BudgetFormProps {
  id?: string | null;
  onBack?: () => void;
}

/**
 * BudgetForm V10 (Cinematic Operational Pipeline)
 * Refactored for Unified Design System.
 */
export const BudgetForm: React.FC<BudgetFormProps> = ({ id, onBack }) => {
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

  useEffect(() => {
    if (!isLoading && budget.status) {
      if (budget.status === BUDGET_STATUS.FINALIZADO) setCurrentStep(11);
      else if ((budget.status === BUDGET_STATUS.EM_EXECUCAO || budget.status === BUDGET_STATUS.AUTORIZADO) && currentStep < 10) setCurrentStep(10);
      else if (budget.status === BUDGET_STATUS.ENVIADO && currentStep < 9) setCurrentStep(9);
    }
  }, [isLoading, budget.status, currentStep]);

  const handleAddFromCatalog = (items: CatalogHubItem[]) => {
    items.forEach(item => addItem(item));
    setShowCatalog(false);
  };

  const handleNextStep = async () => {
    await saveDraft();
    if (currentStep < 11) {
      setCurrentStep((prev) => (prev + 1) as WorkflowStepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) return <PageShell><ERPLoader message="Abrindo pipeline..." /></PageShell>;

  const services = (budget.items || []).filter(item => item.category !== 'material');
  const materials = (budget.items || []).filter(item => item.category === 'material');

  return (
    <PageShell className={cn("pb-48", isSaving && "opacity-70 pointer-events-none")}>
      
      {/* 1. CINEMATIC HEADER */}
      <PageTitle 
        onBack={onBack}
        eyebrow="Pipeline Operacional"
        title={budget.title || 'Novo Projeto'}
        action={<StatusPill status={budget.status} />}
      />

      {/* 2. SILENT PROGRESSION HUD */}
      <div className="mb-12">
        <WorkflowStepper 
          currentStep={currentStep} 
          workflowMap={BUDGET_WORKFLOW_MAP} 
          onStepClick={(id) => setCurrentStep(id)} 
        />
      </div>

      {error && (
        <div className="mb-8 flex items-center justify-between rounded-xl bg-destructive/10 border border-destructive/20 p-shell text-ui-base font-bold text-destructive">
          <span>{error}</span>
          <button onClick={clearError} className="p-2 -mr-2"><X className="h-4 w-4" /></button>
        </div>
      )}

      {isReadOnly && currentStep < 10 && (
        <ContextBanner
          title="Stage Locked"
          meta="Este estágio foi travado para manter a integridade operacional."
          icon={<Lock className="h-4 w-4" />}
          className="mb-12"
        />
      )}

      {/* 3. EDITORIAL STAGES */}
      
      <div className="flex flex-col gap-lg">
        {/* IDENTIFICAÇÃO */}
        {(currentStep <= 3) && (
          <div className="flex flex-col gap-md animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="p-card">
              <SectionLabel className="mt-0 mb-8 text-primary">Contratante</SectionLabel>
              <div className="flex flex-col gap-md">
                <Select
                  label="Selecionar Cliente"
                  value={budget.clientId || ''}
                  onChange={(val: string) => {
                    const client = clients.find(c => c.id === val);
                    updateField('clientId', val);
                    updateField('clientName', client?.name || '');
                  }}
                  disabled={!permissions.canEditClient}
                >
                  <option value="">Cliente Avulso</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                {!budget.clientId && (
                  <Input
                    label="Nome do Cliente"
                    value={budget.clientName || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('clientName', e.target.value)}
                    disabled={!permissions.canEditClient}
                  />
                )}
              </div>
            </Card>

            <Card className="p-card">
              <SectionLabel className="mt-0 mb-8 text-primary">Escopo do Serviço</SectionLabel>
              <div className="flex flex-col gap-md">
                <Input label="Título do Projeto" value={budget.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('title', e.target.value)} disabled={!permissions.canEditTitle} placeholder="Ex: Reforma Elétrica Residencial" />
                <TextArea label="Levantamento Técnico Inicial" value={budget.technicalNotes || ''} onChange={(val: string) => updateField('technicalNotes', val)} disabled={!permissions.canEditNotes} rows={5} placeholder="Descreva os problemas encontrados e a solução proposta..." />
              </div>
            </Card>
          </div>
        )}

        {/* LEVANTAMENTO DE ITENS & MATERIAIS */}
        {(currentStep === 4 || currentStep === 5) && (
          <div className="flex flex-col gap-md animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="p-card">
              <SectionLabel 
                className="mt-0 mb-8 text-primary" 
                action={<button onClick={() => setShowCatalog(true)} className="text-ui-xs text-[var(--accent-gold)] font-bold">+ CATÁLOGO</button>}
              >
                {currentStep === 4 ? "Mão de Obra e Serviços" : "Insumos e Materiais"}
              </SectionLabel>
              
              <div className="flex flex-col gap-sm">
                {(currentStep === 4 ? services : materials).length === 0 ? (
                  <div className="py-20 text-center rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
                    <p className="text-ui-xs text-[var(--text-muted)] opacity-40">Nenhum item lançado</p>
                  </div>
                ) : (
                  (currentStep === 4 ? services : materials).map(item => (
                    <div key={item.id} className="p-5 rounded-xl bg-white/[0.02] border var(--border-subtle) flex flex-col gap-md transition-all hover:bg-white/[0.04]">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-ui-md text-[var(--text-primary)]">{item.description}</span>
                        {permissions.canEditItems && (
                          <button onClick={() => removeItem(item.id)} className="text-[var(--accent-red)] p-1.5 -mr-1.5 opacity-40 hover:opacity-100 transition-opacity">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24">
                          <Input label="Qtde" type="number" value={item.quantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, { quantity: Number(e.target.value) })} disabled={!permissions.canEditItems} />
                        </div>
                        <div className="flex-1">
                          <MonetaryInput label="Valor Unitário" value={item.unitPrice} onChange={(val: number) => updateItem(item.id, { unitPrice: val })} disabled={!permissions.canEditItems} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* CUSTOS & MARGEM */}
        {(currentStep >= 6 && currentStep <= 8) && (
          <div className="flex flex-col gap-md animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="p-card border-l-4 border-l-[var(--accent-gold)]">
              <SectionLabel className="mt-0 mb-8 text-primary">Preço de Venda Final</SectionLabel>
              <div className="flex flex-col mb-10">
                <span className="num text-hero leading-none tracking-tighter text-[var(--accent-gold)] mb-4">
                  <MoneyValue value={budget.chargedValue} />
                </span>
                <div className="flex items-center gap-4 text-ui-xs text-[var(--text-muted)] opacity-60">
                  <span className="flex items-center gap-2">LUCRO: <MoneyValue value={preview?.grossProfit || 0} compact /></span>
                  <span className="opacity-20">|</span>
                  <span className="flex items-center gap-2">MARGEM: {formatPercent(preview?.marginPercent || 0)}</span>
                </div>
              </div>
              <MonetaryInput label="Valor Proposto ao Cliente" value={budget.chargedValue} onChange={(v: number) => updateField('chargedValue', v)} disabled={!permissions.canEditFinancials} />
            </Card>
            
            <Card className="p-card">
              <SectionLabel className="mt-0 mb-8 text-primary">Custos Logísticos</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <MonetaryInput label="Logística / Transporte" value={budget.travelCost} onChange={(v: number) => updateField('travelCost', v)} disabled={!permissions.canEditFinancials} />
                <MonetaryInput label="Ajudantes / Diárias" value={budget.helperCost} onChange={(v: number) => updateField('helperCost', v)} disabled={!permissions.canEditFinancials} />
              </div>
            </Card>
          </div>
        )}

        {/* ENVIO E PROPOSTA */}
        {currentStep === 9 && (
          <div className="flex flex-col gap-md animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="p-card">
              <SectionLabel className="mt-0 mb-8 text-primary">Contrato e Garantia</SectionLabel>
              <TextArea
                label="Notas para o Cliente"
                value={budget.commercialNotes || ''}
                onChange={(val: string) => updateField('commercialNotes', val)}
                disabled={!permissions.canEditNotes}
                placeholder="Termos da garantia, prazos, condições de parcelamento..."
                rows={8}
              />
            </Card>
          </div>
        )}

        {/* EXECUÇÃO */}
        {currentStep === 10 && (
          <div className="animate-in fade-in duration-500">
            <FieldWorkTool budget={budget} onUpdateNotes={(v: string) => updateField('notes', v)} isReadOnly={!permissions.canEditNotes} />
          </div>
        )}

        {/* FINALIZAÇÃO */}
        {currentStep === 11 && (
          <div className="animate-in zoom-in-95 duration-500">
            <BudgetSummaryView budget={budget} onArchived={onBack} />
          </div>
        )}
      </div>

      {/* 4. FAST FOOTER ACTIONS (Cinematic) */}
      <StickyActionBar
        actions={
          <div className="flex w-full gap-sm p-shell">
            <button 
              onClick={handleNextStep}
              className="flex-[4] h-16 flex items-center justify-center gap-3 rounded-[var(--radius-card)] bg-[var(--text-primary)] text-[var(--bg-primary)] py-5 text-ui-base font-bold shadow-card active:scale-[0.97] transition-all"
            >
              {BUDGET_WORKFLOW_MAP[currentStep]?.actionLabel?.toUpperCase() || "CONTINUAR"} <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </button>
            
            {currentStep === 9 && budget.status === BUDGET_STATUS.INICIADO && (
              <button onClick={markAsSent} className="flex-[1.5] h-16 rounded-[var(--radius-card)] border var(--border-soft) bg-[var(--bg-surface-glass)] backdrop-blur-xl py-5 text-ui-sm font-bold text-white active:scale-[0.95] transition-all flex items-center justify-center">
                <Send className="h-5 w-5" strokeWidth={2.5} />
              </button>
            )}

            <button onClick={() => window.print()} className="w-16 h-16 grid place-items-center rounded-[var(--radius-card)] border var(--border-soft) bg-[var(--bg-surface-glass)] backdrop-blur-xl text-[var(--text-muted)] active:scale-[0.95] transition-all shrink-0">
              <FileDown className="h-5 w-5" />
            </button>
          </div>
        }
      />

      {/* Finalize Modal & Catalog remain the same but purified in visual */}
      <Modal
        isOpen={showFinalizeModal}
        title="Auditoria Real"
        confirmLabel="Consolidar Caixa"
        onClose={cancelFinalize}
        onConfirm={confirmFinalize}
      >
        <div className="flex flex-col gap-lg py-4">
          <p className="text-ui-base font-medium text-[var(--text-secondary)] leading-relaxed">Confirme os valores reais para fechar o caixa desta operação.</p>
          <div className="flex flex-col gap-md">
            <div className="flex justify-between items-center border-b var(--border-subtle) pb-4">
              <span className="text-ui-xs text-[var(--text-muted)]">Faturamento</span>
              <strong className="num text-h3 text-[var(--text-primary)]"><MoneyValue value={budget.chargedValue - budget.discounts} /></strong>
            </div>
            <div className="flex justify-between items-center border-b var(--border-subtle) pb-4">
              <span className="text-ui-xs text-[var(--text-muted)]">Custos Totais</span>
              <strong className="num text-h3 text-[var(--accent-red)]"><MoneyValue value={preview?.totalCost || 0} /></strong>
            </div>
            <div className="pt-2">
              <span className="text-ui-xs text-[var(--accent-gold)] block mb-3">Lucro Líquido Real</span>
              <p className="num text-hero font-bold text-[var(--accent-gold)] leading-none tracking-tighter">{formatCurrencyBRL(preview?.grossProfit || 0)}</p>
            </div>
          </div>
        </div>
      </Modal>

      {showCatalog && (
        <Modal isOpen={showCatalog} title="CATÁLOGO PROFISSIONAL" onClose={() => setShowCatalog(false)}>
          <div className="-m-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <PremiumCatalogWorkspace onSendToBudget={handleAddFromCatalog} />
          </div>
        </Modal>
      )}

    </PageShell>
  );
};
