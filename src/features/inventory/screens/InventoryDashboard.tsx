import React from 'react';
import { Package, AlertOctagon, TrendingDown, ShoppingCart } from 'lucide-react';

export const InventoryDashboard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background p-6 pb-24 overflow-x-hidden">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <Package className="text-[var(--accent-green)]" />
          Inventory Engine
        </h1>
        <p className="text-sm text-text-secondary mt-1">Visão unificada de peças, reservas e capital imobilizado.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Capital Imobilizado" value="R$ 145.200" color="green" icon={<Package size={16} />} />
        <MetricCard title="Itens Críticos" value="12" color="error" icon={<AlertOctagon size={16} />} />
        <MetricCard title="Baixo Estoque" value="34" color="yellow" icon={<TrendingDown size={16} />} />
        <MetricCard title="Compras em Aberto" value="R$ 12.500" color="blue" icon={<ShoppingCart size={16} />} />
      </div>

      <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-4">Atenção Imediata (Ruptura)</h2>
      <div className="flex flex-col gap-3">
        {/* Mock list */}
        <CriticalItem sku="COMP-INV-01" name="Compressor Inverter 36k BTUs" qtd={0} min={2} status="OUT_OF_STOCK" />
        <CriticalItem sku="PLACA-EVAP-05" name="Placa Eletrônica Evaporadora" qtd={1} min={5} status="LOW_STOCK" />
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ title: string, value: string, color: 'green'|'error'|'yellow'|'blue', icon: React.ReactNode }> = ({ title, value, color, icon }) => {
  const colorMap = {
    'green': 'text-[var(--accent-green)] border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10',
    'error': 'text-status-error border-status-error/30 bg-status-error/10',
    'yellow': 'text-[var(--accent-yellow)] border-[var(--accent-yellow)]/30 bg-[var(--accent-yellow)]/10',
    'blue': 'text-[var(--accent-blue)] border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/10',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]} flex flex-col`}>
      <div className="flex items-center gap-2 mb-2 opacity-80">
        {icon}
        <h3 className="text-[10px] font-bold uppercase tracking-widest">{title}</h3>
      </div>
      <span className="text-xl font-black">{value}</span>
    </div>
  );
};

const CriticalItem: React.FC<{ sku: string, name: string, qtd: number, min: number, status: string }> = ({ sku, name, qtd, min, status }) => (
  <div className="bg-surface-900 border border-surface-700 rounded-lg p-3 flex justify-between items-center">
    <div className="flex flex-col">
      <span className="text-xs text-text-tertiary font-mono">{sku}</span>
      <span className="text-sm font-bold text-white">{name}</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Estoque</span>
        <span className={`text-sm font-black ${qtd === 0 ? 'text-status-error' : 'text-[var(--accent-yellow)]'}`}>{qtd}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Mínimo</span>
        <span className="text-sm font-bold text-text-secondary">{min}</span>
      </div>
      <button className="ml-2 bg-surface-800 hover:bg-surface-700 text-white text-xs px-3 py-1.5 rounded font-bold transition-colors">
        Pedir
      </button>
    </div>
  </div>
);
