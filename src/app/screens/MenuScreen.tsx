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
      subtitle: 'Meus itens e serviços',
      onClick: () => onNavigate('catalog'),
    },
    {
      title: 'Perfil e Conta',
      subtitle: `${accountLabel} · ${planStatusTitle(account)}`,
      onClick: () => setActiveSection('profile'),
    },
    {
      title: 'Licença Pro',
      subtitle: 'Planos e recursos extras',
      onClick: () => onNavigate('store'),
    },
    {
      title: 'Backup e Sincronização',
      subtitle: 'Drive e exportação local',
      onClick: () => setActiveSection('backup'),
    },
    {
      title: 'Segurança',
      subtitle: 'PIN e proteção de acesso',
      onClick: () => setActiveSection('security'),
    },
    {
      title: 'Sobre o Aferix',
      subtitle: 'Privacidade e termos',
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
                <SectionTitle title="Sobre o Aferix" eyebrow="Base" />
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
      <PageHeader 
        title="Base · Configurações" 
        description="Gerencie seu perfil, conta e preferências do aplicativo." 
      />

      <ListCard title="Sistema" subtitle="Base">
        {visibleSystemItems.map((item) => (
          <ListItem
            key={item.title}
            title={item.title}
            subtitle={item.subtitle}
            onClick={item.onClick}
            action={<span className="row-arrow">›</span>}
          />
        ))}
        {systemItems.length > 5 && (
          <button
            type="button"
            className="list-expand-toggle"
            onClick={() => setShowAllSystemItems((current) => !current)}
          >
            {showAllSystemItems ? "Ver menos" : `Ver mais (${hiddenSystemItemsCount})`}
          </button>
        )}
      </ListCard>
    </PageShell>
  );
}
