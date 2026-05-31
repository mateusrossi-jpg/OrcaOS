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
}

/**
 * SearchInput: Authority-driven unified search field.
 * Refactored for absolute Home DNA parity (Phase 4H).
 */
export const SearchInput = memo(({ className, onChange, ...props }: SearchInputProps) => (
  <div className={cn(
    "relative flex items-center h-[56px] rounded-[16px] bg-white/[0.03] border border-white/[0.06] px-5 focus-within:border-[var(--accent-gold)]/30 focus-within:bg-white/[0.05] transition-all shadow-inset group",
    className
  )}>
    <Search size={18} className="text-white/20 group-focus-within:text-[var(--accent-gold)] transition-colors shrink-0" />
    <input
      className="flex-1 bg-transparent border-none outline-none ml-4 text-[14px] font-semibold text-[var(--text-primary)] placeholder:text-white/10"
      onChange={(e) => onChange?.(e.target.value)}
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
