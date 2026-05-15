import { useState } from 'react';
import type { OrcaAccountState } from '../../core/access/accountPlanStorage';
import { getBillingReadiness } from '../../core/access/billingReadiness';
import { buildProCheckoutUrl, buildProManageUrl, isProCheckoutConfigured, isProManageConfigured } from '../../core/access/commercialCheckout';
import { getGooglePlayBillingSetup, purchaseGooglePlayPro, restoreGooglePlayPurchases, syncGooglePlayPurchaseEntitlement } from '../../core/access/googlePlayBilling';
import { isPlanEntitlementSyncConfigured, refreshPlanEntitlement } from '../../core/access/planEntitlements';
import { proPlanBenefits, proV1Priorities, futureProBacklog } from '../../core/access/planStrategy';
import { isDevToolsEnabled } from '../../core/runtime/devTools';
import { storePackages } from '../orcaAppData';
import { planStatusTitle, planStatusDescription } from '../utils/planHelpers';

interface StoreScreenProps {
  account: OrcaAccountState;
  onAccountChange: (account: OrcaAccountState) => void;
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
    <section className="app-screen wide-screen store-screen">
      <header className="screen-header"><h1>Licença</h1><p>Free para começar. Pro para vender com mais margem e apresentação.</p></header>
      <section className="store-summary-grid">
        <article><span>Free</span><strong>Grátis</strong><small>Básico</small></article>
        <article className="featured"><span>Pro</span><strong>Em validação</strong><small>Profissional</small></article>
        <article className="featured"><span>Pacote vitalício</span><strong>R$ 29,90 sugerido</strong><small>Recursos planejados</small></article>
      </section>
      <section className="orca-panel-card store-comparison-card">
        <header><div><h2>Vantagens do Aferix Pro</h2></div></header>
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
          <article><span>Android package</span><strong>{billingReadiness.packageName || 'Pendente'}</strong><small>Necessário para Google Play Billing.</small></article>
          <article><span>Produto Pro</span><strong>{billingReadiness.proProductId || 'Pendente'}</strong><small>ID da assinatura/produto no Play Console.</small></article>
          <article><span>Bridge Android</span><strong>{billingReadiness.googlePlayBridgeName}</strong><small>{googlePlaySetup.bridgeAvailable ? 'Disponível neste app.' : 'Aguardando plugin nativo.'}</small></article>
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
          <article><span>Produto</span><strong>{googlePlaySetup.productId || 'Pendente'}</strong><small>Assinatura/produto Pro no Play Console.</small></article>
          <article><span>Pacote</span><strong>{googlePlaySetup.packageName || 'Pendente'}</strong><small>Deve bater com o app publicado.</small></article>
          <article><span>Backend</span><strong>{googlePlaySetup.entitlementEndpoint ? 'Configurado' : 'Pendente'}</strong><small>Valida token com Google, não no front-end.</small></article>
        </div>
        <div className="general-capture-actions">
          <button type="button" disabled={!billingReadiness.isGooglePlayReady || !account.userId || isGooglePlayBusy || activeUserPlan === 'pro'} onClick={buyWithGooglePlay}>{isGooglePlayBusy ? 'Processando...' : 'Comprar com Google Play'}</button>
          <button type="button" className="secondary-action" disabled={!billingReadiness.isGooglePlayReady || !account.userId || isGooglePlayBusy} onClick={restoreWithGooglePlay}>Restaurar compra</button>
        </div>
        {!account.userId && <p className="general-helper-text">Entre com e-mail ou Google antes de comprar/restaurar Pro.</p>}
        {!googlePlaySetup.bridgeAvailable && <p className="general-helper-text">Bridge nativo pendente no Android/Capacitor antes da venda real.</p>}
      </div>}
      <div className="orca-panel-card">
        <header>
          <div>
            <span className="orca-kicker">Assinatura</span>
            <h2>{activeUserPlan === 'pro' ? 'Aferix Pro Ativo' : 'Plano Aferix Pro'}</h2>
          </div>
        </header>
        <div className="dashboard-finance-tiles" style={{ padding: '1rem' }}>
          <article className="finance-tile"><span>Status</span><strong>{planStatusTitle(account)}</strong></article>
          <article className="finance-tile"><span>ID</span><strong>{account.installationId.slice(0, 8)}</strong></article>
        </div>
        <div className="local-backup-actions" style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button className="ghost-action" type="button" onClick={openCheckout} disabled={activeUserPlan === 'pro'}>Assinar Pro</button>
          <button className="ghost-action" type="button" onClick={checkSubscription}>Verificar</button>
        </div>
      </div>
      <div className="settings-group account-settings-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Estratégia Free / Pro</span>
          <h2>Grátis para usar, Pro para profissionalizar</h2>
        </div>
        {storePackages.map((pack) => <article className="store-card" key={pack.title}><span><strong>{pack.title}</strong><small>{pack.description}</small><b>{pack.price}</b></span><em className="store-card-status">Planejado</em></article>)}
      </div>
      <div className="orca-panel-card">
        <header>
          <div>
            <h2>Comparativo de Planos</h2>
          </div>
        </header>
        <div className="dashboard-finance-tiles" style={{ padding: '1rem' }}>
          <article className="finance-tile"><span>Free</span><strong>Básico</strong></article>
          <article className="finance-tile" style={{ borderLeft: '3px solid #f59e0b' }}><span>Pro</span><strong>Profissional</strong></article>
        </div>
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
      </div>
      <div className="settings-group account-settings-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Prioridade V1 Pro</span>
          <h2>O que vem primeiro</h2>
        </div>
        <div className="plan-priority-grid">
          {proV1Priorities.map((benefit, index) => <article key={benefit.title}><span>{index + 1}</span><strong>{benefit.title}</strong><small>{benefit.description}</small></article>)}
        </div>
        <div className="plan-future-list">
          {futureProBacklog.map((benefit) => <span key={benefit.title}><strong>{benefit.title}</strong><small>{benefit.description}</small></span>)}
        </div>
      </div>
    </section>
  );
}
