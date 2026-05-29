import { useState, useEffect, useRef } from 'react';
import './CompactActionMenu.css';
import { MoreVertical } from 'lucide-react';
import { cn } from '../../utils/ui';

export interface CompactActionItem {
  id: string;
  label: string;
  tone?: 'default' | 'danger';
  onSelect: () => void | Promise<void>;
}

/**
 * CompactActionMenu: Discrete contextual menu for desktop/tablet.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function CompactActionMenu({
  label = 'Ações rápidas',
  items,
  align = 'right',
}: {
  label?: string;
  align?: 'left' | 'right';
  items: CompactActionItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="compact-action-menu" ref={menuRef}>
      <button
        type="button"
        className={cn(
          "compact-action-menu-trigger transition-all active:scale-[0.9]",
          isOpen && "bg-white/10 text-[var(--text-primary)]"
        )}
        aria-label={label}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((current) => !current);
        }}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className={cn("compact-action-menu-popover animate-in fade-in zoom-in-95 duration-200", `align-${align}`)}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "compact-action-menu-item",
                item.tone === 'danger' && "danger"
              )}
              onClick={async (e) => {
                e.stopPropagation();
                await item.onSelect();
                setIsOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
