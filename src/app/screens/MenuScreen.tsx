import { useState, lazy, Suspense } from 'react';
import { 
  Users, 
  Package, 
  LogOut, 
  Shield,
  Cloud,
  Info,
  Star,
  FileBarChart,
  ChevronLeft
} from "lucide-react";
import { 
  ERPLoader,
} from '../components/ui';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { planStatusTitle } from '../utils/planHelpers';
import type { AppTab } from '../appTypes';

// Unified UI Architecture Layers
import { SemanticScreen } from '../../ui/runtime';
import { OperationalFlowLayout } from '../../ui/layouts';
import { Priority } from '../../ui/attention';
import { AppHeader, SectionTitle, SurfaceCard, OperationalListItem } from '../../ui/primitives';

interface MenuScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
  onNavigate: (tab: AppTab) => void;
}

type MenuSection = 'main' | 'profile' | 'security' | 'backup' | 'about';

/**
 * MenuScreen: Executive settings and system adjustments hub.
 * Mission: Visual Convergence (Cohesive OS Hub style).
 */
export function MenuScreen({ account, onNavigate }: MenuScreenProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const userInitials = accountLabel.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AX';

  const menuGroups = [
    {
      title: 'GESTÃO OPERACIONAL',
      items: [
        { title: 'Base de Clientes', desc: 'Carteira estratégica e CRM', onClick: () => onNavigate('base'), icon: Users },
        { title: 'Catálogo Profissional', desc: 'Sua biblioteca de serviços', onClick: () => onNavigate('catalog'), icon: Package },
        { title: 'Relatórios e BI', desc: 'Inteligência e performance', onClick: () => onNavigate('reports'), icon: FileBarChart },
      ]
    },
    {
      title: 'SEGURANÇA E NÚCLEO',
      items: [
        { title: 'Backup e Sincronismo', desc: 'Proteção de dados em nuvem', onClick: () => setActiveSection('backup'), icon: Cloud },
        { title: 'Acesso e Segurança', desc: 'PIN e autenticação biométrica', onClick: () => setActiveSection('security'), icon: Shield },
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        { title: 'Gerenciar Licença', desc: planStatusTitle(account), onClick: () => onNavigate('store'), icon: Star },
        { title: 'Sobre o Aferix', desc: 'Versão 0.1.0-RC.1', onClick: () => setActiveSection('about'), icon: Info },
      ]
    }
  ];
  
  if (activeSection !== 'main') {
    return (
      <SemanticScreen type="workspace">
        <OperationalFlowLayout
          header={
            <button 
              onClick={() => setActiveSection('main')} 
              className="flex items-center gap-sm text-ui-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-black tracking-widest"
            >
              <ChevronLeft className="h-4 w-4" /> VOLTAR AO MENU
            </button>
          }
        >
          <Suspense fallback={<ERPLoader message="Carregando módulo..." />}>
            {activeSection === 'profile' && (
              <ProfessionalProfileWorkspace onBack={() => setActiveSection('main')} />
            )}
            {activeSection === 'security' && <AppSecurityPanel />}
            {activeSection === 'backup' && (
              <div className="flex flex-col gap-lg">
                <LocalBackupWorkspace includeLinkedSettings={false} />
                <CloudSyncPanel />
                <GoogleDriveBackupPanel />
              </div>
            )}
            {activeSection === 'about' && (
              <div className="flex flex-col gap-lg">
                <LegalCompliancePanel />
                <SurfaceCard>
                  <SectionTitle className="mt-0">Núcleo do Sistema</SectionTitle>
                  <p className="text-ui-base font-medium text-[var(--text-secondary)] leading-relaxed">
                    O Aferix é o sistema operacional definitivo para prestadores de serviço técnicos que buscam precisão matemática e rentabilidade real. 
                    <br/><br/>
                    Build 0.1.0-RC.1
                  </p>
                </SurfaceCard>
              </div>
            )}
          </Suspense>
        </OperationalFlowLayout>
      </SemanticScreen>
    );
  }

  return (
    <SemanticScreen type="workspace">
      <OperationalFlowLayout
        header={
          <AppHeader eyebrow="SISTEMA" title="Ajustes" subtitle="Controle as preferências globais e a estrutura operacional do seu negócio." />
        }
      >
        {/* 1. IDENTITY HUB (P1) */}
        <Priority.P1>
          <SurfaceCard 
            className="group flex items-center gap-lg cursor-pointer hover:bg-white/[0.08] relative overflow-hidden" 
            onClick={() => setActiveSection('profile')}
          >
            <div className="h-16 w-16 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)] font-bold text-h2 border border-[var(--accent-gold)]/20 shadow-glow shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-h3 text-[var(--text-primary)] mb-1 truncate">{accountLabel.toUpperCase()}</p>
              <div className="flex items-center gap-2">
                 <Star className="h-3 w-3 text-[var(--accent-gold)] fill-current" />
                 <span className="text-[10px] font-black text-[var(--accent-gold)] tracking-[0.2em]">{planStatusTitle(account).toUpperCase()}</span>
              </div>
            </div>
            
            {/* Background Texture for the Identity card */}
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[var(--accent-gold)]/5 to-transparent pointer-events-none" />
          </SurfaceCard>
        </Priority.P1>

        {/* 2. SETTINGS LISTS (P2) */}
        <Priority.P2 className="flex flex-col gap-xl pb-32">
          {menuGroups.map((group) => (
            <div key={group.title} className="flex flex-col">
              <SectionTitle>{group.title}</SectionTitle>
              <div className="flex flex-col gap-sm">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <OperationalListItem 
                      key={item.title}
                      title={item.title.toUpperCase()}
                      subtitle={item.desc}
                      action={<Icon className="h-3.5 w-3.5 opacity-60" />}
                      onClick={item.onClick}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-8 flex flex-col gap-lg">
            <button className="h-16 w-full flex items-center justify-center gap-sm rounded-2xl bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20 text-[var(--accent-red)] font-black text-ui-base transition-all hover:bg-[var(--accent-red)]/20 active:scale-[0.95]">
              <LogOut className="h-5 w-5" /> DESCONECTAR DISPOSITIVO
            </button>
            
            <Priority.P3 className="text-center mt-6">
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] opacity-30">
                AFERIX OPERATIONAL OS © 2026
              </p>
              <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-20 mt-1.5">
                ENGINE.V5 • BUILD.0.1.0-RC.1
              </p>
            </Priority.P3>
          </div>
        </Priority.P2>
      </OperationalFlowLayout>
    </SemanticScreen>
  );
}

const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const CloudSyncPanel = lazy(() => import('../../features/settings/components/CloudSyncPanel').then((module) => ({ default: module.CloudSyncPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const LegalCompliancePanel = lazy(() => import('../../features/settings/components/LegalCompliancePanel').then((module) => ({ default: module.LegalCompliancePanel })));
