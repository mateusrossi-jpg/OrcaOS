import React from 'react';
import { BUDGET_STATUS, type BudgetItem } from '../domain/budget';
import { formatCurrencyBRL, formatPercent } from '../utils/formatters';
import { useClients } from '../hooks/useClients';
import { useBudgetForm } from '../hooks/useBudgetForm';
import { Client } from '../domain/client';
import { PremiumCatalogWorkspace } from '../features/catalog/components/PremiumCatalogWorkspace';
import type { CatalogHubItem } from '../features/catalog/types/catalogTypes';
import { 
  PageShell,
  PageHeader,
  PanelCard,
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
  ListItem,
  MoneyValue,
} from '../app/components/ui';
import { StickyActionBar } from '../components/StickyActionBar';

interface BudgetFormProps {
  id?: string | null;
  onBack?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ id, onBack }) => {
  const {
    budget,
    isLoading,
    updateField,
    addItem,
    removeItem,
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

  const { clients } = useClients();
  const [showCatalog, setShowCatalog] = React.useState(false);

  if (isLoading) {
    return (
      <PageShell>
        <div className="empty-state-card">
          <strong>Carregando orçamento...</strong>
        </div>
      </PageShell>
    );
  }

  const handleAddFromCatalog = (items: CatalogHubItem[]) => {
    items.forEach(item => addItem(item));
    setShowCatalog(false);
  };

  return (
    <PageShell className={`aferix-budget-form-screen ${isSaving ? 'is-saving' : ''} ${isReadOnly ? 'is-read-only' : ''}`}>
      <PageHeader 
        title={budget.title || (id ? 'Editar orçamento' : 'Novo orçamento')} 
        sourceLabel={budget.status.toUpperCase()}
        action={
          <SecondaryButton onClick={onBack}>
            Voltar
          </SecondaryButton>
        }
      />

      {isReadOnly && (
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

      <div className="aferix-d-flex aferix-flex-column aferix-gap-md">
        {/* 1. Preço Dominante */}
        <PanelCard className="aferix-card-kpi aferix-text-center" style={{ padding: '12px' }}>
          <MonetaryInput
            label="Preço do Serviço"
            value={budget.chargedValue}
            onChange={(val) => updateField('chargedValue', val)}
            disabled={!permissions.canEditFinancials}
            placeholder="0,00"
          />
        </PanelCard>

        {/* 2. Dados Básicos */}
        <PanelCard className="aferix-d-flex aferix-flex-column aferix-gap-sm" style={{ padding: '12px' }}>
          <Input
            label="Título do Projeto"
            value={budget.title}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={!permissions.canEditTitle}
            placeholder="Ex: Instalação Residencial"
          />

          <Select
            label="Cliente"
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
              label="Nome do Cliente Avulso"
              value={budget.clientName || ''}
              onChange={(e) => updateField('clientName', e.target.value)}
              disabled={!permissions.canEditClient}
              placeholder="Digite o nome..."
            />
          )}
        </PanelCard>

        {/* 2.5. Itens do Orçamento */}
        <div className="aferix-items-section">
          <SectionTitle 
            title="Itens e Serviços" 
            action={
              permissions.canEditItems && (
                <button 
                  type="button"
                  className="ghost-action aferix-font-bold" 
                  onClick={() => setShowCatalog(true)}
                  style={{ color: 'var(--aferix-primary)', fontSize: '0.85rem' }}
                >
                  + Catálogo
                </button>
              )
            }
          />
          <ListCard className="aferix-mb-sm">
            {(budget.items || []).length === 0 ? (
              <div className="aferix-p-md aferix-text-center aferix-text-muted">
                <small>Nenhum item adicionado ainda.</small>
              </div>
            ) : (
              (budget.items || []).map((item: BudgetItem) => (
                <ListItem
                  key={item.id}
                  title={item.description}
                  context={`${item.quantity} x ${formatCurrencyBRL(item.unitPrice)}`}
                  value={<MoneyValue value={item.quantity * item.unitPrice} compact />}
                  action={
                    permissions.canEditItems && (
                      <button type="button" className="ghost-action" onClick={() => removeItem(item.id)} style={{ color: 'var(--aferix-danger)', padding: '8px' }}>✕</button>
                    )
                  }
                />
              ))
            )}
          </ListCard>
        </div>

        {/* 3. Custos Operacionais */}
        <div className="aferix-costs-section">
          <SectionTitle title="Custos e Deduções" />
          <PanelCard className="aferix-d-flex aferix-flex-column aferix-gap-sm" style={{ padding: '12px' }}>
            <div className="aferix-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <MonetaryInput
                label="Materiais"
                value={budget.materialCost}
                onChange={(val) => updateField('materialCost', val)}
                disabled={!permissions.canEditFinancials}
              />
              <MonetaryInput
                label="Ajudante"
                value={budget.helperCost}
                onChange={(val) => updateField('helperCost', val)}
                disabled={!permissions.canEditFinancials}
              />
              <MonetaryInput
                label="Transporte"
                value={budget.travelCost}
                onChange={(val) => updateField('travelCost', val)}
                disabled={!permissions.canEditFinancials}
              />
              <MonetaryInput
                label="Taxas"
                value={budget.fees}
                onChange={(val) => updateField('fees', val)}
                disabled={!permissions.canEditFinancials}
              />
              <MonetaryInput
                label="Descontos"
                value={budget.discounts}
                onChange={(val) => updateField('discounts', val)}
                disabled={!permissions.canEditFinancials}
              />
              <MonetaryInput
                label="Outros"
                value={budget.otherCosts}
                onChange={(val) => updateField('otherCosts', val)}
                disabled={!permissions.canEditFinancials}
              />
            </div>
          </PanelCard>
        </div>

        {/* 4. Notas Operacionais */}
        <div className="aferix-notes-section">
          <SectionTitle title="Notas e Observações" />
          <PanelCard className="aferix-d-flex aferix-flex-column aferix-gap-sm" style={{ padding: '12px' }}>
            <TextArea
              label="Observações do Cliente"
              value={budget.commercialNotes || ''}
              onChange={(val) => updateField('commercialNotes', val)}
              disabled={!permissions.canEditNotes}
              placeholder="Termos de pagamento, garantias..."
            />
            <TextArea
              label="Notas Internas"
              value={budget.notes || ''}
              onChange={(val) => updateField('notes', val)}
              disabled={!permissions.canEditNotes}
              placeholder="Detalhes técnicos, dificuldades encontradas..."
            />
          </PanelCard>
        </div>

        {/* Sticky Action Bar */}
        <StickyActionBar
          onCancel={onBack}
          disabled={isSaving}
          actions={
            <>
              {budget.status === BUDGET_STATUS.INICIADO && (
                <>
                  <button type="button" className="sticky-save" onClick={markAsSent} disabled={isSaving}>
                    Enviar para Cliente
                  </button>
                  <button type="button" className="sticky-secondary" onClick={saveDraft} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                  </button>
                </>
              )}
              {budget.status === BUDGET_STATUS.ENVIADO && (
                <>
                  <button type="button" className="sticky-save" onClick={markAsAuthorized} disabled={isSaving}>
                    Autorizar Execução
                  </button>
                  <button type="button" className="sticky-cancel" onClick={markAsRejected} disabled={isSaving}>
                    Recusar Orçamento
                  </button>
                </>
              )}
              {budget.status === BUDGET_STATUS.AUTORIZADO && (
                <button type="button" className="sticky-save" onClick={markAsExecuting} disabled={isSaving}>
                  Iniciar Execução
                </button>
              )}
              {budget.status === BUDGET_STATUS.EM_EXECUCAO && (
                <button type="button" className="sticky-save" onClick={requestFinalize} disabled={isSaving}>
                  Finalizar Orçamento
                </button>
              )}
              {budget.status === BUDGET_STATUS.FINALIZADO && (
                <button type="button" className="sticky-save" style={{ background: '#4b5563', color: '#fff' }} onClick={archiveBudget} disabled={isSaving}>
                  Arquivar Orçamento
                </button>
              )}
              {![BUDGET_STATUS.INICIADO, BUDGET_STATUS.ENVIADO, BUDGET_STATUS.AUTORIZADO, BUDGET_STATUS.EM_EXECUCAO, BUDGET_STATUS.FINALIZADO].includes(budget.status as any) && (
                <button type="button" className="sticky-save" onClick={saveDraft} disabled={isSaving}>
                  Salvar Rascunho
                </button>
              )}
            </>
          }
        />
      </div>

      {/* 6. Sticky Preview (Simplified) */}
      <div className="aferix-sticky-preview">
        <ContextBanner
          title={`Lucro: ${formatCurrencyBRL(preview?.grossProfit || 0)}`}
          meta={`Margem: ${formatPercent(preview?.marginPercent || 0)} • Custo: ${formatCurrencyBRL(preview?.totalCost || 0)}`}
          icon={<span className="nav-icon">💰</span>}
        />
      </div>

      {/* 6. Finalize Modal */}
      {showFinalizeModal && (
        <div className="aferix-modal-overlay">
          <div className="aferix-modal-card">
            <header className="aferix-modal-header">
              <h2>Revisão Final</h2>
            </header>
            <div className="aferix-modal-body aferix-d-flex aferix-flex-column aferix-gap-md">
              <div className="aferix-d-flex aferix-justify-between">
                <span className="aferix-text-muted">Faturamento</span>
                <strong className="aferix-font-lg">{formatCurrencyBRL((budget.chargedValue - budget.discounts) || 0)}</strong>
              </div>
              <div className="aferix-d-flex aferix-justify-between">
                <span className="aferix-text-muted">Custos Totais</span>
                <strong className="aferix-text-red">{formatCurrencyBRL(preview?.totalCost || 0)}</strong>
              </div>
              <PanelCard className="aferix-card-kpi aferix-mt-sm">
                <div className="aferix-d-flex aferix-justify-between aferix-align-center">
                  <div className="aferix-d-flex aferix-flex-column">
                    <span className="aferix-font-xs aferix-text-muted">LUCRO ESTIMADO</span>
                    <strong className="aferix-font-xl aferix-text-green">{formatCurrencyBRL(preview?.grossProfit || 0)}</strong>
                  </div>
                  <Badge tone="success">{formatPercent(preview?.marginPercent || 0)}</Badge>
                </div>
              </PanelCard>
              <p className="aferix-font-xs aferix-text-muted aferix-mt-sm">
                Esta ação é definitiva e congela os valores para relatórios.
              </p>
            </div>
            <footer className="aferix-modal-footer">
              <SecondaryButton onClick={cancelFinalize}>Voltar</SecondaryButton>
              <PrimaryButton onClick={confirmFinalize}>Confirmar</PrimaryButton>
            </footer>
          </div>
        </div>
      )}

      {/* 7. Catalog Modal */}
      {showCatalog && (
        <Modal
          isOpen={showCatalog}
          title="Catálogo Profissional"
          onClose={() => setShowCatalog(false)}
        >
          <div style={{ margin: '-16px', maxHeight: '60vh', overflowY: 'auto' }}>
            <PremiumCatalogWorkspace onSendToBudget={handleAddFromCatalog} />
          </div>
        </Modal>
      )}

      <style>{`
          .aferix-sticky-preview {
            position: fixed;
            bottom: env(safe-area-inset-bottom, 16px);
            left: 16px;
            right: 16px;
            z-index: 100;
          }
          .aferix-budget-form-screen.is-saving {
            opacity: 0.7;
            pointer-events: none;
          }
          .aferix-budget-form-screen.is-read-only .aferix-card-kpi,
          .aferix-budget-form-screen.is-read-only .aferix-costs-section {
            opacity: 0.85;
          }
          .aferix-costs-section {
            margin-top: 12px;
          }
          @media (max-width: 768px) {
            .aferix-sticky-preview {
              bottom: calc(16px + env(safe-area-inset-bottom, 0px));
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
