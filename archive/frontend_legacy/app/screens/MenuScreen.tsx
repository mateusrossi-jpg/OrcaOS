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
  Key,
  RefreshCw,
  Wifi,
  WifiOff,
  CloudCheck,
  Database,
  Map,
  Calendar,
  Truck,
  Wrench,
  ClipboardList,
  Kanban,
  FileText,
  FolderOpen
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

import { trustLayer } from '../../core/trust/TrustLayer';
import { cloudSyncService } from '../../services/CloudSyncService';
import { useCloudSyncState } from '../../hooks/useCloudSyncState';

/**
 * MenuScreen: Administration & Governance Hub.
 * Refactored for Business Flow Foundation (Phase 4).
 */
export const MenuScreen = memo(function MenuScreen({ account, onNavigate }: MenuScreenProps) {
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  const { role } = useRole();
  const { isOnline, pendingCount, syncState, refresh: refreshSync } = useCloudSyncState();

  const handleCheckSync = async () => {
    await cloudSyncService.syncCloudToLocal();
    refreshSync();
  };

  const handleForceSync = async () => {
    await cloudSyncService.syncLocalToCloud();
    refreshSync();
  };

  const accountLabel = account.status === 'google' || account.status === 'email' || account.status === 'local' ? account.displayName : 'Sem login';
  const userInitials = accountLabel.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AX';

  const isOwner = role === 'OWNER';
  const isSolo = role === 'SOLO';
  const isManager = role === 'MANAGER';
  const isSales = role === 'SALES';
  const isField = role === 'FIELD';
  const isCustomer = role === 'CUSTOMER';

  const comingSoon = (title: string) => trustLayer.emit({
    type: 'info',
    title: 'Recurso em Breve',
    description: `O módulo de ${title} está sendo preparado para o lançamento oficial.`,
    status: 'local'
  });

  const operationalItems = [];
  const commercialItems = [];
  const adminItems = [];
  const systemItems = [];
  const supportItems = [
    { title: 'Central de Ajuda', desc: 'Tutoriais e suporte técnico', onClick: () => { comingSoon('Central de Ajuda'); }, icon: Info },
  ];

  // 1. Operational Items
  if (isOwner || isSolo || isManager || isField) {
    operationalItems.push({ title: 'Agenda de Serviços', desc: 'Atendimentos e ordens de serviço', icon: Calendar, onClick: () => onNavigate('agenda') });
    operationalItems.push({ title: 'Laudos Técnicos', desc: 'Visualizar e emitir laudos de campo', icon: Activity, onClick: () => onNavigate('diagnostics') });
    operationalItems.push({ title: 'Prontuário de Ativos', desc: 'Gerenciar equipamentos de clientes', icon: Wrench, onClick: () => onNavigate('assets') });
    operationalItems.push({ title: 'Checklists & PMOC', desc: 'Executar rotinas e vistorias ativas', icon: ClipboardList, onClick: () => onNavigate('checklists') });
  }
  if (isOwner || isSolo || isManager) {
    operationalItems.push({ title: 'Mesa de Despacho', desc: 'Programação de prestadores em tempo real', icon: Truck, onClick: () => onNavigate('dispatch') });
    operationalItems.push({ title: 'Mapa de Cobertura', desc: 'Distribuição geográfica de operações', icon: Map, onClick: () => onNavigate('map') });
    operationalItems.push({ title: 'Modelos de Checklist', desc: 'Configuração de checklists e laudos', icon: ClipboardList, onClick: () => onNavigate('checklist-manager') });
  }

  // 2. Commercial Items
  if (isOwner || isSolo || isManager || isSales) {
    commercialItems.push({ title: 'Pipeline de Vendas', desc: 'Funil e oportunidades comerciais', icon: Kanban, onClick: () => onNavigate('pipeline') });
    commercialItems.push({ title: 'Propostas & Orçamentos', desc: 'Gerador e base de orçamentos', icon: FileText, onClick: () => onNavigate('budgets') });
    commercialItems.push({ title: 'Catálogo de Insumos', desc: 'Kits de manutenção e tabelas de preços', icon: FolderOpen, onClick: () => onNavigate('catalog') });
  } else if (isCustomer) {
    commercialItems.push({ title: 'Suas Propostas', desc: 'Orçamentos enviados para aprovação', icon: FileText, onClick: () => onNavigate('budgets') });
  }

  // 3. Admin/Management Items
  if (isOwner || isSolo || isManager) {
    adminItems.push({ title: 'Dados da Empresa', desc: 'Configurações fiscais e de marca', icon: Building, onClick: () => comingSoon('Dados da Empresa') });
    adminItems.push({ title: 'Equipe e Acessos', desc: 'Cadastro de técnicos e colaboradores', icon: Users, onClick: () => onNavigate('team') });
    adminItems.push({ title: 'Base de Clientes', desc: 'Cadastro geral de clientes e locais', icon: Users, onClick: () => onNavigate('clients') });
    adminItems.push({ title: 'Índice de Reputação', desc: 'Reviews e satisfação NPS', icon: ShieldCheck, onClick: () => onNavigate('reputation') });
    adminItems.push({ title: 'Gestão de Estoque', desc: 'Controle de materiais e peças físicas', icon: Package, onClick: () => onNavigate('inventory') });
    adminItems.push({ title: 'Relatórios e ROI', desc: 'Análise de lucros e faturamento', icon: FileBarChart, onClick: () => onNavigate('reports') });
  } else if (isSales) {
    adminItems.push({ title: 'Base de Clientes', desc: 'Cadastro geral de clientes e locais', icon: Users, onClick: () => onNavigate('clients') });
  } else if (isCustomer) {
    adminItems.push({ title: 'Seus Relatórios', desc: 'Histórico de manutenções e laudos', icon: FileBarChart, onClick: () => onNavigate('reports') });
  }

  // 4. System & Cloud
  if (isOwner || isSolo) {
    systemItems.push({ title: 'Licença e Assinatura', desc: 'Gerenciar plano Aferix', icon: Star, onClick: () => onNavigate('store') });
    systemItems.push({ title: 'Backup e Sincronismo', desc: 'Exportação local e salvamento em nuvem', icon: Cloud, onClick: () => setActiveSection('backup') });
    systemItems.push({ title: 'Acesso e Segurança', desc: 'PIN de acesso e biometria', icon: Shield, onClick: () => setActiveSection('security') });
  }
  if (isOwner || isSolo || isManager || isField) {
    systemItems.push({ title: 'Integridade Local', desc: 'Diagnósticos técnicos do app offline', icon: Activity, onClick: () => setActiveSection('diagnostics') });
  }

  // Hidden Debug/Tech Info (Only visible if localStorage key exists)
  const isDebugEnabled = typeof window !== 'undefined' && localStorage.getItem('aferix_debug') === 'true';
  if (isDebugEnabled) {
    supportItems.push({ title: 'Atlas do Sistema', desc: 'Mapa completo de recursos e ROI', onClick: () => { onNavigate('atlas' as any); }, icon: Map });
    supportItems.push({ title: 'Alternar Perfil (Debug)', desc: 'Simular outras roles', onClick: () => { window.dispatchEvent(new Event('aferix_open_debug')); }, icon: Cpu });
  }

  const menuGroups = [];
  if (operationalItems.length > 0) menuGroups.push({ title: 'Operações e Logística', items: operationalItems });
  if (commercialItems.length > 0) menuGroups.push({ title: 'Comercial e Vendas', items: commercialItems });
  if (adminItems.length > 0) menuGroups.push({ title: 'Gestão e Negócios', items: adminItems });
  if (systemItems.length > 0) menuGroups.push({ title: 'Segurança e Cloud', items: systemItems });
  menuGroups.push({ title: 'Suporte e Beta', items: supportItems });

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
    <ScreenContainer className="pb-32 bg-background-primary pt-0 px-0 relative overflow-x-hidden min-h-screen">
      {/* Dynamic Background Atmospheric Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/20 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[#0A84FF]/3 pointer-events-none blur-[100px] z-0" />
      <div className="absolute bottom-[10%] left-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/2 pointer-events-none blur-[100px] z-0" />

      <div className="relative z-10">
        <AppHeader 
          title={titleMap[activeSection]}
          onBack={isSubSection ? () => setActiveSection('main') : undefined}
        />

        <div className="px-6 py-8 flex flex-col gap-6">
          
          {activeSection === 'main' ? (
            <>
              {/* SYNC HEALTH CENTER (P1) */}
              <SurfaceCard className="bg-gradient-to-br from-[#121520] via-[#0E1016] to-[#08090C] border border-white/[0.08] rounded-[28px] shadow-2xl relative overflow-hidden" padding="lg">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A84FF]/5 rounded-full blur-[40px] pointer-events-none" />
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-700",
                         isOnline ? "bg-[#47C46A]/10 text-[#47C46A] border-[#47C46A]/20" : "bg-[#E85D5D]/10 text-[#E85D5D] border-[#E85D5D]/20"
                       )}>
                          {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                       </div>
                       <div className="flex flex-col">
                          <SectionLabel className="mb-0.5 leading-none opacity-40">Nuvem Aferix</SectionLabel>
                          <Body className={cn("text-[13px] font-black uppercase tracking-tight", isOnline ? "text-[#47C46A]" : "text-[#E85D5D]")}>
                            {isOnline ? 'Conectado' : 'Sem Conexão'}
                          </Body>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Sincronismo</span>
                       <Body className="text-[11px] font-mono text-white/40">{syncState === 'synced' ? 'Em dia' : 'Sincronizando...'}</Body>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                       <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Pendentes</span>
                       <span className="text-lg font-black text-white font-mono leading-none">{pendingCount}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                       <span className="text-[8px] font-bold text-white/30 uppercase block mb-1">Status</span>
                       <span className="text-sm font-black text-white uppercase leading-none">{syncState === 'synced' ? 'OK' : 'SYNC'}</span>
                    </div>
                 </div>

                 <div className="flex gap-3">
                    <button 
                      onClick={handleCheckSync}
                      className="flex-1 h-12 bg-white/[0.03] border border-white/[0.08] text-white font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw size={14} /> Atualizar
                    </button>
                    <button 
                      onClick={handleForceSync}
                      className="flex-1 h-12 bg-[#D4AF37] text-black font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_8px_16px_rgba(212,169,74,0.2)] cursor-pointer"
                    >
                      <Cloud size={14} className="fill-black" /> Sincronizar
                    </button>
                 </div>
              </SurfaceCard>

              <ExecutiveSummaryGrid>
                   <ValueBlock label="Plano" value={account.plan === 'pro' ? 'PREMIUM' : 'FREE'} icon={<Star size={12} />} variant={account.plan === 'pro' ? "warning" : "default"} />
                   <ValueBlock label="Segurança" value="ATIVO" icon={<ShieldCheck size={12} />} variant="success" />
              </ExecutiveSummaryGrid>

              {/* IDENTITY HUB */}
              <SurfaceCard className="bg-[var(--accent-gold)]/5 border border-[var(--accent-gold)]/20 rounded-2xl cursor-pointer hover:bg-[var(--accent-gold)]/10 transition-all active:scale-[0.99]" padding="lg" onClick={() => setActiveSection('profile')}>
                 <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)] font-bold text-xl">
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
                   <SurfaceCard padding="none" className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.01]">
                      <Stack className="gap-0">
                        {group.items.map((item, idx) => (
                          <InteractiveRow 
                            key={item.title}
                            onClick={item.onClick}
                            hasChevron
                            className={idx !== 0 ? "border-t border-white/[0.04]" : ""}
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

              <Section className="mt-4 gap-6 pb-20">
                 <DangerButton 
                   onClick={() => {
                     import('../../services/AuthService').then(({ AuthService }) => AuthService.logout());
                   }}
                   className="h-16 w-full !rounded-2xl !text-[11px] font-black uppercase tracking-widest shadow-lg"
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
      </div>
    </ScreenContainer>
  );
});
