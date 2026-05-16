import { useState, lazy } from 'react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import {
  signInEmailAccount,
  signInGoogleAccount,
  signInLocalAccount,
  signOutLocalAccount,
} from '../../core/access/accountPlanStorage';
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from '../../core/access/googleAccountAuth';
import { planStatusTitle, planStatusDescription } from '../utils/planHelpers';

const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const LegalCompliancePanel = lazy(() => import('../../features/settings/components/LegalCompliancePanel').then((module) => ({ default: module.LegalCompliancePanel })));

interface SettingsScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
}

export function SettingsScreen({ account, onAccountChange }: SettingsScreenProps) {
  const [settingsSection, setSettingsSection] = useState<'profile' | 'security' | 'backup' | 'preferences' | 'about'>('profile');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailDraft, setEmailDraft] = useState(account.email);
  const [nameDraft, setNameDraft] = useState(account.displayName === 'Visitante' ? '' : account.displayName);
  const googleReady = isGoogleAccountLoginConfigured();
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const accountDescription = account.status === 'google' ? `${account.email || 'E-mail não informado'} · Google vinculado` : account.status === 'email' ? `${account.email} · cadastro por e-mail` : account.status === 'local' ? 'Conta local deste dispositivo' : 'Modo visitante local-first';

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

  return (
    <section className="app-screen wide-screen">
      <header className="screen-header">
        <h1>Configurações</h1>
        <p>Conta, perfil, backup e segurança.</p>
      </header>

      <section className="settings-readiness-grid">
        <article><span>Local-first</span><strong>Funciona sem conta</strong><small>Clientes, atendimentos, cálculos e orçamentos continuam no dispositivo.</small></article>
        <article><span>Conta opcional</span><strong>Identificação do acesso</strong><small>Use e-mail ou Google para vincular testador, Pro assistido e backup no Drive.</small></article>
        <article><span>Backup</span><strong>Local e Drive</strong><small>Exporte seus dados ou salve uma cópia privada no Google Drive.</small></article>
      </section>

      <nav className="settings-section-tabs" aria-label="Seções de configurações">
        <button className={settingsSection === 'profile' ? 'active' : ''} type="button" onClick={() => setSettingsSection('profile')}>Perfil profissional</button>
        <button className={settingsSection === 'security' ? 'active' : ''} type="button" onClick={() => setSettingsSection('security')}>Segurança e acesso</button>
        <button className={settingsSection === 'backup' ? 'active' : ''} type="button" onClick={() => setSettingsSection('backup')}>Backup local</button>
        <button className={settingsSection === 'preferences' ? 'active' : ''} type="button" onClick={() => setSettingsSection('preferences')}>Preferências do app</button>
        <button className={settingsSection === 'about' ? 'active' : ''} type="button" onClick={() => setSettingsSection('about')}>Sobre o Aferix</button>
      </nav>

      {settingsSection === 'profile' && <div className="settings-group account-settings-panel">
        <div className="settings-panel-title">
          <span className="orca-kicker">Perfil profissional</span>
          <h2>Identidade e acesso</h2>
          <p>Use um e-mail principal quando quiser vincular cadastro, Google, liberação Pro assistida e backup no Drive. Para atendimento local, não precisa entrar.</p>
        </div>

        <div className="account-status-grid">
          <article className="settings-row">
            <span><strong>{accountLabel}</strong><small>{accountDescription}</small></span>
          </article>
          <article className="settings-row">
            <span><strong>{planStatusTitle(account)}</strong><small>{planStatusDescription(account, account.planSource === 'subscription' ? 'verificação Pro' : 'verificação local')}</small></span>
          </article>
          <article className="settings-row">
            <span><strong>ID da instalação</strong><small>{account.installationId}</small></span>
          </article>
        </div>

        <section className="account-email-card">
          <div>
            <strong>Vincular e-mail opcional</strong>
            <small>Informe o nome profissional e o e-mail que poderão ser usados para beta, backup no Drive e liberação Pro assistida.</small>
          </div>
          <div className="settings-form-grid">
            <label className="general-form-field"><span>Nome profissional</span><input value={nameDraft} placeholder="Ex.: Profissional técnico" onChange={(event) => setNameDraft(event.target.value)} /></label>
            <label className="general-form-field"><span>E-mail de acesso</span><input type="email" value={emailDraft} placeholder="profissional@email.com" onChange={(event) => setEmailDraft(event.target.value)} /></label>
          </div>
          <div className="settings-actions-row">
            <button type="button" onClick={registerEmailAccount}>Cadastrar e-mail</button>
            <button type="button" disabled={!googleReady || isSigningIn} onClick={connectGoogle}>{isSigningIn ? 'Conectando...' : 'Vincular Google'}</button>
            <button className="secondary-action" type="button" onClick={() => onAccountChange(signInLocalAccount())}>Entrar localmente</button>
            <button className="secondary-action" type="button" onClick={() => onAccountChange(signOutLocalAccount())}>Sair</button>
          </div>
          {!googleReady && <p className="general-helper-text">Login Google indisponível neste ambiente. O app continua funcionando com acesso local e e-mail opcional.</p>}
          {feedback && <p className="general-added-message">{feedback}</p>}
        </section>
      </div>}

      {settingsSection === 'security' && <AppSecurityPanel />}
      {settingsSection === 'backup' && (
        <>
          <LocalBackupWorkspace includeLinkedSettings={false} />
          <GoogleDriveBackupPanel />
        </>
      )}
      {settingsSection === 'preferences' && (
        <>
          <ProfessionalProfileWorkspace />
        </>
      )}
      {settingsSection === 'about' && (
        <>
          <LegalCompliancePanel />
          <div className="settings-group account-settings-panel">
            <div className="settings-panel-title">
              <span className="orca-kicker">Evolução planejada</span>
              <h2>Roteiro do produto</h2>
              <p>O Aferix está em desenvolvimento ativo. Confira as fases previstas:</p>
            </div>
            <div className="plan-priority-grid">
              <article><span>1</span><strong>Fase 1: Essencial</strong><small>Atendimento, cálculo, orçamento e relatório simples.</small></article>
              <article><span>2</span><strong>Fase 2: Financeiro</strong><small>Financeiro gerencial com receitas, custos e lucro real.</small></article>
              <article><span>3</span><strong>Fase 3: Operacional</strong><small>Catálogo, serviços, materiais, estoque leve e lista de compra.</small></article>
              <article><span>4</span><strong>Fase 4: Documentação</strong><small>Relatórios técnicos e comerciais avançados.</small></article>
              <article><span>5</span><strong>Fase 5: Ecossistema</strong><small>Web, nuvem, multiusuário, fiscal e integrações.</small></article>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
