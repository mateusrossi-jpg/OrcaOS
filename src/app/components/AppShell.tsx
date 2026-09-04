import { type ReactNode, memo, useState, useEffect } from 'react';
import { Home, LayoutGrid, DollarSign, Target, ClipboardList, Menu, Zap, Users, Settings } from "lucide-react";
import './AppShell.css';
import './AppHeader.css';
import type { AppTab } from '../appTypes';
import { AppHeader } from './AppHeader';
import { cn } from '../../utils/ui';

interface AppShellProps {
  children: ReactNode;
  activeTab: AppTab;
  onNavigate: (id: AppTab) => void;
}

const NAV_TABS = [
  { id: 'pulse' as AppTab, icon: Home, label: 'PULSO' },
  { id: 'revenue' as AppTab, icon: DollarSign, label: 'RECEITA' },
  { id: 'operations' as AppTab, icon: Zap, label: 'OPERAR' },
  { id: 'relationships' as AppTab, icon: Users, label: 'CLIENTES' },
  { id: 'admin' as AppTab, icon: Settings, label: 'GESTÃO' },
];

/**
 * AppShell: The high-polish executive operating shell.
 */
export const AppShell = memo(function AppShell({ children, activeTab, onNavigate }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (drawerOpen && !target.closest('.side-drawer') && !target.closest('.menu-btn')) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [drawerOpen]);

  const handleTabClick = (id: AppTab) => {
    onNavigate(id);
  };

  return (
    <div className="aferix-shell-root">
      <div className="aferix-mobile-container">
        <AppHeader onMenuToggle={() => setDrawerOpen(prev => !prev)} />
        
        <img src="/icons/aferix-wordmark-premium.svg" alt="" className="hidden" aria-hidden="true" />

        {/* Scrollable Content */}
        <main className="aferix-main-content">
          <div className="content-inner">
            {children}
          </div>
        </main>

        {drawerOpen && (
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
        )}

        {/* Side Drawer Navigation */}
        <nav className={cn("side-drawer", drawerOpen ? 'open' : '', "bg-aferix-bg")}>
          <div className="drawer-brand-card p-6">
            <img src="/icons/aferix-wordmark-premium.svg" alt="Aferix" className="h-6" />
          </div>
          <div className="desktop-sidebar-nav flex flex-col gap-1 px-4">
            {NAV_TABS.map((tab) => (
              <button 
                key={tab.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-[0.98]",
                  activeTab === tab.id ? "bg-aferix-gold/10 text-aferix-gold font-bold" : "text-text-secondary hover:bg-aferix-elevated hover:text-text-primary"
                )}
                onClick={() => { handleTabClick(tab.id); setDrawerOpen(false); }}
                onKeyDown={e => { if (e.key === 'ArrowDown') { /* focus next logic */ } }}
              >
                <tab.icon size={18} />
                <span className="text-[11px] uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
});
