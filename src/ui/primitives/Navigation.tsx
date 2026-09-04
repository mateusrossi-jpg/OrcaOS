import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { ChevronRight } from 'lucide-react';

interface BottomNavigationProps {
  items: Array<{ id: string; label: string; icon: React.ElementType }>;
  activeId: string;
  onNavigate: (id: string) => void;
  className?: string;
}

/**
 * BottomNavigation: OS-level primary navigation hub.
 * Fixed at the base, high-blur glassmorphism.
 */
export const BottomNavigation = memo(({ 
  items, 
  activeId, 
  onNavigate, 
  className 
}: BottomNavigationProps) => (
  <nav className={cn(
    "fixed bottom-0 left-0 right-0 z-sticky flex items-center justify-center pointer-events-none",
    className
  )}>
    <div className="w-full max-w-[440px] h-[calc(env(safe-area-inset-bottom,24px)+68px)] bg-overlay/80 backdrop-blur-3xl border-t var(--border-subtle) pointer-events-auto grid grid-cols-5 px-sm">
      {items.map((item) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-90",
              isActive ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"
            )}
          >
            <Icon 
              className={cn("h-6 w-6 transition-all", isActive ? "opacity-100 scale-110" : "opacity-40")} 
              strokeWidth={isActive ? 2.5 : 2} 
            />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest transition-all",
              isActive ? "opacity-100" : "opacity-40"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
));

interface ListItemProps {
  title: string;
  subtitle?: string;
  value?: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * OperationalListItem: Professional list entry.
 */
export const OperationalListItem = memo(({
  title,
  subtitle,
  value,
  status,
  action,
  onClick,
  className
}: ListItemProps) => (
  <article 
    onClick={onClick}
    className={cn(
      "flex items-center gap-md py-5 px-shell transition-all duration-300 rounded-[var(--radius-button)] bg-white/[0.03] border var(--border-subtle) group",
      onClick && "cursor-pointer hover:bg-white/[0.08] active:scale-[0.98]",
      className
    )}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-md">
        <strong className="text-ui-md font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">{title}</strong>
        {value && <div className="shrink-0">{value}</div>}
      </div>
      {(subtitle || status) && (
        <div className="mt-1.5 flex items-center justify-between gap-md">
          {subtitle && <p className="text-ui-xs font-medium text-[var(--text-secondary)] truncate uppercase tracking-widest opacity-60">{subtitle}</p>}
          {status && <div className="shrink-0">{status}</div>}
        </div>
      )}
    </div>
    
    {(action || onClick) && (
      <div className="flex items-center gap-sm opacity-20 group-hover:opacity-100 transition-opacity">
        {action}
        {onClick && <ChevronRight className="h-4 w-4" />}
      </div>
    )}
  </article>
));
