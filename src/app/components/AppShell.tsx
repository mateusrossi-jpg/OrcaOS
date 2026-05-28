import { type ReactNode } from 'react';
import type { Client, Service as WorkOrder } from '../../core/types/business';
import './AppShell.css';
import type { AppTab } from '../appTypes';
import { ERPNotificationCenter } from '../../ui/system';

const AFERIX_WORDMARK = '/icons/aferix-wordmark-premium.svg';

interface AppShellProps {
  children: ReactNode;
  activeTab: AppTab;
  onNavigate: (id: AppTab) => void;
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

/**
 * AppShell V4 (The Premium Mobile Shell)
 * Implements AFERIX_DESIGN_SPEC.md - Section 3
 * Centered container, max-width 440px, viewport controlled.
 */
export function AppShell({ children, activeTab, onNavigate }: AppShellProps) {
  const bottomNavItems = [
    { id: 'pulse', label: 'Home', icon: '🏠' },
    { id: 'budgets', label: 'Operação', icon: '📑' },
    { id: 'money', label: 'Financeiro', icon: '💰' },
    { id: 'settings', label: 'Menu', icon: '☰' },
  ];

  return (
    <div className="aferix-shell-root">
      <div className="aferix-mobile-container">
        {/* Sticky Header */}
        <header className="aferix-header" role="banner">
          <div className="header-left"></div>
          <div className="header-brand">
            <img src={AFERIX_WORDMARK} alt="Aferix" height={20} />
          </div>
          <div className="header-actions">
            <ERPNotificationCenter />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="aferix-main-content">
          <div className="content-inner">{children}</div>
        </main>

        {/* Fixed Bottom Nav */}
        <nav className="aferix-bottom-nav">
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id || 
              (item.id === 'settings' && ['settings', 'catalog', 'store', 'reports', 'base'].includes(activeTab)) ||
              (item.id === 'budgets' && ['budgets', 'work-history', 'budgetDetail', 'new-budget'].includes(activeTab));

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id as AppTab)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
