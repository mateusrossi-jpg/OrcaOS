import { useState, lazy } from 'react';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { accountPlanService } from '../../services/accountPlanService';
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from '../../core/access/googleAccountAuth';
import { planStatusTitle, planStatusDescription } from '../utils/planHelpers';
import { AferixTabs, PageHeader, PageShell, Surface, PrimaryButton, SecondaryButton, Button, Input } from '../components/ui';

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

export function SettingsScreen({ account, onAccountChange: _onAccountChange }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailDraft, setEmailDraft] = useState(account.email);
  const [nameDraft, setNameDraft] = useState(account.displayName === 'Visitante' ? '' : account.displayName);
  const googleReady = isGoogleAccountLoginConfigured();
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const accountDescription = account.status === 'google' ? `${account.email || 'E-mail não informado'} · Google vinculado` : account.status === 'email' ? `${account.email} · cadastro por e-mail` : account.status === 'local' ? 'Conta local deste dispositivo' : 'Modo visitante local-first';

  async function registerEmailAccount() {
    setIsSigningIn(true);
    try {
      await accountPlanService.signInEmailAccount(emailDraft, nameDraft);
      setFeedback('Conta por e-mail cadastrada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao cadastrar e-mail.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function connectGoogle() {
    setIsSigningIn(true);
    setFeedback(null);
    try {
      const profile = await requestGoogleAccountProfile();
      await accountPlanService.signInGoogleAccount(profile);
      setFeedback('Conta Google conectada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao entrar com Google.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function connectLocal() {
    setIsSigningIn(true);
    try {
      await accountPlanService.signInLocalAccount();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao entrar localmente.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function disconnectAccount() {
    setIsSigningIn(true);
    try {
      await accountPlanService.signOutLocalAccount();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao sair da conta.');
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <PageShell className="wide-screen settings-screen-premium">
      <PageHeader 
        title="Configurações" 
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
          <Surface elevation={1} padding="md" className="settings-group account-settings-panel">
            <div className="settings-panel-title">
              <h2>Sua Conta</h2>
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
                <Input label="Nome profissional" value={nameDraft} placeholder="Ex.: Profissional técnico" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNameDraft(event.target.value)} />
                <Input label="E-mail de acesso" type="email" value={emailDraft} placeholder="profissional@email.com" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmailDraft(event.target.value)} />

              </div>
              <div className="settings-actions-row-premium">
                <PrimaryButton disabled={isSigningIn} onClick={registerEmailAccount}>Cadastrar e-mail</PrimaryButton>
                <SecondaryButton disabled={!googleReady || isSigningIn} onClick={connectGoogle}>{isSigningIn ? 'Conectando...' : 'Vincular Google'}</SecondaryButton>
                <Button variant="ghost" disabled={isSigningIn} onClick={connectLocal}>Entrar localmente</Button>
                <Button variant="ghost" disabled={isSigningIn} onClick={disconnectAccount}>Sair</Button>
              </div>
              {feedback && <p className="general-added-message">{feedback}</p>}
            </section>
          </Surface>
        )}

        {activeTab === 'company' && <ProfessionalProfileWorkspace onBack={() => setActiveTab('account')} />}

        {activeTab === 'security' && <AppSecurityPanel />}

        {activeTab === 'backup' && (
          <div className="backup-settings-flow aferix-d-flex aferix-flex-column aferix-gap-md">
            <LocalBackupWorkspace includeLinkedSettings={false} />
            <GoogleDriveBackupPanel />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="aferix-d-flex aferix-flex-column aferix-gap-md">
            <LegalCompliancePanel />
            <Surface elevation={1} padding="md">
              <div className="settings-panel-title">
                <h2>Sobre o Aferix</h2>
                <p className="aferix-text-muted aferix-mt-sm">Versão MVP · Local-first ERP</p>
              </div>
            </Surface>
          </div>
        )}
      </div>
    </PageShell>
  );
}
