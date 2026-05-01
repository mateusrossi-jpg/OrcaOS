import { useState, type ReactNode } from 'react';
import type { Client, WorkOrder } from '../../core/types/business';
import './AppShell.css';

export interface AppShellNavItem<T extends string> {
  id: T;
  label: string;
  description: string;
  icon?: ReactNode;
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
  if (!status) return 'Sem OS ativa';

  const labels: Record<WorkOrder['status'], string> = {
    open: 'Aberta',
    scheduled: 'Agendada',
    'in-progress': 'Em execução',
    done: 'Concluída',
    cancelled: 'Cancelada',
  };

  return labels[status];
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

  function navigate(tab: T) {
    onNavigate(tab);
    setIsDrawerOpen(false);
  }

  return (
    <main className="professional-app-shell">
      <header className="professional-topbar">
        <button className="topbar-menu-button" type="button" aria-label="Abrir menu" onClick={() => setIsDrawerOpen(true)}>
          <span />
          <span />
          <span />
        </button>

        <div className="topbar-title-block">
          <strong>{title}</strong>
          {subtitle && <small>{subtitle}</small>}
        </div>

        <div className="topbar-status-pill">
          <span>{activeWorkOrder ? 'OS ativa' : 'Sem OS'}</span>
        </div>
      </header>

      <div className="professional-app-content">
        {children}
      </div>

      {isDrawerOpen && <button className="drawer-backdrop" type="button" aria-label="Fechar menu" onClick={() => setIsDrawerOpen(false)} />}

      <aside className={isDrawerOpen ? 'side-drawer open' : 'side-drawer'} aria-hidden={!isDrawerOpen}>
        <div className="drawer-brand-card">
          <div className="drawer-brand-mark">OS</div>
          <div>
            <strong>OrçaOS</strong>
            <small>Calculadora, OS e orçamento técnico</small>
          </div>
        </div>

        <div className="drawer-work-card">
          <span>{statusLabel(activeWorkOrder?.status)}</span>
          <strong>{activeWorkOrder?.title ?? 'Nenhuma OS ativa'}</strong>
          <small>{activeClient?.name ?? 'Crie ou ative uma OS em Clientes / OS'}</small>
        </div>

        <nav className="drawer-nav" aria-label="Menu principal">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button className={active ? 'active' : ''} key={item.id} type="button" onClick={() => navigate(item.id)}>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </main>
  );
}
