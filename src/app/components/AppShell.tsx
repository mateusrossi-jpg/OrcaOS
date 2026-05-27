import { useEffect, useState, memo, type ReactNode } from 'react';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import './AppShell.css';
import type { AppTab, AppIconGlyph } from '../appTypes';
import { ERPNotificationCenter } from '../../ui/system';

const AFERIX_WORDMARK = '/icons/aferix-wordmark-premium.svg';


interface AppShellProps {
  children: ReactNode;
  activeTab: AppTab;
  onNavigate: (id: AppTab) => void;
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

function NavGlyphRaw({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const NavGlyph = memo(NavGlyphRaw);

export function AppShell({ children, activeTab, onNavigate, activeClient }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setIsSidebarCollapsed(true);
    setIsDrawerOpen(false);
  }, [activeTab]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (!(e.target as Element).closest('.app-sidebar, .mobile-top-bar')) {
        setIsDrawerOpen(false);
        setIsSidebarCollapsed(true);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const baseActive =
    activeTab === 'base' ||
    activeTab === 'catalog' ||
    activeTab === 'reports' ||
    activeTab === 'settings' ||
    activeTab === 'store';

  // Core Journey items for Bottom Nav
  const bottomNavItems = [
    { id: 'pulse', label: 'Resumo', icon: 'home' as AppIconGlyph },
    { id: 'work-history', label: 'Operação', icon: 'document' as AppIconGlyph },
    { id: 'money', label: 'Financeiro', icon: 'finance' as AppIconGlyph },
    { id: 'settings', label: 'Mais', icon: 'settings' as AppIconGlyph },
  ];

  const iconMap: Record<AppIconGlyph, ReactNode> = {
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
      <div className="mobile-top-bar" role="banner">
        <button
          className="menu-toggle"
          type="button"
          aria-label="Abrir menu"
          onClick={() => {
            setIsSidebarCollapsed((current) => !current);
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
        <div className="mobile-context-info flex items-center gap-3">
          <ERPNotificationCenter />
          {activeClient && <span className="client-initials" title={activeClient.name}>{activeClient.name.charAt(0).toUpperCase()}</span>}
        </div>
      </div>

      {!isSidebarCollapsed && (
        <div
          className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
          onMouseDown={() => setIsSidebarCollapsed(true)}
          onClick={() => {
            setIsSidebarCollapsed(true);
            setIsDrawerOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      <aside className="app-sidebar side-drawer">
        <div className="sidebar-header">
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
            }}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav desktop-sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Sistema</span>
            <div className="nav-items-stack">
              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => onNavigate('settings')}
              >
                <span className="nav-icon icon-settings">{iconMap['settings']}</span>
                <strong className="nav-label">Configurações</strong>
                {activeTab === 'settings' && <span className="active-indicator" />}
              </button>

              <button
                className={`nav-item ${activeTab === 'store' ? 'active' : ''}`}
                onClick={() => onNavigate('store')}
              >
                <span className="nav-icon icon-store">{iconMap['store']}</span>
                <strong className="nav-label">Licença Pro</strong>
                {activeTab === 'store' && <span className="active-indicator" />}
              </button>
              
              <div className="nav-section-divider" style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }} />
              
              <button
                className="nav-item"
                onClick={() => {
                   // Placeholder for Logout/Exit
                   window.location.reload();
                }}
              >
                <span className="nav-icon">🚪</span>
                <strong className="nav-label">Sair</strong>
              </button>
            </div>
          </div>

        </nav>
      </aside>

      <section className="app-content-area">
        <div className="content-container">{children}</div>
      </section>

      <nav className="mobile-bottom-nav">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${
              (item.id === 'pulse' && activeTab === 'pulse') ||
              (item.id === 'work-history' && (activeTab === 'work-history' || activeTab === 'budgets')) ||
              (item.id === 'money' && activeTab === 'money') ||
              (item.id === 'base' && baseActive)
                ? 'active'
                : ''
            }`}
            onClick={() => onNavigate(item.id as AppTab)}
          >
            <span className="nav-icon">{iconMap[item.icon]}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
