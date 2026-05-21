import { useState, lazy, Suspense } from 'react';
import { BackButton, PageHeader, PageShell } from '../components/ui';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import {
  signInEmailAccount,
  signInGoogleAccount,
  signOutLocalAccount,
} from '../../core/access/accountPlanStorage';
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from '../../core/access/googleAccountAuth';
import { planStatusTitle } from '../utils/planHelpers';
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
      <PageShell className="wide-screen">
        <Suspense fallback={<div className="empty-state-card premium-empty-state"><p>Carregando...</p></div>}>
          {activeSection === 'profile' && (
            <div className="settings-group account-settings-panel">
              <ProfessionalProfileWorkspace onBack={() => setActiveSection('main')} />
            </div>
          )}
          {activeSection === 'security' && (
            <>
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <AppSecurityPanel />
            </>
          )}
          {activeSection === 'backup' && (
            <>
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <LocalBackupWorkspace includeLinkedSettings={false} />
              <GoogleDriveBackupPanel />
            </>
          )}
          {activeSection === 'about' && (
            <>
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <LegalCompliancePanel />
              <div className="settings-group account-settings-panel">
                 <SectionHeader title="Sobre o Aferix" eyebrow="Informação" />
                 <p className="menu-about-note">Versão MVP · Local-first</p>
              </div>
            </>
          )}
        </Suspense>
      </PageShell>
    );
  }

  return (
    <PageShell className="menu-overview-screen">
      <PageHeader 
        title="Configurações" 
        description="Gerencie seu perfil, conta e preferências do aplicativo." 
      />

      <div className="aferix-panel-card">
        <SectionHeader title="Sistema" eyebrow="Ajustes" />
        <div className="menu-list-simple">
          <button className="simple-menu-row" onClick={() => goTo('catalog')}>
            <div className="row-content">
              <strong>Catálogo</strong>
              <small>Meus itens e serviços</small>
            </div>
            <span className="row-arrow">›</span>
          </button>
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
    </PageShell>
  );
}
