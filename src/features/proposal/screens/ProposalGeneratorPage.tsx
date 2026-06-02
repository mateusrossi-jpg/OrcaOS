import React, { useState, useMemo } from 'react';
import { ArrowLeft, Camera, Wrench, Package, Clock, Truck, FileText, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';

interface LineItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export const ProposalGeneratorPage: React.FC = () => {
  const [materials, setMaterials] = useState<LineItem[]>([
    { id: '1', name: 'Placa Principal Brastemp', qty: 1, unitPrice: 450.00 },
    { id: '2', name: 'Gás R410a (kg)', qty: 0.8, unitPrice: 150.00 },
  ]);

  const [labor, setLabor] = useState<LineItem[]>([
    { id: 'l1', name: 'Técnico Sênior (Hora)', qty: 4, unitPrice: 95.00 },
  ]);

  const [extras, setExtras] = useState<LineItem[]>([
    { id: 'e1', name: 'Taxa de Visita / Pedágio', qty: 1, unitPrice: 80.00 },
  ]);

  // Tax rate
  const TAX_RATE = 0.15; // 15% ISS/ICMS approximation

  // Calculated Totals
  const sumItems = (items: LineItem[]) => items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
  
  const materialsTotal = useMemo(() => sumItems(materials), [materials]);
  const laborTotal = useMemo(() => sumItems(labor), [labor]);
  const extrasTotal = useMemo(() => sumItems(extras), [extras]);
  
  const subTotal = materialsTotal + laborTotal + extrasTotal;
  const taxesTotal = subTotal * TAX_RATE;
  const grandTotal = subTotal + taxesTotal;

  const formatBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleUpdateItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string, field: keyof LineItem, val: string | number) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleRemoveItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, defaultName: string) => {
    setter(prev => [...prev, { id: crypto.randomUUID(), name: defaultName, qty: 1, unitPrice: 0 }]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 overflow-x-hidden font-sans">
      {/* CABEÇALHO */}
      <div className="sticky top-0 bg-surface-900 border-b border-surface-800 p-4 pt-12 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full hover:bg-surface-700 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Gerar Proposta</h1>
            <span className="text-[10px] text-[var(--accent-blue)] font-bold tracking-widest uppercase">Anomalia #ANM-204</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* BLOCO 1: Problema Encontrado */}
        <section className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <h2 className="text-xs font-bold text-status-error uppercase tracking-widest flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> 1. Problema Encontrado
          </h2>
          <p className="text-sm text-white mb-3 font-medium">Vazamento fluido refrigerante e placa principal queimada após pico de luz.</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <div className="w-24 h-24 bg-surface-800 rounded-lg border border-surface-700 flex-shrink-0 flex items-center justify-center">
              <Camera size={20} className="text-text-tertiary" />
            </div>
          </div>
        </section>

        {/* BLOCO 2: Solução */}
        <section className="bg-surface-900 border border-[var(--accent-green)]/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <CheckCircle2 size={64} className="text-[var(--accent-green)]" />
          </div>
          <h2 className="text-xs font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2 mb-3 relative z-10">
            <Wrench size={16} /> 2. Solução Recomendada
          </h2>
          <p className="text-sm text-white font-medium relative z-10">Troca da placa eletrônica (Evap), brasagem e recarga de fluido R410a.</p>
        </section>

        {/* HELPER FUNCTION PARA RENDERIZAR LISTAS */}
        {(() => {
          const renderList = (title: string, icon: React.ReactNode, colorClass: string, items: LineItem[], setter: React.Dispatch<React.SetStateAction<LineItem[]>>, defaultName: string) => (
            <section className="bg-surface-900 border border-surface-800 rounded-xl p-4">
              <h2 className={`text-xs font-bold ${colorClass} uppercase tracking-widest flex items-center gap-2 mb-4`}>
                {icon} {title}
              </h2>
              <div className="flex flex-col gap-4 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex flex-col gap-2 pb-4 border-b border-surface-800 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => handleUpdateItem(setter, item.id, 'name', e.target.value)}
                        className="bg-transparent text-sm font-bold text-white outline-none w-full border-b border-transparent focus:border-surface-600 transition-colors"
                      />
                      <button onClick={() => handleRemoveItem(setter, item.id)} className="text-status-error opacity-50 hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col flex-1">
                        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Qtd</span>
                        <input 
                          type="number" 
                          value={item.qty} 
                          onChange={(e) => handleUpdateItem(setter, item.id, 'qty', parseFloat(e.target.value) || 0)}
                          className="bg-surface-800 rounded p-2 text-white text-sm font-mono w-full outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                          step="0.1"
                        />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Preço Unit.</span>
                        <input 
                          type="number" 
                          value={item.unitPrice} 
                          onChange={(e) => handleUpdateItem(setter, item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="bg-surface-800 rounded p-2 text-white text-sm font-mono w-full outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                        />
                      </div>
                      <div className="flex flex-col items-end flex-1 pt-4">
                        <span className="text-sm font-black text-white">{formatBRL(item.qty * item.unitPrice)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => handleAddItem(setter, defaultName)} className="w-full py-3 bg-surface-800 text-[10px] font-bold tracking-widest uppercase text-text-secondary rounded-lg hover:text-white transition-colors flex justify-center items-center gap-2 active:scale-95">
                <Plus size={14} /> Adicionar Linha
              </button>
            </section>
          );

          return (
            <>
              {renderList('3. Materiais', <Package size={16} />, 'text-[var(--accent-blue)]', materials, setMaterials, 'Nova Peça')}
              {renderList('4. Mão de Obra', <Clock size={16} />, 'text-[var(--accent-yellow)]', labor, setLabor, 'Nova Mão de Obra')}
              {renderList('5. Deslocamento / Extras', <Truck size={16} />, 'text-text-tertiary', extras, setExtras, 'Taxa Extra')}
            </>
          );
        })()}

        {/* BLOCO 6: Resumo Financeiro */}
        <section className="bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/20 rounded-xl p-5 mb-8">
          <h2 className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-widest flex items-center gap-2 mb-4">
            <FileText size={16} /> 6. Resumo Financeiro
          </h2>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Materiais:</span>
              <span className="font-mono">{formatBRL(materialsTotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Mão de Obra:</span>
              <span className="font-mono">{formatBRL(laborTotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Deslocamento:</span>
              <span className="font-mono">{formatBRL(extrasTotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-status-error font-bold mt-2 pt-2 border-t border-surface-800">
              <span>Impostos ({TAX_RATE * 100}%):</span>
              <span className="font-mono">{formatBRL(taxesTotal)}</span>
            </div>
          </div>
          <div className="flex justify-between items-end border-t border-[var(--accent-blue)]/30 pt-4">
            <span className="text-sm font-bold text-white uppercase tracking-widest">Total Cliente:</span>
            <span className="text-3xl font-black text-[var(--accent-blue)] tracking-tighter">{formatBRL(grandTotal)}</span>
          </div>
        </section>
      </div>

      {/* BLOCO 7: Ação */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-800 p-4 pb-8 z-20">
        <button className="w-full py-5 bg-[var(--accent-blue)] text-[#050505] font-black text-sm tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(42,139,242,0.3)] hover:brightness-110 active:scale-95 transition-all">
          <FileText size={20} />
          GERAR PROPOSTA
        </button>
      </div>
    </div>
  );
};
