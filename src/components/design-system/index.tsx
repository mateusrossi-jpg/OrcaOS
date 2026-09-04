import React, { memo } from 'react';
import { Menu, Bell, Search, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/ui';

// ===================================================================
// 1. AppHeader & NotificationBadge
// ===================================================================
interface AppHeaderProps {
  onMenuToggle?: () => void;
  title?: string | React.ReactNode;
  notificationCount?: number;
  onNotificationClick?: () => void;
  className?: string;
}

export const NotificationBadge = memo(function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-black text-white leading-none">
      {count > 9 ? '9+' : count}
    </span>
  );
});

export const AppHeader = memo(function AppHeader({
  onMenuToggle,
  title,
  notificationCount = 0,
  onNotificationClick,
  className
}: AppHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40 w-full flex items-center justify-between min-h-[56px] px-5 bg-[var(--color-background)] border-b border-[var(--color-border)] select-none", className)}>
      <button 
        onClick={onMenuToggle}
        className="flex items-center justify-center p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center justify-center">
        {title ? (
          <span className="font-[var(--font-title)] text-[14px] font-black tracking-[0.25em] text-[var(--color-text-primary)] uppercase">
            {title}
          </span>
        ) : (
          <img src="/icons/aferix-wordmark-premium.svg" alt="Aferix" className="h-5 w-auto" />
        )}
      </div>

      <button 
        onClick={onNotificationClick}
        className="relative flex items-center justify-center p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={22} />
        <NotificationBadge count={notificationCount} />
      </button>
    </header>
  );
});

// ===================================================================
// 2. SidebarNavigation (Menu/Drawer overlay)
// ===================================================================
interface SidebarNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  items: { id: string; label: string; icon: LucideIcon; active?: boolean }[];
  onItemClick: (id: string) => void;
  className?: string;
}

export const SidebarNavigation = memo(function SidebarNavigation({
  isOpen,
  onClose,
  items,
  onItemClick,
  className
}: SidebarNavigationProps) {
  if (!isOpen) return null;
  return (
    <div className={cn("fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-sm animate-in fade-in duration-200", className)} onClick={onClose}>
      <div 
        className="w-72 h-full bg-[var(--color-background)] border-r border-[var(--color-border)] p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-left duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <img src="/icons/aferix-wordmark-premium.svg" alt="Aferix" className="h-6 w-auto" />
          <button 
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors font-bold text-[13px] cursor-pointer"
          >
            FECHAR
          </button>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onItemClick(item.id);
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 text-[12px] font-bold uppercase tracking-wider",
                  item.active 
                    ? "bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/25 text-[var(--color-warning)]" 
                    : "bg-[var(--color-surface-elevated)]/30 border border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Icon size={16} className={item.active ? "text-[var(--color-warning)]" : "text-[var(--color-text-muted)]"} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
});

// ===================================================================
// 3. SearchBar
// ===================================================================
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onSearchSubmit?: () => void;
  className?: string;
}

export const SearchBar = memo(function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  onSearchSubmit,
  className
}: SearchBarProps) {
  return (
    <div className={cn("bg-[var(--color-surface)] h-12 rounded-[20px] px-4 text-[var(--color-text-secondary)] w-full border border-[var(--color-border)] focus-within:border-[var(--color-warning)]/20 transition-all flex items-center gap-3 shadow-sm", className)}>
      <Search size={18} className="text-[var(--color-text-muted)] opacity-50 shrink-0" />
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
        className="w-full bg-transparent text-[15px] outline-none border-none p-0 m-0 focus:ring-0 shadow-none placeholder:text-[var(--color-text-muted)]/40 text-[var(--color-text-primary)] font-[var(--font-body)]" 
      />
    </div>
  );
});

// ===================================================================
// 4. MissionCard
// ===================================================================
interface MissionCardProps {
  children: React.ReactNode;
  className?: string;
}

export const MissionCard = memo(function MissionCard({ children, className }: MissionCardProps) {
  return (
    <div 
      className={cn("bg-[var(--color-card)] p-4 flex flex-col rounded-[20px] relative overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-elevated)]", className)}
    >
      {children}
    </div>
  );
});

// ===================================================================
// 5. StatusBadge
// ===================================================================
interface StatusBadgeProps {
  label: string;
  className?: string;
}

export const StatusBadge = memo(function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <div className={cn("inline-flex items-center justify-center px-3 py-1.5 bg-[var(--color-surface-elevated)]/40 border border-[var(--color-border)] rounded-full text-[var(--color-text-muted)]/70", className)}>
      <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
});

// ===================================================================
// 6. PrimaryActionButton (Nova Ordem de Serviço button)
// ===================================================================
interface PrimaryActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const PrimaryActionButton = memo(function PrimaryActionButton({
  children,
  icon: Icon,
  className,
  ...props
}: PrimaryActionButtonProps) {
  return (
    <button 
      type="button"
      className={cn("w-auto px-10 h-14 rounded-full flex items-center justify-center gap-1.5 cursor-pointer font-[var(--font-body)] font-semibold text-[13px] aferix-home-primary-btn active:scale-[0.975]", className)}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={3.2} />}
      <span>{children}</span>
    </button>
  );
});

// ===================================================================
// 7. OperationalMetricCard (Grid Cards)
// ===================================================================
interface OperationalMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  ledColor?: 'green' | 'amber' | 'red' | 'off';
  onClick?: () => void;
  className?: string;
}

export const OperationalMetricCard = memo(function OperationalMetricCard({
  title,
  value,
  description,
  ledColor = 'off',
  onClick,
  className
}: OperationalMetricCardProps) {
  return (
    <div 
      className={cn("bg-[var(--color-card)] rounded-[20px] p-4 flex flex-col gap-1 cursor-pointer border border-[var(--color-border)] shadow-sm interactive-card", className)}
      onClick={onClick}
    >
      <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{title}</span>
      <span className="text-[26px] font-mono font-black text-gradient-premium leading-none my-1">{value}</span>
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full opacity-50",
          ledColor === 'green' && "led-green",
          ledColor === 'amber' && "led-amber",
          ledColor === 'red' && "led-red",
          ledColor === 'off' && "led-off"
        )} />
        <span className="text-[8.5px] text-[var(--color-text-muted)]/50 font-semibold tracking-tight uppercase">
          {description}
        </span>
      </div>
    </div>
  );
});

// ===================================================================
// 8. ActivityCard (Timeline entry)
// ===================================================================
interface ActivityCardProps {
  title: string;
  meta: string;
  time: string;
  type: 'APPOINTMENT' | 'CLIENT' | 'BUDGET';
  icon: LucideIcon;
  onClick?: () => void;
  isLast?: boolean;
  className?: string;
}

export const ActivityCard = memo(function ActivityCard({
  title,
  meta,
  time,
  type,
  icon: Icon,
  onClick,
  isLast = false,
  className
}: ActivityCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 flex items-center justify-between active:bg-white/[0.02] transition-all cursor-pointer",
        !isLast && "border-b border-[var(--color-border)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center border",
          type === 'APPOINTMENT' && "text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/20",
          type === 'CLIENT' && "text-[var(--color-info)] bg-[var(--color-info)]/10 border-[var(--color-info)]/20",
          type === 'BUDGET' && "text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20"
        )}>
          <Icon size={14} />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-[var(--color-text-primary)] tracking-tight truncate max-w-[180px]">{title}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]/40 font-medium uppercase tracking-wider">{meta}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-medium text-[var(--color-text-muted)]/30 uppercase font-mono">{time}</span>
        <ChevronRight size={14} className="text-[var(--color-text-muted)]/10" />
      </div>
    </div>
  );
});

// ===================================================================
// 9. EmptyState
// ===================================================================
interface EmptyStateProps {
  message: string;
  className?: string;
}

export const EmptyState = memo(function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={cn("h-[100px] flex items-center justify-center text-center", className)}>
      <span className="text-[11.5px] text-[var(--color-text-muted)]/30 font-semibold tracking-wider uppercase">
        {message}
      </span>
    </div>
  );
});

// ===================================================================
// 10. SectionTitle
// ===================================================================
interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle = memo(function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]/30 px-1", className)}>
      {children}
    </span>
  );
});
