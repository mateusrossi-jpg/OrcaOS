import { type ReactNode } from 'react';
import { Home, ClipboardList, Wallet, CalendarDays, MoreHorizontal, Bell } from "lucide-react";
import type { Client, Service as WorkOrder } from '../../core/types/business';
import './AppShell.css';
import type { AppTab } from '../appTypes';
import { cn } from '../../utils/ui';

interface AppShellProps {
  children: ReactNode;
  activeTab: AppTab;
  onNavigate: (id: AppTab) => void;
  activeClient: Client | null;
  activeWorkOrder: WorkOrder | null;
}

/**
 * AppShell: The high-polish executive operating shell.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function AppShell({ children, activeTab, onNavigate }: AppShellProps) {
  const bottomNavItems = [
    { id: 'pulse', label: 'Resumo', icon: Home },
    { id: 'budgets', label: 'Operação', icon: ClipboardList },
    { id: 'money', label: 'Financeiro', icon: Wallet },
    { id: 'work-history', label: 'Agenda', icon: CalendarDays },
    { id: 'settings', label: 'Mais', icon: MoreHorizontal },
  ];

  return (
    <div className="aferix-shell-root">
      <div className={cn("aferix-mobile-container", ["pulse", "budgets"].includes(activeTab) && "cinematic-shell")}>
        {/* Sticky Header */}
        {!["pulse", "budgets"].includes(activeTab) && (
          <header className="aferix-header" role="banner">
            <div className="header-brand">
              <div className="brand-symbol">A</div>
              <span className="brand-text">AFERI<span className="brand-accent">X</span></span>
            </div>
            <div className="header-actions">
              <button
                aria-label="Notificações"
                className="notification-trigger"
              >
                <Bell className="h-4 w-4" />
                <span className="notification-dot" />
              </button>
            </div>
          </header>
        )}

        {/* Scrollable Content */}
        <main className="aferix-main-content">
          <div className="content-inner">{children}</div>
        </main>

        {/* Fixed Bottom Nav (5 Items) */}
        <nav className="aferix-bottom-nav">
          {bottomNavItems.map((item) => {
            const isActive = activeTab === item.id || 
              (item.id === 'settings' && ['settings', 'catalog', 'store', 'reports', 'base'].includes(activeTab)) ||
              (item.id === 'budgets' && ['budgets', 'budgetDetail', 'new-budget'].includes(activeTab));
            
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={cn("nav-item", isActive && "active")}
                onClick={() => onNavigate(item.id as AppTab)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn("nav-icon", isActive && "icon-active")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
