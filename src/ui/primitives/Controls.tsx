import React, { memo, type ButtonHTMLAttributes, type ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/ui';
import { Search, Plus, User, FileText, Zap, X, History, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { searchIntelligenceEngine } from '../../services/SearchIntelligenceEngine';

interface ExecutiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ExecutiveButton: Tactile control for high-value actions.
 */
export const ExecutiveButton = memo(({
  children,
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: ExecutiveButtonProps) => {
  const base = "relative inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none gap-sm overflow-hidden";
  
  const variants = {
    primary: "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-[var(--shadow-button)] hover:brightness-105 active:brightness-95",
    secondary: "bg-[var(--btn-secondary-bg)] text-[var(--text-primary)] border border-[var(--btn-secondary-border)] hover:bg-white/[0.06] active:bg-white/[0.08]",
    glass: "bg-[var(--btn-glass-bg)] backdrop-blur-xl text-[var(--text-primary)] border border-white/[0.08] hover:bg-white/[0.05]",
    danger: "bg-[var(--btn-danger-bg)] text-[oklch(0.75_0.14_25)] border border-[oklch(0.75_0.14_25)]/20 hover:bg-[oklch(0.75_0.14_25)]/15",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]",
  };

  const sizes = {
    sm: "h-10 px-4 text-ui-xs rounded-lg",
    md: "h-[52px] px-shell text-ui-base rounded-[var(--radius-button)]",
    lg: "h-16 px-10 text-ui-md rounded-2xl",
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
});

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
  onClear?: () => void;
  onResultSelect?: (item: any) => void;
}

/**
 * SearchInput: Authority-driven unified search field.
 * Upgraded to 'Command Center' DNA (V6.7 P2).
 */
export const SearchInput = memo(({ className, onChange, onResultSelect, ...props }: SearchInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const intelligence = useLiveQuery(() => searchIntelligenceEngine.getIntelligence(), []);
  const results = useLiveQuery(() => searchIntelligenceEngine.searchUniversal(query), [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showOverlay = isFocused;

  return (
    <div ref={containerRef} className="relative w-full z-40">
      <div className={cn(
        "relative flex items-center h-[56px] rounded-[16px] bg-white/[0.03] border border-white/[0.06] px-5 focus-within:border-[var(--accent-gold)]/30 focus-within:bg-white/[0.05] transition-all shadow-inset group",
        className
      )}>
        <Search size={18} className="text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors shrink-0" />
        <input
          className="flex-1 bg-transparent border-none outline-none ml-4 text-[14px] font-semibold text-[var(--text-primary)] placeholder:text-white/10"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            onChange?.(val);
          }}
          {...props}
        />
        {query && (
          <button onClick={() => { setQuery(''); onChange?.(''); }} className="p-2 opacity-40 hover:opacity-100">
             <X size={14} />
          </button>
        )}
      </div>

      {showOverlay && (
        <div className="absolute top-[64px] left-0 right-0 bg-[#0A0C12]/95 backdrop-blur-xl border border-white/[0.08] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
           {!query ? (
             <div className="p-6 flex flex-col gap-8">
                {intelligence?.recentClients && intelligence.recentClients.length > 0 && (
                  <div className="flex flex-col gap-4">
                     <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Clientes Recentes</span>
                     <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {intelligence.recentClients.map(c => (
                          <button 
                            key={c.id}
                            onClick={() => onResultSelect?.({ type: 'client', ...c })}
                            className="flex-none h-12 px-5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3 active:scale-95 transition-all whitespace-nowrap"
                          >
                             <User size={14} className="text-[var(--accent-gold)]" />
                             <span className="text-[12px] font-bold text-white/80">{c.name}</span>
                          </button>
                        ))}
                     </div>
                  </div>
                )}

                {intelligence?.frequentServices && intelligence.frequentServices.length > 0 && (
                  <div className="flex flex-col gap-4">
                     <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Serviços Frequentes</span>
                     <div className="flex flex-wrap gap-2">
                        {intelligence.frequentServices.map(s => (
                          <button 
                            key={s}
                            onClick={() => onResultSelect?.({ type: 'service', title: s })}
                            className="h-10 px-4 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-2 active:scale-95 transition-all"
                          >
                             <Zap size={12} className="text-[var(--accent-gold)]" />
                             <span className="text-[11px] font-semibold text-white/60">{s}</span>
                          </button>
                        ))}
                     </div>
                  </div>
                )}

                {/* RECENT ACTIVITY */}
                <div className="flex flex-col gap-4 border-t border-white/[0.04] pt-6">
                   <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Histórico Rápido</span>
                   <div className="grid grid-cols-2 gap-4">
                      {intelligence?.recentBudgets?.slice(0, 2).map(b => (
                        <button key={b.id} onClick={() => onResultSelect?.({ type: 'budget', ...b })} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] active:bg-white/[0.05] text-left">
                           <FileText size={14} className="opacity-40" />
                           <span className="text-[11px] font-bold text-white/60 truncate">{b.title}</span>
                        </button>
                      ))}
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col">
                {results?.length === 0 ? (
                  <div className="py-12 text-center opacity-30">
                     <span className="text-[10px] font-black uppercase tracking-widest">Nenhum resultado encontrado</span>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    {results?.map((res: any) => (
                      <button 
                        key={`${res.type}-${res.id}`} 
                        onClick={() => onResultSelect?.(res)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-all border-b border-white/[0.02] last:border-0"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] grid place-items-center">
                               {res.type === 'client' ? <User size={14} /> : res.type === 'budget' ? <FileText size={14} /> : <Zap size={14} />}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[13px] font-bold text-white uppercase tracking-tight">{res.title}</span>
                               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{res.type}</span>
                            </div>
                         </div>
                         <ChevronRight size={14} className="opacity-20" />
                      </button>
                    ))}
                  </div>
                )}
             </div>
           )}
        </div>
      )}
    </div>
  );
});

/**
 * FloatingActionButton: High-polish FAB for new operations.
 */
export const FloatingActionButton = memo(({ onClick, label = 'Novo' }: { onClick: () => void; label?: string }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-[var(--fab-bottom)] right-[var(--fab-right)] z-toast grid place-items-center w-16 h-16 rounded-full bg-[var(--accent-gold)] text-black shadow-[var(--shadow-button)] transition-all hover:scale-110 hover:brightness-110 active:scale-95 group"
    aria-label={label}
  >
    <Plus className="h-8 w-8 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
  </button>
));
