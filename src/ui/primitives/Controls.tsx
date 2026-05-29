import React, { memo, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { Search, Plus } from 'lucide-react';

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
    primary: "bg-[var(--accent-gold)] text-black shadow-[var(--shadow-button)] hover:brightness-110",
    secondary: "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border var(--border-soft) shadow-soft hover:bg-white/[0.08]",
    glass: "bg-[var(--bg-surface-glass)] backdrop-blur-xl text-[var(--text-primary)] border var(--border-soft) hover:bg-white/[0.12]",
    danger: "bg-[var(--accent-red)]/10 text-[var(--accent-red)] border border-[var(--accent-red)]/20 hover:bg-[var(--accent-red)]/20",
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

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

/**
 * SearchInput: Authority-driven unified search field.
 */
export const SearchInput = memo(({ className, ...props }: SearchInputProps) => (
  <div className={cn(
    "relative flex items-center h-[56px] rounded-[var(--radius-button)] bg-[var(--bg-surface-glass)] border var(--border-subtle) px-shell focus-within:border-[var(--accent-gold)]/40 focus-within:bg-white/[0.06] transition-all shadow-inset group",
    className
  )}>
    <Search className="h-5 w-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-gold)] transition-colors" />
    <input 
      className="flex-1 bg-transparent border-none outline-none ml-md text-ui-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40"
      {...props}
    />
  </div>
));

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
