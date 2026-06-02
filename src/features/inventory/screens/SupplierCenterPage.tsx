import React from 'react';
import { Truck, Star, Phone, Mail } from 'lucide-react';

export const SupplierCenterPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background p-6 pb-24 overflow-x-hidden">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
          <Truck className="text-[var(--accent-blue)]" />
          Supplier Center
        </h1>
        <p className="text-sm text-text-secondary mt-1">Gestão de fornecedores e controle de compras (Procurement).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mock de Fornecedores */}
        <SupplierCard name="EletroPeças Distribuidora" rating={4.8} leadTime={2} activeOrders={3} />
        <SupplierCard name="HVAC Supply Co." rating={4.2} leadTime={5} activeOrders={1} />
        <SupplierCard name="Solar Equipamentos" rating={3.5} leadTime={15} activeOrders={0} />
      </div>
    </div>
  );
};

const SupplierCard: React.FC<{ name: string, rating: number, leadTime: number, activeOrders: number }> = ({ name, rating, leadTime, activeOrders }) => (
  <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 flex flex-col gap-3 hover:border-surface-600 transition-colors cursor-pointer">
    <div className="flex justify-between items-start">
      <h3 className="font-bold text-white">{name}</h3>
      <div className="flex items-center gap-1 bg-surface-800 px-2 py-1 rounded">
        <Star size={12} className="text-[var(--accent-yellow)] fill-[var(--accent-yellow)]" />
        <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div className="flex flex-col">
        <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Lead Time</span>
        <span className="text-sm font-bold text-white">{leadTime} dias</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-text-tertiary uppercase tracking-widest">Ordens Ativas</span>
        <span className="text-sm font-bold text-[var(--accent-blue)]">{activeOrders} compras</span>
      </div>
    </div>

    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-surface-800">
      <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-white transition-colors">
        <Phone size={12} /> Ligar
      </button>
      <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-white transition-colors">
        <Mail size={12} /> E-mail
      </button>
    </div>
  </div>
);
