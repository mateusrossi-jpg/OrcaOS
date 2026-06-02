import React from 'react';
import { BookOpen, Folder, Tag, TrendingUp } from 'lucide-react';
import { StickyActionBar } from '../../../components/StickyActionBar';

export const ServicePlaybookPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-[var(--accent-yellow)]" size={32} />
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Playbook de Serviço</h1>
        </div>
        
        <p className="text-sm text-text-secondary mb-8">
          A inteligência coletiva da operação. Todas as soluções consolidadas e validadas pela equipe de campo.
        </p>
        
        <div className="space-y-4">
          <PlaybookCategory title="HVAC" count={124} icon={<Folder size={20} />} />
          <PlaybookCategory title="Elétrica" count={85} icon={<Folder size={20} />} />
          <PlaybookCategory title="Solar" count={32} icon={<Folder size={20} />} />
          <PlaybookCategory title="Facilities" count={45} icon={<Folder size={20} />} />
        </div>
        
        <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mt-10 mb-4">Soluções em Alta</h2>
        <div className="space-y-3">
          <TrendingSolution title="Substituição Placa Inverter Carrier" reuses={14} success={98} />
          <TrendingSolution title="Reset Módulo Compressor York" reuses={8} success={85} />
        </div>
      </div>
      
      <StickyActionBar
        primaryAction={{ label: 'BUSCAR SOLUÇÃO', onClick: () => {} }}
        secondaryAction={{ label: 'NOVO CASO', onClick: () => {} }}
      />
    </div>
  );
};

const PlaybookCategory: React.FC<{title: string, count: number, icon: React.ReactNode}> = ({ title, count, icon }) => (
  <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
    <div className="flex items-center gap-3">
      <div className="text-text-tertiary">{icon}</div>
      <span className="font-bold text-white text-lg">{title}</span>
    </div>
    <div className="bg-surface-900 px-3 py-1 rounded-full text-xs font-bold text-text-secondary">
      {count} Casos
    </div>
  </div>
);

const TrendingSolution: React.FC<{title: string, reuses: number, success: number}> = ({ title, reuses, success }) => (
  <div className="bg-surface-900 border border-surface-700 rounded-lg p-3">
    <h4 className="text-white font-bold mb-2">{title}</h4>
    <div className="flex gap-4 text-xs">
      <span className="text-text-secondary flex items-center gap-1"><TrendingUp size={12}/> Reutilizada {reuses}x</span>
      <span className="text-[var(--accent-green)] flex items-center gap-1"><Tag size={12}/> {success}% Sucesso</span>
    </div>
  </div>
);
