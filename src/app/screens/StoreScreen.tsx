import { useState } from 'react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { buildProCheckoutUrl } from '../../core/access/commercialCheckout';
import { proPlanBenefits } from '../../core/access/planStrategy';
import { PageHeader, PageShell, PlanCard, BackButton, ListCard, ListItem, PanelCard } from '../components/ui';

interface StoreScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
  onBack?: () => void;
}

export function StoreScreen({ account, onBack }: StoreScreenProps) {
  const activeUserPlan = account.plan;
  const [showAllProBenefits, setShowAllProBenefits] = useState(false);
  const visibleProBenefits = showAllProBenefits ? proPlanBenefits : proPlanBenefits.slice(0, 5);
  const hiddenProBenefitsCount = Math.max(proPlanBenefits.length - visibleProBenefits.length, 0);

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
          title="Básico"
          price="Grátis"
          benefits={['Cálculos essenciais', 'Relatórios locais', 'Offline-first']}
          action={<button className="secondary-action inline-action" type="button" disabled>Sua licença atual</button>}
        />
        <PlanCard
          badge="PRO"
          title="Em preparação"
          price="Beta"
          benefits={['Sincronização Cloud', 'Todos os cálculos', 'Suporte prioritário']}
          action={<button className="primary-action inline-action" type="button" disabled={activeUserPlan === 'pro'} onClick={openCheckout}>Quero este plano</button>}
          featured
        />
        <PlanCard
          badge="VITALÍCIO"
          title="Planejado"
          price="Futuro"
          benefits={['Tudo do Pro', 'Sem mensalidades', 'Vitalício']}
          action={<button className="ghost-action inline-action" type="button" disabled>Disponível futuramente</button>}
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
            <span className="aferix-kicker">Beta Controlado</span>
            <h2>Acesso Pro Gradual</h2>
            <p>Os recursos premium serão liberados gradualmente. Sua licença atual é gratuita e vitalícia durante a fase Beta.</p>
          </div>
        </header>
      </PanelCard>


    </PageShell>
  );
}
