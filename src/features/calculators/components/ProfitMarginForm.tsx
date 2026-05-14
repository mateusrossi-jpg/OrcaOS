import React from 'react';

/**
 * ProfitMarginForm - Aferix
 * Focus on whitespace and typographic grouping.
 * Follows the ORCAOS_VISUAL_DIRECTION_V1 rules.
 */
export const ProfitMarginForm: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 bg-[#000000]">
      
      {/* Left Column: Inputs Grouping */}
      <div className="lg:col-span-7 space-y-6">
        <header className="mb-8">
          <h2 className="text-xl font-bold text-white tracking-tighter uppercase font-sans">AFERIX</h2>
          <p className="text-sm text-gray-500">Defina seus custos e preço de venda para validar o lucro.</p>
        </header>

        {/* Group: Primary Values */}
        <div className="bg-[#161618] border border-[#27272A] rounded-lg p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#27272A] pb-2 mb-4">
            Valores Base
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Preço de Venda (R$)</label>
              <input 
                type="text" 
                className="w-full bg-[#000000] border border-[#27272A] rounded-md px-3 py-2 text-xs text-white font-mono focus:border-[#2DD4BF] outline-none transition-all"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Custo de Materiais (R$)</label>
              <input 
                type="text" 
                className="w-full bg-[#000000] border border-[#27272A] rounded-md px-3 py-2 text-xs text-white font-mono focus:border-[#2DD4BF] outline-none transition-all"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        {/* Group: Operational Costs */}
        <div className="bg-[#161618] border border-[#27272A] rounded-lg p-6 space-y-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#27272A] pb-2 mb-4">
            Custos e Impostos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Impostos (%)</label>
              <input type="text" className="w-full bg-[#000000] border border-[#27272A] rounded-md px-3 py-2 text-xs text-white font-mono focus:border-[#2DD4BF] outline-none transition-all" defaultValue="6" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400">Comissões/Taxas (%)</label>
              <input type="text" className="w-full bg-[#000000] border border-[#27272A] rounded-md px-3 py-2 text-xs text-white font-mono focus:border-[#2DD4BF] outline-none transition-all" placeholder="0" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Result Panel (Sticky) */}
      <div className="lg:col-span-5">
        <div className="sticky top-6 bg-[#111111] border border-[#27272A] rounded-lg p-6 space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Margem de Lucro</span>
            <div className="text-5xl font-semibold text-[#10B981] font-mono tracking-tighter">
              32.5%
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#27272A]">
              <span className="text-xs text-gray-400">Lucro Líquo em R$</span>
              <span className="text-sm font-semibold text-white font-mono">R$ 1.250,00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#27272A]">
              <span className="text-xs text-gray-400">Ponto de Equilíbrio</span>
              <span className="text-sm font-semibold text-white font-mono">R$ 2.800,00</span>
            </div>
          </div>

          <button className="w-full bg-[#2DD4BF] hover:bg-[#26bba8] text-[#0A0A0B] font-bold py-3 rounded text-xs uppercase tracking-widest transition-colors">
            Adicionar ao Orçamento
          </button>
        </div>
      </div>
    </div>
  );
};