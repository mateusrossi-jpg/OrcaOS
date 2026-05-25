import { useState, lazy, Suspense } from 'react';
import { 
  BackButton, 
  PageHeader, 
  PageShell, 
  PanelCard, 
  ListCard, 
  ListItem, 
  SectionTitle 
} from '../components/ui';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import {
  signInEmailAccount,
  signInGoogleAccount,
  signOutLocalAccount,
} from '../../core/access/accountPlanStorage';
import { isGoogleAccountLoginConfigured, requestGoogleAccountProfile } from '../../core/access/googleAccountAuth';
import { planStatusTitle } from '../utils/planHelpers';
import type { AppTab } from '../appTypes';

const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const LegalCompliancePanel = lazy(() => import('../../features/settings/components/LegalCompliancePanel').then((module) => ({ default: module.LegalCompliancePanel })));

interface MenuScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
  onNavigate: (tab: AppTab) => void;
}

type MenuSection = 'main' | 'profile' | 'security' | 'backup' | 'about';

export function MenuScreen({ account, onAccountChange, onNavigate }: MenuScreenProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showAllSystemItems, setShowAllSystemItems] = useState(false);
  const [emailDraft, setEmailDraft] = useState(account.email);
  const [nameDraft, setNameDraft] = useState(account.displayName === 'Visitante' ? '' : account.displayName);
  const googleReady = isGoogleAccountLoginConfigured();
  
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const systemItems = [
    {
      title: 'Catálogo',
      onClick: () => onNavigate('catalog'),
    },
    {
      title: 'Perfil e Conta',
      context: `${accountLabel} · ${planStatusTitle(account)}`,
      onClick: () => setActiveSection('profile'),
    },
    {
      title: 'Licença Pro',
      onClick: () => onNavigate('store'),
    },
    {
      title: 'Backup e Sincronização',
      onClick: () => setActiveSection('backup'),
    },
    {
      title: 'Segurança',
      onClick: () => setActiveSection('security'),
    },
    {
      title: 'Sobre o Aferix',
      onClick: () => setActiveSection('about'),
    },
  ] as const;
  const visibleSystemItems = showAllSystemItems ? systemItems : systemItems.slice(0, 5);
  const hiddenSystemItemsCount = Math.max(systemItems.length - visibleSystemItems.length, 0);
  
  function registerEmailAccount() {
    try {
      const nextAccount = signInEmailAccount(emailDraft, nameDraft);
      onAccountChange(nextAccount);
      setFeedback('Conta por e-mail cadastrada.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao cadastrar e-mail.');
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
      setFeedback(error instanceof Error ? error.message : 'Falha ao entrar com Google.');
    } finally {
      setIsSigningIn(false);
    }
  }

  if (activeSection !== 'main') {
    return (
      <PageShell className="wide-screen">
        <Suspense fallback={<PanelCard><p>Carregando...</p></PanelCard>}>
          {activeSection === 'profile' && (
            <PanelCard className="settings-group account-settings-panel">
              <ProfessionalProfileWorkspace onBack={() => setActiveSection('main')} />
            </PanelCard>
          )}
          {activeSection === 'security' && (
            <PanelCard className="settings-group account-settings-panel">
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <AppSecurityPanel />
            </PanelCard>
          )}
          {activeSection === 'backup' && (
            <PanelCard className="settings-group account-settings-panel">
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <LocalBackupWorkspace includeLinkedSettings={false} />
              <GoogleDriveBackupPanel />
            </PanelCard>
          )}
          {activeSection === 'about' && (
            <PanelCard className="settings-group account-settings-panel">
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <LegalCompliancePanel />
              <PanelCard>
                <SectionTitle title="Sobre o Aferix" />
                <p className="menu-about-note menu-about-note-spaced">Versão MVP · Local-first</p>
              </PanelCard>
            </PanelCard>
          )}
        </Suspense>
      </PageShell>
    );
  }

  return (
    <PageShell className="menu-overview-screen">
      <PageHeader title="Configurações" />

      <PanelCard className="menu-utility-panel">
        <div className="menu-utility-list">
          {visibleSystemItems.map((item) => (
            <button
              key={item.title}
              className="menu-utility-item"
              type="button"
              onClick={item.onClick}
            >
              <span className="utility-item-title">{item.title}</span>
              {'context' in item && <span className="utility-meta">{item.context}</span>}
              <span className="row-arrow">›</span>
            </button>
          ))}
          {hiddenSystemItemsCount > 0 && (
            <button className="menu-utility-item" type="button" onClick={() => setShowAllSystemItems(true)}>
              <span className="utility-item-title">Ver todos ({hiddenSystemItemsCount})</span>
            </button>
          )}
        </div>
      </PanelCard>
    </PageShell>
  );
}
