import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, FileText, Wrench, ChevronRight, X, CalendarDays } from 'lucide-react';
import { cn } from '../utils/ui';
import { db } from '../storage/dexieDatabase';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    clients: any[];
    budgets: any[];
    workOrders: any[];
  }>({ clients: [], budgets: [], workOrders: [] });
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('aferix_command_palette', handleOpen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('aferix_command_palette', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ clients: [], budgets: [], workOrders: [] });
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      const q = query.toLowerCase();
      try {
        const [clients, budgets, workOrders] = await Promise.all([
          db.clients.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q)).limit(5).toArray(),
          db.budgets.filter(b => (b.title || '').toLowerCase().includes(q) || (b.clientName || '').toLowerCase().includes(q)).limit(5).toArray(),
          db.workOrders.filter(w => (w.title || '').toLowerCase().includes(q)).limit(5).toArray(),
        ]);
        setResults({ clients, budgets, workOrders });
      } catch (err) {
        console.error("Command Palette Search Error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 150);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.clients.length + results.budgets.length + results.workOrders.length;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col pt-[15vh] px-4 items-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={() => { setIsOpen(false); setQuery(''); }}
      />
      
      <div className="relative w-full max-w-2xl bg-[#1C1C1E]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Input Area */}
        <div className="flex items-center px-6 py-5 border-b border-white/5">
          <Search size={24} className={cn("text-white/40 mr-4 transition-colors", query && "text-[var(--accent-gold)]")} />
          <input
            ref={inputRef}
            type="text"
            placeholder="O que você precisa encontrar? (Clientes, OS, Propostas...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-[18px] font-medium text-white placeholder:text-white/20 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="flex flex-col max-h-[60vh] overflow-y-auto scrollbar-none pb-4">
          
          {!query && (
            <div className="px-8 py-12 flex flex-col items-center justify-center opacity-30 text-center">
               <Search size={48} className="mb-6" />
               <span className="text-[14px] font-black uppercase tracking-widest font-mono">Busca Universal</span>
               <span className="text-[12px] font-medium mt-2 max-w-[250px]">Digite para encontrar qualquer registro no sistema instantaneamente.</span>
            </div>
          )}

          {query && totalResults === 0 && !isSearching && (
             <div className="px-8 py-12 flex flex-col items-center justify-center opacity-30 text-center">
               <span className="text-[12px] font-black uppercase tracking-widest font-mono">Nenhum resultado encontrado</span>
             </div>
          )}

          {results.clients.length > 0 && (
            <div className="flex flex-col mt-4">
              <span className="px-6 py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Clientes</span>
              {results.clients.map(client => (
                <button 
                  key={client.id}
                  onClick={() => {
                    setIsOpen(false);
                    // Emit global navigation event or handle routing here
                    window.dispatchEvent(new CustomEvent('aferix_navigate', { detail: { tab: 'clients', id: client.id } }));
                  }}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[15px] font-bold text-white uppercase">{client.name}</span>
                      <span className="text-[11px] text-white/40">{client.email || 'Sem e-mail'} · {client.phone || 'Sem telefone'}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/10 group-hover:text-white/30" />
                </button>
              ))}
            </div>
          )}

          {results.budgets.length > 0 && (
            <div className="flex flex-col mt-4">
              <span className="px-6 py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Propostas & Orçamentos</span>
              {results.budgets.map(budget => (
                <button 
                  key={budget.id}
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent('aferix_navigate', { detail: { tab: 'budgets', id: budget.id } }));
                  }}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[15px] font-bold text-white uppercase">{budget.title || 'Proposta Sem Título'}</span>
                      <span className="text-[11px] text-white/40">{budget.clientName || 'Cliente Avulso'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-mono text-[var(--accent-gold)] font-black">R$ {(budget.chargedValue || 0).toFixed(2)}</span>
                    <ChevronRight size={16} className="text-white/10 group-hover:text-white/30" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.workOrders.length > 0 && (
            <div className="flex flex-col mt-4">
              <span className="px-6 py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Ordens de Serviço</span>
              {results.workOrders.map(wo => (
                <button 
                  key={wo.id}
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent('aferix_navigate', { detail: { tab: 'base', id: wo.id } }));
                  }}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-green)]/10 text-[var(--accent-green)] flex items-center justify-center">
                      <Wrench size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[15px] font-bold text-white uppercase">{wo.title || 'OS Sem Título'}</span>
                      <span className="text-[11px] text-white/40">Criada em: {new Date(wo.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/10 group-hover:text-white/30" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-6 py-3 bg-white/[0.01] flex items-center justify-between">
           <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
             <Search size={10} /> {totalResults} REGISTROS ENCONTRADOS
           </span>
           <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] font-mono">ESC para fechar</span>
        </div>
      </div>
    </div>
  );
};
