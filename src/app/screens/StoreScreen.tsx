import { useState } from 'react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { buildProCheckoutUrl } from '../../core/access/commercialCheckout';
import { refreshPlanEntitlement } from '../../core/access/planEntitlements';
import { proPlanBenefits } from '../../core/access/planStrategy';
import { storePackages } from '../appData';
import { MetricCard, PageHeader, PageShell, PlanCard, BackButton, ListCard, ListItem, PanelCard, SecondaryButton } from '../components/ui';
import { planStatusTitle } from '../utils/planHelpers';

interface StoreScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
  onBack?: () => void;
}

export function StoreScreen({ account, onAccountChange, onBack }: StoreScreenProps) {
  const activeUserPlan = account.plan;
  const [showAllProBenefits, setShowAllProBenefits] = useState(false);
  const visibleProBenefits = showAllProBenefits ? proPlanBenefits : proPlanBenefits.slice(0, 5);
  const hiddenProBenefitsCount = Math.max(proPlanBenefits.length - visibleProBenefits.length, 0);

  async function checkSubscription() {
    try {
      const result = await refreshPlanEntitlement(account);
      onAccountChange(result.account);
    } catch {
      // Error handled by not updating state
    }
  }

  function openCheckout() {
    try {
      window.open(buildProCheckoutUrl(account), '_blank', 'noopener,noreferrer');
    } catch {
      // Error handled by not updating state
    }
  }

  return (
    <PageShell className="wide-screen store-screen">
      {onBack && <BackButton label="Voltar" onClick={onBack} />}
      <PageHeader title="Licença" />
      <section className="plan-card-grid" aria-label="Planos Aferix">
        <PlanCard
          badge="FREE"
          title="Grátis"
          price="R$ 0/mês"
          benefits={['13 cálculos livres', 'Acesso aos cálculos avulsos', 'Relatórios básicos', 'Suporte limitado']}
          action={<button className="secondary-action inline-action" type="button" disabled>Plano atual</button>}
        />
        <PlanCard
          badge="PRO"
          title="Em validação"
          price="R$ 29,90/mês"
          benefits={['17 cálculos Pro', 'Todos os cálculos', 'Relatórios completos', 'Suporte prioritário']}
          action={<button className="primary-action inline-action" type="button" disabled={activeUserPlan === 'pro'} onClick={openCheckout}>Quero este plano</button>}
          featured
        />
        <PlanCard
          badge="VITALÍCIO"
          title="Vitalício"
          price="R$ 29,90"
          benefits={['Tudo do plano Pro', 'Sem mensalidades', 'Atualizações futuras', 'Suporte vitalício']}
          action={<button className="secondary-action inline-action" type="button" disabled>Planejado</button>}
        />
      </section>
      <ListCard title="Vantagens do Aferix Pro" className="store-comparison-card">
        {visibleProBenefits.map((benefit) => (
          <ListItem key={benefit.title} title={benefit.title} />
        ))}
        {proPlanBenefits.length > 5 && (
          <button
            type="button"
            className="list-expand-toggle"
            onClick={() => setShowAllProBenefits((current) => !current)}
          >
            {showAllProBenefits ? "Ver menos" : `Ver mais (${hiddenProBenefitsCount})`}
          </button>
        )}
      </ListCard>

      <PanelCard className="pro-preparation-card">
        <header>
          <div>
            <span className="aferix-kicker">Evolução</span>
            <h2>Plano Pro em preparação</h2>
            <p>Estamos refinando as ferramentas de sincronização e relatórios avançados.</p>
          </div>
        </header>
        <div className="aferix-p-md">
          <p className="aferix-text-muted aferix-font-sm">Recursos premium serão liberados gradualmente para todos os usuários beta. Sua licença atual é gratuita durante este período.</p>
        </div>
      </PanelCard>

      <PanelCard>
        <header>
          <div>
            <span className="aferix-kicker">Assinatura</span>
            <h2>{activeUserPlan === 'pro' ? 'Aferix Pro Ativo' : 'Plano Aferix Pro'}</h2>
            <p>Status: {planStatusTitle(account)}</p>
          </div>
        </header>
        <div className="local-backup-actions store-account-actions">
          <SecondaryButton onClick={checkSubscription}>Verificar Licença</SecondaryButton>
        </div>
      </PanelCard>

      <details className="aferix-panel-card store-detail-section">
        <summary>Planos e Comparativo</summary>
        <div className="store-detail-content">
          <div className="metric-grid compact-metric-grid">
            <MetricCard label="Free" value="Básico" />
            <MetricCard label="Pro" value="Profissional" tone="brand" />
          </div>
          {storePackages.map((pack) => (
            <article className="store-card" key={pack.title}>
              <span><strong>{pack.title}</strong><b>{pack.price}</b></span>
              <em className="store-card-status">Lançamento em breve</em>
            </article>
          ))}
        </div>
      </details>
    </PageShell>
  );
}
