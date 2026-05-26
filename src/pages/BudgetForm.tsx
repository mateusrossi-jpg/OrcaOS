import React from 'react';
import { useBudgetForm } from '../hooks/useBudgetForm';
import { formatCurrencyBRL, formatPercent } from '../utils/formatters';
import { useClients } from '../hooks/useClients';
import { Client } from '../domain/client';
import {
  PageShell,
  PageHeader,
  PanelCard,
  Input,
  Select,
  MonetaryInput,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  Badge,
  SectionTitle,
  ContextBanner,
} from '../app/components/ui';

interface BudgetFormProps {
  id?: string | null;
  onBack?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ id, onBack }) => {
  const {
    budget,
    isLoading,
    updateField,
    preview,
    isSaving,
    isReadOnly,
    showFinalizeModal,
    saveDraft,
    markAsSent,
    markAsAuthorized,
    markAsRejected,
    requestFinalize,
    cancelFinalize,
    confirmFinalize,
    error,
    clearError,
  } = useBudgetForm(id);

  const { clients } = useClients();

  if (isLoading) {
    return (
      <PageShell>
        <div className="empty-state-card">
          <strong>Carregando orçamento...</strong>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className={`aferix-budget-form-screen ${isSaving ? 'is-saving' : ''}`}>
      <PageHeader 
        title={budget.title || (id ? 'Editar orçamento' : 'Novo orçamento')} 
        sourceLabel={budget.status.toUpperCase()}
        action={
          <SecondaryButton onClick={onBack}>
            Voltar
          </SecondaryButton>
        }
      />

      {error && (
        <div className="aferix-card-warning aferix-mb-md">
          <div className="aferix-d-flex aferix-justify-between aferix-align-center">
            <span className="aferix-font-bold aferix-font-xs">{error}</span>
            <button onClick={clearError} className="ghost-action">✕</button>
          </div>
        </div>
      )}

      <div className="aferix-d-flex aferix-flex-column aferix-gap-lg">
        {/* 1. Preço Dominante */}
        <PanelCard className="aferix-card-kpi aferix-text-center">
          <MonetaryInput
            label="Preço do Serviço"
            value={budget.chargedValue}
            onChange={(val) => updateField('chargedValue', val)}
            disabled={isReadOnly}
            placeholder="0,00"
          />
        </PanelCard>

        {/* 2. Dados Básicos */}
        <PanelCard className="aferix-d-flex aferix-flex-column aferix-gap-md">
          <Input
            label="Título do Orçamento"
            value={budget.title}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={isReadOnly}
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
            disabled={isReadOnly}
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
              disabled={isReadOnly}
              placeholder="Digite o nome..."
            />
          )}
        </PanelCard>

        {/* 3. Custos Operacionais */}
        <div className="aferix-costs-section">
          <SectionTitle title="Custos da Operação" />
          <PanelCard className="aferix-d-flex aferix-flex-column aferix-gap-md">
            <MonetaryInput
              label="Materiais"
              value={budget.materialCost}
              onChange={(val) => updateField('materialCost', val)}
              disabled={isReadOnly}
            />
            <MonetaryInput
              label="Ajudante"
              value={budget.helperCost}
              onChange={(val) => updateField('helperCost', val)}
              disabled={isReadOnly}
            />
            <MonetaryInput
              label="Transporte"
              value={budget.travelCost}
              onChange={(val) => updateField('travelCost', val)}
              disabled={isReadOnly}
            />
            <MonetaryInput
              label="Taxas"
              value={budget.fees}
              onChange={(val) => updateField('fees', val)}
              disabled={isReadOnly}
            />
            <MonetaryInput
              label="Descontos"
              value={budget.discounts}
              onChange={(val) => updateField('discounts', val)}
              disabled={isReadOnly}
            />
            <MonetaryInput
              label="Outros Custos"
              value={budget.otherCosts}
              onChange={(val) => updateField('otherCosts', val)}
              disabled={isReadOnly}
            />
          </PanelCard>
        </div>

        {/* 4. Ações Operacionais */}
        {!isReadOnly && (
          <div className="aferix-d-flex aferix-flex-column aferix-gap-md aferix-mt-lg aferix-journey-actions">
            <PrimaryButton onClick={requestFinalize} disabled={isSaving}>
              Finalizar e Congelar
            </PrimaryButton>
            
            <div className="aferix-d-flex aferix-gap-sm">
              <SecondaryButton className="aferix-flex-1" onClick={markAsSent} disabled={isSaving}>
                Enviado
              </SecondaryButton>
              <SecondaryButton className="aferix-flex-1" onClick={markAsAuthorized} disabled={isSaving}>
                Autorizar
              </SecondaryButton>
            </div>

            <SecondaryButton onClick={saveDraft} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </SecondaryButton>
            
            <DangerButton onClick={markAsRejected} disabled={isSaving}>
              Recusar Orçamento
            </DangerButton>
          </div>
        )}
      </div>

      {/* 5. Sticky Preview */}
      <div className="aferix-sticky-preview">
        <ContextBanner
          title={`Lucro: ${formatCurrencyBRL(preview?.grossProfit || 0)}`}
          meta={`Margem: ${formatPercent(preview?.marginPercent || 0)} • Custo: ${formatCurrencyBRL(preview?.totalCost || 0)}`}
          icon={<span className="nav-icon">💰</span>}
          actionLabel={!isReadOnly ? "Finalizar" : undefined}
          onAction={!isReadOnly ? requestFinalize : undefined}
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
        .aferix-costs-section {
          margin-top: 12px;
        }
        .aferix-journey-actions {
          padding-bottom: 120px; /* Space for sticky preview */
        }
        @media (max-width: 768px) {
          .aferix-sticky-preview {
            bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
    </PageShell>
  );
};
