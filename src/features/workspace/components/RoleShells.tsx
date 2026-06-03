import React, { ReactNode, useState } from 'react';
import { Home, DollarSign, Users, FileText, Settings, Calendar, Wrench, ClipboardList, Activity, User, Target, Kanban, Map, Truck, Menu, Plus, Zap } from 'lucide-react';
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
  console.log("ACTIVE SHELL = OwnerShell");
  console.log("ROLE = OWNER");
  console.log("TABS =", tabs);
  return <ShellLayout {...props} tabs={tabs} />;
}

export function FieldShell(props: ShellProps) {
  const tabs = [
    { id: 'base', icon: ClipboardList, label: 'EXECUÇÃO' },
    { id: 'assets', icon: Wrench, label: 'ATIVOS' },
    { id: 'diagnostics', icon: Activity, label: 'LAUDOS' },
    { id: 'settings', icon: Menu, label: 'MENU' },
  ];
  console.log("ACTIVE SHELL = FieldShell");
  console.log("ROLE = FIELD");
  console.log("TABS =", tabs);
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
  console.log("ACTIVE SHELL = SalesShell");
  console.log("ROLE = SALES");
  console.log("TABS =", tabs);
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
  console.log("ACTIVE SHELL = ManagerShell");
  console.log("ROLE = MANAGER");
  console.log("TABS =", tabs);
  return <ShellLayout {...props} tabs={tabs} />;
}

export function CustomerShell(props: ShellProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'reports', icon: ClipboardList, label: 'LAUDOS' },
    { id: 'budgets', icon: Target, label: 'PROPOSTAS' },
    
    { id: 'settings', icon: Menu, label: 'MENU' },
  ];
  console.log("ACTIVE SHELL = CustomerShell");
  console.log("ROLE = CUSTOMER");
  console.log("TABS =", tabs);
  return <ShellLayout {...props} tabs={tabs} />;
}

export function SoloShell(props: ShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { children, activeTab, onNavigate } = props;

  const handleQuickAction = (tabId: string) => {
    setIsOpen(false);
    onNavigate(tabId);
  };

  return (
    <div className="aferix-shell-root">
      <div className="aferix-mobile-container">
        <main className="aferix-main-content">
          <div className="content-inner">{children}</div>
        </main>
        
        <OperationalDock>
          <NavigationItem icon={Home} label="EMPRESA" isActive={activeTab === 'dashboard'} onClick={() => onNavigate('dashboard')} />
          <NavigationItem icon={Target} label="PROPOSTAS" isActive={activeTab === 'budgets' && props.activeTab !== 'new-quick-service' && props.activeTab !== 'new-budget'} onClick={() => onNavigate('budgets')} />
          
          {/* Central Quick Action Button "+" */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center relative w-12 h-12 rounded-full bg-[var(--accent-gold)] text-black shadow-[var(--glow-gold)] active:scale-95 transition-all self-center border border-[var(--accent-gold)]/20 -mt-2 cursor-pointer z-40"
            title="Ações Rápidas"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
          
          <NavigationItem icon={Calendar} label="AGENDA / OS" isActive={activeTab === 'agenda'} onClick={() => onNavigate('agenda')} />
          <NavigationItem icon={DollarSign} label="FINANCEIRO" isActive={activeTab === 'money'} onClick={() => onNavigate('money')} />
        </OperationalDock>

        {/* BOTTOM SHEET FOR QUICK ACTIONS */}
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
            <div 
              className="bg-[#0c0f16] border-t border-white/10 rounded-t-[28px] p-6 flex flex-col gap-6 max-w-md mx-auto w-full animate-slide-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-black font-mono tracking-[0.25em] text-[var(--accent-gold)] uppercase">Menu de Ações Rápidas</span>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest min-w-[48px] min-h-[48px] flex items-center justify-center">Fechar</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 1. Atendimento Expresso */}
                <button
                  onClick={() => handleQuickAction('new-quick-service')}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] active:scale-95 transition-all text-left flex flex-col gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
                    <Zap size={16} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Serviço Expresso</h3>
                    <p className="text-[10px] text-text-tertiary mt-1 leading-snug">Criar, finalizar e faturar serviço com 1 toque.</p>
                  </div>
                </button>

                {/* 2. Nova Proposta */}
                <button
                  onClick={() => handleQuickAction('new-budget')}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] active:scale-95 transition-all text-left flex flex-col gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)]/10 flex items-center justify-center">
                    <Target size={16} className="text-[var(--accent-blue)]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Nova Proposta</h3>
                    <p className="text-[10px] text-text-tertiary mt-1 leading-snug">Gerar orçamento completo com materiais e serviços.</p>
                  </div>
                </button>

                {/* 3. Nova OS */}
                <button
                  onClick={() => handleQuickAction('new-budget')}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] active:scale-95 transition-all text-left flex flex-col gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center">
                    <ClipboardList size={16} className="text-[var(--accent-green)]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Nova OS</h3>
                    <p className="text-[10px] text-text-tertiary mt-1 leading-snug">Registrar ordem de serviço diretamente na Agenda.</p>
                  </div>
                </button>

                {/* 4. Receber Pagamento */}
                <button
                  onClick={() => handleQuickAction('money')}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] active:scale-95 transition-all text-left flex flex-col gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-green)]/15 flex items-center justify-center">
                    <DollarSign size={16} className="text-[var(--accent-green)]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Receber Pagamento</h3>
                    <p className="text-[10px] text-text-tertiary mt-1 leading-snug">Liquidar lançamentos em aberto no livro-razão.</p>
                  </div>
                </button>

                {/* 5. Novo Laudo */}
                <button
                  onClick={() => handleQuickAction('diagnostics')}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] active:scale-95 transition-all text-left flex flex-col gap-2 cursor-pointer col-span-2"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
                    <Activity size={16} className="text-[var(--accent-gold)]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Novo Laudo</h3>
                    <p className="text-[10px] text-text-tertiary mt-1 leading-snug">Emitir laudo técnico completo de inspeção de ativos.</p>
                  </div>
                </button>
              </div>

              {/* Menu e Gestão (Fallback) */}
              <button
                onClick={() => handleQuickAction('settings')}
                className="w-full py-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-white/60 font-black tracking-widest text-[10px] uppercase transition-all active:scale-[0.98] cursor-pointer"
              >
                Configurações & Gestão Completa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
