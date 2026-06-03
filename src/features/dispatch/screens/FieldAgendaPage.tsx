import React from 'react';
import { SurfaceCard } from '../../../ui/system';
import { Navigation, PlayCircle } from 'lucide-react';

export const FieldAgendaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 pb-24">
      <h1 className="text-2xl font-black mb-6">Sua Rota</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-widest mb-3">Agora</h2>
          <SurfaceCard className="p-5 bg-[var(--accent-green)] border-none text-black relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Navigation size={120} />
            </div>
            <h3 className="font-black text-xl mb-1">Shopping Sul</h3>
            <p className="text-sm font-bold opacity-80 mb-4">Corretiva Chiller 01</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                <PlayCircle size={18} /> INICIAR O.S.
              </button>
            </div>
          </SurfaceCard>
        </div>

        <div>
          <h2 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Próximo (14:00)</h2>
          <SurfaceCard padding="sm">
            <h3 className="font-bold text-white text-lg">Hospital Alpha</h3>
            <p className="text-sm text-text-secondary mt-1">Preventiva Trimestral</p>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
};
