import { useState, lazy, Suspense, memo } from 'react';
import { 
  Users, 
  Package, 
  LogOut, 
  Shield,
  Cloud,
  Info,
  Star,
  FileBarChart,
  ChevronLeft,
  Activity,
  ChevronRight,
  ShieldCheck,
  HardDrive,
  Cpu,
  Lock,
  History
} from "lucide-react";
import { 
  ERPLoader,
  DangerButton
} from '../components/ui';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { planStatusTitle } from '../utils/planHelpers';
import type { AppTab } from '../appTypes';
import { cn } from '../../utils/ui';

// ── Unified UI Architecture ──────────────────────────────────────────────────
import { 
  ScreenContainer, 
  AppHeader, 
  SurfaceCard, 
  SectionLabel,
  ExecutiveSummaryGrid,
  ValueBlock,
  SemanticBadge,
  InteractiveRow,
  OpsChip,
  Stack,
  Section,
  Title,
  Subtitle,
  Body,
  Heading,
  Value
} from '../../ui/system';

interface MenuScreenProps {
  account: AferixAccountState;
  onAccountChange: (account: AferixAccountState) => void;
  onNavigate: (tab: AppTab) => void;
}

type MenuSection = 'main' | 'profile' | 'security' | 'backup' | 'about' | 'diagnostics';

/**
 * MenuScreen: Executive settings and system adjustments hub.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
 */
export const MenuScreen = memo(function MenuScreen({ account, onNavigate }: MenuScreenProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const userInitials = accountLabel.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AX';

  const menuGroups = [
    {
      title: 'Gestão Operacional',
      items: [
        { title: 'Base de Clientes', desc: 'Carteira estratégica e CRM', onClick: () => onNavigate('base'), icon: Users },
        { title: 'Catálogo Profissional', desc: 'Sua biblioteca de serviços', onClick: () => onNavigate('catalog'), icon: Package },
        { title: 'Relatórios e BI', desc: 'Inteligência e performance', onClick: () => onNavigate('reports'), icon: FileBarChart },
      ]
    },
    {
      title: 'Segurança e Núcleo',
      items: [
        { title: 'Backup e Sincronismo', desc: 'Proteção de dados em nuvem', onClick: () => setActiveSection('backup'), icon: Cloud },
        { title: 'Acesso e Segurança', desc: 'PIN e autenticação biométrica', onClick: () => setActiveSection('security'), icon: Shield },
        { title: 'Diagnósticos de Sistema', desc: 'Resiliência e integridade offline', onClick: () => setActiveSection('diagnostics'), icon: Activity },
      ]
    }
  ];

  const titleMap: Record<MenuSection, string> = {
    main: 'Ajustes.',
    profile: 'Perfil.',
    security: 'Segurança.',
    backup: 'Backup.',
    diagnostics: 'Diagnósticos.',
    about: 'Sobre.',
  };

  const isSubSection = activeSection !== 'main';

  const chips = (
    <>
       <OpsChip icon={<Lock size={11} />} label="PIN_ATIVO" accent={false} />
       <OpsChip icon={<History size={11} />} label="SYNC_OK" accent="green" />
    </>
  );

  return (
    <ScreenContainer className="pb-32">
      
      {/* ━━━ AUTHORITATIVE HEADER ━━━ */}
      <AppHeader 
        title={titleMap[activeSection]}
        onBack={isSubSection ? () => setActiveSection('main') : undefined}
        chips={!isSubSection ? chips : undefined}
      />

      <div className="px-4 flex flex-col gap-8">
        
        {activeSection === 'main' ? (
          <>
            {/* ━━━ EXECUTIVE COCKPIT ━━━ */}
            <ExecutiveSummaryGrid>
               <ValueBlock label="Licença" value={account.plan === 'pro' ? 'PREMIUM' : 'FREE'} icon={<Star size={12} />} variant={account.plan === 'pro' ? "warning" : "default"} />
               <ValueBlock label="Segurança" value="PROTEGIDO" icon={<ShieldCheck size={12} />} variant="success" />
            </ExecutiveSummaryGrid>

            {/* 1. IDENTITY HUB */}
            <SurfaceCard variant="cinematic" padding="lg" onClick={() => setActiveSection('profile')}>
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[#D4A94E]/10 border border-[#D4A94E]/20 flex items-center justify-center text-[#D4A94E] font-bold text-xl">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Body className="truncate font-bold uppercase">{accountLabel}</Body>
                    <div className="flex items-center gap-2 mt-1">
                       <Star className="h-3 w-3 text-[#D4A94E] fill-current" />
                       <SectionLabel className="text-[var(--accent-gold)] tracking-[0.2em]">{planStatusTitle(account)}</SectionLabel>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-white/20" />
               </div>
            </SurfaceCard>

            {/* 2. MENU GROUPS */}
            {menuGroups.map((group) => (
              <Section key={group.title} className="gap-3">
                 <SectionLabel className="ml-2">{group.title}</SectionLabel>
                 <SurfaceCard padding="none">
                    <Stack className="gap-0">
                      {group.items.map((item, idx) => (
                        <InteractiveRow 
                          key={item.title}
                          onClick={item.onClick}
                          hasChevron
                          className={idx !== 0 ? "border-t border-white/[0.05]" : ""}
                          leftSlot={
                            <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.07] grid place-items-center">
                               <item.icon size={16} className="text-white/40" />
                            </div>
                          }
                        >
                           <Stack className="gap-0.5">
                              <Body className="leading-tight">{item.title}</Body>
                              <Subtitle className="text-[11px] opacity-40">{item.desc}</Subtitle>
                           </Stack>
                        </InteractiveRow>
                      ))}
                    </Stack>
                 </SurfaceCard>
              </Section>
            ))}

            <Section className="mt-4 gap-10 pb-20">
               <DangerButton className="h-16 w-full !rounded-2xl !text-[11px] font-black uppercase tracking-widest">
                  <LogOut size={16} className="mr-3" /> DESCONECTAR_ESTA_SESSÃO
               </DangerButton>
               <div className="text-center opacity-20">
                  <Body className="text-[9px] font-bold font-mono uppercase tracking-[0.4em]">Aferix OS v0.1.0-RC1</Body>
               </div>
            </Section>
          </>
        ) : (
          <Suspense fallback={<ERPLoader message="Carregando módulo..." />}>
             {activeSection === 'profile' && <ProfessionalProfileWorkspace hideTitle />}
             {activeSection === 'security' && <AppSecurityPanel />}
             {activeSection === 'backup' && (
               <Section className="gap-6">
                 <LocalBackupWorkspace includeLinkedSettings={false} />
                 <CloudSyncPanel />
                 <GoogleDriveBackupPanel />
               </Section>
             )}
             {activeSection === 'diagnostics' && <OfflineDiagnosticsPanel />}
          </Suspense>
        )}

      </div>
    </ScreenContainer>
  );
});

const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const CloudSyncPanel = lazy(() => import('../../features/settings/components/CloudSyncPanel').then((module) => ({ default: module.CloudSyncPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const OfflineDiagnosticsPanel = lazy(() => import('../../features/settings/components/OfflineDiagnosticsPanel').then((module) => ({ default: module.OfflineDiagnosticsPanel })));
