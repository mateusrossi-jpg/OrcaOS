import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, FileText, Wrench, ChevronRight, X } from 'lucide-react';
import { cn } from '../utils/ui';
import { db } from '../storage/dexieDatabase';

interface SearchResultItem {
  id: string;
  type: 'client' | 'budget' | 'workOrder';
  title: string;
  subtitle: string;
  value?: string;
  raw: any;
}

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    clients: any[];
    budgets: any[];
    workOrders: any[];
  }>({ clients: [], budgets: [], workOrders: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Flattened items for simple keyboard navigation index management
  const flattenedItems: SearchResultItem[] = [
    ...results.clients.map((c) => ({
      id: c.id,
      type: 'client' as const,
      title: c.name,
      subtitle: `${c.email || 'Sem e-mail'} · ${c.phone || 'Sem telefone'}`,
      raw: c,
    })),
    ...results.budgets.map((b) => ({
      id: b.id,
      type: 'budget' as const,
      title: b.title || 'Proposta Sem Título',
      subtitle: b.clientName || 'Cliente Avulso',
      value: `R$ ${(b.chargedValue || 0).toFixed(2)}`,
      raw: b,
    })),
    ...results.workOrders.map((w) => ({
      id: w.id,
      type: 'workOrder' as const,
      title: w.title || 'OS Sem Título',
      subtitle: `Criada em: ${new Date(w.createdAt).toLocaleDateString('pt-BR')}`,
      raw: w,
    })),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results]);

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
          db.clients
            .filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.phone || '').toLowerCase().includes(q)
            )
            .limit(5)
            .toArray(),
          db.budgets
            .filter(
              (b) =>
                (b.title || '').toLowerCase().includes(q) ||
                (b.clientName || '').toLowerCase().includes(q)
            )
            .limit(5)
            .toArray(),
          db.workOrders
            .filter((w) => (w.title || '').toLowerCase().includes(q))
            .limit(5)
            .toArray(),
        ]);
        setResults({ clients, budgets, workOrders });
      } catch (err) {
        console.error('Command Palette Search Error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 150);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    const tab =
      item.type === 'client'
        ? 'clients'
        : item.type === 'budget'
          ? 'budgets'
          : 'base';
    window.dispatchEvent(
      new CustomEvent('aferix_navigate', { detail: { tab, id: item.id } })
    );
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flattenedItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev - 1 < 0 ? flattenedItems.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedItems[selectedIndex]) {
        handleSelect(flattenedItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const totalResults = flattenedItems.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Busca Universal"
      className="fixed inset-0 z-[9999] flex flex-col pt-[15vh] px-4 items-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="absolute inset-0"
        onClick={() => {
          setIsOpen(false);
          setQuery('');
        }}
      />

      <div className="relative w-full max-w-2xl bg-[#1C1C1E]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Input Area */}
        <div className="flex items-center px-6 py-5 border-b border-white/5">
          <Search
            size={24}
            className={cn(
              'text-white/40 mr-4 transition-colors',
              query && 'text-[var(--accent-gold)]'
            )}
          />
          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Campo de busca universal"
            placeholder="O que você precisa encontrar? (Clientes, OS, Propostas...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent border-none text-[18px] font-medium text-white placeholder:text-white/20 outline-none focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Limpar busca"
              className="p-2 bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 rounded-full text-white/40 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div
          ref={listRef}
          className="flex flex-col max-h-[60vh] overflow-y-auto scrollbar-none pb-4"
        >
          {!query && (
            <div className="px-8 py-12 flex flex-col items-center justify-center opacity-30 text-center">
              <Search size={48} className="mb-6" />
              <span className="text-[14px] font-black uppercase tracking-widest font-mono">
                Busca Universal
              </span>
              <span className="text-[12px] font-medium mt-2 max-w-[250px]">
                Digite para encontrar qualquer registro no sistema
                instantaneamente.
              </span>
            </div>
          )}

          {query && totalResults === 0 && !isSearching && (
            <div className="px-8 py-12 flex flex-col items-center justify-center opacity-30 text-center">
              <span className="text-[12px] font-black uppercase tracking-widest font-mono">
                Nenhum resultado encontrado
              </span>
            </div>
          )}

          {results.clients.length > 0 && (
            <div className="flex flex-col mt-4">
              <span className="px-6 py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                Clientes
              </span>
              {results.clients.map((client) => {
                const itemIndex = flattenedItems.findIndex(
                  (i) => i.type === 'client' && i.id === client.id
                );
                const isSelected = itemIndex === selectedIndex;
                const itemData = flattenedItems[itemIndex];
                return (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(itemData)}
                    aria-label={`Cliente: ${client.name}`}
                    className={cn(
                      'w-full flex items-center justify-between px-6 py-3 transition-colors group focus:outline-none',
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'hover:bg-white/[0.03] active:bg-white/[0.05]'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] flex items-center justify-center">
                        <Users size={18} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-bold text-white uppercase">
                          {client.name}
                        </span>
                        <span className="text-[11px] text-white/40">
                          {client.email || 'Sem e-mail'} ·{' '}
                          {client.phone || 'Sem telefone'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-white/10 group-hover:text-white/30"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {results.budgets.length > 0 && (
            <div className="flex flex-col mt-4">
              <span className="px-6 py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                Propostas & Orçamentos
              </span>
              {results.budgets.map((budget) => {
                const itemIndex = flattenedItems.findIndex(
                  (i) => i.type === 'budget' && i.id === budget.id
                );
                const isSelected = itemIndex === selectedIndex;
                const itemData = flattenedItems[itemIndex];
                return (
                  <button
                    key={budget.id}
                    onClick={() => handleSelect(itemData)}
                    aria-label={`Proposta: ${budget.title || 'Sem Título'} para ${budget.clientName || 'Cliente Avulso'}`}
                    className={cn(
                      'w-full flex items-center justify-between px-6 py-3 transition-colors group focus:outline-none',
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'hover:bg-white/[0.03] active:bg-white/[0.05]'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-bold text-white uppercase">
                          {budget.title || 'Proposta Sem Título'}
                        </span>
                        <span className="text-[11px] text-white/40">
                          {budget.clientName || 'Cliente Avulso'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] font-mono text-[var(--accent-gold)] font-black">
                        R$ {(budget.chargedValue || 0).toFixed(2)}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-white/10 group-hover:text-white/30"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {results.workOrders.length > 0 && (
            <div className="flex flex-col mt-4">
              <span className="px-6 py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                Ordens de Serviço
              </span>
              {results.workOrders.map((wo) => {
                const itemIndex = flattenedItems.findIndex(
                  (i) => i.type === 'workOrder' && i.id === wo.id
                );
                const isSelected = itemIndex === selectedIndex;
                const itemData = flattenedItems[itemIndex];
                return (
                  <button
                    key={wo.id}
                    onClick={() => handleSelect(itemData)}
                    aria-label={`Ordem de Serviço: ${wo.title || 'Sem Título'}`}
                    className={cn(
                      'w-full flex items-center justify-between px-6 py-3 transition-colors group focus:outline-none',
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'hover:bg-white/[0.03] active:bg-white/[0.05]'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-green)]/10 text-[var(--accent-green)] flex items-center justify-center">
                        <Wrench size={18} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-bold text-white uppercase">
                          {wo.title || 'OS Sem Título'}
                        </span>
                        <span className="text-[11px] text-white/40">
                          Criada em:{' '}
                          {new Date(wo.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-white/10 group-hover:text-white/30"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-6 py-3 bg-white/[0.01] flex items-center justify-between">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
            <Search size={10} /> {totalResults} REGISTROS ENCONTRADOS
          </span>
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] font-mono">
            ↑↓ para navegar · ENTER para selecionar · ESC para fechar
          </span>
        </div>
      </div>
    </div>
  );
};
