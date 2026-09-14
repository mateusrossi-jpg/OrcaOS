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
  ERPLoader
} from '../components/ui';
import type { AferixAccountState } from '../../core/access/accountPlanStorage';
import { planStatusTitle } from '../utils/planHelpers';
import type { AppTab } from '../appTypes';
import { cn } from '../../utils/ui';
import { useRole } from '../../hooks/useRole';

// ── Dark Premium V12 Architecture ─────────────────────────────────────────────
import { 
  AferixV12Tokens,
  V12HeroCard,
  GroupedSection,
  ListCard,
  PrimaryPillButton,
  SecondaryActionButton,
  V12StatusBadge
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
import { uiPreferences } from '../../core/preferences/uiPreferences';

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

  // Hidden Debug/Tech Info (Only visible if debug preference is enabled)
  const isDebugEnabled = uiPreferences.isDebugModeEnabled();
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
    <div className={AferixV12Tokens.layout.pageContainer}>
      <div className={AferixV12Tokens.layout.contentWrapper}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            {isSubSection && (
              <button
                onClick={() => setActiveSection('main')}
                className="w-10 h-10 rounded-[12px] bg-[#3A3A3C] border border-white/5 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
                aria-label="Voltar"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
                {isSubSection ? 'Menu / Configurações' : 'Painel de Controle'}
              </span>
              <h1 className="text-[20px] font-black tracking-tight text-white">
                {titleMap[activeSection]}
              </h1>
            </div>
          </div>
          
          {activeSection === 'main' && (
            <V12StatusBadge 
              label={isOnline ? 'Online' : 'Offline'} 
              tone={isOnline ? 'success' : 'critical'} 
            />
          )}
        </div>

        {activeSection === 'main' ? (
          <>
            {/* SYNC & CONNECTIVITY HERO */}
            <V12HeroCard>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[17px] font-bold text-white tracking-tight">
                    {isOnline ? "Nuvem Aferix Sincronizada" : "Modo Offline Ativo"}
                  </h2>
                  <p className="text-[12px] text-[#8E8E93]">
                    {isOnline ? "Seus dados estão protegidos e sincronizados." : "Operação local garantida via Dexie & Event Store."}
                  </p>
                </div>
                <V12StatusBadge
                  label={syncState === 'synced' ? "Em dia" : `${pendingCount} pendentes`}
                  tone={isOnline ? "success" : "attention"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#2C2C2E] border border-white/5 rounded-[14px] p-3 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase text-[#8E8E93]">Fila de Sync</span>
                  <span className="text-[18px] font-mono font-black text-white">{pendingCount}</span>
                </div>
                <div className="bg-[#2C2C2E] border border-white/5 rounded-[14px] p-3 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase text-[#8E8E93]">Plano</span>
                  <span className="text-[14px] font-black text-[#FFD60A] uppercase truncate">
                    {account.plan === 'pro' ? 'PREMIUM' : 'FREE'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                <SecondaryActionButton
                  onClick={handleCheckSync}
                  icon={RefreshCw}
                >
                  Verificar
                </SecondaryActionButton>
                <SecondaryActionButton
                  onClick={handleForceSync}
                  icon={Cloud}
                >
                  Sincronizar
                </SecondaryActionButton>
              </div>
            </V12HeroCard>

            {/* IDENTITY / PROFILE TILE */}
            <GroupedSection headerTitle="Identidade do Operador">
              <button 
                type="button"
                onClick={() => setActiveSection('profile')}
                className="w-full text-left bg-[#3A3A3C] border border-white/5 p-4 rounded-[16px] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/10 flex items-center justify-center text-white font-black text-lg">
                    {userInitials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-bold text-white uppercase truncate">{accountLabel}</span>
                    <span className="text-[11px] text-[#FFD60A] font-bold flex items-center gap-1 mt-0.5">
                      <Star size={11} className="fill-[#FFD60A]" /> {planStatusTitle(account)}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#8E8E93] shrink-0" />
              </button>
            </GroupedSection>

            {/* MENU GROUPS */}
            {menuGroups.map((group) => (
              <GroupedSection key={group.title} headerTitle={group.title}>
                <div className="flex flex-col divide-y divide-white/5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={item.onClick}
                        className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-white/[0.02] active:bg-white/[0.04] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-[10px] bg-white/5 border border-white/5 flex items-center justify-center text-[#8E8E93] shrink-0">
                            <Icon size={17} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-bold text-white truncate">{item.title}</span>
                            <span className="text-[11px] text-[#8E8E93] truncate">{item.desc}</span>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-[#8E8E93]/60 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </GroupedSection>
            ))}

            {/* LOGOUT ACTION */}
            <div className="pt-2 pb-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  import('../../services/AuthService').then(({ AuthService }) => AuthService.logout());
                }}
                className="h-14 w-full rounded-[16px] bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] font-bold text-[13px] uppercase tracking-wider active:scale-[0.975] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={17} /> Desconectar Sessão
              </button>
              
              <div className="text-center">
                <span className="text-[10px] font-mono font-bold text-[#8E8E93]/60 uppercase tracking-[0.2em]">
                  Aferix OS v0.1.0-RC1 • Golden V12 Dark Industrial
                </span>
              </div>
            </div>
          </>
        ) : (
          <Suspense fallback={<div className="py-20 flex items-center justify-center"><ERPLoader message="Carregando módulo..." /></div>}>
             {activeSection === 'profile' && <ProfessionalProfileWorkspace hideTitle />}
             {activeSection === 'security' && <AppSecurityPanel />}
             {activeSection === 'backup' && (
               <div className="flex flex-col gap-5">
                 <LocalBackupWorkspace includeLinkedSettings={false} />
                 <CloudSyncPanel />
                 <GoogleDriveBackupPanel />
               </div>
             )}
             {activeSection === 'diagnostics' && <OfflineDiagnosticsPanel />}
          </Suspense>
        )}

      </div>
    </div>
  );
});
