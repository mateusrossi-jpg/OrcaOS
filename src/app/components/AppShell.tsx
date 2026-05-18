import { useEffect, useState, type ReactNode } from 'react';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import './AppShell.css';

const AFERIX_ICON_URL = '/icons/aferix-wordmark-premium.svg';

export function statusLabel(status: WorkOrder['status']): string {
  const labels: Record<WorkOrder['status'], string> = {
    'in-progress': 'Em execução',
    done: 'Concluído',
    cancelled: 'Cancelado',
  };

  return labels[status];
}

interface AppShellProps {
  children: ReactNode;
  activeTab: string;
  navItems: Array<{ id: string; label: string; description: string; icon: string; section?: string; primary?: boolean }>;
  onNavigate: (id: any) => void;
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

export function AppShell({ children, activeTab, navItems, onNavigate, activeClient, activeWorkOrder }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Auto-collapse sidebar on mobile after navigation
  useEffect(() => {
    setIsSidebarCollapsed(true);
  }, [activeTab]);

  const mainNavItems = navItems.filter(item => item.id !== 'settings' && item.id !== 'store');
  const accountNavItems = [
    { id: 'settings', label: 'Configurações', icon: 'settings' },
    { id: 'store', label: 'Licença Pro', icon: 'store' }
  ];

  return (
    <main className={`app-main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Mobile Top Bar */}
      <header className="mobile-top-bar">
        <button className="menu-toggle" type="button" aria-label="Abrir menu" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          {isSidebarCollapsed ? '☰' : '✕'}
        </button>
        <div className="mobile-app-brand">
          <div className="aferix-logo-text-small">
            AFERI<span>X</span>
          </div>
        </div>
        <div className="mobile-context-info">
          {activeClient && <span className="client-initials" title={activeClient.name}>{activeClient.name.charAt(0).toUpperCase()}</span>}
        </div>
      </header>

      {/* Main Sidebar / Sidebar Drawer */}
      <aside className="app-sidebar">
        <header className="sidebar-header">
          <div className="sidebar-brand-group">
            <div className="aferix-logo-text">
              AFERI<span>X</span>
            </div>
          </div>
          <button className="drawer-close-button" type="button" aria-label="Fechar menu" onClick={() => setIsSidebarCollapsed(true)}>
            ✕
          </button>
        </header>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Principal</span>
            <div className="nav-items-stack">
              {mainNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className={`nav-icon icon-${item.icon}`} />
                    <strong className="nav-label">{item.label}</strong>
                    {isActive && <span className="active-indicator" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="nav-section" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <span className="nav-section-title">Conta</span>
            <div className="nav-items-stack">
              {accountNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className={`nav-icon icon-${item.icon}`} />
                    <strong className="nav-label">{item.label}</strong>
                    {isActive && <span className="active-indicator" />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* Screen Content */}
      <section className="app-content-area">
        <div className="content-container">
          {children}
        </div>
      </section>
    </main>
  );
}
