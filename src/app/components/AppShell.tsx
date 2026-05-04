import { Fragment, useEffect, useState, type ReactNode } from 'react';
import type { Client, WorkOrder } from '../../core/types/business';
import './AppShell.css';

const ORCAOS_LOGO_SRC = '/icons/orcaos-icon.svg';

export interface AppShellNavItem<T extends string> {
  id: T;
  label: string;
  description: string;
  icon?: ReactNode;
  section?: string;
  primary?: boolean;
}

interface AppShellProps<T extends string> {
  activeTab: T;
  title: string;
  subtitle?: string;
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

export function AppShell<T extends string>({
  activeTab,
  title,
  subtitle,
  navItems,
  activeClient,
  activeWorkOrder,
  onNavigate,
  children,
}: AppShellProps<T>) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clockText, setClockText] = useState(() => formatTopbarClock(new Date()));

  useEffect(() => {
    document.body.classList.toggle('orcaos-drawer-open', isDrawerOpen);

    return () => {
      document.body.classList.remove('orcaos-drawer-open');
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    const updateClock = () => setClockText(formatTopbarClock(new Date()));
    updateClock();
    const intervalId = window.setInterval(updateClock, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  function navigate(tab: T) {
    onNavigate(tab);
    setIsDrawerOpen(false);
  }

  const topbarContextLabel = activeWorkOrder ? 'Ativo' : 'Livre';
  const topbarContextTitle = activeWorkOrder
    ? `${activeWorkOrder.title} · ${activeClient?.name ?? 'Cliente não vinculado'} · ${statusLabel(activeWorkOrder.status)}`
    : 'Nenhum atendimento ativo';
  const bottomNavItems = navItems.filter((item) => item.primary);

  return (
    <main className="professional-app-shell">
      <header className="professional-topbar">
        <button className="topbar-menu-button" type="button" aria-label="Abrir menu" onClick={() => setIsDrawerOpen(true)}>
          <span />
          <span />
          <span />
        </button>

        <img className="topbar-brand-mark" src={ORCAOS_LOGO_SRC} alt="" aria-hidden="true" />

        <div className="topbar-title-block">
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </div>

        <time className="topbar-clock" dateTime={new Date().toISOString()} aria-label={`Horário atual ${clockText}`}>
          {clockText}
        </time>

        <div className={activeWorkOrder ? 'topbar-status-pill active' : 'topbar-status-pill'} title={topbarContextTitle} aria-label={topbarContextTitle}>
          <span aria-hidden="true" />
          <strong>{topbarContextLabel}</strong>
        </div>
      </header>

      <div className="professional-app-content">
        {children}
      </div>

      <nav className="bottom-nav" aria-label="Navegação principal">
        {bottomNavItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button className={active ? 'active' : ''} key={item.id} type="button" onClick={() => navigate(item.id)}>
              <span>{item.icon ?? item.label.slice(0, 2)}</span>
              <strong>{item.label}</strong>
            </button>
          );
        })}
      </nav>

      {isDrawerOpen && <button className="drawer-backdrop" type="button" aria-label="Fechar menu" onClick={() => setIsDrawerOpen(false)} />}

      <aside className={isDrawerOpen ? 'side-drawer open' : 'side-drawer'} aria-hidden={!isDrawerOpen}>
        <div className="drawer-brand-card">
          <img className="drawer-brand-mark" src={ORCAOS_LOGO_SRC} alt="" aria-hidden="true" />
          <div>
            <strong>OrçaOS</strong>
          </div>
          <button type="button" aria-label="Fechar menu" onClick={() => setIsDrawerOpen(false)}>Fechar</button>
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
                    <small>{item.description}</small>
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
