import React, { useState, useMemo } from 'react';
import { ArrowLeft, Camera, Wrench, Package, Clock, Truck, FileText, AlertTriangle, Plus, Trash2, Tag, Send, Save, Copy, CheckCircle2 } from 'lucide-react';

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
  const MARGIN_RATE = 0.30; // 30% Margem de Lucro Bruto

  // Calculated Totals
  const sumItems = (items: LineItem[]) => items.reduce((acc, curr) => acc + (curr.qty * curr.unitPrice), 0);
  
  const materialsTotal = useMemo(() => sumItems(materials), [materials]);
  const laborTotal = useMemo(() => sumItems(labor), [labor]);
  const extrasTotal = useMemo(() => sumItems(extras), [extras]);
  
  const rawSubTotal = materialsTotal + laborTotal + extrasTotal;
  
  const discountValue = (rawSubTotal * (discountPercent / 100)) + discountFixed;
  const subTotalAfterDiscount = rawSubTotal - discountValue;

  const taxesTotal = subTotalAfterDiscount * TAX_RATE;
  const marginTotal = subTotalAfterDiscount * MARGIN_RATE;
  
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
      
      {/* =========================================
          BLOCO 1: IDENTIFICAÇÃO
      =========================================== */}
      <div className="bg-surface-900 border-b border-surface-800 p-4 pt-12 flex flex-col z-30 shadow-md sticky top-0">
        <div className="flex items-center gap-3 mb-4">
          <button className="w-10 h-10 flex items-center justify-center bg-surface-800 rounded-full hover:bg-surface-700 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Nova Proposta</h1>
            <span className="text-[10px] text-text-tertiary font-bold tracking-widest uppercase">ID: PRP-9928</span>
          </div>
        </div>

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
            <span className="text-[10px] text-text-tertiary tracking-widest uppercase font-bold">Status</span>
            <span className="text-xs font-bold text-[var(--accent-yellow)]">Rascunho Comercial</span>
          </div>
          <div className="flex flex-col col-span-2 pt-2 border-t border-surface-700">
            <span className="text-[10px] text-text-tertiary tracking-widest uppercase font-bold">Origem Vinculada</span>
            <span className="text-xs font-bold text-[var(--accent-blue)]">Anomalia #ANM-204</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* =========================================
            BLOCO 2: PROBLEMA ENCONTRADO
        =========================================== */}
        <section className="bg-surface-900 border border-status-error/30 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xs font-bold text-status-error uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} /> 2. Problema Encontrado
            </h2>
            <span className="bg-status-error/20 text-status-error text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded">Alta Severidade</span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            <div className="w-24 h-24 bg-surface-800 rounded-lg border border-surface-700 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=200&fit=crop" alt="Evaporadora" className="opacity-50 object-cover w-full h-full" />
              <Camera size={20} className="text-white absolute" />
            </div>
            <div className="w-24 h-24 bg-[var(--accent-blue)]/10 rounded-lg border border-[var(--accent-blue)]/30 flex-shrink-0 flex flex-col items-center justify-center gap-1">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-[var(--accent-blue)] ml-1"></div>
              </div>
              <span className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest">Áudio Téc.</span>
            </div>
          </div>
          
          <p className="text-sm text-white font-medium">Vazamento fluido refrigerante e placa principal queimada após pico de luz. Equipamento parado.</p>
        </section>

        {/* =========================================
            BLOCO 3: SOLUÇÃO PROPOSTA
        =========================================== */}
        <section className="bg-surface-900 border border-[var(--accent-green)]/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 p-2">
            <CheckCircle2 size={80} />
          </div>
          <h2 className="text-xs font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2 mb-3 relative z-10">
            <Wrench size={16} /> 3. Solução Proposta
          </h2>
          <div className="space-y-3 relative z-10">
            <div>
              <span className="text-[10px] text-[var(--accent-green)] tracking-widest uppercase font-bold block mb-1">Recomendação do Técnico</span>
              <p className="text-sm text-white font-medium">Substituição imediata da placa eletrônica, reparo do vazamento (brasagem) e recarga completa de fluido refrigerante.</p>
            </div>
            <div className="pt-3 border-t border-[var(--accent-green)]/20">
              <span className="text-[10px] text-[var(--accent-green)] tracking-widest uppercase font-bold block mb-1">Escopo Comercial</span>
              <p className="text-xs text-text-secondary">Fornecimento de peças originais, mão de obra especializada e descarte ecológico do gás remanescente.</p>
            </div>
          </div>
        </section>

        {/* =========================================
            BLOCOS 4, 5, 6: PEÇAS, SERVIÇOS E EXTRAS
        =========================================== */}
        {(() => {
          const renderList = (index: number, title: string, icon: React.ReactNode, colorClass: string, items: LineItem[], setter: React.Dispatch<React.SetStateAction<LineItem[]>>, defaultName: string) => (
            <section className="bg-surface-900 border border-surface-800 rounded-xl p-4">
              <h2 className={`text-xs font-bold ${colorClass} uppercase tracking-widest flex items-center gap-2 mb-4`}>
                {icon} {index}. {title}
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
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleAddItem(setter, item.name)} className="text-text-tertiary hover:text-white p-2">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => handleRemoveItem(setter, item.id)} className="text-status-error opacity-50 hover:opacity-100 p-2">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
              {renderList(4, 'Peças e Materiais', <Package size={16} />, 'text-[var(--accent-blue)]', materials, setMaterials, 'Nova Peça')}
              {renderList(5, 'Serviços e Mão de Obra', <Clock size={16} />, 'text-[var(--accent-yellow)]', labor, setLabor, 'Nova Mão de Obra')}
              {renderList(6, 'Custos Extras', <Truck size={16} />, 'text-text-tertiary', extras, setExtras, 'Taxa Extra')}
            </>
          );
        })()}

        {/* =========================================
            BLOCO 7: DESCONTOS
        =========================================== */}
        <section className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <h2 className="text-xs font-bold text-[var(--accent-green)] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Tag size={16} /> 7. Descontos
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
               <span className="text-xs text-[var(--accent-green)] font-bold uppercase tracking-widest">Desconto Aplicado: -{formatBRL(discountValue)}</span>
             </div>
          )}
        </section>

        {/* =========================================
            BLOCO 8: IMPOSTOS
        =========================================== */}
        <section className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <h2 className="text-xs font-bold text-status-error uppercase tracking-widest flex items-center gap-2 mb-2">
            <FileText size={16} /> 8. Impostos Retidos
          </h2>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-text-secondary">ISS / ICMS (Auto 15%)</span>
            <span className="text-sm font-black text-status-error">+{formatBRL(taxesTotal)}</span>
          </div>
        </section>

        {/* =========================================
            BLOCO 9: RESUMO EXECUTIVO
        =========================================== */}
        <section className="bg-[var(--accent-blue)]/5 border border-[var(--accent-blue)]/30 rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest flex items-center justify-center gap-2 mb-6">
            <FileText size={14} /> 9. Resumo Executivo
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
            
            <div className="flex justify-between text-sm text-status-error font-bold">
              <span>Impostos (15%):</span>
              <span className="font-mono">+{formatBRL(taxesTotal)}</span>
            </div>

            <div className="flex justify-between text-xs text-text-tertiary mt-2 border-t border-surface-800 pt-3">
              <span>Margem Bruta Projetada:</span>
              <span className="font-mono">{formatBRL(marginTotal)} (30%)</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center border-t border-[var(--accent-blue)]/30 pt-6">
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-1">Total Final para o Cliente</span>
            <span className="text-4xl font-black text-[var(--accent-blue)] tracking-tighter">{formatBRL(grandTotal)}</span>
          </div>
        </section>

        {/* =========================================
            BLOCO 10: GERAÇÃO E AÇÕES FINAIS
        =========================================== */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button className="py-4 bg-surface-800 text-white font-bold text-[10px] tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-surface-700 transition-colors">
            <Save size={16} /> Salvar Rascunho
          </button>
          <button className="py-4 bg-surface-800 text-white font-bold text-[10px] tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-surface-700 transition-colors">
            <Copy size={16} /> Duplicar Proposta
          </button>
          <button className="col-span-2 py-5 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] font-bold text-[10px] tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 border border-[var(--accent-blue)]/30 hover:bg-[var(--accent-blue)]/20 transition-colors">
            <FileText size={18} /> Gerar PDF Simples
          </button>
          <button className="col-span-2 py-5 bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-bold text-[10px] tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 border border-[var(--accent-green)]/30 hover:bg-[var(--accent-green)]/20 transition-colors">
            <Send size={18} /> Enviar Assinatura para Cliente
          </button>
        </div>

      </div>

      {/* =========================================
          RODAPÉ FIXO (STICKY FOOTER)
      =========================================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-900 border-t border-surface-800 p-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-widest">Total Proposta</span>
            <span className="text-xl font-black text-white tracking-tighter">{formatBRL(grandTotal)}</span>
          </div>
          
          <button className="px-8 py-4 bg-[var(--accent-blue)] text-[#050505] font-black text-xs tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(42,139,242,0.3)] hover:brightness-110 active:scale-95 transition-all">
            GERAR PROPOSTA
          </button>
        </div>
      </div>
    </div>
  );
};
