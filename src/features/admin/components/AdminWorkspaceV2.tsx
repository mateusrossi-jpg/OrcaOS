import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Building, 
  Cloud, 
  Shield, 
  Activity, 
  ChevronRight,
  LogOut,
  Map,
  Cpu,
  Package
} from 'lucide-react';
import { 
  ScreenContainer, 
  SurfaceCard, 
  SectionLabel, 
  Stack, 
  Section, 
  Body, 
  Subtitle,
  OpsChip,
  ERPLoader
} from '../../../ui/system';
import { cn } from '../../../utils/ui';
import { useRole } from '../../../hooks/useRole';

interface AdminWorkspaceV2Props {
  account: any;
  onNavigate: (tab: any) => void;
}

/**
 * AdminWorkspaceV2: Strategic Governance Hub (RC14).
 * Primary Question: "Como configuro minha empresa?"
 */
export const AdminWorkspaceV2: React.FC<AdminWorkspaceV2Props> = ({ account, onNavigate }) => {
  const { role } = useRole();
  const isOwner = role === 'OWNER';
  const isSolo = role === 'SOLO';

  const menuItems = [
    { title: 'Identidade da Empresa', desc: 'Logo, dados fiscais e marca', icon: Building, onClick: () => {} },
    { title: 'Gestão de Equipe', desc: 'Acessos e permissões', icon: Users, onClick: () => onNavigate('team') },
    { title: 'Estoque & Materiais', desc: 'Preços e catálogo industrial', icon: Package, onClick: () => onNavigate('catalog') },
    { title: 'Nuvem & Sincronismo', desc: 'Status da cópia de segurança', icon: Cloud, onClick: () => {} },
    { title: 'Segurança & PIN', desc: 'Proteção biométrica', icon: Shield, onClick: () => {} },
  ];

  const isDebugEnabled = typeof window !== 'undefined' && localStorage.getItem('aferix_debug') === 'true';

  return (
    <ScreenContainer className="pb-40 bg-background-primary pt-0 px-0 relative overflow-x-hidden min-h-screen animate-in fade-in duration-500">
      {/* Atmospheric glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#161B29]/20 via-transparent to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-[var(--accent-gold)]/3 pointer-events-none blur-[100px] z-0" />

      <div className="relative z-10">
        <AppHeader title="Ajustes." />

        <div className="px-6 py-8 flex flex-col gap-10">
        
        {/* IDENTITY SUMMARY */}
        <SurfaceCard padding="lg" className="bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]/20 shadow-xl">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)] font-black text-2xl border border-[var(--accent-gold)]/20">
                 {account?.displayName?.substring(0, 1).toUpperCase() || 'A'}
              </div>
              <Stack className="gap-0.5">
                 <Body className="text-[17px] font-black text-white uppercase">{account?.displayName || 'Comandante'}</Body>
                 <Subtitle className="text-[11px] opacity-40 uppercase tracking-widest">{role} · Plano Professional</Subtitle>
              </Stack>
           </div>
        </SurfaceCard>

        {/* ADMIN GROUPS */}
        <Section className="gap-4">
           <SectionLabel className="ml-1 uppercase tracking-widest opacity-40">Configurações Estruturais</SectionLabel>
           <SurfaceCard padding="none" className="overflow-hidden shadow-2xl">
              <Stack className="gap-0">
                 {menuItems.map((item, idx) => (
                   <button 
                     key={idx}
                     onClick={item.onClick}
                     className={cn(
                       "w-full text-left p-6 flex items-center justify-between active:bg-white/5 transition-all",
                       idx !== 0 && "border-t border-white/[0.05]"
                     )}
                   >
                      <div className="flex items-center gap-5">
                         <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                            <item.icon size={20} />
                         </div>
                         <Stack className="gap-0.5">
                            <span className="text-[15px] font-black text-white uppercase leading-tight">{item.title}</span>
                            <Subtitle className="text-[11px] opacity-30 leading-tight">{item.desc}</Subtitle>
                         </Stack>
                      </div>
                      <ChevronRight size={18} className="text-white/10" />
                   </button>
                 ))}
              </Stack>
           </SurfaceCard>
        </Section>

        {/* DEBUG & DEV (HIDDEN BY DEFAULT) */}
        {isDebugEnabled && (
          <Section className="gap-4 opacity-40">
             <SectionLabel className="ml-1 uppercase tracking-widest">Ferramentas de Engenharia</SectionLabel>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onNavigate('atlas')} className="bg-white/5 border border-white/10 p-5 rounded-[28px] flex items-center gap-4 active:scale-95 transition-all">
                   <Map size={18} />
                   <span className="text-[11px] font-black uppercase">Atlas</span>
                </button>
                <button onClick={() => {}} className="bg-white/5 border border-white/10 p-5 rounded-[28px] flex items-center gap-4 active:scale-95 transition-all">
                   <Activity size={18} />
                   <span className="text-[11px] font-black uppercase">Saúde</span>
                </button>
             </div>
          </Section>
        )}

        <button 
          onClick={() => import('../../../services/AuthService').then(({ AuthService }) => AuthService.logout())}
          className="h-16 w-full bg-red-500/10 border border-red-500/20 text-red-400 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
           <LogOut size={16} /> ENCERRAR SESSÃO NO DISPOSITIVO
        </button>

      </div>
      </div>
    </ScreenContainer>
  );
};

const AppHeader = ({ title }: { title: string }) => (
  <div className="px-6 pt-16 pb-8 flex flex-col gap-2">
     <SectionLabel className="!text-[10px] opacity-40 uppercase tracking-[0.4em]">ADMINISTRAÇÃO</SectionLabel>
     <h1 className="text-[38px] font-black text-white tracking-tight leading-none">{title}</h1>
  </div>
);
