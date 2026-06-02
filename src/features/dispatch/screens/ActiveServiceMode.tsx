import React from 'react';

export const ActiveServiceMode: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-between">
      <div className="p-6 bg-surface-900 border-b border-surface-800">
        <div className="flex items-center gap-2 mb-2 text-[var(--accent-green)] animate-pulse">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-green)]"></div>
          <span className="text-xs font-bold uppercase tracking-widest">Serviço em Andamento</span>
        </div>
        <h1 className="text-3xl font-black">Shopping Sul</h1>
        <p className="text-text-secondary">Corretiva Chiller 01</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full h-16 bg-surface-800 border border-surface-700 rounded-2xl flex items-center px-4 mb-4">
          <div className="w-6 h-6 border-2 border-surface-600 rounded-full mr-3"></div>
          <span className="font-bold text-white">Medir pressão gás</span>
        </div>
        <div className="w-full h-16 bg-surface-800 border border-surface-700 rounded-2xl flex items-center px-4">
          <div className="w-6 h-6 border-2 border-surface-600 rounded-full mr-3"></div>
          <span className="font-bold text-white">Tirar foto do painel</span>
        </div>
      </div>

      <div className="p-6 bg-surface-900 border-t border-surface-800 pb-safe">
        <button className="w-full h-16 bg-[var(--accent-yellow)] text-black font-black text-lg rounded-2xl">
          FINALIZAR O.S.
        </button>
      </div>
    </div>
  );
};
