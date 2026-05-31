import { type ReactNode, memo, useState } from 'react';
import { Home, LayoutGrid, DollarSign, Users, Target, Zap, CalendarDays, Package, X, Wrench, ChevronRight, Activity } from "lucide-react";
import './AppShell.css';
import type { AppTab } from '../appTypes';
import { cn } from '../../utils/ui';
import { OpsChip } from '../../ui/system';

interface AppShellProps {
  children: ReactNode;
  activeTab: AppTab;
  onNavigate: (id: AppTab) => void;
}

const NAV_TABS = [
  { id: 'pulse' as AppTab, icon: Home, label: 'Home' },
  { id: 'budgets' as AppTab, icon: Target, label: 'Vendas' },
  { id: 'base' as AppTab, icon: LayoutGrid, label: 'Operações' },
  { id: 'clients' as AppTab, icon: Users, label: 'Clientes' },
  { id: 'money' as AppTab, icon: DollarSign, label: 'Financeiro' },
];

/**
 * AppShell: The high-polish executive operating shell.
 * Implementa o Menu Tático para o pilar 'Operações' (Fase 4D).
 */
export const AppShell = memo(function AppShell({ children, activeTab, onNavigate }: AppShellProps) {
  const [showTacticalMenu, setShowTacticalMenu] = useState(false);

  const handleTabClick = (id: AppTab) => {
    if (id === 'base') {
      setShowTacticalMenu(true);
    } else {
      setShowTacticalMenu(false);
      onNavigate(id);
    }
  };

  const tacticalActions = [
    { id: 'new-budget', icon: Target, label: 'NOVO ORÇAMENTO', accent: 'orange' as const },
    { id: 'new-os', icon: Zap, label: 'NOVA OS AVULSA', accent: 'blue' as const },
    { id: 'base', icon: Activity, label: 'PAINEL', accent: false as const },
    { id: 'work-history', icon: CalendarDays, label: 'AGENDA', accent: false as const },
  ];

  return (
    <div className="aferix-shell-root">
      <div className="aferix-mobile-container">
        {/* Scrollable Content */}
        <main className="aferix-main-content">
          <div className="content-inner">
            {children}
          </div>
        </main>

        {/* ━━━ TACTICAL ACTION BAR (Fase 4E: Integrated Sub-Menu) ━━━ */}
        <div 
          className="tactical-menu-container"
          style={{ 
            transform: `translateX(-50%) translateY(${showTacticalMenu ? '0' : '20px'})`,
            opacity: showTacticalMenu ? 1 : 0,
            pointerEvents: showTacticalMenu ? "all" : "none"
          }}
        >
           <div className="tactical-menu-inner">
              {tacticalActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => { setShowTacticalMenu(false); onNavigate(action.id as AppTab); }}
                  className="tactical-menu-btn"
                >
                  <OpsChip icon={<action.icon size={11} />} label={action.label} accent={action.accent} />
                </button>
              ))}
           </div>
        </div>

        {/* ━━━ UNIVERSAL BOTTOM NAV (HOMESCREEN PARITY) ━━━ */}
        <div className="bottom-nav-container">
          <div className="bottom-nav-inner" style={{ gridTemplateColumns: `repeat(${NAV_TABS.length}, 1fr)` }}>
            {NAV_TABS.map(({ id, icon: Icon, label }) => {
              const active = activeTab === id;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleTabClick(id)}
                  className="nav-tab-btn"
                >
                  {active && <div className="nav-tab-btn-active-bg" />}
                  <Icon
                    size={21}
                    className="nav-tab-icon"
                    strokeWidth={active ? 2.25 : 1.5}
                    style={{ color: active ? "var(--accent-gold)" : "#505050" }}
                  />
                  <span
                    className="nav-tab-label"
                    style={{ 
                      color: active ? "var(--accent-gold)" : "#505050",
                      fontWeight: active ? 600 : 400
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
