import { Fragment, useEffect, useState, type ReactNode } from 'react';
import type { Client, WorkOrder } from '../../core/types/business';
import './AppShell.css';

const AFERIX_ICON_URL = '/icons/aferix-mark-premium.svg';

export function AferixLogo({ className, collapsed }: { className?: string; collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className={`aferix-brand-logo collapsed ${className || ''}`} aria-label="Aferix">
        <img className="aferix-mark-img" src={AFERIX_ICON_URL} alt="Aferix" />
      </div>
    );
  }

  return (
    <div className={`aferix-brand-logo ${className || ''}`} aria-label="Aferix">
      <img className="aferix-wordmark-img" src="/icons/aferix-wordmark-premium.svg" alt="Aferix" />
    </div>
  );
}

export interface AppShellNavItem<T extends string> {
  id: T;
  label: string;
  description: string;
  icon?: ReactNode | string;
  section?: string;
  primary?: boolean;
}

interface AppShellProps<T extends string> {
  activeTab: T;
  navItems: AppShellNavItem<T>[];
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
  onNavigate: (tab: T) => void;
  children: ReactNode;
}

function statusLabel(status?: WorkOrder['status']): string {
  if (!status) return 'Sem atendimento ativo';

  const labels: Record<WorkOrder['status'], string> = {
    open: 'Em orçamento',
    scheduled: 'Agendada',
    'in-progress': 'Em execução',
    done: 'Concluída',
    cancelled: 'Cancelada',
  };

  return labels[status];
}

function formatTopbarClock(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function AppNavIcon({ icon }: { icon?: ReactNode | string }) {
  if (icon && typeof icon !== 'string') return <>{icon}</>;

  const id = icon || 'more';
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (id === 'dashboard') return <svg {...commonProps}><path d="M3 3v18h18" /><path d="m7 15 3.5-4 3 3 4.5-7" /><path d="M17 7h3v3" /></svg>;
  if (id === 'budget') return <svg {...commonProps}><path d="M9 3h6" /><path d="M10 3v3" /><path d="M14 3v3" /><path d="M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z" /><path d="M8 11h8" /><path d="M8 15h6" /></svg>;
  if (id === 'clients') return <svg {...commonProps}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (id === 'finance') return <svg {...commonProps}><path d="M18 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h18V9a2 2 0 0 0-2-2H7" /><path d="M16 13h2" /><path d="M8 12c0-1.1.9-2 2-2h2a2 2 0 1 1 0 4h-2a2 2 0 1 0 0 4h3" /><path d="M11 8v12" /></svg>;
  if (id === 'catalog') return <svg {...commonProps}><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" /><path d="M3 7h18v13H3z" /><path d="M3 12h18" /><path d="M9 12v2h6v-2" /></svg>;
  if (id === 'calculator') return <svg {...commonProps}><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8" /><path d="M12 10v8" /><path d="M15 12a2 2 0 0 0-2-2h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-3" /></svg>;
  if (id === 'list') return <svg {...commonProps}><path d="M9 3h6" /><path d="M10 3v3" /><path d="M14 3v3" /><path d="M5 5h14v16H5z" /><path d="M8 11h8" /><path d="M8 15h8" /><path d="M8 19h5" /></svg>;
  if (id === 'reports') return <svg {...commonProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h5" /></svg>;
  if (id === 'survey') return <svg {...commonProps}><path d="M4 5h6l2 2h8v12H4z" /><path d="M8 12h8" /><path d="M8 16h5" /></svg>;
  if (id === 'store') return <svg {...commonProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></svg>;
  if (id === 'beta') return <svg {...commonProps}><path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></svg>;
  if (id === 'settings') return <svg {...commonProps}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /><path d="M8 4v4" /><path d="M15 10v4" /><path d="M11 16v4" /></svg>;
  return <svg {...commonProps}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>;
}

export function AppShell<T extends string>({
  activeTab,
  navItems,
  activeClient,
  activeWorkOrder,
  onNavigate,
  children,
}: AppShellProps<T>) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clockText, setClockText] = useState(() => formatTopbarClock(new Date()));
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.toggle('aferix-drawer-open', isDrawerOpen);

    return () => {
      document.body.classList.remove('aferix-drawer-open');
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    const updateClock = () => setClockText(formatTopbarClock(new Date()));
    updateClock();
    const intervalId = window.setInterval(updateClock, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!openDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.top-nav-menu-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [openDropdown]);

  useEffect(() => {
    if (!openDropdown) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openDropdown]);

  function navigate(tab: T) {
    onNavigate(tab);
    setIsDrawerOpen(false);
    setOpenDropdown(null);
  }

  const toggleDropdown = (menuKey: string) => {
    setOpenDropdown(prev => prev === menuKey ? null : menuKey);
  };

  const gestaoItems = navItems.filter(item => item.section === 'Gestão financeira');
  const operacaoItems = navItems.filter(item => item.section === 'Operação');
  const sistemaItems = navItems.filter(item => item.section === 'Sistema');

  return (
    <main className="professional-app-shell">
      {/* Desktop Top Navigation Bar */}
      <header className="app-top-nav" aria-label="Navegação superior">
        <div className="app-top-nav-left">
          <AferixLogo />
        </div>
        
        <nav className="app-top-nav-center" aria-label="Menu principal desktop">
          {/* Gestão */}
          <div
            className="top-nav-menu-container"
            onMouseEnter={() => setOpenDropdown('gestao')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              className={`top-nav-menu-button ${openDropdown === 'gestao' ? 'active' : ''} ${
                gestaoItems.some(i => activeTab === i.id) ? 'tab-active' : ''
              }`}
              type="button"
              aria-expanded={openDropdown === 'gestao'}
              aria-haspopup="menu"
              onClick={() => toggleDropdown('gestao')}
            >
              Gestão <span className="dropdown-arrow">▾</span>
            </button>
            {openDropdown === 'gestao' && (
              <div className="top-nav-dropdown" role="menu">
                {gestaoItems.map(item => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={active ? 'active' : ''}
                      type="button"
                      role="menuitem"
                      onClick={() => navigate(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operação */}
          <div
            className="top-nav-menu-container"
            onMouseEnter={() => setOpenDropdown('operacao')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              className={`top-nav-menu-button ${openDropdown === 'operacao' ? 'active' : ''} ${
                operacaoItems.some(i => activeTab === i.id) ? 'tab-active' : ''
              }`}
              type="button"
              aria-expanded={openDropdown === 'operacao'}
              aria-haspopup="menu"
              onClick={() => toggleDropdown('operacao')}
            >
              Operação <span className="dropdown-arrow">▾</span>
            </button>
            {openDropdown === 'operacao' && (
              <div className="top-nav-dropdown" role="menu">
                {operacaoItems.map(item => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={active ? 'active' : ''}
                      type="button"
                      role="menuitem"
                      onClick={() => navigate(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sistema */}
          <div
            className="top-nav-menu-container"
            onMouseEnter={() => setOpenDropdown('sistema')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              className={`top-nav-menu-button ${openDropdown === 'sistema' ? 'active' : ''} ${
                sistemaItems.some(i => activeTab === i.id) ? 'tab-active' : ''
              }`}
              type="button"
              aria-expanded={openDropdown === 'sistema'}
              aria-haspopup="menu"
              onClick={() => toggleDropdown('sistema')}
            >
              Sistema <span className="dropdown-arrow">▾</span>
            </button>
            {openDropdown === 'sistema' && (
              <div className="top-nav-dropdown" role="menu">
                {sistemaItems.map(item => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={active ? 'active' : ''}
                      type="button"
                      role="menuitem"
                      onClick={() => navigate(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="app-top-nav-right">
          <time className="top-nav-digital-clock" dateTime={new Date().toISOString()}>
            {clockText}
          </time>
        </div>
      </header>

      <aside className="desktop-sidebar" aria-label="Navegação principal">
        <div className="desktop-sidebar-brand">
          <AferixLogo className="drawer-brand-mark-wrapper" />
        </div>
        <nav className="desktop-sidebar-nav">
          {navItems.map((item, index) => {
            const active = activeTab === item.id;
            const showSection = item.section && item.section !== navItems[index - 1]?.section;
            return (
              <Fragment key={item.id}>
                {showSection && <span className="drawer-nav-heading">{item.section}</span>}
                <button className={active ? 'active' : ''} type="button" title={item.label} onClick={() => navigate(item.id)}>
                  <span className="drawer-nav-icon"><AppNavIcon icon={item.icon} /></span>
                  <span className="desktop-sidebar-label">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              </Fragment>
            );
          })}
        </nav>
      </aside>
      <header className="professional-topbar">
        <button className="topbar-menu-button" type="button" aria-label="Abrir menu" onClick={() => setIsDrawerOpen(true)}>
          <span />
          <span />
          <span />
        </button>

        <div className="topbar-branding-center">
          <div className="topbar-logo-group">
            <AferixLogo />
            <time className="topbar-digital-clock" dateTime={new Date().toISOString()}>
              {clockText}
            </time>
          </div>
        </div>

        {/* Status pill removed as requested - redundant with dashboard and side drawer */}
      </header>

      <div className="professional-app-content">
        {children}
      </div>

      {isDrawerOpen && <button className="drawer-backdrop" type="button" aria-label="Fechar menu" onClick={() => setIsDrawerOpen(false)} />}

      <aside className={isDrawerOpen ? 'side-drawer open' : 'side-drawer'} aria-hidden={!isDrawerOpen}>
        <div className="drawer-brand-card">
          <AferixLogo />
        </div>

        <div className={activeWorkOrder ? 'drawer-status-strip active' : 'drawer-status-strip'}>
          <span aria-hidden="true" />
          <strong>{activeWorkOrder ? statusLabel(activeWorkOrder.status) : 'Sem atendimento'}</strong>
          <small>{activeWorkOrder?.title ?? 'Nenhum atendimento ativo'}</small>
        </div>

        <nav className="drawer-nav" aria-label="Menu principal">
          {navItems.map((item, index) => {
            const active = activeTab === item.id;
            const showSection = item.section && item.section !== navItems[index - 1]?.section;
            return (
              <Fragment key={item.id}>
                {showSection && <span className="drawer-nav-heading">{item.section}</span>}
                <button className={active ? 'active' : ''} type="button" onClick={() => navigate(item.id)}>
                  <span>
                    <strong>{item.label}</strong>
                  </span>
                </button>
              </Fragment>
            );
          })}
        </nav>
      </aside>
    </main>
  );
}
