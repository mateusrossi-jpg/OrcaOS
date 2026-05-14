import React from 'react';
import { useNetwork } from '../src/core/context/NetworkContext';

/**
 * Sidebar Component - Aferix
 * Purely typographic navigation without secondary icons.
 * Uses Teal (#2DD4BF) for active states and strict spacing.
 */
export const Sidebar: React.FC = () => {
  const { isOnline, isPulsing } = useNetwork();

  const ledColorClass = isOnline ? 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  const syncStatusText = isOnline ? 'Sincronizado' : 'Offline';

  const menuGroups = [
    {
      label: 'Geral',
      items: [
        { name: 'Painel de Controle', active: true },
        { name: 'Clientes e OS', active: false },
      ]
    },
    {
      label: 'Operacional',
      items: [
        { name: 'Cálculos Técnicos', active: false },
        { name: 'Levantamento de Campo', active: false },
        { name: 'Catálogo de Itens', active: false },
      ]
    },
    {
      label: 'Financeiro',
      items: [
        { name: 'Orçamentos', active: false },
        { name: 'Fluxo de Caixa', active: false, badge: 'EM BREVE' },
      ]
    }
  ];

  return (
    <aside className="w-64 h-screen bg-[#0A0A0B] border-r border-[#27272A] flex flex-col p-6 gap-8">
      {/* Brand Header */}
      <div className="px-2">
        <span className="text-xl font-bold text-white tracking-tighter uppercase">
          Aferix <span className="text-[#2DD4BF]">.</span>
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex flex-col gap-8">
        {menuGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] px-2">
              {group.label}
            </h3>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.name}>
                  <button
                    className={`w-full text-left px-2 py-2 rounded-md transition-all flex justify-between items-center group
                      ${item.active 
                        ? 'text-[#2DD4BF] font-semibold bg-[#2DD4BF]/5 border-l-2 border-[#2DD4BF]' 
                        : 'text-gray-400 hover:text-white hover:bg-[#161618] border-l-2 border-transparent'}`}
                  >
                    <span className="text-sm tracking-tight">{item.name}</span>
                    {item.badge && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#27272A] text-gray-500 group-hover:text-gray-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Placeholder */}
      <div className="mt-auto pt-6 border-t border-[#27272A] px-2">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">Mateus Silva</div>
        <div className="text-[10px] text-gray-600 font-mono">Plano Profissional</div>
        
        {/* CSS-only Sync LED Indicator */}
        <div className="mt-6 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPulsing ? 'animate-pulse' : 'transition-colors duration-500'} ${ledColorClass}`} />
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{syncStatusText}</span>
        </div>
      </div>
    </aside>
  );
};