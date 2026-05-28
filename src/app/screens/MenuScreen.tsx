import { useState, lazy, Suspense } from 'react';
import { 
  BackButton, 
  PageHeader, 
  PageShell, 
  Surface, 
  SectionTitle,
  ListCard
} from '../components/ui';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { planStatusTitle } from '../utils/planHelpers';
import type { AppTab } from '../appTypes';

const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const CloudSyncPanel = lazy(() => import('../../features/settings/components/CloudSyncPanel').then((module) => ({ default: module.CloudSyncPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const LegalCompliancePanel = lazy(() => import('../../features/settings/components/LegalCompliancePanel').then((module) => ({ default: module.LegalCompliancePanel })));

interface MenuScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
  onNavigate: (tab: AppTab) => void;
}

type MenuSection = 'main' | 'profile' | 'security' | 'backup' | 'about';

/**
 * MenuScreen V5 (The Advanced Settings Hub)
 * Total visual parity: Centered 440px, purified surfaces.
 */
export function MenuScreen({ account, onNavigate }: MenuScreenProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';

  const menuGroups = [
    {
      title: 'GESTÃO OPERACIONAL',
      items: [
        { title: 'Base de Clientes', onClick: () => onNavigate('base'), icon: '👥' },
        { title: 'Catálogo Profissional', onClick: () => onNavigate('catalog'), icon: '📦' },
        { title: 'Relatórios e BI', onClick: () => onNavigate('reports'), icon: '📊' },
      ]
    },
    {
      title: 'SEGURANÇA E DADOS',
      items: [
        { title: 'Backup e Sincronismo', onClick: () => setActiveSection('backup'), icon: '☁️' },
        { title: 'Acesso e PIN', onClick: () => setActiveSection('security'), icon: '🔒' },
      ]
    },
    {
      title: 'ASSINATURA E PERFIL',
      items: [
        { 
          title: 'Meu Perfil', 
          context: `${accountLabel} · ${planStatusTitle(account)}`,
          onClick: () => setActiveSection('profile'),
          icon: '👤'
        },
        { title: 'Gerenciar Licença', onClick: () => onNavigate('store'), icon: '⭐' },
        { title: 'Sobre o ERP', onClick: () => setActiveSection('about'), icon: 'ℹ️' },
      ]
    }
  ];
  
  if (activeSection !== 'main') {
    return (
      <div className="aferix-settings-detail-container" style={{ maxWidth: '440px', margin: '0 auto' }}>
        <Suspense fallback={<Surface elevation={1} padding="md"><p>Preparando ambiente...</p></Surface>}>
          {activeSection === 'profile' && (
            <Surface elevation={1} padding="md" className="settings-group">
              <ProfessionalProfileWorkspace onBack={() => setActiveSection('main')} />
            </Surface>
          )}
          {activeSection === 'security' && (
            <Surface elevation={1} padding="md" className="settings-group">
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <AppSecurityPanel />
            </Surface>
          )}
          {activeSection === 'backup' && (
            <Surface elevation={1} padding="md" className="settings-group">
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <LocalBackupWorkspace includeLinkedSettings={false} />
              <CloudSyncPanel />
              <GoogleDriveBackupPanel />
            </Surface>
          )}
          {activeSection === 'about' && (
            <Surface elevation={1} padding="md" className="settings-group">
              <BackButton label="Voltar ao Menu" onClick={() => setActiveSection('main')} />
              <LegalCompliancePanel />
              <Surface elevation={0} padding="md" className="aferix-mt-lg">
                <SectionTitle title="Sobre o Aferix" />
                <p className="aferix-text-muted text-small">O sistema operacional definitivo para prestadores de serviço técnicos. Versão 0.1.0-rc.1</p>
              </Surface>
            </Surface>
          )}
        </Suspense>
      </div>
    );
  }

  return (
    <div className="aferix-menu-container" style={{ maxWidth: '440px', margin: '0 auto' }}>
      <PageHeader title="Mais" sourceLabel="Configurações e utilitários técnicos." />

      <div className="aferix-d-flex aferix-flex-column aferix-gap-lg aferix-mt-lg">
        {menuGroups.map((group) => (
          <div key={group.title} className="menu-group-section">
            <SectionTitle title={group.title} />
            <ListCard className="aferix-mt-sm">
              {group.items.map((item) => (
                <button
                  key={item.title}
                  className="aferix-menu-row-button"
                  type="button"
                  onClick={item.onClick}
                >
                  <span className="row-icon">{item.icon}</span>
                  <div className="row-body">
                    <strong className="row-title">{item.title}</strong>
                    {'context' in item && <span className="row-context">{item.context}</span>}
                  </div>
                  <span className="row-arrow">›</span>
                </button>
              ))}
            </ListCard>
          </div>
        ))}
      </div>
      
      <footer className="aferix-mt-2xl aferix-text-center aferix-pb-xl">
        <p className="aferix-font-xs aferix-text-muted" style={{ opacity: 0.5 }}>AFERIX ERP OPERACIONAL © 2026</p>
      </footer>

      <style>{`
        .aferix-menu-row-button {
          display: flex;
          align-items: center;
          width: 100%;
          padding: var(--sz-md);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-dim);
          text-align: left;
          gap: var(--sz-md);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .aferix-menu-row-button:last-child {
          border-bottom: none;
        }

        .aferix-menu-row-button:hover {
          background: var(--bg-active);
        }

        .row-icon {
          font-size: 20px;
          min-width: 24px;
          display: flex;
          justify-content: center;
        }

        .row-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .row-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .row-context {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .row-arrow {
          font-size: 20px;
          color: var(--border-medium);
          font-weight: 300;
        }
      `}</style>
    </div>
  );
}
