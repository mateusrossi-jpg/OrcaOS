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
  History,
  Building,
  Key
} from "lucide-react";
import { 
  ERPLoader,
  DangerButton
} from '../components/ui';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { planStatusTitle } from '../utils/planHelpers';
import type { AppTab } from '../appTypes';
import { cn } from '../../utils/ui';
import { useRole } from '../../hooks/useRole';

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

// Dynamic lazy components
const ProfessionalProfileWorkspace = lazy(() => import('../../features/settings/components/ProfessionalProfileWorkspace').then((module) => ({ default: module.ProfessionalProfileWorkspace })));
const AppSecurityPanel = lazy(() => import('../../features/settings/components/AppSecurityPanel').then((module) => ({ default: module.AppSecurityPanel })));
const LocalBackupWorkspace = lazy(() => import('../../features/settings/components/LocalBackupWorkspace').then((module) => ({ default: module.LocalBackupWorkspace })));
const CloudSyncPanel = lazy(() => import('../../features/settings/components/CloudSyncPanel').then((module) => ({ default: module.CloudSyncPanel })));
const GoogleDriveBackupPanel = lazy(() => import('../../features/settings/components/GoogleDriveBackupPanel').then((module) => ({ default: module.GoogleDriveBackupPanel })));
const OfflineDiagnosticsPanel = lazy(() => import('../../features/settings/components/OfflineDiagnosticsPanel').then((module) => ({ default: module.OfflineDiagnosticsPanel })));

/**
 * MenuScreen: Administration & Governance Hub.
 * Refactored for Business Flow Foundation (Phase 4).
 */
export const MenuScreen = memo(function MenuScreen({ account, onNavigate }: MenuScreenProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  const { role } = useRole();
  
  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const userInitials = accountLabel.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AX';

  const isOwner = role === 'OWNER';
  const isSolo = role === 'SOLO';
  const isManager = role === 'MANAGER';
  const isSales = role === 'SALES';

  const adminItems = [];
  
  // Enterprise Administration
  if (isOwner || isManager) {
    adminItems.push({ title: 'Gestão de Empresa', desc: 'Dados fiscais e identidade', onClick: () => {}, icon: Building });
    adminItems.push({ title: 'Equipe e Acessos', desc: 'Controle de prestadores e permissões', onClick: () => onNavigate('team'), icon: Users });
  }

  // System Security & Cloud
  if (isOwner || isSolo) {
    adminItems.push({ title: 'Licença e Assinatura', desc: 'Plano e recursos ativos', onClick: () => onNavigate('store'), icon: Star });
    adminItems.push({ title: 'Backup e Sincronismo', desc: 'Proteção de dados em nuvem', onClick: () => setActiveSection('backup'), icon: Cloud });
    adminItems.push({ title: 'Acesso e Segurança', desc: 'PIN e autenticação biométrica', onClick: () => setActiveSection('security'), icon: Shield });
  }

  // Technical Diagnostics
  if (isOwner || isSolo || isManager) {
    adminItems.push({ title: 'Integridade do Sistema', desc: 'Diagnósticos técnicos offline', onClick: () => setActiveSection('diagnostics'), icon: Activity });
  }

  // Common items
  const supportItems = [
    { title: 'Central de Ajuda', desc: 'Tutoriais e suporte técnico', onClick: () => {}, icon: Info },
    { title: 'Alternar Perfil (Debug)', desc: 'Simular outras roles de acesso', onClick: () => window.dispatchEvent(new Event('aferix_open_debug')), icon: Cpu },
  ];

  const menuGroups = [];
  if (adminItems.length > 0) menuGroups.push({ title: 'Administração', items: adminItems });
  menuGroups.push({ title: 'Suporte e Debug', items: supportItems });

  const titleMap: Record<MenuSection, string> = {
    main: 'Administração.',
    profile: 'Perfil.',
    security: 'Segurança.',
    backup: 'Backup.',
    diagnostics: 'Diagnósticos.',
    about: 'Sobre.',
  };

  const isSubSection = activeSection !== 'main';

  return (
    <ScreenContainer className="pb-32">
      <AppHeader 
        title={titleMap[activeSection]}
        onBack={isSubSection ? () => setActiveSection('main') : undefined}
      />

      <div className="px-6 py-8 flex flex-col gap-12">
        
        {activeSection === 'main' ? (
          <>
            <ExecutiveSummaryGrid>
                 <ValueBlock label="Plano" value={account.plan === 'pro' ? 'PREMIUM' : 'FREE'} icon={<Star size={12} />} variant={account.plan === 'pro' ? "warning" : "default"} />
                 <ValueBlock label="Segurança" value="ATIVO" icon={<ShieldCheck size={12} />} variant="success" />
            </ExecutiveSummaryGrid>

            {/* IDENTITY HUB */}
            <SurfaceCard className="bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]/20" padding="lg" onClick={() => setActiveSection('profile')}>
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)] font-bold text-xl">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Body className="truncate font-bold uppercase">{accountLabel}</Body>
                    <div className="flex items-center gap-2 mt-1">
                       <Star className="h-3 w-3 text-[var(--accent-gold)] fill-current" />
                       <SectionLabel className="text-[var(--accent-gold)] tracking-[0.2em]">{planStatusTitle(account)}</SectionLabel>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-white/20" />
               </div>
            </SurfaceCard>

            {/* MENU GROUPS */}
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
                              <Body className="leading-tight text-[13px] font-bold uppercase tracking-tight">{item.title}</Body>
                              <Subtitle className="text-[11px] opacity-40">{item.desc}</Subtitle>
                           </Stack>
                        </InteractiveRow>
                      ))}
                    </Stack>
                 </SurfaceCard>
              </Section>
            ))}

            <Section className="mt-4 gap-10 pb-20">
               <DangerButton 
                 onClick={() => {
                   import('../../services/AuthService').then(({ AuthService }) => AuthService.logout());
                 }}
                 className="h-16 w-full !rounded-2xl !text-[11px] font-black uppercase tracking-widest"
               >
                  <LogOut size={16} className="mr-3" /> DESCONECTAR_ESTA_SESSÃO
               </DangerButton>
               <div className="text-center opacity-20">
                  <p className="text-sm font-bold text-[var(--accent-gold)] mb-1 uppercase tracking-tight">Vantagem Exclusiva Beta</p>
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
