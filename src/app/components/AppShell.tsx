import { type ReactNode, memo } from 'react';
import { Home, LayoutGrid, DollarSign, Target, ClipboardList, Menu } from "lucide-react";
import './AppShell.css';
import type { AppTab } from '../appTypes';
import { OperationalDock, NavigationItem } from '../../components/OperationalDock';

interface AppShellProps {
  children: ReactNode;
  activeTab: AppTab;
  onNavigate: (id: AppTab) => void;
}

const NAV_TABS = [
  { id: 'pulse' as AppTab, icon: Home, label: 'PULSO' },
  { id: 'attendances' as AppTab, icon: ClipboardList, label: 'AGENDA' },
  { id: 'budgets' as AppTab, icon: Target, label: 'PROPOSTAS' },
  { id: 'base' as AppTab, icon: LayoutGrid, label: 'EXECUÇÃO' },
  { id: 'settings' as AppTab, icon: Menu, label: 'GESTÃO' },
];

/**
 * AppShell: The high-polish executive operating shell.
 * Aligned with AFERIX VISUAL PROTOCOL (Operational Dock).
 */
export const AppShell = memo(function AppShell({ children, activeTab, onNavigate }: AppShellProps) {
  const handleTabClick = (id: AppTab) => {
    onNavigate(id);
  };

  return (
    <div className="aferix-shell-root">
      <div className="aferix-mobile-container">
        {/* Scrollable Content */}
        <main className="aferix-main-content">
          <div className="content-inner">
            {children}
          </div>
        </main>

        {/* ━━━ OPERATIONAL DOCK (Bottom Navigation) ━━━ */}
        <OperationalDock>
          {NAV_TABS.map((tab) => (
            <NavigationItem
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => handleTabClick(tab.id)}
            />
          ))}
        </OperationalDock>
      </div>
    </div>
  );
});
