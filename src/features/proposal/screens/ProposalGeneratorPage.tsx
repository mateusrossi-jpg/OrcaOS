import React, { useState, useMemo } from 'react';
import { ArrowLeft, Camera, Wrench, Package, Clock, Truck, FileText, CheckCircle2, AlertTriangle, Plus, Trash2, Tag, Send, Save } from 'lucide-react';

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

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountFixed, setDiscountFixed] = useState<number>(0);

  // Tax rate
  const TAX_RATE = 0.15; // 15% ISS/ICMS approximation

  // Calculated Totals
  const sumItems = (items: LineItem[]) => items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
  
  const materialsTotal = useMemo(() => sumItems(materials), [materials]);
  const laborTotal = useMemo(() => sumItems(labor), [labor]);
  const extrasTotal = useMemo(() => sumItems(extras), [extras]);
  
  const rawSubTotal = materialsTotal + laborTotal + extrasTotal;
  
  const discountValue = (rawSubTotal * (discountPercent / 100)) + discountFixed;
  const subTotalAfterDiscount = rawSubTotal - discountValue;

  const taxesTotal = subTotalAfterDiscount * TAX_RATE;
  const grandTotal = subTotalAfterDiscount + taxesTotal;

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
    <div className="flex flex-col min-h-screen bg-background pb-32 overflow-x-hidden font-sans">
      
      {/* 1. CABEÇALHO E CONTEXTO */}
      <div className="bg-surface-900 border-b border-surface-800 p-4 pt-12 flex flex-col z-30 shadow-md sticky top-0">
        <div className="flex items-center gap-3 mb-4">
          <button className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full hover:bg-surface-700 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Gerar Proposta</h1>
            <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase">Rascunho Comercial</span>
          </div>
        </div>

        {/* Informações do Cliente Inline */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-surface-800 p-4 rounded-xl border border-surface-700">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-tertiary tracking-widest uppercase font-bold">Cliente</span>
            <span className="text-xs font-bold text-white">Condomínio Alpha</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-tertiary tracking-widest uppercase font-bold">Local</span>
            <span className="text-xs font-bold text-white">Torre B - Cobertura</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-tertiary tracking-widest uppercase font-bold">Ativo</span>
            <span className="text-xs font-bold text-white">Chiller Carrier 30RBA</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-tertiary tracking-widest uppercase font-bold">Origem</span>
            <span className="text-xs font-bold text-[var(--accent-blue)]">Anomalia #ANM-204</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* 2. BLOCO DO PROBLEMA */}
        <section className="bg-surface-900 border border-status-error/30 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xs font-bold text-status-error uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} /> Problema Encontrado
            </h2>
            <span className="bg-status-error/20 text-status-error text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded">Severidade Alta</span>
          </div>
          <p className="text-sm text-white mb-4 font-medium">Vazamento fluido refrigerante e placa principal queimada após pico de luz. Equipamento parado.</p>
          
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            <div className="w-24 h-24 bg-surface-800 rounded-lg border border-surface-700 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=200&fit=crop" alt="Placa" className="opacity-50 object-cover w-full h-full" />
              <Camera size={20} className="text-white absolute" />
            </div>
          </div>

          <div className="bg-surface-800 p-3 rounded-lg border-l-2 border-[var(--accent-green)]">
            <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold block mb-1">Recomendação Técnica</span>
            <p className="text-xs text-white">Troca da placa eletrônica (Evap), brasagem e recarga de fluido R410a.</p>
          </div>
        </section>

        {/* HELPERS 3, 4, 5: PECAS, SERVICOS, EXTRAS */}
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
                      <button onClick={() => handleRemoveItem(setter, item.id)} className="text-status-error opacity-50 hover:opacity-100 p-2">
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
                <Plus size={14} /> Adicionar Item
              </button>
            </section>
          );

          return (
            <>
              {renderList('Peças e Materiais', <Package size={16} />, 'text-[var(--accent-blue)]', materials, setMaterials, 'Nova Peça')}
              {renderList('Mão de Obra e Instalação', <Wrench size={16} />, 'text-[var(--accent-yellow)]', labor, setLabor, 'Nova Mão de Obra')}
              {renderList('Custos Extras', <Truck size={16} />, 'text-text-tertiary', extras, setExtras, 'Taxa Extra')}
            </>
          );
        })()}

        {/* 6. BLOCO DE DESCONTOS */}
        <section className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <h2 className="text-xs font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Tag size={16} /> Descontos Comerciais
          </h2>
          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Percentual (%)</span>
              <input 
                type="number" 
                value={discountPercent} 
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="bg-surface-800 rounded p-3 text-white text-sm font-mono w-full outline-none focus:ring-1 focus:ring-[var(--accent-green)]"
                step="0.5"
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Valor Fixo (R$)</span>
              <input 
                type="number" 
                value={discountFixed} 
                onChange={(e) => setDiscountFixed(parseFloat(e.target.value) || 0)}
                className="bg-surface-800 rounded p-3 text-white text-sm font-mono w-full outline-none focus:ring-1 focus:ring-[var(--accent-green)]"
              />
            </div>
          </div>
          {discountValue > 0 && (
             <div className="mt-3 text-right">
               <span className="text-xs text-[var(--accent-green)] font-bold uppercase tracking-widest">Desconto Total: -{formatBRL(discountValue)}</span>
             </div>
          )}
        </section>

        {/* 7 e 8. RESUMO FINANCEIRO GIGANTE */}
        <section className="bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/30 rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest flex items-center justify-center gap-2 mb-6">
            <FileText size={14} /> Fechamento Financeiro
          </h2>
          
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal Bruto:</span>
              <span className="font-mono">{formatBRL(rawSubTotal)}</span>
            </div>
            
            {discountValue > 0 && (
              <div className="flex justify-between text-sm text-[var(--accent-green)] font-bold">
                <span>Descontos Aplicados:</span>
                <span className="font-mono">-{formatBRL(discountValue)}</span>
              </div>
            )}
            
            {/* Bloco de Impostos Automático */}
            <div className="flex justify-between text-sm text-status-error font-bold border-t border-surface-800 pt-3">
              <span>Impostos Gerados ({TAX_RATE * 100}%):</span>
              <span className="font-mono">+{formatBRL(taxesTotal)}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center border-t border-[var(--accent-blue)]/30 pt-6">
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Total Final para o Cliente</span>
            <span className="text-4xl font-black text-[var(--accent-blue)] tracking-tighter">{formatBRL(grandTotal)}</span>
          </div>
        </section>

        {/* 9. AÇÕES FINAIS (Rascunho e Envio Rápido) */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button className="py-4 bg-surface-800 text-white font-bold text-[10px] tracking-widest uppercase rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-surface-700 transition-colors">
            <Save size={18} />
            Salvar Rascunho
          </button>
          <button className="py-4 bg-surface-800 text-white font-bold text-[10px] tracking-widest uppercase rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-surface-700 transition-colors border border-[var(--accent-green)]/30">
            <Send size={18} className="text-[var(--accent-green)]" />
            Enviar ao Cliente
          </button>
        </div>

      </div>

      {/* 10. RODAPÉ FIXO (Sticky Footer) */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-800 p-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Total Proposta</span>
            <span className="text-xl font-black text-white tracking-tighter">{formatBRL(grandTotal)}</span>
          </div>
          
          <button className="px-8 py-4 bg-[var(--accent-blue)] text-[#050505] font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(42,139,242,0.3)] hover:brightness-110 active:scale-95 transition-all">
            GERAR PDF
          </button>
        </div>
      </div>
    </div>
  );
};
