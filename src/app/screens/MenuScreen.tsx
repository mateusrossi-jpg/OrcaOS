import { useState, lazy, Suspense } from 'react';
import { 
  BackButton, 
  PageHeader, 
  PageShell, 
  PanelCard, 
  SectionTitle 
} from '../components/ui';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
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

export function MenuScreen({ account, onNavigate }: MenuScreenProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';

  const menuGroups = [
    {
      title: 'OPERACIONAL',
      items: [
        { title: 'Clientes', onClick: () => onNavigate('base'), icon: '👥' },
        { title: 'Catálogo de Serviços', onClick: () => onNavigate('catalog'), icon: '📦' },
        { title: 'Relatórios', onClick: () => onNavigate('reports'), icon: '📊' },
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        { title: 'Backup e Sincronização', onClick: () => setActiveSection('backup'), icon: '☁️' },
        { title: 'Segurança', onClick: () => setActiveSection('security'), icon: '🔒' },
      ]
    },
    {
      title: 'PLATAFORMA',
      items: [
        { 
          title: 'Perfil Profissional', 
          context: `${accountLabel} · ${planStatusTitle(account)}`,
          onClick: () => setActiveSection('profile'),
          icon: '👤'
        },
        { title: 'Licença Pro', onClick: () => onNavigate('store'), icon: '⭐' },
        { title: 'Sobre o Aferix', onClick: () => setActiveSection('about'), icon: 'ℹ️' },
      ]
    }
  ];
  
  if (activeSection !== 'main') {
    // ... rest of details view logic remains same
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
      <PageHeader title="Mais" sourceLabel="Configurações e utilitários do sistema." />

      <div className="aferix-d-flex aferix-flex-column aferix-gap-lg">
        {menuGroups.map((group) => (
          <div key={group.title} className="menu-group-section">
            <SectionTitle title={group.title} />
            <PanelCard className="menu-utility-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="menu-utility-list">
                {group.items.map((item) => (
                  <button
                    key={item.title}
                    className="menu-utility-item"
                    type="button"
                    onClick={item.onClick}
                    style={{ border: 'none', borderRadius: 0, borderBottom: '1px solid var(--aferix-border)' }}
                  >
                    <div className="menu-utility-content">
                      <div className="aferix-d-flex aferix-align-center aferix-gap-sm">
                        <span className="utility-icon">{item.icon}</span>
                        <span className="utility-item-title">{item.title}</span>
                      </div>
                      {'context' in item && <span className="utility-meta" style={{ marginLeft: '28px' }}>{item.context}</span>}
                    </div>
                    <span className="row-arrow">›</span>
                  </button>
                ))}
              </div>
            </PanelCard>
          </div>
        ))}
      </div>
      
      <div className="aferix-mt-xl aferix-text-center">
        <p className="aferix-font-xs aferix-text-muted">Aferix ERP © 2026</p>
      </div>
    </PageShell>
  );
}
