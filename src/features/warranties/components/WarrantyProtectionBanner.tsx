import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  partName: string;
  daysRemaining: number;
  provider: 'MANUFACTURER' | 'INTERNAL_SERVICE';
}

export const WarrantyProtectionBanner: React.FC<Props> = ({ partName, daysRemaining, provider }) => {
  return (
    <div className="w-full bg-status-error text-white p-6 rounded-xl flex items-start gap-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
      <div className="p-3 bg-white/20 rounded-full">
        <ShieldCheck size={32} className="text-white" />
      </div>
      <div>
        <h2 className="text-xl font-black uppercase tracking-widest">GARANTIA ATIVA</h2>
        <p className="font-bold text-sm mt-1">
          A peça <span className="underline">{partName}</span> está sob garantia de {provider === 'MANUFACTURER' ? 'Fabricante' : 'Serviço'}.
        </p>
        <p className="text-xs mt-2 opacity-80">Cobertura restante: {daysRemaining} dias.</p>
      </div>
    </div>
  );
};
