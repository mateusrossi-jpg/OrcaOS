import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import './AppShell.css';

const AFERIX_WORDMARK = '/icons/aferix-wordmark-premium.svg';

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

function NavGlyph({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function AppShell({ children, activeTab, navItems, onNavigate, activeClient }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBudgetGroupOpen, setIsBudgetGroupOpen] = useState(false);
  const [isBaseGroupOpen, setIsBaseGroupOpen] = useState(false);
  const lastMenuActionAtRef = useRef(0);

  const canRunMenuAction = () => {
    const now = Date.now();
    if (now - lastMenuActionAtRef.current < 180) {
      return false;
    }
    lastMenuActionAtRef.current = now;
    return true;
  };

  useEffect(() => {
    setIsSidebarCollapsed(true);
    setIsDrawerOpen(false);
    setIsBudgetGroupOpen(false);
    setIsBaseGroupOpen(false);
  }, [activeTab]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (!(e.target as Element).closest('.app-sidebar, .mobile-top-bar')) {
        setIsDrawerOpen(false);
        setIsSidebarCollapsed(true);
        setIsBudgetGroupOpen(false);
        setIsBaseGroupOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const mainNavItems = navItems.filter((item) => item.id !== 'settings' && item.id !== 'store');

  const budgetNewItem = mainNavItems.find((item) => item.id === 'budgets');
  const budgetHistoryItem = mainNavItems.find((item) => item.id === 'budget-history');

  const pulseItem = mainNavItems.find((item) => item.id === 'home');
  const moneyItem = mainNavItems.find((item) => item.id === 'financial');

  const baseClientsItem = mainNavItems.find((item) => item.id === 'clients');
  const baseCatalogItem = mainNavItems.find((item) => item.id === 'catalog');
  const baseReportsItem = mainNavItems.find((item) => item.id === 'reports');

  const baseSubItems = [baseClientsItem, baseCatalogItem, baseReportsItem].filter(Boolean) as Array<{
    id: string;
    label: string;
    description: string;
    icon: string;
    section?: string;
    primary?: boolean;
  }>;

  const accountNavItems = [
    { id: 'settings', label: 'Configurações', icon: 'settings' },
    { id: 'store', label: 'Licença Pro', icon: 'store' },
  ];

  const baseActive = activeTab === 'clients' || activeTab === 'catalog' || activeTab === 'reports';
  const workActive = activeTab === 'budgets' || activeTab === 'budget-history';

  const iconMap: Record<string, ReactNode> = {
    home: <NavGlyph path="M3 10.5 12 3l9 7.5M6.5 9.5V21h11V9.5" />,
    document: <NavGlyph path="M8 3.5h8l4.5 4.5V20.5a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 8 3.5Zm8 .5V8h4" />,
    clients: <NavGlyph path="M16.5 11.5a3.5 3.5 0 1 0-3.5-3.5 3.5 3.5 0 0 0 3.5 3.5ZM7.5 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2.5c-2.7 0-5 1.6-5 3.8V20h10v-1.7c0-2.2-2.3-3.8-5-3.8Zm9 0c-1 0-2 .2-2.8.7 1.1.8 1.8 1.9 1.8 3.2V20h6v-1.3c0-2.4-2.2-4.2-5-4.2Z" />,
    finance: <NavGlyph path="M5 18 9 14l3.2 2.7L19 9.5M19 13V9h-4" />,
    chart: <NavGlyph path="M5 20.5h14M7.5 17V12m4 5V8m4 9v-6" />,
    settings: <NavGlyph path="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm8 3-.2-.9-2.1-.4a6.5 6.5 0 0 0-.7-1.6l1.2-1.8-.7-.7-1.8 1.2a6.5 6.5 0 0 0-1.6-.7L14.9 4h-1.8l-.4 2.1a6.5 6.5 0 0 0-1.6.7L9.3 5.6l-.7.7 1.2 1.8a6.5 6.5 0 0 0-.7 1.6L7 10.1v1.8l2.1.4a6.5 6.5 0 0 0 .7 1.6l-1.2 1.8.7.7 1.8-1.2a6.5 6.5 0 0 0 1.6.7l.4 2.1h1.8l.4-2.1a6.5 6.5 0 0 0 1.6-.7l1.8 1.2.7-.7-1.2-1.8a6.5 6.5 0 0 0 .7-1.6l2.1-.4Z" />,
    store: <NavGlyph path="M5 8.5h14l-1 12H6l-1-12Zm2.2-3h9.6l1.2 3H6l1.2-3Zm2.3 6v1.3a2.5 2.5 0 0 0 5 0V11.5" />,
  };

  return (
    <main className={`app-main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <header className="mobile-top-bar">
        <button
          className="menu-toggle"
          type="button"
          aria-label="Abrir menu"
          onClick={() => {
            if (!canRunMenuAction()) return;
            setIsSidebarCollapsed((current) => {
              const nextCollapsed = !current;
              if (!nextCollapsed) {
                setIsBudgetGroupOpen(false);
                setIsBaseGroupOpen(false);
              }
              return nextCollapsed;
            });
            setIsDrawerOpen((current) => !current);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              setIsSidebarCollapsed(false);
              setIsDrawerOpen(true);
            }
          }}
        >
          {isSidebarCollapsed ? '☰' : '✕'}
        </button>
        <div className="mobile-app-brand">
          <img src={AFERIX_WORDMARK} alt="Aferix" height={24} />
        </div>
        <div className="mobile-context-info">
          {activeClient && <span className="client-initials" title={activeClient.name}>{activeClient.name.charAt(0).toUpperCase()}</span>}
        </div>
      </header>

      {!isSidebarCollapsed && (
        <div
          className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
          onMouseDown={() => setIsSidebarCollapsed(true)}
          onClick={() => {
            setIsSidebarCollapsed(true);
            setIsDrawerOpen(false);
            setIsBudgetGroupOpen(false);
            setIsBaseGroupOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      <aside className="app-sidebar side-drawer">
        <header className="sidebar-header">
          <div className="sidebar-brand-group">
            <img className="sidebar-wordmark-img" src={AFERIX_WORDMARK} alt="Aferix" />
          </div>
          <button
            className="drawer-close-button"
            type="button"
            aria-label="Fechar menu"
            onClick={() => {
              setIsSidebarCollapsed(true);
              setIsDrawerOpen(false);
              setIsBudgetGroupOpen(false);
              setIsBaseGroupOpen(false);
            }}
          >
            ✕
          </button>
        </header>

        <nav className="sidebar-nav desktop-sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Principal</span>
            <div className="nav-items-stack">
              {pulseItem && (
                <button
                  className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                  onClick={() => onNavigate(pulseItem.id)}
                >
                  <span className="nav-icon icon-home">{iconMap.home}</span>
                  <strong className="nav-label">Pulse</strong>
                  {activeTab === 'home' && <span className="active-indicator" />}
                </button>
              )}

              {budgetNewItem && budgetHistoryItem && (
                <div className={`nav-group ${workActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className={`nav-item nav-parent ${workActive ? 'active' : ''}`}
                    onClick={() => {
                      if (!canRunMenuAction()) return;
                      setIsBudgetGroupOpen((current) => !current);
                    }}
                  >
                    <span className="nav-icon icon-document">{iconMap.document}</span>
                    <strong className="nav-label">Work</strong>
                    <span className={`nav-group-caret ${isBudgetGroupOpen ? 'open' : ''}`}>▾</span>
                    {workActive && <span className="active-indicator" />}
                  </button>

                  {isBudgetGroupOpen && (
                    <div className="nav-subitems">
                      <button
                        type="button"
                        className={`nav-subitem ${activeTab === 'budgets' ? 'active' : ''}`}
                        onClick={() => {
                          if (!canRunMenuAction()) return;
                          onNavigate('budgets');
                        }}
                      >
                        Novo orçamento
                      </button>
                      <button
                        type="button"
                        className={`nav-subitem ${activeTab === 'budget-history' ? 'active' : ''}`}
                        onClick={() => {
                          if (!canRunMenuAction()) return;
                          onNavigate('budget-history');
                        }}
                      >
                        Histórico
                      </button>
                    </div>
                  )}
                </div>
              )}

              {moneyItem && (
                <button
                  className={`nav-item ${activeTab === 'financial' ? 'active' : ''}`}
                  onClick={() => onNavigate(moneyItem.id)}
                >
                  <span className="nav-icon icon-finance">{iconMap.finance}</span>
                  <strong className="nav-label">Money</strong>
                  {activeTab === 'financial' && <span className="active-indicator" />}
                </button>
              )}

              {baseSubItems.length > 0 && (
                <div className={`nav-group ${baseActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className={`nav-item nav-parent ${baseActive ? 'active' : ''}`}
                    onClick={() => {
                      if (!canRunMenuAction()) return;
                      setIsBaseGroupOpen((current) => !current);
                    }}
                  >
                    <span className="nav-icon icon-clients">{iconMap.clients}</span>
                    <strong className="nav-label">Base</strong>
                    <span className={`nav-group-caret ${isBaseGroupOpen ? 'open' : ''}`}>▾</span>
                    {baseActive && <span className="active-indicator" />}
                  </button>

                  {isBaseGroupOpen && (
                    <div className="nav-subitems">
                      {baseSubItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`nav-subitem ${activeTab === item.id ? 'active' : ''}`}
                          onClick={() => {
                            if (!canRunMenuAction()) return;
                            onNavigate(item.id);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="nav-section" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <span className="nav-section-title">Conta</span>
            <div className="nav-items-stack top-nav-menu-container">
              {accountNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className={`nav-icon icon-${item.icon}`}>{iconMap[item.icon] ?? iconMap.settings}</span>
                    <strong className="nav-label">{item.label}</strong>
                    {isActive && <span className="active-indicator" />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      <section className="app-content-area">
        <div className="content-container">{children}</div>
      </section>
    </main>
  );
}
