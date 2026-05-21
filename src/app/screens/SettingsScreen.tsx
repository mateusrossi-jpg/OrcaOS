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
import { AferixTabs, PageHeader, PageShell } from '../components/ui';

const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const LegalCompliancePanel = lazy(() => import('../../features/settings/components/LegalCompliancePanel').then((module) => ({ default: module.LegalCompliancePanel })));

interface SettingsScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
}

type SettingsTab = 'account' | 'company' | 'security' | 'backup' | 'about';

export function SettingsScreen({ account, onAccountChange }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
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
    <PageShell className="wide-screen settings-screen-premium">
      <PageHeader 
        title="Configurações" 
        description="Gerencie conta, perfil profissional e preferências." 
      />

      <AferixTabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as SettingsTab)}
        items={[
          { id: 'account', label: 'Conta' },
          { id: 'company', label: 'Empresa' },
          { id: 'security', label: 'Segurança' },
          { id: 'backup', label: 'Backup' },
          { id: 'about', label: 'Sobre' },
        ]}
        variant="pill"
      />

      <div className="settings-content-area">
        {activeTab === 'account' && (
          <div className="settings-group account-settings-panel">
            <div className="settings-panel-title">
              <span className="orca-kicker">Acesso e Identidade</span>
              <h2>Sua Conta</h2>
              <p>Gerencie seu acesso e identificação no Aferix.</p>
            </div>

            <div className="account-status-grid-compact">
              <article className="settings-row-premium">
                <div className="row-content">
                  <strong>{accountLabel}</strong>
                  <small>{accountDescription}</small>
                  <small>{planStatusDescription(account, account.planSource === 'subscription' ? 'verificação Pro' : 'verificação local')}</small>
                </div>
                <div className="row-status">
                  <span className="plan-badge">{planStatusTitle(account)}</span>
                </div>
              </article>
            </div>

            <section className="account-registration-card">
              <div className="settings-form-grid">
                <label className="general-form-field"><span>Nome profissional</span><input value={nameDraft} placeholder="Ex.: Profissional técnico" onChange={(event) => setNameDraft(event.target.value)} /></label>
                <label className="general-form-field"><span>E-mail de acesso</span><input type="email" value={emailDraft} placeholder="profissional@email.com" onChange={(event) => setEmailDraft(event.target.value)} /></label>
              </div>
              <div className="settings-actions-row-premium">
                <button className="primary-action" type="button" onClick={registerEmailAccount}>Cadastrar e-mail</button>
                <button className="secondary-action" type="button" disabled={!googleReady || isSigningIn} onClick={connectGoogle}>{isSigningIn ? 'Conectando...' : 'Vincular Google'}</button>
                <button className="ghost-action" type="button" onClick={() => onAccountChange(signInLocalAccount())}>Entrar localmente</button>
                <button className="ghost-action" type="button" onClick={() => onAccountChange(signOutLocalAccount())}>Sair</button>
              </div>
              {feedback && <p className="general-added-message">{feedback}</p>}
            </section>
          </div>
        )}

        {activeTab === 'company' && <ProfessionalProfileWorkspace onBack={() => setActiveTab('account')} />}

        {activeTab === 'security' && <AppSecurityPanel />}

        {activeTab === 'backup' && (
          <div className="backup-settings-flow">
            <LocalBackupWorkspace includeLinkedSettings={false} />
            <GoogleDriveBackupPanel />
          </div>
        )}

        {activeTab === 'about' && (
          <>
            <LegalCompliancePanel />
            <div className="settings-group account-settings-panel">
              <div className="settings-panel-title">
                <span className="orca-kicker">Evolução planejada</span>
                <h2>Roteiro do produto</h2>
                <p>O Aferix está em desenvolvimento ativo. Confira as fases previstas.</p>
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
      </div>
    </PageShell>
  );
}
