import { useState, lazy, Suspense } from 'react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import {
  signInEmailAccount,
  signInGoogleAccount,
  signInLocalAccount,
  signOutLocalAccount,
} from '../../core/access/accountPlanStorage';
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from '../../core/access/googleAccountAuth';
import { planStatusTitle, planStatusDescription } from '../utils/planHelpers';
import type { AppTab } from '../appTypes';
import { SectionHeader } from '../components/designSystem';

const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const LegalCompliancePanel = lazy(() => import('../../features/settings/components/LegalCompliancePanel').then((module) => ({ default: module.LegalCompliancePanel })));

interface MenuScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
  goTo: (tab: AppTab) => void;
}

type MenuSection = 'main' | 'profile' | 'security' | 'backup' | 'about';

export function MenuScreen({ account, onAccountChange, goTo }: MenuScreenProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailDraft, setEmailDraft] = useState(account.email);
  const [nameDraft, setNameDraft] = useState(account.displayName === 'Visitante' ? '' : account.displayName);
  const googleReady = isGoogleAccountLoginConfigured();
  
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  
  function registerEmailAccount() {
    try {
      const nextAccount = signInEmailAccount(emailDraft, nameDraft);
      onAccountChange(nextAccount);
      setFeedback('Conta por e-mail cadastrada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível cadastrar e-mail.');
    }
  }

  async function connectGoogle() {
    setIsSigningIn(true);
    setFeedback(null);
    try {
      const profile = await requestGoogleAccountProfile();
      const nextAccount = signInGoogleAccount(profile);
      onAccountChange(nextAccount);
      setFeedback('Conta Google conectada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível entrar com Google.');
    } finally {
      setIsSigningIn(false);
    }
  }

  if (activeSection !== 'main') {
    return (
      <section className="app-screen wide-screen">
        <button className="back-button" type="button" onClick={() => setActiveSection('main')}>‹ Voltar ao Menu</button>
        <Suspense fallback={<div className="empty-state-card"><p>Carregando...</p></div>}>
          {activeSection === 'profile' && (
            <div className="settings-group account-settings-panel">
              <SectionHeader title="Perfil profissional" eyebrow="Sistema" />
              <div className="account-status-grid">
                <article className="settings-row">
                  <span><strong>{accountLabel}</strong><small>{planStatusTitle(account)}</small></span>
                </article>
              </div>
              <section className="account-email-card">
                <div className="settings-form-grid">
                  <label className="general-form-field"><span>Nome profissional</span><input value={nameDraft} placeholder="Ex.: Profissional técnico" onChange={(event) => setNameDraft(event.target.value)} /></label>
                  <label className="general-form-field"><span>E-mail de acesso</span><input type="email" value={emailDraft} placeholder="profissional@email.com" onChange={(event) => setEmailDraft(event.target.value)} /></label>
                </div>
                <div className="settings-actions-row">
                  <button type="button" className="primary-action inline-action" onClick={registerEmailAccount}>Salvar perfil</button>
                  <button type="button" className="ghost-action" disabled={!googleReady || isSigningIn} onClick={connectGoogle}>{isSigningIn ? 'Conectando...' : 'Vincular Google'}</button>
                </div>
                {feedback && <p className="general-added-message">{feedback}</p>}
                <div className="settings-actions-row" style={{ marginTop: '2rem' }}>
                   <button className="secondary-action ghost-action" type="button" onClick={() => onAccountChange(signOutLocalAccount())}>Sair da conta</button>
                </div>
              </section>
              <ProfessionalProfileWorkspace />
            </div>
          )}
          {activeSection === 'security' && <AppSecurityPanel />}
          {activeSection === 'backup' && (
            <>
              <LocalBackupWorkspace includeLinkedSettings={false} />
              <GoogleDriveBackupPanel />
            </>
          )}
          {activeSection === 'about' && (
            <>
              <LegalCompliancePanel />
              <div className="settings-group account-settings-panel">
                 <SectionHeader title="Sobre o Aferix" eyebrow="Informação" />
                 <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Versão MVP · Local-first</p>
              </div>
            </>
          )}
        </Suspense>
      </section>
    );
  }

  return (
    <section className="app-screen menu-overview-screen">
      <header className="page-header">
        <div>
          <h1>Mais Ferramentas</h1>
          <p>Tudo o que você precisa para organizar sua operação.</p>
        </div>
      </header>

      <div className="aferix-panel-card">
        <SectionHeader title="Operação" eyebrow="Ferramentas de campo" />
        <div className="menu-grid">
          <button className="menu-item-card" onClick={() => goTo('catalog')}>
            <span className="menu-item-icon">📦</span>
            <strong>Catálogo</strong>
            <small>Itens e serviços</small>
          </button>
          <button className="menu-item-card" onClick={() => goTo('calculations')}>
            <span className="menu-item-icon">⚖️</span>
            <strong>Precificação</strong>
            <small>Calculadoras comerciais</small>
          </button>
          <button className="menu-item-card" onClick={() => goTo('survey')}>
            <span className="menu-item-icon">📝</span>
            <strong>Levantamento</strong>
            <small>Checklist de campo</small>
          </button>
          <button className="menu-item-card" onClick={() => goTo('purchaseList')}>
            <span className="menu-item-icon">🛒</span>
            <strong>Compras</strong>
            <small>Lista do cliente</small>
          </button>
          <button className="menu-item-card" onClick={() => goTo('reports')}>
            <span className="menu-item-icon">📄</span>
            <strong>Relatórios</strong>
            <small>Prévia de documentos</small>
          </button>
        </div>
      </div>

      <div className="aferix-panel-card" style={{ marginTop: '1.5rem' }}>
        <SectionHeader title="Sistema" eyebrow="Configurações" />
        <div className="menu-list-simple">
          <button className="simple-menu-row" onClick={() => setActiveSection('profile')}>
            <div className="row-content">
              <strong>Perfil e Conta</strong>
              <small>{accountLabel} · {planStatusTitle(account)}</small>
            </div>
            <span className="row-arrow">›</span>
          </button>
          <button className="simple-menu-row" onClick={() => goTo('store')}>
            <div className="row-content">
              <strong>Licença Pro</strong>
              <small>Planos e recursos extras</small>
            </div>
            <span className="row-arrow">›</span>
          </button>
          <button className="simple-menu-row" onClick={() => setActiveSection('backup')}>
            <div className="row-content">
              <strong>Backup e Sincronização</strong>
              <small>Drive e exportação local</small>
            </div>
            <span className="row-arrow">›</span>
          </button>
          <button className="simple-menu-row" onClick={() => setActiveSection('security')}>
            <div className="row-content">
              <strong>Segurança</strong>
              <small>PIN e proteção de acesso</small>
            </div>
            <span className="row-arrow">›</span>
          </button>
          <button className="simple-menu-row" onClick={() => setActiveSection('about')}>
            <div className="row-content">
              <strong>Sobre o Aferix</strong>
              <small>Privacidade e termos</small>
            </div>
            <span className="row-arrow">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
