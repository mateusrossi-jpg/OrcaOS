import React, { ReactNode } from 'react';
import { Home, DollarSign, Users, FileText, Settings, Calendar, Wrench, ClipboardList, Activity, User, Target, Kanban, Map, Truck, Menu } from 'lucide-react';
import { OperationalDock, NavigationItem } from '../../../components/OperationalDock';

interface ShellProps {
  children: ReactNode;
  activeTab: string;
  onNavigate: (id: string) => void;
}

const ShellLayout = ({ children, tabs, activeTab, onNavigate }: any) => (
  <div className="aferix-shell-root">
    <div className="aferix-mobile-container">
      <main className="aferix-main-content">
        <div className="content-inner">{children}</div>
      </main>
      <OperationalDock>
        {tabs.map((t: any) => (
          <NavigationItem key={t.id} icon={t.icon} label={t.label} isActive={activeTab === t.id} onClick={() => onNavigate(t.id)} />
        ))}
      </OperationalDock>
    </div>
  </div>
);

export function OwnerShell(props: ShellProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'EMPRESA' },
    { id: 'money', icon: DollarSign, label: 'FINANCEIRO' },
    { id: 'clients', icon: Users, label: 'CLIENTES' },
    { id: 'team', icon: Users, label: 'EQUIPE' },
    { id: 'settings', icon: Menu, label: 'MENU' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function FieldShell(props: ShellProps) {
  const tabs = [
    { id: 'base', icon: ClipboardList, label: 'EXECUÇÃO' },
    { id: 'assets', icon: Wrench, label: 'ATIVOS' },
    { id: 'diagnostics', icon: Activity, label: 'LAUDOS' },
    { id: 'settings', icon: Menu, label: 'MENU' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function SalesShell(props: ShellProps) {
  const tabs = [
    { id: 'pipeline', icon: Kanban, label: 'PIPELINE' },
    { id: 'anomalies', icon: Activity, label: 'ANOMALIAS' },
    { id: 'budgets', icon: Target, label: 'PROPOSTAS' },
    { id: 'clients', icon: Users, label: 'CLIENTES' },
    { id: 'settings', icon: Menu, label: 'MENU' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function ManagerShell(props: ShellProps) {
  const tabs = [
    { id: 'map', icon: Map, label: 'MAPA' },
    { id: 'dispatch', icon: Truck, label: 'DISPATCH' },
    { id: 'agenda', icon: Calendar, label: 'AGENDA' },
    { id: 'team', icon: Users, label: 'EQUIPE' },
    { id: 'settings', icon: Menu, label: 'MENU' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function CustomerShell(props: ShellProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'reports', icon: ClipboardList, label: 'LAUDOS' },
    { id: 'budgets', icon: Target, label: 'PROPOSTAS' },
    
    { id: 'settings', icon: Menu, label: 'MENU' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}

export function SoloShell(props: ShellProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'MEU NEGÓCIO' },
    { id: 'agenda', icon: Calendar, label: 'AGENDA / OS' },
    { id: 'money', icon: DollarSign, label: 'FINANCEIRO' },
    { id: 'clients', icon: Users, label: 'CLIENTES' },
    { id: 'settings', icon: Menu, label: 'MENU' },
  ];
  return <ShellLayout {...props} tabs={tabs} />;
}
