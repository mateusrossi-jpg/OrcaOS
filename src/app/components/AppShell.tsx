import { useEffect, useState, type ReactNode } from 'react';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import './AppShell.css';

const AFERIX_ICON_URL = '/icons/aferix-mark-premium.svg';

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

  const sections = navItems.reduce((acc, item) => {
    const section = item.section || 'Principal';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <main className={`app-main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Mobile Top Bar */}
      <header className="mobile-top-bar">
        <button className="menu-toggle" type="button" aria-label="Abrir menu" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          {isSidebarCollapsed ? '☰' : '✕'}
        </button>
        <div className="mobile-app-brand">
          <img src={AFERIX_ICON_URL} alt="" className="app-logo-small" />
          <span className="brand-name-text">AFERIX</span>
        </div>
        <div className="mobile-context-info">
          {activeClient && <span className="client-initials" title={activeClient.name}>{activeClient.name.charAt(0).toUpperCase()}</span>}
        </div>
      </header>

      {/* Main Sidebar / Sidebar Drawer */}
      <aside className="app-sidebar">
        <header className="sidebar-header">
          <div className="app-brand">
            <img src={AFERIX_ICON_URL} alt="Aferix" className="app-logo" />
            <div className="brand-text-stack">
              <span className="brand-name">AFERIX</span>
              <span className="brand-tagline">FINANCEIRO</span>
            </div>
          </div>
        </header>

        <nav className="sidebar-nav">
          {Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="nav-section">
              <span className="nav-section-title">{sectionName}</span>
              <div className="nav-items-stack">
                {items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => onNavigate(item.id)}
                      title={item.description}
                    >
                      <span className={`nav-icon icon-${item.icon}`} />
                      <div className="nav-text">
                        <strong className="nav-label">{item.label}</strong>
                        <span className="nav-desc">{item.description}</span>
                      </div>
                      {isActive && <span className="active-indicator" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <footer className="sidebar-footer">
          <div className="sidebar-context-card">
            <div className={`status-dot ${activeWorkOrder ? activeWorkOrder.status : 'inactive'}`} />
            <div className="context-details">
              <strong>{activeWorkOrder ? statusLabel(activeWorkOrder.status) : 'Sem serviço'}</strong>
              <small>{activeWorkOrder?.title ?? 'Nenhum serviço ativo'}</small>
            </div>
          </div>
        </footer>
      </aside>

      {/* Screen Content */}
      <section className="app-content-area">
        <div className="content-container">
          {children}
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {navItems.filter(i => i.primary).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className={`nav-icon icon-${item.icon}`} />
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}
