import { useState } from 'react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { buildProCheckoutUrl } from '../../core/access/commercialCheckout';
import { proPlanBenefits } from '../../core/access/planStrategy';
import { PageHeader, PageShell, PlanCard, BackButton, ListCard, ListItem, Surface, Badge, SectionTitle, ContextBanner } from '../components/ui';
import { planStatusTitle } from '../utils/planHelpers';

interface StoreScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
  onBack?: () => void;
}

export function StoreScreen({ account, onBack }: StoreScreenProps) {
  return (
    <PageShell className="wide-screen store-screen">
      {onBack && <BackButton label="Voltar" onClick={onBack} />}
      <PageHeader title="Licença e Plano" />
      
      <div className="aferix-d-flex aferix-flex-column aferix-gap-lg">
        <Surface elevation={1} padding="lg">
          <div className="aferix-text-center aferix-mb-md">
            <Badge tone="brand">CONTA {account.plan.toUpperCase()}</Badge>
            <h2 className="aferix-font-xl aferix-font-bold">Status da Assinatura</h2>
            <p className="aferix-text-muted aferix-mt-sm">Sua licença atual é vitalícia durante o período Beta.</p>
          </div>

          <div className="aferix-divider aferix-my-lg" style={{ height: '1px', background: 'var(--border-soft)' }} />

          <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="aferix-p-md aferix-text-center" style={{ background: 'var(--bg-active)', borderRadius: 'var(--radius-md)' }}>
              <span className="aferix-d-block aferix-font-xs aferix-text-muted">PLANO ATUAL</span>
              <strong className="aferix-font-lg">{planStatusTitle(account)}</strong>
            </div>
            <div className="aferix-p-md aferix-text-center" style={{ background: 'var(--bg-active)', borderRadius: 'var(--radius-md)' }}>
              <span className="aferix-d-block aferix-font-xs aferix-text-muted">PRÓXIMA COBRANÇA</span>
              <strong className="aferix-font-lg">R$ 0,00</strong>
            </div>
          </div>
        </Surface>

        <Surface elevation={1} padding="md">
          <SectionTitle title="Recursos Habilitados" />
          <div className="aferix-mt-sm">
            <ul className="aferix-list-check" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {proPlanBenefits.slice(0, 4).map(b => (
                <li key={b.title} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--status-success)' }}>✓</span>
                  {b.title}
                </li>
              ))}
            </ul>
          </div>
        </Surface>

        <ContextBanner
          title="Aferix Pro em Preparação"
          meta="Novos recursos como sincronismo avançado e multiusuário serão liberados automaticamente para sua conta."
          icon="⭐"
        />
      </div>
    </PageShell>
  );
}
