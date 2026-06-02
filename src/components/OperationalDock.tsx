import React from 'react';
import { cn } from '../utils/ui';

/**
 * OperationalDock – the bottom‑dock that mimics a physical hardware dock.
 * It is the final element in the visual hierarchy (see Visual OS spec).
 * Accepts arbitrary JSX (usually navigation items or action buttons).
 */
interface OperationalDockProps {
  /** Content placed inside the dock – typically a set of buttons */
  children: React.ReactNode;
  /** Optional class names */
  className?: string;
}

export const OperationalDock: React.FC<OperationalDockProps> = ({ children, className }) => {
  return (
    <div className={cn("operational-dock animate-fade-in", className)} role="toolbar">
      {children}
    </div>
  );
};

/**
 * NavigationItem – A single tab/item inside the OperationalDock.
 */
interface NavigationItemProps {
  icon: React.ComponentType<any>;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  accent?: 'gold' | 'green' | 'red' | 'grey';
  /** Optional badge count (e.g., notifications) */
  badge?: number;
}


export const NavigationItem: React.FC<NavigationItemProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  accent = 'gold',
  badge
}) => {
  // Accessibility: explicit aria-label includes badge count when present
  const ariaLabel = badge ? `${label}, ${badge} new items` : label;
  return (
    <button
      onClick={onClick}
      className={cn(
        "operational-dock-nav group flex flex-col items-center justify-center relative",
        isActive && "active",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]"
      )}
      title={label}
      aria-label={ariaLabel}
    >
      <Icon
        size={20}
        strokeWidth={isActive ? 2.5 : 2}
        className={cn(
          "transition-all duration-300",
          isActive ? "text-[var(--accent-gold)] scale-110" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
        )}
      />
      {isActive && (
        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent-gold)] shadow-[0_0_8px_var(--accent-gold)]" />
      )}
      <span className={cn("mt-1 text-xs", isActive ? "text-[var(--accent-gold)]" : "text-[var(--text-secondary)]")}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="badge">{badge}</span>
      )}
    </button>
  );
};
