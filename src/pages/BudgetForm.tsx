import React from 'react';
import { BUDGET_STATUS, type BudgetItem, type BudgetStatus } from '../domain/budget';
import { formatCurrencyBRL, formatPercent } from '../utils/formatters';
import { useClients } from '../hooks/useClients';
import { useBudgetForm } from '../hooks/useBudgetForm';
import { BUDGET_WORKFLOW_MAP, type WorkflowStepId } from '../domain/budgetWorkflow';
import { WorkflowStepper } from '../app/components/ui/WorkflowStepper';
import { Client } from '../domain/client';
import { PremiumCatalogWorkspace } from '../features/catalog/components/PremiumCatalogWorkspace';
import type { CatalogHubItem } from '../features/catalog/types/catalogTypes';
import { BudgetSummaryView } from '../features/budgets/components/BudgetSummaryView';
import { FieldWorkTool } from '../features/budgets/components/FieldWorkTool';
import { 
  PageShell,
  PageHeader,
  Surface,
  Input,
  Select,
  MonetaryInput,
  PrimaryButton,
  SecondaryButton,
  Badge,
  SectionTitle,
  ContextBanner,
  TextArea,
  Modal,
  ListCard,
  MoneyValue,
} from '../app/components/ui';
import { StickyActionBar } from '../components/StickyActionBar';

interface BudgetFormProps {
  id?: string | null;
  onBack?: () => void;
}

const mapStatusToStep = (status: BudgetStatus): WorkflowStepId => {
  if (status === BUDGET_STATUS.ENVIADO) return 9; // Proposta
  if (status === BUDGET_STATUS.AUTORIZADO || status === BUDGET_STATUS.EM_EXECUCAO) return 10; // Execução
  if (status === BUDGET_STATUS.FINALIZADO || status === BUDGET_STATUS.ARQUIVADO) return 11; // Fechamento
  return 1; // Cliente
};

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
    markAsAuthorized,
    markAsRejected,
    markAsExecuting,
    archiveBudget,
    requestFinalize,
    cancelFinalize,
    confirmFinalize,
    error,
    clearError,
    isReadOnly,
  } = useBudgetForm(id);

  const [currentStep, setCurrentStep] = React.useState<WorkflowStepId>(1);
  const { clients } = useClients();
  const [showCatalog, setShowCatalog] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && budget.status) {
      setCurrentStep(mapStatusToStep(budget.status));
    }
  }, [isLoading, budget.status]);

  const handleNavigate = (stepId: WorkflowStepId) => {
    setCurrentStep(stepId);
  };

  const handleAddFromCatalog = (items: CatalogHubItem[]) => {
    items.forEach(item => addItem(item));
    setShowCatalog(false);
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="empty-state-card">
          <strong>Carregando orçamento...</strong>
        </div>
      </PageShell>
    );
  }

  const services = (budget.items || []).filter(item => item.category !== 'material');
  const materials = (budget.items || []).filter(item => item.category === 'material');

  return (
    <PageShell className={`aferix-budget-form-screen ${isSaving ? 'is-saving' : ''} ${isReadOnly ? 'is-read-only' : ''}`}>
      <PageHeader 
        title={currentStep === 11 ? 'Finalização do Projeto' : (budget.title || (id ? 'Editar orçamento' : 'Novo orçamento'))} 
        sourceLabel={budget.status.toUpperCase()}
        action={
          <SecondaryButton onClick={onBack}>
            Voltar
          </SecondaryButton>
        }
      />

      {isReadOnly && currentStep < 11 && (
        <div className="aferix-mb-md">
          <ContextBanner
            title={`Orçamento bloqueado para edição (Status: ${budget.status.replace('_', ' ').toUpperCase()})`}
            meta="Os dados principais, itens e custos não podem mais ser alterados."
            icon={<span className="nav-icon">🔒</span>}
          />
        </div>
      )}

      {error && (
        <div className="aferix-card-warning aferix-mb-md">
          <div className="aferix-d-flex aferix-justify-between aferix-align-center">
            <span className="aferix-font-bold aferix-font-xs">{error}</span>
            <button onClick={clearError} className="ghost-action">✕</button>
          </div>
        </div>
      )}

      <WorkflowStepper 
        currentStep={currentStep} 
        workflowMap={BUDGET_WORKFLOW_MAP} 
        onStepClick={handleNavigate} 
      />

      <div className="aferix-d-flex aferix-flex-column aferix-gap-md aferix-mt-lg">
        
        {/* ETAPA 1: CLIENTE */}
        {currentStep === 1 && (
          <Surface elevation={1} padding="md">
            <SectionTitle title="Vincular Cliente" eyebrow="Passo 1" />
            <Select
              label="Selecione um Cliente"
              value={budget.clientId || ''}
              onChange={(val) => {
                const selectedClient = clients.find((c: Client) => c.id === val);
                updateField('clientId', val);
                updateField('clientName', selectedClient?.name || '');
              }}
              disabled={!permissions.canEditClient}
            >
              <option value="">Cliente Avulso (Nome Livre)</option>
              {clients.map((c: Client) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            {!budget.clientId && (
              <Input
                label="Nome do Cliente"
                value={budget.clientName || ''}
                onChange={(e) => updateField('clientName', e.target.value)}
                disabled={!permissions.canEditClient}
                placeholder="Digite o nome completo..."
              />
            )}
          </Surface>
        )}

        {/* ETAPA 2: ESCOPO */}
        {currentStep === 2 && (
          <Surface elevation={1} padding="md">
            <SectionTitle title="Escopo do Projeto" eyebrow="Passo 2" />
            <Input
              label="Título do Orçamento"
              value={budget.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={!permissions.canEditTitle}
              placeholder="Ex: Instalação Elétrica Residencial"
              autoFocus
            />
            <Input
              label="Prazo Estimado de Execução"
              value={budget.executionDeadline || ''}
              onChange={(e) => updateField('executionDeadline', e.target.value)}
              disabled={!permissions.canEditTitle}
              placeholder="Ex: 3 dias úteis"
            />
          </Surface>
        )}

        {/* ETAPA 3: TÉCNICO */}
        {currentStep === 3 && (
          <Surface elevation={1} padding="md">
            <SectionTitle title="Levantamento Técnico" eyebrow="Passo 3" />
            <TextArea
              label="Descrição do Problema / Necessidade"
              value={budget.technicalNotes || ''}
              onChange={(val) => updateField('technicalNotes', val)}
              disabled={!permissions.canEditNotes}
              placeholder="Descreva o cenário encontrado no local..."
              rows={5}
            />
          </Surface>
        )}

        {/* ETAPA 4: SERVIÇOS (M. Obra) */}
        {currentStep === 4 && (
          <div className="aferix-items-section">
            <SectionTitle 
              title="Mão de Obra e Serviços" 
              eyebrow="Passo 4"
              action={
                permissions.canEditItems && (
                  <button 
                    type="button"
                    className="ghost-action aferix-font-bold" 
                    onClick={() => setShowCatalog(true)}
                    style={{ color: 'var(--brand-primary)', fontSize: '0.85rem' }}
                  >
                    + Catálogo
                  </button>
                )
              }
            />
            <ListCard>
              {services.length === 0 ? (
                <div className="aferix-p-md aferix-text-center aferix-text-muted">
                  <small>Nenhum serviço adicionado.</small>
                </div>
              ) : (
                services.map((item: BudgetItem) => (
                  <div key={item.id} className="aferix-budget-item-row aferix-d-flex aferix-flex-column aferix-gap-xs" style={{ padding: '12px', borderBottom: '1px solid var(--border-soft)' }}>
                    <div className="aferix-d-flex aferix-justify-between aferix-align-center">
                      <strong className="aferix-font-sm">{item.description}</strong>
                      {permissions.canEditItems && (
                        <button type="button" className="ghost-action" onClick={() => removeItem(item.id)} style={{ color: 'var(--status-danger)' }}>✕</button>
                      )}
                    </div>
                    <div className="aferix-d-flex aferix-align-center aferix-gap-md">
                      <div style={{ width: '70px' }}>
                        <Input
                          label="Qtd"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                          disabled={!permissions.canEditItems}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <MonetaryInput
                          label="Preço Unit."
                          value={item.unitPrice}
                          onChange={(val) => updateItem(item.id, { unitPrice: val })}
                          disabled={!permissions.canEditItems}
                        />
                      </div>
                      <div className="aferix-text-right" style={{ paddingTop: '14px' }}>
                        <MoneyValue value={item.quantity * item.unitPrice} compact />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ListCard>
          </div>
        )}

        {/* ETAPA 5: MATERIAIS */}
        {currentStep === 5 && (
          <div className="aferix-items-section">
            <SectionTitle 
              title="Materiais e Insumos" 
              eyebrow="Passo 5"
              action={
                permissions.canEditItems && (
                  <button 
                    type="button"
                    className="ghost-action aferix-font-bold" 
                    onClick={() => setShowCatalog(true)}
                    style={{ color: 'var(--brand-primary)', fontSize: '0.85rem' }}
                  >
                    + Catálogo
                  </button>
                )
              }
            />
            <ListCard>
              {materials.length === 0 ? (
                <div className="aferix-p-md aferix-text-center aferix-text-muted">
                  <small>Nenhum material adicionado.</small>
                </div>
              ) : (
                materials.map((item: BudgetItem) => (
                  <div key={item.id} className="aferix-budget-item-row aferix-d-flex aferix-flex-column aferix-gap-xs" style={{ padding: '12px', borderBottom: '1px solid var(--border-soft)' }}>
                    <div className="aferix-d-flex aferix-justify-between aferix-align-center">
                      <strong className="aferix-font-sm">{item.description}</strong>
                      {permissions.canEditItems && (
                        <button type="button" className="ghost-action" onClick={() => removeItem(item.id)} style={{ color: 'var(--status-danger)' }}>✕</button>
                      )}
                    </div>
                    <div className="aferix-d-flex aferix-align-center aferix-gap-md">
                      <div style={{ width: '70px' }}>
                        <Input
                          label="Qtd"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                          disabled={!permissions.canEditItems}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <MonetaryInput
                          label="Preço Unit."
                          value={item.unitPrice}
                          onChange={(val) => updateItem(item.id, { unitPrice: val })}
                          disabled={!permissions.canEditItems}
                        />
                      </div>
                      <div className="aferix-text-right" style={{ paddingTop: '14px' }}>
                        <MoneyValue value={item.quantity * item.unitPrice} compact />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ListCard>
          </div>
        )}

        {/* ETAPA 6: LOGÍSTICA (CUSTOS DIRETOS) */}
        {currentStep === 6 && (
          <Surface elevation={1} padding="md">
            <SectionTitle title="Logística e Outros Custos" eyebrow="Passo 6" />
            <div className="aferix-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <MonetaryInput label="Viagem/Transporte" value={budget.travelCost} onChange={(val) => updateField('travelCost', val)} disabled={!permissions.canEditFinancials} />
              <MonetaryInput label="Ajudante / Terceiros" value={budget.helperCost} onChange={(val) => updateField('helperCost', val)} disabled={!permissions.canEditFinancials} />
              <MonetaryInput label="Compras Avulsas (Material Extra)" value={budget.materialCost} onChange={(val) => updateField('materialCost', val)} disabled={!permissions.canEditFinancials} />
              <MonetaryInput label="Outros Custos" value={budget.otherCosts} onChange={(val) => updateField('otherCosts', val)} disabled={!permissions.canEditFinancials} />
            </div>
          </Surface>
        )}

        {/* ETAPA 7: TAXAS (DEDUÇÕES) */}
        {currentStep === 7 && (
          <Surface elevation={1} padding="md">
            <SectionTitle title="Impostos e Descontos" eyebrow="Passo 7" />
            <div className="aferix-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <MonetaryInput label="Taxas (NF/Cartão)" value={budget.fees} onChange={(val) => updateField('fees', val)} disabled={!permissions.canEditFinancials} />
              <MonetaryInput label="Desconto Comercial" value={budget.discounts} onChange={(val) => updateField('discounts', val)} disabled={!permissions.canEditFinancials} />
            </div>
          </Surface>
        )}

        {/* ETAPA 8: ESTRATÉGIA (ANÁLISE DE LUCRO) */}
        {currentStep === 8 && (
          <Surface elevation={2} padding="md">
            <SectionTitle title="Preço de Venda e Margem" eyebrow="Passo 8" />
            <MonetaryInput
              label="Preço Final Proposto"
              value={budget.chargedValue}
              onChange={(val) => updateField('chargedValue', val)}
              disabled={!permissions.canEditFinancials}
            />
            <div className="aferix-mt-lg aferix-p-md" style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-soft)' }}>
              <div className="aferix-d-flex aferix-justify-between aferix-align-center">
                <div>
                  <span className="aferix-d-block aferix-font-xs aferix-text-muted">LUCRO ESTIMADO</span>
                  <strong className="aferix-font-xl" style={{ color: 'var(--status-success)' }}>{formatCurrencyBRL(preview?.grossProfit || 0)}</strong>
                </div>
                <Badge tone="success">{formatPercent(preview?.marginPercent || 0)}</Badge>
              </div>
            </div>
          </Surface>
        )}

        {/* ETAPA 9: PROPOSTA */}
        {currentStep === 9 && (
          <Surface elevation={1} padding="md">
            <SectionTitle title="Termos da Proposta" eyebrow="Passo 9" />
            <TextArea
              label="Condições para o Cliente"
              value={budget.commercialNotes || ''}
              onChange={(val) => updateField('commercialNotes', val)}
              disabled={!permissions.canEditNotes}
              placeholder="Descreva condições de pagamento, prazos e garantias..."
              rows={5}
            />
          </Surface>
        )}
...
        {/* ETAPA 10: EXECUÇÃO */}
        {currentStep === 10 && (
          <FieldWorkTool 
            budget={budget} 
            onUpdateNotes={(val) => updateField('notes', val)} 
            isReadOnly={!permissions.canEditNotes}
          />
        )}

        {/* ETAPA 11: FECHAMENTO */}
        {currentStep === 11 && (
          <BudgetSummaryView budget={budget} onArchived={onBack} />
        )}

        {/* Sticky Action Bar */}
        {currentStep < 11 && (
          <StickyActionBar
            onCancel={onBack}
            disabled={isSaving}
            actions={
              <div className="aferix-d-flex aferix-gap-sm aferix-w-full">
                <button 
                  type="button" 
                  className="sticky-save" 
                  style={{ flex: 2 }}
                  onClick={async () => {
                    await saveDraft();
                    setCurrentStep((prev) => (prev + 1) as WorkflowStepId);
                  }}
                  disabled={isSaving}
                >
                  {BUDGET_WORKFLOW_MAP[currentStep].actionLabel}
                </button>
                {currentStep >= 9 && budget.status === BUDGET_STATUS.INICIADO && (
                  <button type="button" className="sticky-secondary" style={{ flex: 1 }} onClick={markAsSent} disabled={isSaving}>
                    Enviar
                  </button>
                )}
              </div>
            }
          />
        )}
      </div>

      {/* Sticky Preview */}
      {currentStep < 11 && (
        <div className="aferix-sticky-preview">
          <ContextBanner
            title={`Margem: ${formatPercent(preview?.marginPercent || 0)}`}
            meta={`Lucro: ${formatCurrencyBRL(preview?.grossProfit || 0)} • Custo: ${formatCurrencyBRL(preview?.totalCost || 0)}`}
            icon={<span className="nav-icon">💰</span>}
          />
        </div>
      )}

      {/* Finalize Modal */}
      {showFinalizeModal && (
        <div className="aferix-modal-overlay">
          <div className="aferix-modal-card">
            <header className="aferix-modal-header">
              <h2>Revisão de Fechamento</h2>
            </header>
            <div className="aferix-modal-body aferix-d-flex aferix-flex-column aferix-gap-md">
              <div className="aferix-d-flex aferix-justify-between">
                <span className="aferix-text-muted">Receita Líquida</span>
                <strong className="aferix-font-lg">{formatCurrencyBRL((budget.chargedValue - budget.discounts) || 0)}</strong>
              </div>
              <div className="aferix-d-flex aferix-justify-between">
                <span className="aferix-text-muted">Custo Total Real</span>
                <strong className="aferix-text-red">{formatCurrencyBRL(preview?.totalCost || 0)}</strong>
              </div>
              <Surface elevation={2} className="aferix-mt-sm" padding="sm">
                <div className="aferix-d-flex aferix-justify-between aferix-align-center">
                  <div className="aferix-d-flex aferix-flex-column">
                    <span className="aferix-font-xs aferix-text-muted">LUCRO REAL</span>
                    <strong className="aferix-font-xl" style={{ color: 'var(--status-success)' }}>{formatCurrencyBRL(preview?.grossProfit || 0)}</strong>
                  </div>
                  <Badge tone="success">{formatPercent(preview?.marginPercent || 0)}</Badge>
                </div>
              </Surface>
            </div>
            <footer className="aferix-modal-footer">
              <SecondaryButton onClick={cancelFinalize}>Revisar</SecondaryButton>
              <PrimaryButton onClick={confirmFinalize}>Confirmar e Finalizar</PrimaryButton>
            </footer>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      {showCatalog && (
        <Modal
          isOpen={showCatalog}
          title="Selecionar do Catálogo"
          onClose={() => setShowCatalog(false)}
        >
          <div style={{ margin: '-16px', maxHeight: '70vh', overflowY: 'auto' }}>
            <PremiumCatalogWorkspace onSendToBudget={handleAddFromCatalog} />
          </div>
        </Modal>
      )}

      <style>{`
          .aferix-sticky-preview {
            position: fixed;
            bottom: calc(env(safe-area-inset-bottom, 0px) + 72px);
            left: 12px;
            right: 12px;
            z-index: 90;
            opacity: 0.9;
            transform: scale(0.95);
          }
          .aferix-budget-form-screen.is-saving {
            opacity: 0.7;
            pointer-events: none;
          }
          @media (max-width: 768px) {
            .aferix-sticky-preview {
              bottom: calc(76px + env(safe-area-inset-bottom, 0px));
            }
          }
          button {
            min-height: 48px;
            min-width: 48px;
          }
        `}</style>
    </PageShell>
  );
};
