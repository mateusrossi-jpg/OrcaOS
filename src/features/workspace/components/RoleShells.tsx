import React, { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../../../app/components/AppShell.css';
import {
  Home, DollarSign, Users, FileText, Settings,
  ClipboardList, Plus, Zap, X, LogOut, BarChart3, Bell,
  CheckCircle2, AlertCircle, CloudOff, RefreshCw, Cloud, Menu,
  Trash2, Calendar,
} from 'lucide-react';
import { cn } from '../../../utils/ui';
import { QUICK_ACTIONS } from '../utils/quickActions';
import { AuthService } from '../../../services/AuthService';
import { useTrustLayer } from '../../../core/trust/TrustLayer';
import { db } from '../../../storage/dexieDatabase';
import { useLiveQuery } from 'dexie-react-hooks';

interface ShellProps {
  children: ReactNode;
  activeTab: string;
  onNavigate: (id: string) => void;
}

// ─── Anchor rect type ─────────────────────────────────────────────────────────
interface AnchorRect { top: number; bottom: number; left: number; right: number; width: number; }

function getAnchorRect(el: HTMLElement | null): AnchorRect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width };
}

// ─── Popover position helper ──────────────────────────────────────────────────
// Returns a style object that anchors the popover below a button.
// "align" = 'left' → popover's left edge aligns with button's left edge
// "align" = 'right' → popover's right edge aligns with button's right edge
function popoverStyle(
  rect: AnchorRect | null,
  width: number,
  align: 'left' | 'right',
): React.CSSProperties {
  const margin = 16;
  if (!rect) {
    return { 
      position: 'fixed', 
      top: 74, 
      ...(align === 'left' ? { left: margin } : { right: margin }), 
      zIndex: 9999, 
      width, 
      transformOrigin: align === 'left' ? 'top left' : 'top right' 
    };
  }
  
  const vw = window.innerWidth;
  const top = rect.bottom + 8;
  
  if (align === 'left') {
    const left = Math.max(margin, rect.left);
    const anchorCenter = rect.left + rect.width / 2;
    const distanceFromLeft = Math.max(anchorCenter - left, 16);
    return {
      position: 'fixed',
      top,
      left,
      zIndex: 9999,
      width,
      transformOrigin: `${distanceFromLeft}px top`
    };
  } else {
    const right = Math.max(margin, vw - rect.right);
    const anchorCenter = rect.left + rect.width / 2;
    const popoverRightEdge = vw - right;
    const distanceFromRight = Math.max(popoverRightEdge - anchorCenter, 16);
    return {
      position: 'fixed',
      top,
      right,
      zIndex: 9999,
      width,
      transformOrigin: `calc(100% - ${distanceFromRight}px) top`
    };
  }
}

// ─── ESC key hook ─────────────────────────────────────────────────────────────
function useEscKey(onEsc: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onEsc(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [active, onEsc]);
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'relationships', icon: Users,        label: 'Clientes' },
  { id: 'budgets',       icon: FileText,      label: 'Orçamentos' },
  { id: 'operations',   icon: ClipboardList, label: 'Ordens de Serviço' },
  { id: 'reports',      icon: BarChart3,     label: 'Relatórios' },
  { id: 'admin',        icon: Settings,      label: 'Configurações' },
  { id: 'logout',       icon: LogOut,        label: 'Sair', danger: true, action: () => AuthService.logout() },
];

// ─── Popover Arrow ───────────────────────────────────────────────────────────
const PopoverArrow = ({ rect, align }: { rect: AnchorRect | null; align: 'left' | 'right' }) => {
  if (!rect) return null;
  const vw = window.innerWidth;
  const margin = 16;
  const anchorCenter = rect.left + rect.width / 2;
  
  if (align === 'left') {
    const left = Math.max(margin, rect.left);
    const distanceFromLeft = Math.max(anchorCenter - left, 16);
    return (
      <div 
        className="absolute top-[-5px] w-2.5 h-2.5 bg-[#141414] border-t border-l border-white/[0.05] rotate-45 shrink-0 z-[10000]"
        style={{ left: `${distanceFromLeft - 5}px` }}
      />
    );
  } else {
    const right = Math.max(margin, vw - rect.right);
    const popoverRightEdge = vw - right;
    const distanceFromRight = Math.max(popoverRightEdge - anchorCenter, 16);
    return (
      <div 
        className="absolute top-[-5px] w-2.5 h-2.5 bg-[#141414] border-t border-l border-white/[0.05] rotate-45 shrink-0 z-[10000]"
        style={{ right: `${distanceFromRight - 5}px` }}
      />
    );
  }
};

// ─── Menu Popover ─────────────────────────────────────────────────────────────
interface MenuPopoverProps {
  open: boolean;
  anchor: AnchorRect | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  activeTab: string;
}

const MenuPopover = ({ open, anchor, onClose, onNavigate, activeTab }: MenuPopoverProps) => {
  useEscKey(onClose, open);

  const handleItem = (item: any) => {
    onClose();
    setTimeout(() => {
      if (item.action) item.action();
      else onNavigate(item.id);
    }, 120);
  };

  if (!open) return null;

  const style = {
    ...popoverStyle(anchor, 280, 'left'),
    backgroundColor: '#141414',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
    padding: '12px 10px 16px 10px',
    opacity: 1,
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  };

  const GROUPS = [
    {
      title: 'Operação',
      items: [
        { id: 'relationships', label: 'Clientes' },
        { id: 'operations', label: 'Ordens de Serviço' },
        { id: 'budgets', label: 'Orçamentos' },
      ],
    },
    {
      title: 'Gestão',
      items: [
        { id: 'agenda', label: 'Agenda' },
        { id: 'reports', label: 'Relatórios' },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { id: 'admin', label: 'Configurações' },
        { id: 'logout', label: 'Sair', danger: true, action: () => AuthService.logout() },
      ],
    },
  ];

  const GroupHeader = ({ label, showDivider }: { label: string; showDivider: boolean }) => (
    <div className="flex flex-col shrink-0 px-2.5 pb-1">
      {showDivider && <div className="h-[1px] bg-white/[0.04] mb-2 mt-1 w-full" />}
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </span>
    </div>
  );

  return createPortal(
    <>
      {/* Click-outside trap */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />

      {/* Floating panel */}
      <div 
        className="aferix-popover flex flex-col gap-2 relative" 
        style={style} 
        onClick={e => e.stopPropagation()}
      >
        <PopoverArrow rect={anchor} align="left" />
        {GROUPS.map((group, gIdx) => (
          <div key={group.title} className="flex flex-col shrink-0">
            <GroupHeader label={group.title} showDivider={gIdx > 0} />
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'operations' && (activeTab === 'base' || activeTab === 'operations')) ||
                  (item.id === 'relationships' && (activeTab === 'clients' || activeTab === 'relationships')) ||
                  (item.id === 'budgets' && (activeTab === 'revenue' || activeTab === 'budgets')) ||
                  (item.id === 'admin' && (activeTab === 'settings' || activeTab === 'admin'));

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItem(item)}
                    className={cn(
                      'aferix-popover-item group',
                      isActive && 'aferix-popover-item--active',
                      item.danger && 'aferix-popover-item--danger'
                    )}
                  >
                    <span className="text-[14px] font-medium text-white/70 group-hover:text-white transition-colors">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>,
    document.body
  );
};

// ─── Notification Popover ─────────────────────────────────────────────────────
interface NotifPopoverProps {
  open: boolean;
  anchor: AnchorRect | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  events: any[];
}

const NotifPopover = ({ open, anchor, onClose, onNavigate, events }: NotifPopoverProps) => {
  useEscKey(onClose, open);
  const [cleared, setCleared] = useState(false);
  const visible = cleared ? [] : events;

  if (!open) return null;

  const isEmpty = visible.length === 0;

  const style = {
    ...popoverStyle(anchor, 280, 'right'),
    maxHeight: isEmpty ? '130px' : '75vh',
    height: isEmpty ? '130px' : 'auto',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    backgroundColor: '#141414',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.04)',
    padding: isEmpty ? '20px 14px' : '14px 12px 16px 12px',
    opacity: 1,
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  };

  const handleNotifClick = (item: any) => {
    onClose();
    setTimeout(() => {
      const titleLower = item.title?.toLowerCase() || '';
      if (titleLower.includes('orçamento')) {
        onNavigate('budgets');
      } else if (titleLower.includes('os') || titleLower.includes('serviço')) {
        onNavigate('operations');
      } else if (titleLower.includes('agenda')) {
        onNavigate('agenda');
      } else if (titleLower.includes('cliente')) {
        onNavigate('relationships');
      } else {
        onNavigate('operations');
      }
    }, 120);
  };

  // Group notifications by priority
  const urgent = visible.filter(e => e.type === 'error');
  const today = visible.filter(e => e.type === 'success' || e.type === 'info');
  const scheduled = visible.filter(e => e.type === 'warning');

  const PriorityHeader = ({ label, colorClass }: { label: string; colorClass: string }) => (
    <div className="flex items-center px-1 pt-2 pb-1.5 shrink-0">
      <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] shrink-0", colorClass)}>
        {label}
      </span>
    </div>
  );

  return createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />

      <div 
        className="aferix-popover flex flex-col justify-center relative" 
        style={style} 
        onClick={e => e.stopPropagation()}
      >
        <PopoverArrow rect={anchor} align="right" />
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center text-center py-4">
            <p className="text-[14px] font-bold text-white/95">✓ Tudo em dia</p>
            <p className="text-[11px] text-white/40 mt-1 font-medium">Nenhuma ação necessária.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] shrink-0 mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                  NOTIFICAÇÕES
                </span>
                <span className="min-w-[20px] h-[20px] px-1.5 bg-[#E85D5D] rounded-full flex items-center justify-center text-[10px] font-black text-white leading-none shadow-sm">
                  {visible.length}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
              {urgent.length > 0 && (
                <div className="flex flex-col gap-1 shrink-0">
                  <PriorityHeader label="URGENTE" colorClass="text-[#E85D5D]" />
                  <div className="flex flex-col gap-1.5">
                    {urgent.map((item: any) => (
                      <NotifItem 
                        key={item.id} 
                        item={item} 
                        onClick={() => handleNotifClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {today.length > 0 && (
                <div className="flex flex-col gap-1 shrink-0">
                  <PriorityHeader label="HOJE" colorClass="text-white/20" />
                  <div className="flex flex-col gap-1.5">
                    {today.map((item: any) => (
                      <NotifItem 
                        key={item.id} 
                        item={item} 
                        onClick={() => handleNotifClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {scheduled.length > 0 && (
                <div className="flex flex-col gap-1 shrink-0">
                  <PriorityHeader label="PROGRAMADO" colorClass="text-amber-500" />
                  <div className="flex flex-col gap-1.5">
                    {scheduled.map((item: any) => (
                      <NotifItem 
                        key={item.id} 
                        item={item} 
                        onClick={() => handleNotifClick(item)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 pt-3 border-t border-white/[0.05] mt-2 flex justify-center">
              <button
                onClick={() => setCleared(true)}
                className="w-auto px-6 py-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] rounded-[16px] text-[11px] font-bold text-white/50 hover:text-white/80 transition-all flex items-center gap-1.5"
              >
                <Trash2 size={11} className="text-white/40" />
                Limpar Tudo
              </button>
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  );
};

const NotifItem = ({ item, onClick }: { item: any; onClick: () => void }) => {
  const timeFormatted = item.timestamp 
    ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : (item.time || '12:00');

  const typeColors = {
    error: {
      border: "border-l-[3px] border-l-[#FF453A] border-y border-r border-white/[0.04]",
      bg: "bg-[#FF453A]/5 hover:bg-[#FF453A]/10 hover:border-white/[0.08]"
    },
    warning: {
      border: "border-l-[3px] border-l-[#FFD60A] border-y border-r border-white/[0.04]",
      bg: "bg-[#FFD60A]/5 hover:bg-[#FFD60A]/10 hover:border-white/[0.08]"
    },
    success: {
      border: "border-l-[3px] border-l-[#30D158] border-y border-r border-white/[0.04]",
      bg: "bg-[#30D158]/5 hover:bg-[#30D158]/10 hover:border-white/[0.08]"
    },
    info: {
      border: "border-l-[3px] border-l-[#0A84FF] border-y border-r border-white/[0.04]",
      bg: "bg-[#0A84FF]/5 hover:bg-[#0A84FF]/10 hover:border-white/[0.08]"
    }
  };

  const style = typeColors[item.type as keyof typeof typeColors] || typeColors.info;

  return (
    <button 
      onClick={onClick}
      className={cn(
        "rounded-[14px] px-3.5 py-2 flex items-center w-full text-left transition-all active:scale-[0.99]",
        style.border,
        style.bg
      )}
      style={{ height: '52px' }}
    >
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-baseline justify-between gap-1.5 w-full">
          <span className="text-[12.5px] font-bold text-white leading-tight truncate">{item.title}</span>
          <span className="text-[9.5px] text-white/30 shrink-0 font-medium text-right ml-auto">{timeFormatted}</span>
        </div>
        {(item.description || item.message) && (
          <p className="text-[11px] text-white/50 leading-tight font-medium truncate mt-1">
            {item.description || item.message}
          </p>
        )}
      </div>
    </button>
  );
};

const getHeaderTitle = (activeTab: string): string => {
  switch (activeTab) {
    case 'pulse':
    case 'dashboard':
    case 'home':
      return 'Início';
    case 'relationships':
    case 'clients':
      return 'Clientes';
    case 'budgets':
    case 'revenue':
      return 'Orçamentos';
    case 'operations':
    case 'agenda':
    case 'base':
      return 'Agenda';
    case 'reports':
      return 'Relatórios';
    case 'admin':
    case 'settings':
      return 'Configurações';
    case 'money':
      return 'Financeiro';
    default:
      // Capitalize first letter as fallback
      return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  }
};

// ─── Shell Layout ─────────────────────────────────────────────────────────────
const ShellLayout = ({ children, tabs, activeTab, onNavigate, onQuickAction }: any) => {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [menuAnchor,  setMenuAnchor]  = useState<AnchorRect | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<AnchorRect | null>(null);

  const { recentEvents } = useTrustLayer();

  const menuBtnRef  = useRef<HTMLButtonElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);

  // Toggle menu — capture anchor rect synchronously at click time
  const openMenu = useCallback((e?: any) => {
    let el = menuBtnRef.current;
    if (e && e instanceof HTMLElement) el = e as HTMLButtonElement;
    else if (e && e.currentTarget) el = e.currentTarget as HTMLButtonElement;

    setNotifOpen(false);
    setMenuOpen(prev => {
      if (!prev) setMenuAnchor(getAnchorRect(el));
      return !prev;
    });
  }, []);

  // Toggle notif — capture anchor rect synchronously at click time
  const openNotif = useCallback((e?: any) => {
    let el = notifBtnRef.current;
    if (e && e instanceof HTMLElement) el = e as HTMLButtonElement;
    else if (e && e.currentTarget) el = e.currentTarget as HTMLButtonElement;

    setMenuOpen(false);
    setNotifOpen(prev => {
      if (!prev) setNotifAnchor(getAnchorRect(el));
      return !prev;
    });
  }, []);

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setNotifOpen(false);
  }, []);

  // Global event bridge (HomeScreen uses window.aferixOpen*)
  useEffect(() => {
    (window as any).aferixOpenMenu   = openMenu;
    (window as any).aferixOpenNotifs = openNotif;
    window.addEventListener('aferix_open_menu',   openMenu);
    window.addEventListener('aferix_open_notifs', openNotif);
    return () => {
      window.removeEventListener('aferix_open_menu',   openMenu);
      window.removeEventListener('aferix_open_notifs', openNotif);
      delete (window as any).aferixOpenMenu;
      delete (window as any).aferixOpenNotifs;
    };
  }, [openMenu, openNotif]);

  const isHome = activeTab === 'pulse' || activeTab === 'dashboard' || activeTab === 'home';
  const criticalCount = recentEvents.filter((e: any) => e.type === 'error').length;
  const pendingNotifCount = recentEvents.filter((e: any) => e.type === 'warning' || e.type === 'info' || e.type === 'success').length;
  const totalNotifs = criticalCount + pendingNotifCount;

  return (
    <>
      <div className="aferix-shell-root">
        <div className="aferix-mobile-container">

          {/* ── Universal Header ── */}
          <header className="animate-fade-in bg-background-primary pt-[calc(env(safe-area-inset-top,0px)+6px)] pb-1.5 sticky top-0 z-[1000] shadow-2xl w-full">
            <div className="max-w-md mx-auto w-full px-5 flex items-center justify-between">
              {/* ☰ Menu */}
              <button
                ref={menuBtnRef}
                onClick={openMenu}
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                className={cn('aferix-header-btn', menuOpen && 'aferix-header-btn--active')}
              >
                <Menu size={19} strokeWidth={1.8} />
              </button>

              {/* Contextual Title with Pulsing LED */}
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-[13px] font-black tracking-[0.18em] text-white leading-none uppercase">
                  {getHeaderTitle(activeTab)}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#47C46A] shadow-[0_0_6px_rgba(71,196,106,0.5)] animate-pulse" />
              </div>

              {/* 🔔 Bell */}
              <button
                ref={notifBtnRef}
                onClick={openNotif}
                aria-label="Notificações"
                aria-expanded={notifOpen}
                className={cn('aferix-header-btn relative', notifOpen && 'aferix-header-btn--active')}
              >
                <Bell size={19} strokeWidth={1.8} />
                {totalNotifs > 0 && (
                  <span className={cn(
                    "absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center text-[8px] font-black leading-none border border-[#0A0A0A]",
                    criticalCount > 0 
                      ? "bg-[#FF453A] text-white" 
                      : "bg-[#FFD60A] text-black font-black"
                  )}>
                    {totalNotifs}
                  </span>
                )}
              </button>
            </div>
          </header>

          <main className="aferix-main-content">
            <div className="content-inner">{children}</div>
          </main>

          {onQuickAction && (
            <button
              className="aferix-solo-fab transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={onQuickAction}
              aria-label="Ações Rápidas"
              style={{ bottom: 'calc(env(safe-area-inset-bottom,16px) + 24px)' }}
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* ── Popovers ── */}
      <MenuPopover
        open={menuOpen}
        anchor={menuAnchor}
        onClose={closeAll}
        onNavigate={onNavigate}
        activeTab={activeTab}
      />
      <NotifPopover
        open={notifOpen}
        anchor={notifAnchor}
        onClose={closeAll}
        onNavigate={onNavigate}
        events={recentEvents}
      />
    </>
  );
};

// ─── Shell Variants ───────────────────────────────────────────────────────────
export function OwnerShell(props: ShellProps) {
  const tabs = [
    { id: 'pulse', icon: Home, label: 'PULSO' },
    { id: 'revenue', icon: DollarSign, label: 'RECEITA' },
    { id: 'operations', icon: Zap, label: 'AGENDA' },
    { id: 'relationships', icon: Users, label: 'CLIENTES' },
    { id: 'admin', icon: Settings, label: 'GESTÃO' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function FieldShell(props: ShellProps) {
  const tabs = [
    { id: 'pulse', icon: Home, label: 'PULSO' },
    { id: 'operations', icon: Zap, label: 'AGENDA' },
    { id: 'relationships', icon: Users, label: 'CLIENTES' },
    { id: 'admin', icon: Settings, label: 'GESTÃO' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function SalesShell(props: ShellProps) {
  const tabs = [
    { id: 'pulse', icon: Home, label: 'PULSO' },
    { id: 'revenue', icon: DollarSign, label: 'RECEITA' },
    { id: 'relationships', icon: Users, label: 'CLIENTES' },
    { id: 'admin', icon: Settings, label: 'GESTÃO' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function ManagerShell(props: ShellProps) {
  const tabs = [
    { id: 'pulse', icon: Home, label: 'PULSO' },
    { id: 'operations', icon: Zap, label: 'AGENDA' },
    { id: 'relationships', icon: Users, label: 'CLIENTES' },
    { id: 'admin', icon: Settings, label: 'GESTÃO' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function CustomerShell(props: ShellProps) {
  const tabs = [
    { id: 'pulse', icon: Home, label: 'PULSO' },
    { id: 'revenue', icon: DollarSign, label: 'PROPOSTAS' },
    { id: 'operations', icon: Zap, label: 'SERVIÇOS' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function SoloShell(props: ShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { children, activeTab, onNavigate } = props;

  const handleQuickAction = (tabId: string) => {
    setIsOpen(false);
    onNavigate(tabId);
  };

  const tabs = [
    { id: 'pulse', icon: Home, label: 'PULSO' },
    { id: 'revenue', icon: DollarSign, label: 'RECEITA' },
    { id: 'operations', icon: Zap, label: 'AGENDA' },
    { id: 'relationships', icon: Users, label: 'CLIENTES' },
    { id: 'admin', icon: Settings, label: 'GESTÃO' },
  ];

  const handleNavigate = (tabId: string) => {
    let target = tabId;
    if (tabId === 'home') target = 'pulse';
    if (tabId === 'dashboard') target = 'pulse';
    onNavigate(target);
  };

  const isHome = activeTab === 'pulse' || activeTab === 'dashboard' || activeTab === 'home';

  return (
    <ShellLayout
      {...props}
      tabs={tabs}
      onNavigate={handleNavigate}
      onQuickAction={!isHome ? () => setIsOpen(true) : undefined}
    >
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[1100] flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[#111214] border-t border-white/[0.05] rounded-t-[22px] p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] flex flex-col gap-4 max-w-md mx-auto w-full animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/[0.04]">
              <span className="text-[12px] font-black tracking-[0.18em] text-white/50 uppercase">Ações Rápidas</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.tabId)}
                  className={cn(
                    'p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] active:scale-95 transition-all text-left flex flex-col gap-2 cursor-pointer',
                    action.id === 'diagnostic' && 'col-span-2',
                  )}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${action.color}18` }}
                  >
                    <action.icon size={14} style={{ color: action.color }} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black text-white uppercase tracking-wide">{action.label}</h3>
                    <p className="text-[10px] text-white/35 mt-0.5 leading-snug">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleQuickAction('settings')}
              className="w-full py-3 rounded-xl border border-white/[0.04] bg-transparent hover:bg-white/[0.03] text-white/40 font-bold tracking-widest text-[11px] uppercase transition-all active:scale-[0.98] cursor-pointer"
            >
              Gestão &amp; Configurações
            </button>
          </div>
        </div>
      )}
    </ShellLayout>
  );
}
