import { useState } from 'react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { getBillingReadiness } from '../../core/access/billingReadiness';
import { buildProCheckoutUrl, buildProManageUrl, isProCheckoutConfigured, isProManageConfigured } from '../../core/access/commercialCheckout';
import { getGooglePlayBillingSetup, purchaseGooglePlayPro, restoreGooglePlayPurchases, syncGooglePlayPurchaseEntitlement } from '../../core/access/googlePlayBilling';
import { isPlanEntitlementSyncConfigured, refreshPlanEntitlement } from '../../core/access/planEntitlements';
import { proPlanBenefits, proV1Priorities, futureProBacklog } from '../../core/access/planStrategy';
import { isDevToolsEnabled } from '../../core/runtime/devTools';
import { storePackages } from '../appData';
import { MetricCard, PageHeader, PageShell, PlanCard, SectionHeader } from '../components/designSystem';
import { planStatusTitle, planStatusDescription } from '../utils/planHelpers';

interface StoreScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
}

export function StoreScreen({ account, onAccountChange }: StoreScreenProps) {
  const activeUserPlan = account.plan;
  const devToolsEnabled = isDevToolsEnabled();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCheckingPlan, setIsCheckingPlan] = useState(false);
  const [isGooglePlayBusy, setIsGooglePlayBusy] = useState(false);
  const checkoutConfigured = isProCheckoutConfigured();
  const manageConfigured = isProManageConfigured();
  const billingReadiness = getBillingReadiness();
  const googlePlaySetup = getGooglePlayBillingSetup();
  const googlePlayMode = billingReadiness.channel === 'google-play';
  const planSourceLabel = account.planSource === 'subscription'
    ? 'verificação Pro'
    : account.planSource === 'local-test' && devToolsEnabled
      ? 'teste local'
      : 'verificação local';

  async function checkSubscription() {
    setIsCheckingPlan(true);
    setFeedback(null);
    try {
      const result = await refreshPlanEntitlement(account);
      onAccountChange(result.account);
      setFeedback(planStatusDescription(result.account, 'verificação Pro'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível verificar a liberação Pro.');
    } finally {
      setIsCheckingPlan(false);
    }
  }

  function openCheckout() {
    setFeedback(null);
    try {
      window.open(buildProCheckoutUrl(account), '_blank', 'noopener,noreferrer');
      setFeedback('Checkout aberto. Depois do pagamento, volte aqui e clique em Verificar assinatura.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível abrir o checkout Pro.');
    }
  }

  async function buyWithGooglePlay() {
    setIsGooglePlayBusy(true);
    setFeedback(null);
    try {
      const purchase = await purchaseGooglePlayPro();
      const result = await syncGooglePlayPurchaseEntitlement(account, purchase, 'purchase');
      onAccountChange(result.account);
      setFeedback(planStatusDescription(result.account, 'Google Play'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível concluir a compra pelo Google Play.');
    } finally {
      setIsGooglePlayBusy(false);
    }
  }

  async function restoreWithGooglePlay() {
    setIsGooglePlayBusy(true);
    setFeedback(null);
    try {
      const purchases = await restoreGooglePlayPurchases();
      if (purchases.length === 0) {
        setFeedback('Nenhuma compra Pro restaurável foi encontrada nesta conta Google Play.');
        return;
      }
      const result = await syncGooglePlayPurchaseEntitlement(account, purchases[0], 'restore');
      onAccountChange(result.account);
      setFeedback(planStatusDescription(result.account, 'restauração Google Play'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível restaurar compras pelo Google Play.');
    } finally {
      setIsGooglePlayBusy(false);
    }
  }

  return (
    <PageShell className="wide-screen store-screen">
      <PageHeader title="Licença" description="Escolha o plano ideal para o seu negócio." />
      <section className="plan-card-grid" aria-label="Planos Aferix">
        <PlanCard
          badge="FREE"
          title="Grátis"
          subtitle="Básico"
          price="R$ 0/mês"
          description="Para testar o fluxo local-first sem cobrança."
          benefits={['13 cálculos livres', 'Acesso aos cálculos avulsos', 'Relatórios básicos', 'Suporte limitado']}
          action={<button className="secondary-action inline-action" type="button" disabled>Plano atual</button>}
        />
        <PlanCard
          badge="PRO"
          title="Em validação"
          subtitle="Profissional"
          price="R$ 29,90/mês"
          description="Para vender com margem, histórico e apresentação."
          benefits={['17 cálculos Pro', 'Todos os cálculos', 'Relatórios completos', 'Suporte prioritário']}
          action={<button className="primary-action inline-action" type="button" disabled={activeUserPlan === 'pro'} onClick={openCheckout}>Quero este plano</button>}
          featured
        />
        <PlanCard
          badge="VITALÍCIO"
          title="Vitalício"
          subtitle="Acesso vitalício"
          price="R$ 29,90"
          description="Oferta planejada para fundadores."
          benefits={['Tudo do plano Pro', 'Sem mensalidades', 'Atualizações futuras', 'Suporte vitalício']}
          action={<button className="secondary-action inline-action" type="button" disabled>Planejado</button>}
        />
      </section>
      <section className="aferix-panel-card store-comparison-card">
        <SectionHeader title="Vantagens do Aferix Pro" />
        <div className="continuous-list">
          {proPlanBenefits.map((benefit) => (
            <article className="continuous-list-item" key={benefit.title}>
              <div className="client-col">
                <strong>{benefit.title}</strong>
                <small>{benefit.description}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="settings-group account-settings-panel billing-readiness-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Pagamentos</span>
          <h2>{billingReadiness.statusTitle}</h2>
          </div>
        <div className="billing-readiness-grid">
          <article><span>Canal</span><strong>{billingReadiness.channelLabel}</strong><small>{billingReadiness.channel === 'beta-assisted' ? 'Sem cobrança automática no beta.' : 'Canal configurável por ambiente.'}</small></article>
          <article><span>Endpoint Pro</span><strong>{billingReadiness.entitlementEndpointConfigured ? 'Configurado' : 'Pendente'}</strong><small>Responsável por liberar, expirar ou bloquear Pro.</small></article>
          <article><span>Android package</span><strong className="android-package" title={billingReadiness.packageName || 'Pendente'}>{billingReadiness.packageName || 'Pendente'}</strong><small>Necessário para Google Play Billing.</small></article>
          <article><span>Produto Pro</span><strong className="product-id" title={billingReadiness.proProductId || 'Pendente'}>{billingReadiness.proProductId || 'Pendente'}</strong><small>ID da assinatura/produto no Play Console.</small></article>
          <article><span>Bridge Android</span><strong className="long-token" title={billingReadiness.googlePlayBridgeName}>{billingReadiness.googlePlayBridgeName}</strong><small>{googlePlaySetup.bridgeAvailable ? 'Disponível neste app.' : 'Aguardando plugin nativo.'}</small></article>
        </div>
        <div className="billing-release-list">
          {billingReadiness.releaseChecklist.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
      {googlePlayMode && <div className="settings-group account-settings-panel commercial-checkout-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Google Play</span>
          <h2>Compra pela conta Google</h2>
          </div>
        <div className="billing-readiness-grid">
          <article><span>Produto</span><strong className="product-id" title={googlePlaySetup.productId || 'Pendente'}>{googlePlaySetup.productId || 'Pendente'}</strong><small>Assinatura/produto Pro no Play Console.</small></article>
          <article><span>Pacote</span><strong className="android-package" title={googlePlaySetup.packageName || 'Pendente'}>{googlePlaySetup.packageName || 'Pendente'}</strong><small>Deve bater com o app publicado.</small></article>
          <article><span>Backend</span><strong>{googlePlaySetup.entitlementEndpoint ? 'Configurado' : 'Pendente'}</strong><small>Valida token com Google, não no front-end.</small></article>
        </div>
        <div className="general-capture-actions">
          <button type="button" disabled={!billingReadiness.isGooglePlayReady || !account.userId || isGooglePlayBusy || activeUserPlan === 'pro'} onClick={buyWithGooglePlay}>{isGooglePlayBusy ? 'Processando...' : 'Comprar com Google Play'}</button>
          <button type="button" className="secondary-action" disabled={!billingReadiness.isGooglePlayReady || !account.userId || isGooglePlayBusy} onClick={restoreWithGooglePlay}>Restaurar compra</button>
        </div>
        {!account.userId && <p className="general-helper-text">Entre com e-mail ou Google antes de comprar/restaurar Pro.</p>}
        {!googlePlaySetup.bridgeAvailable && <p className="general-helper-text">Bridge nativo pendente no Android/Capacitor antes da venda real.</p>}
      </div>}
      <div className="aferix-panel-card">
        <header>
          <div>
            <span className="orca-kicker">Assinatura</span>
            <h2>{activeUserPlan === 'pro' ? 'Aferix Pro Ativo' : 'Plano Aferix Pro'}</h2>
          </div>
        </header>
        <div className="metric-grid compact-metric-grid">
          <MetricCard label="Status" value={planStatusTitle(account)} />
          <MetricCard label="ID" value={account.installationId.slice(0, 8)} />
        </div>
        <div className="local-backup-actions store-account-actions">
          <button className="ghost-action" type="button" onClick={checkSubscription}>Verificar</button>
        </div>
      </div>
      <details className="aferix-panel-card store-detail-section">
        <summary>Estratégia e comparativo</summary>
        <div className="store-detail-content">
          <div className="metric-grid compact-metric-grid">
            <MetricCard label="Free" value="Básico" />
            <MetricCard label="Pro" value="Profissional" tone="brand" />
          </div>
          {storePackages.map((pack) => (
            <article className="store-card" key={pack.title}>
              <span><strong>{pack.title}</strong><small>{pack.description}</small><b>{pack.price}</b></span>
              <em className="store-card-status">Planejado</em>
            </article>
          ))}
        </div>
      </details>
      <details className="aferix-panel-card store-detail-section">
        <summary>Prioridade V1 Pro e backlog</summary>
        <div className="store-detail-content">
          <div className="plan-priority-grid">
            {proV1Priorities.map((benefit, index) => <article key={benefit.title}><span>{index + 1}</span><strong>{benefit.title}</strong><small>{benefit.description}</small></article>)}
          </div>
          <div className="plan-future-list">
            {futureProBacklog.map((benefit) => <span key={benefit.title}><strong>{benefit.title}</strong><small>{benefit.description}</small></span>)}
          </div>
        </div>
      </details>
    </PageShell>
  );
}
